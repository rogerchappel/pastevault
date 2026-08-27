#!/usr/bin/env node
import { realpathSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { stdin as input, stdout, stderr } from 'node:process';
import { fileURLToPath } from 'node:url';
import { defaultStorePath, loadVault, mutateVault } from './storage.js';
import { PasteVault, safeItem } from './vault.js';
import { readImportFile } from './fixtures.js';
import { renderJson, renderList, renderPalette, renderShow } from './format.js';
import { detectSecrets, redactText } from './secrets.js';
import type { AddInput } from './types.js';

interface CliOptions {
  store: string;
  json: boolean;
  reveal: boolean;
  limit?: number;
  tags: string[];
  pinned?: boolean;
}

const help = `pastevault — local-first clipboard/snippet vault

Usage:
  pastevault add <text> [--tag name] [--pin] [--store path]
  pastevault add --stdin [--tag name]
  pastevault import <file.json> [--store path] [--tag name]
  pastevault list [--limit n] [--tag name] [--pinned] [--json] [--reveal]
  pastevault search <query> [--json] [--reveal]
  pastevault show <id> [--json] [--reveal]
  pastevault pin <id> | unpin <id> | rm <id>
  pastevault palette [--limit n] [--reveal]
  pastevault secrets [--json]
  pastevault redact <text>
  pastevault capture-file <file> [--tag name] [--store path]
  pastevault stats [--json]
  pastevault export [--json] [--reveal]

Privacy defaults:
  Text is stored only in a local JSON file. Secret-looking content is redacted in output
  unless --reveal is supplied for the current command.
`;

export async function main(argv = process.argv.slice(2)): Promise<number> {
  try {
    const { command, args, options } = parse(argv);
    if (!command || command === 'help' || command === '--help' || command === '-h') {
      stdout.write(help);
      return 0;
    }
    if (command === 'redact') return redactCommand(args);

    const readVault = async () => new PasteVault(await loadVault(options.store));

    switch (command) {
      case 'add': {
        const text = args.includes('--stdin') ? await readStdin() : positional(args).join(' ');
        const item = await mutateVault(options.store, (data) => new PasteVault(data).add({ text, tags: options.tags, pinned: args.includes('--pin'), source: args.includes('--stdin') ? 'stdin' : 'manual' }));
        writeItem(item, options);
        return 0;
      }
      case 'import': {
        const [file] = exactPositionals(args, 1, 'usage: pastevault import <file.json> [options]');
        const inputs = await readImportFile(file);
        const items = await mutateVault(options.store, (data) => new PasteVault(data).importItems(inputs.map((item) => ({
          ...item,
          tags: [...(item.tags ?? []), ...options.tags]
        }))));
        write(options.json ? renderJson({ imported: items.length, items: items.map((item) => safeItem(item, options.reveal)) }) : `Imported ${items.length} snippets.\n`);
        return 0;
      }
      case 'list': {
        const vault = await readVault();
        const items = vault.list({ limit: options.limit, includeSecrets: options.reveal, pinned: options.pinned, tags: options.tags });
        write(options.json ? renderJson({ items: items.map((item) => safeItem(item, options.reveal)) }) : renderList(items, options.reveal));
        return 0;
      }
      case 'search': {
        const vault = await readVault();
        const query = positional(args).join(' ');
        if (!query) throw new Error('search requires a query');
        const items = vault.list({ query, limit: options.limit, includeSecrets: options.reveal, tags: options.tags });
        write(options.json ? renderJson({ query, items: items.map((item) => safeItem(item, options.reveal)) }) : renderList(items, options.reveal));
        return 0;
      }
      case 'show': {
        const vault = await readVault();
        const item = vault.get(requiredArg(args, 'show requires an id'));
        write(options.json ? renderJson({ item: safeItem(item, options.reveal) }) : renderShow(item, options.reveal));
        return 0;
      }
      case 'pin':
      case 'unpin': {
        const id = requiredArg(args, `${command} requires an id`);
        const item = await mutateVault(options.store, (data) => new PasteVault(data).pin(id, command === 'pin'));
        writeItem(item, options);
        return 0;
      }
      case 'rm':
      case 'remove': {
        const id = requiredArg(args, 'remove requires an id');
        const item = await mutateVault(options.store, (data) => new PasteVault(data).remove(id));
        write(options.json ? renderJson({ removed: safeItem(item, options.reveal) }) : `Removed ${item.id}.\n`);
        return 0;
      }
      case 'palette': {
        const vault = await readVault();
        const items = vault.list({ limit: options.limit ?? 12, tags: options.tags });
        write(options.json ? renderJson({ items: items.map((item) => safeItem(item, options.reveal)) }) : renderPalette(items, options.reveal));
        return 0;
      }
      case 'secrets': {
        const vault = await readVault();
        const items = vault.data.items.filter((item) => item.secrets.length > 0).map((item) => ({ id: item.id, findings: item.secrets, redacted: redactText(item.text, item.secrets) }));
        write(options.json ? renderJson({ items }) : `${items.map((item) => `${item.id} ${item.findings.map((finding) => finding.kind).join(', ')} ${item.redacted.split('\n')[0]}`).join('\n')}\n`);
        return 0;
      }
      case 'stats': {
        const vault = await readVault();
        const stats = vault.stats();
        write(options.json ? renderJson(stats) : `items: ${stats.items}\npinned: ${stats.pinned}\nwith secrets: ${stats.withSecrets}\ntags: ${stats.tags.join(', ') || '-'}\n`);
        return 0;
      }
      case 'export': {
        const vault = await readVault();
        const items = vault.data.items.map((item) => safeItem(item, options.reveal));
        write(renderJson({ version: vault.data.version, exportedAt: new Date().toISOString(), items }));
        return 0;
      }
      case 'capture-file': {
        const file = requiredArg(args, 'capture-file requires a text file');
        const text = await readFile(file, 'utf8');
        const inputItem: AddInput = { text, source: 'clipboard', tags: options.tags };
        const item = await mutateVault(options.store, (data) => new PasteVault(data).add(inputItem));
        writeItem(item, options);
        return 0;
      }
      default:
        throw new Error(`unknown command: ${command}`);
    }
  } catch (error) {
    stderr.write(`pastevault: ${(error as Error).message}\n`);
    return 1;
  }
}

function parse(argv: string[]) {
  const command = argv[0];
  const args = argv.slice(1);
  const options: CliOptions = { store: defaultStorePath(), json: false, reveal: false, tags: [] };
  for (let index = 1; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--store') options.store = optionValue(argv, ++index, '--store');
    else if (arg === '--json') options.json = true;
    else if (arg === '--reveal') options.reveal = true;
    else if (arg === '--limit') options.limit = Number(optionValue(argv, ++index, '--limit'));
    else if (arg === '--tag') options.tags.push(optionValue(argv, ++index, '--tag'));
    else if (arg === '--pinned') options.pinned = true;
    else if (arg === '--pin' || arg === '--stdin') continue;
    else if (arg.startsWith('-')) throw new Error(`unknown option: ${arg}`);
  }
  if (options.limit !== undefined && (!Number.isInteger(options.limit) || options.limit < 1)) throw new Error('--limit must be a positive integer');
  validateCommandArgs(command, args);
  return { command, args, options };
}

function validateCommandArgs(command: string | undefined, args: string[]): void {
  if (!command || ['help', '--help', '-h'].includes(command)) return;
  const values = positional(args);
  const singleOperandUsage: Record<string, string> = {
    import: 'usage: pastevault import <file.json> [options]',
    show: 'usage: pastevault show <id> [options]',
    pin: 'usage: pastevault pin <id> [options]',
    unpin: 'usage: pastevault unpin <id> [options]',
    rm: 'usage: pastevault rm <id> [options]',
    remove: 'usage: pastevault remove <id> [options]',
    'capture-file': 'usage: pastevault capture-file <file> [options]'
  };
  const usage = singleOperandUsage[command];
  if (usage && values.length !== 1) throw new Error(usage);

  if (['list', 'palette', 'secrets', 'stats', 'export'].includes(command) && values.length !== 0) {
    throw new Error(`usage: pastevault ${command} [options]`);
  }
  if (command === 'add' && !args.includes('--stdin') && values.length === 0) {
    throw new Error('usage: pastevault add <text> [options]');
  }
  if (['search', 'redact'].includes(command) && values.length === 0) {
    throw new Error(`usage: pastevault ${command} <text> [options]`);
  }
}

function optionValue(argv: string[], index: number, option: string): string {
  const value = argv[index];
  if (!value || value.startsWith('-')) throw new Error(`${option} requires a value`);
  return value;
}

function requiredArg(args: string[], message: string): string {
  const value = positional(args)[0];
  if (!value) throw new Error(message);
  return value;
}

function exactPositionals(args: string[], count: number, message: string): string[] {
  const values = positional(args);
  if (values.length !== count) throw new Error(message);
  return values;
}

function positional(args: string[]): string[] {
  const values: string[] = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (['--store', '--limit', '--tag'].includes(arg)) {
      index += 1;
      continue;
    }
    if (arg.startsWith('--')) continue;
    values.push(arg);
  }
  return values;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of input) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}

function redactCommand(args: string[]): number {
  const text = positional(args).join(' ');
  write(`${redactText(text, detectSecrets(text))}\n`);
  return 0;
}

function writeItem(item: import('./types.js').PasteItem, options: CliOptions): void {
  write(options.json ? renderJson({ item: safeItem(item, options.reveal) }) : renderShow(item, options.reveal));
}

function write(text: string): void {
  stdout.write(text);
}

export function isDirectExecution(moduleUrl: string, argvPath: string | undefined): boolean {
  if (!argvPath) return false;
  try {
    return realpathSync(fileURLToPath(moduleUrl)) === realpathSync(argvPath);
  } catch {
    return false;
  }
}

if (isDirectExecution(import.meta.url, process.argv[1])) {
  process.exitCode = await main();
}
