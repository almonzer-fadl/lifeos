"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?mode=count");
      const data = await res.json();
      if (data.count !== undefined) setCount(data.count);
    } catch { /* ignore */ }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=5");
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
        setCount(data.length);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  const handleOpen = () => {
    fetchNotifications();
    setOpen(!open);
  };

  const handleMarkAllRead = async () => {
    if (notifications.length === 0) return;
    const ids = notifications.map((n) => n.id);
    setNotifications([]);
    setCount(0);
    setOpen(false);
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read_all", ids }),
    }).catch(() => {});
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center h-10 w-10 rounded-lg border border-[var(--border-light)] bg-[rgba(255,255,255,0.02)] text-[var(--text-tertiary)] hover:border-[var(--border)] hover:text-[var(--text-secondary)] transition-all"
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 flex items-center justify-center h-4 min-w-[16px] rounded-full bg-[var(--rose)] text-[9px] font-bold text-white px-1"
          >
            {count > 9 ? "9+" : count}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 z-50 w-80 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] shadow-[var(--shadow-modal)] overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-light)]">
                <span className="text-xs font-semibold text-[var(--text)]">Notifications</span>
                {notifications.length > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-tertiary)] hover:text-[var(--text)]"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-xs text-[var(--text-tertiary)]">No new notifications</p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="border-b border-[var(--border-light)] last:border-b-0">
                      {n.href ? (
                        <Link
                          href={n.href}
                          onClick={() => setOpen(false)}
                          className="block px-4 py-3 hover:bg-[var(--surface-hover)] transition-colors"
                        >
                          <div className="text-xs font-semibold text-[var(--text)] leading-snug">{n.title}</div>
                          <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed line-clamp-2">{n.body}</div>
                          <div className="text-[9px] text-[var(--text-tertiary)] mt-1">
                            {formatRelativeTime(n.createdAt)}
                          </div>
                        </Link>
                      ) : (
                        <div className="px-4 py-3">
                          <div className="text-xs font-semibold text-[var(--text)] leading-snug">{n.title}</div>
                          <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed line-clamp-2">{n.body}</div>
                          <div className="text-[9px] text-[var(--text-tertiary)] mt-1">
                            {formatRelativeTime(n.createdAt)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}
