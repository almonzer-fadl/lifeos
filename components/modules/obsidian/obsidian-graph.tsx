"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface GraphNodeData {
  id: string;
  name: string;
  folder: string;
  links: number;
  tags: string[];
  size: number;
}

interface GraphEdgeData {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
}

const FOLDER_COLORS: Record<string, string> = {
  "LifeOS": "#c8a85b",
  "Project Genesis": "#689dc8",
  "Project Zenith": "#a08ef5",
  "Project Origin": "#e85460",
  "Project Axone": "#3ec488",
  "Marketing": "#d4952a",
  "Gari": "#d58b45",
  "Cheet Sheets": "#8298e8",
  "Archive": "#586573",
};

function folderColor(folder: string): string {
  return FOLDER_COLORS[folder] || "#586573";
}

// Hex to RGB for glow effects
function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

export function ObsidianGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNodeData | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNodeData | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number }>>([]);

  // Node physics state (mutable for animation)
  const nodeState = useRef<Map<string, { x: number; y: number; vx: number; vy: number; size: number; color: string }>>(new Map());

  useEffect(() => {
    fetch("/api/obsidian?type=graph")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  // Initialize physics
  const initPhysics = useCallback(() => {
    if (!data || !containerRef.current) return;
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    const nodeMap = nodeState.current;
    nodeMap.clear();

    const folderNodes = selectedFolder
      ? data.nodes.filter(n => n.folder === selectedFolder)
      : data.nodes;

    // Place nodes in a spiral
    const cx = w / 2;
    const cy = h / 2;
    const sorted = [...folderNodes].sort((a, b) => b.links - a.links);

    sorted.forEach((n, i) => {
      const angle = (i / sorted.length) * Math.PI * 6;
      const radius = 40 + (i / sorted.length) * Math.min(w, h) * 0.38;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      const color = folderColor(n.folder);
      const size = Math.max(3, Math.min(n.size * 2.2, 22));

      nodeMap.set(n.id, {
        x, y, vx: 0, vy: 0, size, color,
      });
    });

    // Initialize particles
    particlesRef.current = Array.from({ length: 60 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      life: Math.random(),
    }));
  }, [data, selectedFolder]);

  // Animation loop (stored in ref to avoid declaration-order issues)
  const animateRef = useRef<() => void>(() => {});

  animateRef.current = useCallback(() => {
    if (!data || !canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    canvas.width = w * devicePixelRatio;
    canvas.height = h * devicePixelRatio;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const nodeMap = nodeState.current;
    const nodes = [...nodeMap.entries()];
    const folderNodes = selectedFolder
      ? data.nodes.filter(n => n.folder === selectedFolder)
      : data.nodes;
    const nodeIds = new Set(folderNodes.map(n => n.id));
    const edges = data.edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

    // Physics step
    for (const [id, node] of nodes) {
      // Center gravity
      node.vx += (w / 2 - node.x) * 0.0003;
      node.vy += (h / 2 - node.y) * 0.0003;

      // Node repulsion
      for (const [id2, n2] of nodes) {
        if (id === id2) continue;
        const dx = node.x - n2.x;
        const dy = node.y - n2.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;
        const minDist = (node.size + n2.size) + 20;
        if (dist < minDist) {
          const force = (minDist - dist) / dist * 0.05;
          node.vx += dx * force;
          node.vy += dy * force;
        }
      }

      // Edge attraction
      for (const edge of edges) {
        if (edge.source === id || edge.target === id) {
          const otherId = edge.source === id ? edge.target : edge.source;
          const other = nodeMap.get(otherId);
          if (other) {
            const dx = other.x - node.x;
            const dy = other.y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy) + 1;
            const targetDist = 80;
            const force = (dist - targetDist) / dist * 0.001;
            node.vx += dx * force;
            node.vy += dy * force;
          }
        }
      }

      // Damping
      node.vx *= 0.92;
      node.vy *= 0.92;

      // Bounds
      node.x = Math.max(node.size, Math.min(w - node.size, node.x));
      node.y = Math.max(node.size, Math.min(h - node.size, node.y));
    }

    // Apply velocities
    for (const [, node] of nodes) {
      node.x += node.vx;
      node.y += node.vy;
    }

    // Clear with deep space background
    ctx.fillStyle = "#080a0c";
    ctx.fillRect(0, 0, w, h);

    // Draw background particles (dust) — copy to local to avoid mutating ref
    ctx.save();
    const particles = particlesRef.current;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      p.life += 0.002;
      if (p.life > 1) p.life = 0;

      const alpha = Math.sin(p.life * Math.PI) * 0.3;
      ctx.fillStyle = `rgba(200, 168, 91, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Draw edges with glow
    ctx.save();
    for (const edge of edges) {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (!source || !target) continue;

      const gradient = ctx.createLinearGradient(source.x, source.y, target.x, target.y);
      const sRgb = hexToRgb(source.color);
      const tRgb = hexToRgb(target.color);
      gradient.addColorStop(0, `rgba(${sRgb[0]},${sRgb[1]},${sRgb[2]},0.5)`);
      gradient.addColorStop(0.5, `rgba(200,168,91,0.15)`);
      gradient.addColorStop(1, `rgba(${tRgb[0]},${tRgb[1]},${tRgb[2]},0.5)`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();

      // Glow line
      ctx.strokeStyle = `rgba(200,168,91,0.08)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
    }
    ctx.restore();

    // Draw nodes
    for (const [id, node] of nodes) {
      const [r, g, b] = hexToRgb(node.color);
      const pulse = 1 + Math.sin(Date.now() * 0.002 + id.charCodeAt(0)) * 0.15;

      // Outer glow
      const glow = ctx.createRadialGradient(node.x, node.y, node.size * 0.5, node.x, node.y, node.size * 2.5);
      glow.addColorStop(0, `rgba(${r},${g},${b},0.35)`);
      glow.addColorStop(0.5, `rgba(${r},${g},${b},0.08)`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Node body
      const bodyGrad = ctx.createRadialGradient(
        node.x - node.size * 0.2, node.y - node.size * 0.2, 0,
        node.x, node.y, node.size * pulse
      );
      bodyGrad.addColorStop(0, `rgba(${Math.min(r + 60, 255)},${Math.min(g + 60, 255)},${Math.min(b + 60, 255)},1)`);
      bodyGrad.addColorStop(0.7, `rgba(${r},${g},${b},0.9)`);
      bodyGrad.addColorStop(1, `rgba(${r},${g},${b},0.5)`);

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Label for larger nodes
      if (node.size > 7) {
        ctx.fillStyle = "#e6eaf0";
        ctx.font = `${Math.max(8, node.size * 0.7)}px var(--font-sans), system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(id, node.x, node.y + node.size + 12);
      }
    }

    animRef.current = requestAnimationFrame(animateRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, selectedFolder]);

  useEffect(() => {
    if (data) {
      initPhysics();
      animRef.current = requestAnimationFrame(animateRef.current);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [data, selectedFolder, initPhysics]);

  // Canvas mouse interaction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDragging = false;
    let draggedId: string | null = null;

    const getNodeAt = (mx: number, my: number): string | null => {
      const nodeMap = nodeState.current;
      for (const [id, node] of nodeMap) {
        const dx = node.x - mx;
        const dy = node.y - my;
        if (Math.sqrt(dx * dx + dy * dy) < node.size * 1.8) return id;
      }
      return null;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (isDragging && draggedId) {
        const node = nodeState.current.get(draggedId);
        if (node) {
          node.x = mx;
          node.y = my;
          node.vx = 0;
          node.vy = 0;
        }
      } else {
        const hovered = getNodeAt(mx, my);
        const folderNodes = selectedFolder
          ? data?.nodes.filter(n => n.folder === selectedFolder)
          : data?.nodes;
        if (hovered && folderNodes) {
          const node = folderNodes.find(n => n.id === hovered);
          setHoveredNode(node || null);
          canvas.style.cursor = "grab";
        } else {
          setHoveredNode(null);
          canvas.style.cursor = "default";
        }
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const id = getNodeAt(mx, my);
      if (id) {
        isDragging = true;
        draggedId = id;
        canvas.style.cursor = "grabbing";
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isDragging) {
        // Click — select
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const id = getNodeAt(mx, my);
        if (id && data) {
          const node = (selectedFolder
            ? data.nodes.filter(n => n.folder === selectedFolder)
            : data.nodes).find(n => n.id === id);
          setSelectedNode(node || null);
        }
      }
      isDragging = false;
      draggedId = null;
      if (canvas) canvas.style.cursor = "default";
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    return () => {
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
    };
  }, [data, selectedFolder]);

  // Resize handler
  useEffect(() => {
    const onResize = () => { if (data) { initPhysics(); } };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [data, initPhysics]);

  const folders = data ? [...new Set(data.nodes.map(n => n.folder))].sort() : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[420px]">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="h-16 w-16 rounded-full border-2 border-[var(--accent)]/30 border-t-[var(--accent)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-xs text-[var(--text-tertiary)]">Mapping your knowledge graph…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[420px]">
        <p className="text-sm text-[var(--rose)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Folder filter */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setSelectedFolder(null)}
          className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide transition-all ${
            !selectedFolder
              ? "bg-[var(--surface-hover)] text-[var(--text)] border border-[var(--border-strong)]"
              : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          }`}
        >
          All ({data?.nodes.length || 0})
        </button>
        {folders.map(f => (
          <button
            key={f}
            onClick={() => setSelectedFolder(f)}
            className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide transition-all hover:opacity-90"
            style={{
              backgroundColor: folderColor(f) + "22",
              color: folderColor(f),
              border: `1px solid ${folderColor(f)}44`,
              ...(selectedFolder === f ? {
                backgroundColor: folderColor(f) + "33",
                border: `1px solid ${folderColor(f)}88`,
              } : {}),
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Graph canvas */}
      <div
        ref={containerRef}
        className="relative w-full rounded-lg border border-[var(--border)] overflow-hidden"
        style={{
          minHeight: "420px",
          height: "min(520px, 65vh)",
          background: "radial-gradient(ellipse at center, #0a0d12 0%, #080a0c 70%)",
        }}
      >
        <canvas ref={canvasRef} className="w-full h-full" />

        {/* Hover tooltip */}
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)]/95 backdrop-blur-md px-3 py-2 shadow-[var(--shadow-modal)] pointer-events-none"
          >
            <div className="text-xs font-semibold text-[var(--text)]">{hoveredNode.name}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-[var(--text-tertiary)]">{hoveredNode.folder}</span>
              {hoveredNode.links > 0 && (
                <span className="text-[10px] text-[var(--accent)]">{hoveredNode.links} connections</span>
              )}
            </div>
          </motion.div>
        )}

        {/* Drag hint */}
        <div className="absolute top-3 right-3 text-[9px] text-[var(--text-tertiary)]/50 pointer-events-none">
          drag to explore
        </div>
      </div>

      {/* Selected node detail */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: folderColor(selectedNode.folder) }}
                />
                <h3 className="text-sm font-semibold text-[var(--text)]">{selectedNode.name}</h3>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                {selectedNode.folder} · {selectedNode.links} connections
              </p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] text-sm"
            >
              ✕
            </button>
          </div>
          {selectedNode.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {selectedNode.tags.map(t => (
                <span key={t} className="rounded-full bg-[var(--surface-hover)] px-2 py-0.5 text-[9px] text-[var(--text-tertiary)]">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}

      <div className="mt-2 text-[9px] text-[var(--text-tertiary)] text-center">
        {data ? data.nodes.length : 0} notes · {data ? data.edges.length : 0} connections · drag nodes · hover for detail
      </div>
    </div>
  );
}
