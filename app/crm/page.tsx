import Link from "next/link";
import { db } from "@/lib/db";
import { CrmClient } from "./crm-client";

export const dynamic = "force-dynamic";

export default async function CrmPage() {
  const [rawContacts, groups, birthdays] = await Promise.all([
    db.contact.findMany({
      where: { isActive: true },
      orderBy: [{ isKeyPerson: "desc" }, { fullName: "asc" }],
      include: {
        group: true,
        _count: { select: { interactions: true } },
      },
    }),
    db.contactGroup.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { contacts: true } } },
    }),
    db.contact.findMany({
      where: { birthday: { not: null }, isActive: true },
      select: { id: true, fullName: true, birthday: true },
    }),
  ]);

  const now = new Date();
  const upcomingBirthdays = birthdays
    .map((c) => {
      if (!c.birthday) return null;
      const bday = new Date(c.birthday);
      const thisYear = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());
      let daysUntil = Math.ceil((thisYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil < 0) daysUntil += 365;
      return { id: c.id, fullName: c.fullName, daysUntil };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null && c.daysUntil <= 60)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const contacts = rawContacts.map((c) => ({
    ...c,
    lastContactedAt: c.lastContactedAt?.toISOString() ?? null,
    nextFollowUpAt: c.nextFollowUpAt?.toISOString() ?? null,
  }));

  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="premium-kicker">Relationship Management</div>
          <h1 className="premium-title">People</h1>
          <p className="premium-subtitle">Stay connected with the people who matter.</p>
        </div>
        <Link
          href="/crm/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--bg)] transition-opacity hover:opacity-90"
        >
          + Add Contact
        </Link>
      </div>

      <CrmClient contacts={contacts} groups={groups} upcomingBirthdays={upcomingBirthdays} />
    </div>
  );
}
