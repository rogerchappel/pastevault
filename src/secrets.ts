import type { SecretFinding } from './types.js';

interface PatternRule {
  kind: string;
  confidence: SecretFinding['confidence'];
  pattern: RegExp;
}

const rules: PatternRule[] = [
  { kind: 'github-token', confidence: 'high', pattern: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g },
  { kind: 'slack-token', confidence: 'high', pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g },
  { kind: 'aws-access-key-id', confidence: 'high', pattern: /\bA[SK]IA[0-9A-Z]{16}\b/g },
  { kind: 'private-key', confidence: 'high', pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g },
  { kind: 'bearer-token', confidence: 'medium', pattern: /\bBearer\s+[A-Za-z0-9._~+/=-]{24,}\b/g },
  { kind: 'generic-secret-assignment', confidence: 'medium', pattern: /\b(?:api[_-]?key|secret|token|password)\s*[:=]\s*['"]?[^'"\s]{12,}['"]?/gi },
  { kind: 'jwt', confidence: 'medium', pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g }
];

export function detectSecrets(text: string): SecretFinding[] {
  const findings: SecretFinding[] = [];
  for (const rule of rules) {
    for (const match of text.matchAll(rule.pattern)) {
      if (match.index === undefined) continue;
      const value = match[0];
      findings.push({
        kind: rule.kind,
        start: match.index,
        end: match.index + value.length,
        preview: previewSecret(value),
        confidence: rule.confidence
      });
    }
  }
  return mergeFindings(findings);
}

export function redactText(text: string, findings = detectSecrets(text)): string {
  if (findings.length === 0) return text;
  let output = '';
  let cursor = 0;
  for (const finding of [...findings].sort((a, b) => a.start - b.start)) {
    if (finding.start < cursor) continue;
    output += text.slice(cursor, finding.start);
    output += `[redacted:${finding.kind}]`;
    cursor = finding.end;
  }
  output += text.slice(cursor);
  return output;
}

export function hasSecrets(text: string): boolean {
  return detectSecrets(text).length > 0;
}

function previewSecret(value: string): string {
  const compact = value.replace(/\s+/g, ' ');
  if (compact.length <= 10) return '*'.repeat(compact.length);
  return `${compact.slice(0, 4)}…${compact.slice(-4)}`;
}

function mergeFindings(findings: SecretFinding[]): SecretFinding[] {
  const sorted = findings.sort((a, b) => a.start - b.start || b.end - a.end);
  const merged: SecretFinding[] = [];
  for (const finding of sorted) {
    const previous = merged.at(-1);
    if (previous && finding.start < previous.end) {
      if (previous.confidence !== 'high' && finding.confidence === 'high') {
        merged[merged.length - 1] = { ...finding };
      } else {
        if (finding.end > previous.end) previous.end = finding.end;
        previous.confidence = previous.confidence === 'high' || finding.confidence === 'high' ? 'high' : previous.confidence;
      }
      continue;
    }
    merged.push({ ...finding });
  }
  return merged;
}
