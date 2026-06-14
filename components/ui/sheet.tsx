"use client";

import { Drawer } from "vaul";

interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  children: React.ReactNode;
  title?: string;
}

export function Sheet({ open, onOpenChange, trigger, children, title }: SheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>}
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface-raised)] border-t border-[var(--border)] rounded-t-2xl max-h-[85vh] focus:outline-none">
          <div className="mx-auto mt-3 mb-2 w-10 h-1 rounded-full bg-[var(--border-strong)]" />
          {title && (
            <div className="px-4 pt-1 pb-2">
              <Drawer.Title className="text-sm font-semibold text-[var(--text)]">
                {title}
              </Drawer.Title>
            </div>
          )}
          <div className="px-4 pb-8 pt-1 overflow-y-auto max-h-[calc(85vh-3rem)]">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
