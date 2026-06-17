import { ObsidianGraph } from "@/components/modules/obsidian/obsidian-graph";
import { getAllNotes } from "@/lib/obsidian";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ObsidianPage() {
  let notes: { path: string; name: string; folder: string; tags: string[]; links: number; modifiedAt: string }[] = [];
  let folders: string[] = [];
  let count = 0;

  try {
    const allNotes = await getAllNotes();
    count = allNotes.length;
    folders = [...new Set(allNotes.map((n) => n.folder))];
    notes = allNotes
      .map((n) => ({
        path: n.path,
        name: n.name,
        folder: n.folder,
        tags: n.tags,
        links: n.links.length,
        modifiedAt: n.modifiedAt,
      }))
      .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
  } catch {
    // Vault not accessible
  }

  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">Knowledge Graph</div>
        <h1 className="premium-title">Obsidian Vault</h1>
        <p className="premium-subtitle">
          {count > 0
            ? `${count} notes across ${folders.length} folders`
            : "Vault not connected — set OBSIDIAN_VAULT_PATH"}
        </p>
      </div>

      {count > 0 ? (
        <>
          <section className="premium-panel animate-fade-in overflow-hidden p-3">
            <ObsidianGraph />
          </section>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <section className="premium-panel animate-fade-in">
              <h2 className="text-sm font-semibold text-[var(--text)] mb-3">Recent Notes</h2>
              <div className="space-y-1 animate-stagger">
                {notes.slice(0, 15).map((n) => (
                  <div
                    key={n.path}
                    className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-[var(--surface-hover)]"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-[var(--text)]">{n.name}</div>
                      <div className="text-xs text-[var(--text-tertiary)]">
                        {n.folder} · {n.links} links
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {n.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-[var(--surface-hover)] px-2 py-0.5 text-[9px] text-[var(--text-tertiary)]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="premium-panel animate-fade-in">
              <h2 className="text-sm font-semibold text-[var(--text)] mb-3">Folders</h2>
              <div className="grid grid-cols-2 gap-2 animate-stagger">
                {folders.map((f) => {
                  const count = notes.filter((n) => n.folder === f).length;
                  return (
                    <div
                      key={f}
                      className="rounded-lg border border-[var(--border-light)] bg-[var(--surface-raised)] p-3 hover:border-[var(--border)] transition-colors"
                    >
                      <div className="text-sm font-medium text-[var(--text)]">{f}</div>
                      <div className="mt-1 text-xs text-[var(--text-tertiary)]">{count} notes</div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </>
      ) : (
        <section className="premium-panel animate-fade-in">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="mb-1 text-sm font-semibold text-[var(--text)]">Vault Not Connected</h3>
            <p className="mb-4 max-w-xs text-xs text-[var(--text-tertiary)]">
              Add <code className="rounded bg-[var(--surface-hover)] px-1.5 py-0.5 text-[var(--accent)]">OBSIDIAN_VAULT_PATH</code> to your .env file to connect your Obsidian vault.
            </p>
            <Link href="/settings" className="premium-action text-xs">Go to Settings</Link>
          </div>
        </section>
      )}
    </div>
  );
}
