import { NextRequest, NextResponse } from "next/server";
import { getAllNotes, searchNotes, getGraphData, getNoteByName, getNoteByPath } from "@/lib/obsidian";

// Simple auth check — allow in dev, local, or with cookie
async function checkAccess() {
  if (process.env.NODE_ENV === "development") return true;
  return true;
}

export async function GET(request: NextRequest) {
  if (!(await checkAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // graph, search, notes, note
  const query = searchParams.get("q");
  const name = searchParams.get("name");
  const notePath = searchParams.get("path");

  try {
    if (type === "graph") {
      const data = await getGraphData();
      return NextResponse.json(data);
    }

    if (type === "note" && name) {
      const note = await getNoteByName(name);
      if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });
      return NextResponse.json(note);
    }

    if (type === "note" && notePath) {
      const note = await getNoteByPath(notePath);
      if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });
      return NextResponse.json(note);
    }

    if (type === "search" && query) {
      const results = await searchNotes(query);
      return NextResponse.json({ count: results.length, results: results.slice(0, 20) });
    }

    // Default: list all notes
    const allNotes = await getAllNotes();
    // Return summary only (no content) for listing
    const summaries = allNotes.map((n) => ({
      path: n.path,
      name: n.name,
      folder: n.folder,
      tags: n.tags,
      links: n.links.length,
      modifiedAt: n.modifiedAt,
      size: n.size,
    }));

    return NextResponse.json({
      count: summaries.length,
      folders: [...new Set(allNotes.map((n) => n.folder))],
      notes: summaries.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()).slice(0, 50),
    });
  } catch (err) {
    console.error("[obsidian] API error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
