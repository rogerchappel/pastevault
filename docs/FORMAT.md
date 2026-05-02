# Vault file format

pastevault stores versioned JSON:

```ts
interface VaultFile {
  version: 1;
  createdAt: string;
  updatedAt: string;
  items: PasteItem[];
}
```

Each item includes an id, original text, timestamps, source, pin state, normalized tags, content hash, and secret findings. The format is intentionally JSON-friendly so tests, agents, and migrations can inspect it without a daemon.

The CLI writes with an atomic temp-file rename. Future incompatible changes should add a migration path and bump `version`.
