const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani",
  "Jumada al-Awwal", "Jumada al-Thani", "Rajab",
  "Sha'ban", "Ramadan", "Shawwal",
  "Dhu al-Qi'dah", "Dhu al-Hijjah",
];

// Approximate Hijri date conversion using a simplified formula
// Based on Kuwaiti algorithm (approximate, within 1-2 days)
export function gregorianToHijri(date: Date): { year: number; month: number; day: number; formatted: string } {
  const jd = gregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  const monthName = HIJRI_MONTHS[month - 1] || "";
  return {
    year,
    month,
    day,
    formatted: `${day} ${monthName} ${year}`,
  };
}

function gregorianToJD(year: number, month: number, day: number): number {
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

export function getHijriDate(date?: Date): string {
  const d = date || new Date();
  return gregorianToHijri(d).formatted;
}
