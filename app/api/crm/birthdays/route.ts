import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { format } from "date-fns";

export async function GET() {
  const contacts = await db.contact.findMany({
    where: { birthday: { not: null }, isActive: true },
    select: { id: true, fullName: true, birthday: true },
  });

  const today = new Date();
  const upcoming = contacts
    .map((c) => {
      if (!c.birthday) return null;
      const bday = new Date(c.birthday);
      const thisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
      let daysUntil = Math.ceil(
        (thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntil < 0) daysUntil += 365;
      return { ...c, daysUntil };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 10);

  return NextResponse.json(upcoming);
}
