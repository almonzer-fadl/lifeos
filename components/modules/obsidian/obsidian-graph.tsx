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
  "LifeOS": "#8c6d2d", // Refined Bronze-Gold
  "Project Genesis": "#4a4f54", // Obsidian Blue
  "Project Zenith": "#8c6d2d",
  "Project Origin": "#4a4f54",
  "Archive": "#989ea4",
};

function folderColor(folder: string): string {
  return FOLDER_COLORS[folder] || "#989ea4";
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

  // View state for Pan & Zoom
  const viewState = useRef({
    x: 0,
    y: 0,
    zoom: 1,
    targetX: 0,
    targetY: 0,
    targetZoom: 1,
  });

  // Node physics state (mutable for animation)
  const nodeState = useRef<Map<string, { x: number; y: number; vx: number; vy: number; size: number; color: string }>>(new Map());

  useEffect(() => {
    fetch("/api/obsidian?type=graph")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  // Initialize physics and center view
  const initPhysics = useCallback(() => {
    if (!data || !containerRef.current) return;
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    const nodeMap = nodeState.current;
    nodeMap.clear();

    const folderNodes = selectedFolder
      ? data.nodes.filter(n => n.folder === selectedFolder)
      : data.nodes;

    // Place nodes in a gentle spiral
    const cx = w / 2;
    const cy = h / 2;
    const sorted = [...folderNodes].sort((a, b) => b.links - a.links);

    sorted.forEach((n, i) => {
      const angle = (i / sorted.length) * Math.PI * 4;
      const radius = 20 + (i / sorted.length) * Math.min(w, h) * 0.35;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      const color = folderColor(n.folder);
      const size = Math.max(2, Math.min(n.size * 1.5, 14));

      nodeMap.set(n.id, {
        x, y, vx: 0, vy: 0, size, color,
      });
    });

    // Reset view
    viewState.current = {
      x: 0,
      y: 0,
      zoom: 1,
      targetX: 0,
      targetY: 0,
      targetZoom: 1,
    };
  }, [data, selectedFolder]);

  // Animation loop
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
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const nodeMap = nodeState.current;
    const nodes = [...nodeMap.entries()];
    const folderNodes = selectedFolder
      ? data.nodes.filter(n => n.folder === selectedFolder)
      : data.nodes;
    const nodeIds = new Set(folderNodes.map(n => n.id));
    const edges = data.edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

    // Smooth camera transition
    const vs = viewState.current;
    vs.zoom += (vs.targetZoom - vs.zoom) * 0.1;
    vs.x += (vs.targetX - vs.x) * 0.1;
    vs.y += (vs.targetY - vs.y) * 0.1;

    // Quiet Physics step
    for (const [id, node] of nodes) {
      // Gentle center gravity
      node.vx += (w / 2 - node.x) * 0.00015;
      node.vy += (h / 2 - node.y) * 0.00015;

      // Soft node repulsion
      for (const [id2, n2] of nodes) {
        if (id === id2) continue;
        const dx = node.x - n2.x;
        const dy = node.y - n2.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;
        const minDist = (node.size + n2.size) + 40;
        if (dist < minDist) {
          const force = (minDist - dist) / dist * 0.015;
          node.vx += dx * force;
          node.vy += dy * force;
        }
      }

      // Elegant edge attraction
      for (const edge of edges) {
        if (edge.source === id || edge.target === id) {
          const otherId = edge.source === id ? edge.target : edge.source;
          const other = nodeMap.get(otherId);
          if (other) {
            const dx = other.x - node.x;
            const dy = other.y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy) + 1;
            const targetDist = 100;
            const force = (dist - targetDist) / dist * 0.0005;
            node.vx += dx * force;
            node.vy += dy * force;
          }
        }
      }

      // High damping for silk-like movement
      node.vx *= 0.85;
      node.vy *= 0.85;

      node.x += node.vx;
      node.y += node.vy;
    }

    // Clear background - Infinite Ivory
    ctx.fillStyle = "#fcfbf7";
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for background clear
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // Apply View Transform
    ctx.save();
    ctx.translate(w / 2 + vs.x, h / 2 + vs.y);
    ctx.scale(vs.zoom, vs.zoom);
    ctx.translate(-w / 2, -h / 2);

    // Draw background texture gradient (scaled with view)
    const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/1.2);
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(1, "rgba(140, 109, 45, 0.05)");
    ctx.fillStyle = grad;
    ctx.fillRect(-w * 5, -h * 5, w * 15, h * 15);

    // Draw delicate edges
    ctx.save();
    ctx.lineWidth = 0.8 / vs.zoom; // Doubled edge width
    for (const edge of edges) {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (!source || !target) continue;

      ctx.strokeStyle = "rgba(20, 22, 24, 0.12)"; // Darkened for visibility
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
    }
    ctx.restore();

    // Draw nodes
    for (const [id, node] of nodes) {
      const isHovered = hoveredNode?.id === id;
      const isSelected = selectedNode?.id === id;
      
      // Node body - solid and clean
      ctx.fillStyle = isHovered || isSelected ? "var(--accent)" : node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, isHovered ? node.size + 4 : node.size, 0, Math.PI * 2);
      ctx.fill();

      // Delicate stroke
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2 / vs.zoom;
      ctx.stroke();

      // Serif Label for curated nodes
      if ((node.size > 6 && vs.zoom > 0.4) || isHovered) {
        ctx.fillStyle = isHovered ? "var(--text)" : "var(--text-tertiary)";
        ctx.font = `${isHovered ? "italic " : ""}12px var(--font-serif), serif`;
        ctx.textAlign = "center";
        ctx.fillText(id, node.x, node.y + node.size + 20);
      }
    }

    ctx.restore();

    animRef.current = requestAnimationFrame(animateRef.current);
  }, [data, selectedFolder, hoveredNode, selectedNode]);

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

    let isDraggingNode = false;
    let isPanning = false;
    let draggedId: string | null = null;
    let lastX = 0;
    let lastY = 0;

    const getNodeAt = (mx: number, my: number): string | null => {
      const vs = viewState.current;
      const w = containerRef.current?.clientWidth || 0;
      const h = containerRef.current?.clientHeight || 0;
      
      // Transform screen space to world space
      const wx = (mx - (w / 2 + vs.x)) / vs.zoom + (w / 2);
      const wy = (my - (h / 2 + vs.y)) / vs.zoom + (h / 2);

      const nodeMap = nodeState.current;
      for (const [id, node] of nodeMap) {
        const dx = node.x - wx;
        const dy = node.y - wy;
        if (Math.sqrt(dx * dx + dy * dy) < (node.size + 10)) return id;
      }
      return null;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (isDraggingNode && draggedId) {
        const vs = viewState.current;
        const w = containerRef.current?.clientWidth || 0;
        const h = containerRef.current?.clientHeight || 0;
        const wx = (mx - (w / 2 + vs.x)) / vs.zoom + (w / 2);
        const wy = (my - (h / 2 + vs.y)) / vs.zoom + (h / 2);

        const node = nodeState.current.get(draggedId);
        if (node) {
          node.x = wx;
          node.y = wy;
          node.vx = 0;
          node.vy = 0;
        }
      } else if (isPanning) {
        const vs = viewState.current;
        vs.targetX += (e.clientX - lastX);
        vs.targetY += (e.clientY - lastY);
        lastX = e.clientX;
        lastY = e.clientY;
      } else {
        const hovered = getNodeAt(mx, my);
        const folderNodes = selectedFolder
          ? data?.nodes.filter(n => n.folder === selectedFolder)
          : data?.nodes;
        if (hovered && folderNodes) {
          const node = folderNodes.find(n => n.id === hovered);
          setHoveredNode(node || null);
          canvas.style.cursor = "pointer";
        } else {
          setHoveredNode(null);
          canvas.style.cursor = "grab";
        }
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const id = getNodeAt(mx, my);
      if (id) {
        isDraggingNode = true;
        draggedId = id;
      } else {
        isPanning = true;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.style.cursor = "grabbing";
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isDraggingNode && !isPanning) {
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
      isDraggingNode = false;
      isPanning = false;
      draggedId = null;
      if (canvas) canvas.style.cursor = "grab";
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const vs = viewState.current;
      const zoomDelta = e.deltaY * -0.001;
      vs.targetZoom = Math.max(0.2, Math.min(vs.targetZoom + zoomDelta, 4));
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("wheel", onWheel);
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
      <div className="flex items-center justify-center h-[500px]">
        <p className="font-serif italic text-sm text-[var(--text-tertiary)]">Visualizing intellectual connections…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <p className="text-sm text-[var(--rose)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Domain filter */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedFolder(null)}
          className={`rounded-full px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] transition-all ${
            !selectedFolder
              ? "bg-[var(--text)] text-[var(--bg)] shadow-md"
              : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          }`}
        >
          All Domains
        </button>
        {folders.map(f => (
          <button
            key={f}
            onClick={() => setSelectedFolder(f)}
            className={`rounded-full px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] transition-all ${
              selectedFolder === f
                ? "bg-[var(--accent)] text-white shadow-md"
                : "bg-white text-[var(--text-tertiary)] shadow-sm hover:shadow-md"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Graph canvas */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-[40px] bg-[#fcfbf7] shadow-inner"
        style={{
          minHeight: "500px",
          height: "65vh",
        }}
      >
        <canvas ref={canvasRef} className="w-full h-full" />
        
        {/* Interaction Hint */}
        <div className="absolute top-8 right-8 text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--text-tertiary)] opacity-40 pointer-events-none">
          Scroll to zoom · Drag to pan
        </div>
      </div>

      {/* Selected node detail */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-[40px] bg-white p-10 shadow-2xl border border-[var(--border-light)]"
        >
          <div className="flex items-start justify-between gap-8">
            <div>
              <div className="flex items-center gap-4">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: folderColor(selectedNode.folder) }}
                />
                <h3 className="font-serif text-3xl text-[var(--text)]">{selectedNode.name}</h3>
              </div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--text-tertiary)] mt-4">
                Sector: {selectedNode.folder} · {selectedNode.links} Intellectual Links
              </p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg)] text-[var(--text-tertiary)] transition-all hover:text-[var(--text)] hover:scale-110"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {selectedNode.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {selectedNode.tags.map(t => (
                <span key={t} className="rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
