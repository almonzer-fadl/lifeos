"use client";

import { useEffect, useState } from "react";

interface Book {
  id: string; title: string; author: string; status: string;
  category: string | null; rating: number | null; currentPage: number | null; pageCount: number | null;
  _count: { notes: number };
}

export default function ReadingPage() {
  const [books, setBooks] = useState<{ reading: Book[]; queue: Book[]; completed: Book[] }>({ reading: [], queue: [], completed: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/reading/books").then((r) => r.json()),
      fetch("/api/reading/queue").then((r) => r.json()),
    ]).then(([all, queue]) => {
      const allBooks: Book[] = Array.isArray(all) ? all : [];
      const queueBooks: Book[] = Array.isArray(queue) ? queue : [];
      setBooks({
        reading: allBooks.filter((b) => b.status === "reading"),
        queue: queueBooks,
        completed: allBooks.filter((b) => b.status === "completed").slice(0, 10),
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="premium-page"><div className="skeleton h-32 w-full rounded-lg" /></div>;

  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header">
        <div className="premium-kicker">Intellectual Growth</div>
        <h1 className="premium-title">Reading</h1>
        <p className="premium-subtitle">Books, notes, and ideas</p>
      </div>

      {books.reading.length > 0 && (
        <div className="premium-panel">
          <div className="mb-2 text-sm font-semibold text-[var(--text)]">Currently Reading</div>
          {books.reading.map((b) => (
            <div key={b.id} className="rounded-lg px-3 py-2 bg-[var(--surface)] border border-[var(--border-light)]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-[var(--text)]">{b.title}</div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">{b.author}</div>
                </div>
                {b.currentPage != null && b.pageCount != null && (
                  <span className="text-xs text-[var(--sky)]">{Math.round(b.currentPage / b.pageCount * 100)}%</span>
                )}
              </div>
              {b.currentPage != null && b.pageCount != null && (
                <div className="mt-2 h-1.5 rounded-full bg-[var(--border-light)] overflow-hidden">
                  <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${(b.currentPage / b.pageCount) * 100}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {books.queue.length > 0 && (
        <div className="premium-panel">
          <div className="mb-2 text-sm font-semibold text-[var(--text)]">Reading Queue</div>
          <div className="space-y-1">
            {books.queue.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg px-3 py-2 bg-[var(--surface)] border border-[var(--border-light)]">
                <div>
                  <div className="text-sm text-[var(--text)]">{b.title}</div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">{b.author}{b.category ? ` · ${b.category}` : ""}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {books.completed.length > 0 && (
        <div className="premium-panel">
          <div className="mb-2 text-sm font-semibold text-[var(--text)]">Completed</div>
          <div className="space-y-1">
            {books.completed.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg px-3 py-2 bg-[var(--surface)] border border-[var(--border-light)]">
                <div>
                  <div className="text-sm text-[var(--text)]">{b.title}</div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">{b.author}</div>
                </div>
                {b.rating && <span className="text-xs text-[var(--accent)]">{"★".repeat(b.rating)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {books.reading.length === 0 && books.queue.length === 0 && books.completed.length === 0 && (
        <div className="premium-empty">No books yet. Start your reading list.</div>
      )}
    </div>
  );
}
