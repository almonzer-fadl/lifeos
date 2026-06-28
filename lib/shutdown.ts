export function setupGracefulShutdown(server: { close: (callback: () => void) => void }) {
  let shuttingDown = false;

  process.on("SIGTERM", () => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log("[lifeos] SIGTERM received, draining connections...");

    server.close(() => {
      console.log("[lifeos] Server closed");
      process.exit(0);
    });

    // Force exit after 10s
    setTimeout(() => {
      console.log("[lifeos] Force exit after timeout");
      process.exit(1);
    }, 10_000);
  });

  process.on("SIGINT", () => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log("[lifeos] SIGINT received, shutting down...");
    process.exit(0);
  });
}
