import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface ImportantDate {
  date: string;
  label: string;
}

export async function GET() {
  const contacts = await db.contact.findMany({
    where: { importantDates: { not: null }, isActive: true },
    select: { id: true, fullName: true, importantDates: true },
  });

  const today = new Date();
  const allDates: {
    contactId: string;
    contactName: string;
    label: string;
    date: Date;
    daysUntil: number;
  }[] = [];

  for (const c of contacts) {
    if (!c.importantDates) continue;
    const dates = c.importantDates as unknown as ImportantDate[];
    for (const d of dates) {
      const date = new Date(d.date);
      const thisYear = new Date(today.getFullYear(), date.getMonth(), date.getDate());
      let daysUntil = Math.ceil(
        (thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntil < 0) daysUntil += 365;
      allDates.push({
        contactId: c.id,
        contactName: c.fullName,
        label: d.label,
        date: thisYear,
        daysUntil,
      });
    }
  }

  const upcoming = allDates
    .filter((d) => d.daysUntil <= 90)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 20);

  return NextResponse.json(upcoming);
}
