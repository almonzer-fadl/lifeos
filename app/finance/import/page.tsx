import { EmptyState } from "@/components/ui/empty-state";

export default function ImportPage() {
  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">Data Pipeline</div>
        <h1 className="premium-title">Import</h1>
        <p className="premium-subtitle">CSV and bank statement imports</p>
      </div>
      <section className="premium-panel animate-fade-in">
        <EmptyState
          icon="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          title="Import coming soon"
          description="Drag-and-drop CSV imports, column mapping, and duplicate detection are in development."
        />
      </section>
    </div>
  );
}
