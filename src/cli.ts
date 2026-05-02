#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { stdin as input, stdout, stderr } from 'node:process';
import { defaultStorePath, loadVault, saveVault } from './storage.js';
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
  pastevault import <file.json> [--store path]
  pastevault list [--limit n] [--tag name] [--pinned] [--json] [--reveal]
  pastevault search <query> [--json] [--reveal]
  pastevault show <id> [--json] [--reveal]
  pastevault pin <id> | unpin <id> | rm <id>
  pastevault palette [--limit n] [--reveal]
  pastevault secrets [--json]
  pastevault redact <text>
  pastevault stats [--json]

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

    const vaultFile = await loadVault(options.store);
    const vault = new PasteVault(vaultFile);

    switch (command) {
      case 'add': {
        const text = args.includes('--stdin') ? await readStdin() : args.filter((arg) => !arg.startsWith('--')).join(' ');
        const item = vault.add({ text, tags: options.tags, pinned: args.includes('--pin'), source: args.includes('--stdin') ? 'stdin' : 'manual' });
        await saveVault(options.store, vault.data);
        writeItem(item, options);
        return 0;
      }
      case 'import': {
        const file = args.find((arg) => !arg.startsWith('--'));
        if (!file) throw new Error('import requires a JSON file path');
        const items = vault.importItems(await readImportFile(file));
        await saveVault(options.store, vault.data);
        write(options.json ? renderJson({ imported: items.length, items: items.map((item) => safeItem(item, options.reveal)) }) : `Imported ${items.length} snippets.\n`);
        return 0;
      }
      case 'list': {
        const items = vault.list({ limit: options.limit, includeSecrets: options.reveal, pinned: options.pinned, tags: options.tags });
        write(options.json ? renderJson({ items: items.map((item) => safeItem(item, options.reveal)) }) : renderList(items, options.reveal));
        return 0;
      }
      case 'search': {
        const query = args.filter((arg) => !arg.startsWith('--')).join(' ');
        if (!query) throw new Error('search requires a query');
        const items = vault.list({ query, limit: options.limit, includeSecrets: options.reveal, tags: options.tags });
        write(options.json ? renderJson({ query, items: items.map((item) => safeItem(item, options.reveal)) }) : renderList(items, options.reveal));
        return 0;
      }
      case 'show': {
        const item = vault.get(requiredArg(args, 'show requires an id'));
        write(options.json ? renderJson({ item: safeItem(item, options.reveal) }) : renderShow(item, options.reveal));
        return 0;
      }
      case 'pin':
      case 'unpin': {
        const item = vault.pin(requiredArg(args, `${command} requires an id`), command === 'pin');
        await saveVault(options.store, vault.data);
        writeItem(item, options);
        return 0;
      }
      case 'rm':
      case 'remove': {
        const item = vault.remove(requiredArg(args, 'remove requires an id'));
        await saveVault(options.store, vault.data);
        write(options.json ? renderJson({ removed: safeItem(item, options.reveal) }) : `Removed ${item.id}.\n`);
        return 0;
      }
      case 'palette': {
        const items = vault.list({ limit: options.limit ?? 12, tags: options.tags });
        write(options.json ? renderJson({ items: items.map((item) => safeItem(item, options.reveal)) }) : renderPalette(items, options.reveal));
        return 0;
      }
      case 'secrets': {
        const items = vault.data.items.filter((item) => item.secrets.length > 0).map((item) => ({ id: item.id, findings: item.secrets, redacted: redactText(item.text, item.secrets) }));
        write(options.json ? renderJson({ items }) : `${items.map((item) => `${item.id} ${item.findings.map((finding) => finding.kind).join(', ')} ${item.redacted.split('\n')[0]}`).join('\n')}\n`);
        return 0;
      }
      case 'stats': {
        const stats = vault.stats();
        write(options.json ? renderJson(stats) : `items: ${stats.items}\npinned: ${stats.pinned}\nwith secrets: ${stats.withSecrets}\ntags: ${stats.tags.join(', ') || '-'}\n`);
        return 0;
      }
      case 'capture-file': {
        const file = requiredArg(args, 'capture-file requires a text file');
        const text = await readFile(file, 'utf8');
        const inputItem: AddInput = { text, source: 'clipboard', tags: options.tags };
        const item = vault.add(inputItem);
        await saveVault(options.store, vault.data);
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
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--store') options.store = argv[++index];
    else if (arg === '--json') options.json = true;
    else if (arg === '--reveal') options.reveal = true;
    else if (arg === '--limit') options.limit = Number(argv[++index]);
    else if (arg === '--tag') options.tags.push(argv[++index]);
    else if (arg === '--pinned') options.pinned = true;
  }
  if (options.limit !== undefined && (!Number.isInteger(options.limit) || options.limit < 1)) throw new Error('--limit must be a positive integer');
  return { command, args, options };
}

function requiredArg(args: string[], message: string): string {
  const value = args.find((arg) => !arg.startsWith('--'));
  if (!value) throw new Error(message);
  return value;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of input) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}

function redactCommand(args: string[]): number {
  const text = args.join(' ');
  write(`${redactText(text, detectSecrets(text))}\n`);
  return 0;
}

function writeItem(item: import('./types.js').PasteItem, options: CliOptions): void {
  write(options.json ? renderJson({ item: safeItem(item, options.reveal) }) : renderShow(item, options.reveal));
}

function write(text: string): void {
  stdout.write(text);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = await main();
}
