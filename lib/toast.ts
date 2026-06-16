import { toast as sonner } from "sonner";

export const toast = {
  success(message: string, opts?: { undo?: () => void }) {
    if (opts?.undo) {
      sonner.success(message, {
        action: { label: "Undo", onClick: opts.undo },
        duration: 5000,
      });
    } else {
      sonner.success(message);
    }
  },

  error(message: string) {
    sonner.error(message);
  },

  info(message: string) {
    sonner(message);
  },

  promise<T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) {
    return sonner.promise(promise, messages);
  },

  dismiss() {
    sonner.dismiss();
  },
};
