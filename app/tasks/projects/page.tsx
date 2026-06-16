import { EmptyState } from "@/components/ui/empty-state";

export default function ProjectsPage() {
  return (
    <div className="premium-page"><div className="premium-header animate-fade-in"><div className="premium-kicker">Workspaces</div><h1 className="premium-title">Projects</h1><p className="premium-subtitle">Organize tasks into projects</p></div>
    <section className="premium-panel animate-fade-in"><EmptyState icon="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2zm0 0l4 4 4-4 4 4" title="Coming soon" description="Project management is in development." /></section></div>
  );
}
