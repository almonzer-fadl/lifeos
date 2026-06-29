import fs from "fs";
import path from "path";

const VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH || "/Users/almonzerfadl/Fadl Company LTD/Vault";

interface ObsidianNote {
  path: string;       // relative path from vault root
  name: string;       // filename without .md
  content: string;    // raw markdown
  links: string[];    // [[wikilinks]] target names
  tags: string[];     // #tags
  folder: string;     // parent folder name
  modifiedAt: string; // ISO date
  size: number;       // bytes
  frontmatter: Record<string, unknown> | null;
}

interface GraphNode {
  id: string;
  name: string;
  folder: string;
  links: number;
  tags: string[];
  size: number;
}

interface GraphEdge {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Parse YAML frontmatter (simple, no external deps)
function parseFrontmatter(content: string): { data: Record<string, unknown> | null; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { data: null, body: content };

  const data: Record<string, unknown> = {};
  const lines = match[1].split("\n");
  for (const line of lines) {
    const kv = line.match(/^(\w[\w\s]*?):\s*(.*)/);
    if (kv) {
      const key = kv[1].trim();
      let value: unknown = kv[2].trim();
      // Handle arrays
      if (value === "true") value = true;
      else if (value === "false") value = false;
      else if (/^\d+$/.test(value as string)) value = parseInt(value as string);
      else if (/^\[(.*)\]$/.test(value as string)) {
        value = (value as string).slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
      }
      data[key] = value;
    }
  }

  return { data: Object.keys(data).length > 0 ? data : null, body: content.slice(match[0].length) };
}

// Extract [[wikilinks]] from markdown body
function extractWikilinks(body: string): string[] {
  const links = new Set<string>();
  const regex = /\[\[([^\]|#]+)(?:[|#][^\]]+)?\]\]/g;
  let match;
  while ((match = regex.exec(body)) !== null) {
    links.add(match[1].trim());
  }
  return [...links];
}

// Extract #tags
function extractTags(body: string): string[] {
  const tags = new Set<string>();
  // Only match tags that are not inside code blocks
  const cleanBody = body.replace(/```[\s\S]*?```/g, "");
  const regex = /#([\w-/]+)/g;
  let match;
  while ((match = regex.exec(cleanBody)) !== null) {
    tags.add(match[1]);
  }
  return [...tags];
}

function isMarkdownFile(filePath: string): boolean {
  return path.extname(filePath).toLowerCase() === ".md";
}

function shouldSkipFolder(folder: string): boolean {
  const skip = [".obsidian", ".stfolder", ".trash", ".git", "node_modules"];
  return skip.includes(folder) || folder.startsWith(".");
}

export async function getAllNotes(): Promise<ObsidianNote[]> {
  const notes: ObsidianNote[] = [];
  const dirs = fs.readdirSync(VAULT_PATH, { withFileTypes: true });

  for (const entry of dirs) {
    if (!entry.isDirectory()) continue;
    if (shouldSkipFolder(entry.name)) continue;

    const folderPath = path.join(VAULT_PATH, entry.name);
    const files = walkDir(folderPath, entry.name);

    for (const file of files) {
      try {
        const content = fs.readFileSync(file.fullPath, "utf-8");
        const { data: frontmatter, body } = parseFrontmatter(content);
        const stat = fs.statSync(file.fullPath);

        notes.push({
          path: file.relativePath,
          name: file.name,
          content: body,
          links: extractWikilinks(body),
          tags: extractTags(body),
          folder: entry.name,
          modifiedAt: stat.mtime.toISOString(),
          size: stat.size,
          frontmatter,
        });
      } catch {
        // Skip unreadable files
      }
    }
  }

  return notes;
}

function walkDir(dir: string, folderName: string): { fullPath: string; relativePath: string; name: string }[] {
  const results: { fullPath: string; relativePath: string; name: string }[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(folderName, entry.name);

    if (entry.isDirectory()) {
      if (!shouldSkipFolder(entry.name)) {
        results.push(...walkDir(fullPath, relativePath));
      }
    } else if (isMarkdownFile(entry.name)) {
      results.push({
        fullPath,
        relativePath,
        name: entry.name.replace(/\.md$/, ""),
      });
    }
  }

  return results;
}

export async function getNoteByName(name: string): Promise<ObsidianNote | null> {
  const notes = await getAllNotes();
  return notes.find((n) => n.name === name) || null;
}

export async function getNoteByPath(relativePath: string): Promise<ObsidianNote | null> {
  const fullPath = path.join(VAULT_PATH, relativePath);
  try {
    const content = fs.readFileSync(fullPath, "utf-8");
    const { data: frontmatter, body } = parseFrontmatter(content);
    const stat = fs.statSync(fullPath);

    return {
      path: relativePath,
      name: path.basename(relativePath, ".md"),
      content: body,
      links: extractWikilinks(body),
      tags: extractTags(body),
      folder: path.dirname(relativePath).split("/")[0],
      modifiedAt: stat.mtime.toISOString(),
      size: stat.size,
      frontmatter,
    };
  } catch {
    return null;
  }
}

export async function searchNotes(query: string): Promise<ObsidianNote[]> {
  const notes = await getAllNotes();
  const q = query.toLowerCase();
  return notes.filter(
    (n) =>
      n.name.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export async function getGraphData(): Promise<GraphData> {
  const notes = await getAllNotes();
  const nodeMap = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();

  // Create nodes
  for (const note of notes) {
    nodeMap.set(note.name, {
      id: note.name,
      name: note.name,
      folder: note.folder,
      links: note.links.length,
      tags: note.tags,
      size: Math.min(note.links.length + 1, 20),
    });
  }

  // Create edges for [[wikilinks]]
  for (const note of notes) {
    for (const target of note.links) {
      if (!nodeMap.has(target)) continue; // target doesn't exist as a note
      const key = [note.name, target].sort().join("||");
      if (edgeSet.has(key)) continue;
      edgeSet.add(key);
      edges.push({ source: note.name, target });
    }
  }

  // Also connect notes with shared tags
  const tagMap = new Map<string, string[]>();
  for (const note of notes) {
    for (const tag of note.tags) {
      if (!tagMap.has(tag)) tagMap.set(tag, []);
      tagMap.get(tag)!.push(note.name);
    }
  }

  for (const [, tagNotes] of tagMap) {
    if (tagNotes.length < 2 || tagNotes.length > 20) continue; // skip too common or trivial tags
    for (let i = 0; i < tagNotes.length; i++) {
      for (let j = i + 1; j < tagNotes.length; j++) {
        const key = [tagNotes[i], tagNotes[j]].sort().join("||");
        if (edgeSet.has(key)) continue;
        edgeSet.add(key);
        edges.push({ source: tagNotes[i], target: tagNotes[j] });
      }
    }
  }

  return {
    nodes: [...nodeMap.values()],
    edges,
  };
}

export { VAULT_PATH };
