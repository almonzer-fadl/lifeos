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
      <div className="premium-header">
        <div className="premium-kicker">Knowledge Network</div>
        <h1 className="premium-title">The Archive</h1>
        <p className="premium-subtitle italic">
          {count > 0
            ? `Your intellectual estate currently contains ${count} curated notes across ${folders.length} sectors.`
            : "Vault not connected — established path required."}
        </p>
      </div>

      {count > 0 ? (
        <>
          <section className="premium-panel overflow-hidden shadow-2xl p-8">
            <div className="mb-8 border-b border-[var(--border-light)] pb-6">
              <h2 className="text-xl font-serif text-[var(--text)]">Intellectual Graph</h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-tertiary)] mt-1">Visualizing connection and density</p>
            </div>
            <div className="h-[500px] w-full bg-[var(--bg)] rounded-[32px] overflow-hidden">
              <ObsidianGraph />
            </div>
          </section>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <section className="space-y-8">
                <div>
                  <h2 className="text-xl font-serif text-[var(--text)]">Recent Manuscripts</h2>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-tertiary)] mt-1">Latest modifications</p>
                </div>
                <div className="space-y-1">
                  {notes.slice(0, 10).map((n) => (
                    <div
                      key={n.path}
                      className="group flex items-center justify-between gap-6 rounded-2xl p-4 transition-all hover:bg-white hover:shadow-lg"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-[var(--text)]">{n.name}</div>
                        <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mt-1">
                          {n.folder} · {n.links} References
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {n.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[var(--accent)]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="lg:col-span-5">
              <section className="space-y-8">
                <div>
                  <h2 className="text-xl font-serif text-[var(--text)]">Sectors</h2>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-tertiary)] mt-1">Vault organization</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {folders.slice(0, 8).map((f) => {
                    const folderCount = notes.filter((n) => n.folder === f).length;
                    return (
                      <div
                        key={f}
                        className="rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[var(--text)] tracking-wide">{f}</span>
                          <span className="font-serif text-lg text-[var(--accent)]">{folderCount}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
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
