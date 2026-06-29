"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Command {
  id: string;
  label: string;
  shortcut: string;
  href: string;
  icon: string;
  section: string;
}

const COMMANDS: Command[] = [
  { id: "home", label: "Home", shortcut: "G H", href: "/", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", section: "Navigation" },
  { id: "t1d", label: "Glucose Command", shortcut: "G T", href: "/t1d", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", section: "Navigation" },
  { id: "finance", label: "Finance", shortcut: "G F", href: "/finance", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", section: "Navigation" },
  { id: "tasks", label: "Tasks", shortcut: "G K", href: "/tasks", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", section: "Navigation" },
  { id: "habits", label: "Habits", shortcut: "G B", href: "/habits", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", section: "Navigation" },
  { id: "sleep", label: "Sleep", shortcut: "G S", href: "/sleep", icon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z", section: "Navigation" },
  { id: "activity", label: "Activity", shortcut: "G A", href: "/activity", icon: "M13 10V3L4 14h7v7l9-11h-7z", section: "Navigation" },
  { id: "journal", label: "Journal", shortcut: "G J", href: "/journal", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", section: "Navigation" },
  { id: "obsidian", label: "Obsidian Vault", shortcut: "G O", href: "/obsidian", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1", section: "Navigation" },
  { id: "log-glucose", label: "Log Glucose", shortcut: "N G", href: "/t1d/log", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6", section: "Quick Add" },
  { id: "log-sleep", label: "Log Sleep", shortcut: "N S", href: "/sleep/log", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6", section: "Quick Add" },
  { id: "log-activity", label: "Log Activity", shortcut: "N A", href: "/activity/log", icon: "M13 10V3L4 14h7v7l9-11h-7z", section: "Quick Add" },
  { id: "log-task", label: "New Task", shortcut: "N K", href: "/tasks", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6", section: "Quick Add" },
  { id: "log-habit", label: "New Habit", shortcut: "N H", href: "/habits/new", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6", section: "Quick Add" },
  { id: "journal-new", label: "New Entry", shortcut: "N J", href: "/journal/new", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", section: "Quick Add" },
  { id: "settings", label: "Settings", shortcut: "G ,", href: "/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z", section: "System" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? COMMANDS.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.shortcut.toLowerCase().includes(query.toLowerCase()) ||
          c.section.toLowerCase().includes(query.toLowerCase())
      )
    : COMMANDS;

  // Group filtered results by section
  const grouped: Record<string, Command[]> = {};
  for (const cmd of filtered) {
    if (!grouped[cmd.section]) grouped[cmd.section] = [];
    grouped[cmd.section].push(cmd);
  }

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard shortcut to open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      // Escape to close
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Auto-focus input
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  // Navigate with arrow keys
  const handlePaletteKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const flatCommands = filtered;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, flatCommands.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && flatCommands[selectedIndex]) {
        e.preventDefault();
        router.push(flatCommands[selectedIndex].href);
        setOpen(false);
      }
    },
    [filtered, selectedIndex, router]
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed left-1/2 top-[15%] z-[101] w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--surface-deep)] shadow-[0_28px_80px_rgba(0,0,0,0.6)]"
          >
            {/* Search */}
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handlePaletteKeyDown}
                placeholder="Search commands..."
                className="flex-1 border-none bg-transparent p-0 text-sm text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:ring-0 focus:outline-none"
              />
              <kbd className="rounded border border-[var(--border)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--text-tertiary)]">esc</kbd>
            </div>

            {/* Results */}
            <div className="max-h-[320px] overflow-y-auto py-2">
              {Object.entries(grouped).map(([section, commands]) => (
                <div key={section}>
                  <div className="px-4 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                    {section}
                  </div>
                  {commands.map((cmd) => {
                    const flatIndex = filtered.indexOf(cmd);
                    const isSelected = flatIndex === selectedIndex;
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          router.push(cmd.href);
                          setOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors ${
                          isSelected
                            ? "bg-[var(--surface-hover)]"
                            : "hover:bg-[var(--surface-hover)]"
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={cmd.icon} />
                        </svg>
                        <span className="flex-1 text-sm text-[var(--text)]">{cmd.label}</span>
                        <kbd className="rounded bg-[var(--surface)] border border-[var(--border)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--text-tertiary)]">
                          {cmd.shortcut}
                        </kbd>
                      </button>
                    );
                  })}
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="px-4 py-8 text-center text-xs text-[var(--text-tertiary)]">
                  No commands found
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[var(--border)] px-4 py-2 flex items-center gap-4 text-[9px] text-[var(--text-tertiary)]">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Dismiss</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
