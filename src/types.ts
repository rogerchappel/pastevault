export type PasteSource = 'manual' | 'clipboard' | 'fixture' | 'stdin' | 'import';

export interface SecretFinding {
  kind: string;
  start: number;
  end: number;
  preview: string;
  confidence: 'low' | 'medium' | 'high';
}

export interface PasteItem {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  source: PasteSource;
  pinned: boolean;
  tags: string[];
  note?: string;
  contentHash: string;
  secrets: SecretFinding[];
}

export interface VaultFile {
  version: 1;
  createdAt: string;
  updatedAt: string;
  items: PasteItem[];
}

export interface AddInput {
  text: string;
  source?: PasteSource;
  tags?: string[];
  note?: string;
  pinned?: boolean;
  createdAt?: string;
}

export interface ListOptions {
  limit?: number;
  includeSecrets?: boolean;
  pinned?: boolean;
  query?: string;
  tags?: string[];
}

export interface SearchOptions extends ListOptions {
  query: string;
}

export interface RenderOptions {
  json?: boolean;
  includeSecrets?: boolean;
  limit?: number;
}
