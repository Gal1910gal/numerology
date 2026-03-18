// Special numbers - never reduce these
const SPECIAL = [11, 13, 14, 16, 19, 22, 33];

export function reduce(n: number): number {
  if (n <= 0) return 0;
  if (SPECIAL.includes(n)) return n;
  while (n > 9) {
    n = String(n)
      .split("")
      .reduce((sum, d) => sum + parseInt(d), 0);
    if (SPECIAL.includes(n)) return n;
  }
  return n;
}

// Hebrew gematria - all letters reduced to 1-9
const GEMATRIA: Record<string, number> = {
  א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9,
  י: 1, כ: 2, ך: 2, ל: 3, מ: 4, ם: 4, נ: 5, ן: 5,
  ס: 6, ע: 7, פ: 8, ף: 8, צ: 9, ץ: 9,
  ק: 1, ר: 2, ש: 3, ת: 4,
};

// Hebrew vowels (אהו"י)
const VOWELS = new Set(["א", "ה", "ו", "י"]);

export function letterValue(ch: string): number {
  return GEMATRIA[ch] ?? 0;
}

export function sumLetters(name: string): number {
  return name
    .split("")
    .reduce((sum, ch) => sum + (GEMATRIA[ch] ?? 0), 0);
}

export function sumConsonants(name: string): number {
  return name
    .split("")
    .filter((ch) => GEMATRIA[ch] && !VOWELS.has(ch))
    .reduce((sum, ch) => sum + GEMATRIA[ch], 0);
}

export function sumVowels(name: string): number {
  return name
    .split("")
    .filter((ch) => VOWELS.has(ch))
    .reduce((sum, ch) => sum + GEMATRIA[ch], 0);
}

// ---- Date helpers ----
export function digitSum(n: number): number {
  return String(n)
    .split("")
    .reduce((s, d) => s + parseInt(d), 0);
}

export function reduceDate(day: number, month: number, year: number): number {
  const total =
    digitSum(day) + digitSum(month) + digitSum(year);
  return reduce(total);
}

// שביל גורל
export function destinyPath(day: number, month: number, year: number): number {
  return reduceDate(day, month, year);
}

// יציאה ליעוד
export function destinationAge(destinyPathVal: number): number {
  return 27 - reduce(destinyPathVal);
}

// שנה אישית
export function personalYear(
  day: number,
  month: number,
  today: Date
): number {
  const currentYear = today.getFullYear();
  const birthdayThisYear = new Date(currentYear, month - 1, day);
  const hasCelebrated = today >= birthdayThisYear;

  let yearForCalc: number;
  if (month >= 1 && month <= 6) {
    yearForCalc = hasCelebrated ? currentYear : currentYear - 1;
  } else {
    yearForCalc = hasCelebrated ? currentYear + 1 : currentYear;
  }

  const yearValue = reduce(digitSum(yearForCalc));
  const dayReduced = reduce(digitSum(day));
  const monthReduced = reduce(digitSum(month));

  // Personal year: always 1-9 only
  let n = dayReduced + monthReduced + yearValue;
  while (n > 9) n = String(n).split("").reduce((s, d) => s + parseInt(d), 0);
  return n;
}

// פסגות - peaks (inputs already reduced)
export function peaks(day: number, month: number, year: number) {
  const d = reduce(digitSum(day));
  const m = reduce(digitSum(month));
  const y = reduce(digitSum(year));

  const p1 = reduce(d + m);
  const p2 = reduce(d + y);
  const p3 = reduce(p1 + p2);
  const p4 = reduce(m + y);

  return { p1, p2, p3, p4 };
}

// Peak age ranges
export function peakAges(destAge: number) {
  return {
    p1: { from: destAge, to: destAge + 8 },
    p2: { from: destAge + 9, to: destAge + 17 },
    p3: { from: destAge + 18, to: destAge + 26 },
    p4: { from: destAge + 27, to: null },
  };
}

// אתגרים - challenges
export function challenges(day: number, month: number, year: number) {
  const d = reduce(digitSum(day));
  const m = reduce(digitSum(month));
  const y = reduce(digitSum(year));

  const c1 = reduce(Math.abs(d - m));
  const c2 = reduce(Math.abs(d - y));
  const c3 = reduce(Math.abs(c1 - c2));
  const c4 = reduce(Math.abs(m - y));

  return { c1, c2, c3, c4 };
}

// גימטריה
export function gematria(firstName: string, lastName: string) {
  const cleanFirst = firstName.replace(/\s/g, "");
  const cleanLast = lastName.replace(/\s/g, "");
  const full = cleanFirst + cleanLast;

  return {
    firstName: reduce(sumLetters(cleanFirst)),
    lastName: reduce(sumLetters(cleanLast)),
    total: reduce(sumLetters(full)),
    firstNameRaw: sumLetters(cleanFirst),
    lastNameRaw: sumLetters(cleanLast),
    totalRaw: sumLetters(full),
  };
}

// Full analysis
export interface NumerologyInput {
  day: number;
  month: number;
  year: number;
  firstName: string;
  lastName: string;
  today?: Date;
}

export interface NumerologyResult {
  destinyPath: number;
  personalYear: number;
  destinationAge: number;
  peaks: { p1: number; p2: number; p3: number; p4: number };
  peakAges: {
    p1: { from: number; to: number };
    p2: { from: number; to: number };
    p3: { from: number; to: number };
    p4: { from: number; to: number | null };
  };
  challenges: { c1: number; c2: number; c3: number; c4: number };
  gematria: {
    firstName: number;
    lastName: number;
    total: number;
    firstNameRaw: number;
    lastNameRaw: number;
    totalRaw: number;
  };
}

export function analyze(input: NumerologyInput): NumerologyResult {
  const { day, month, year, firstName, lastName } = input;
  const today = input.today ?? new Date();

  const dp = destinyPath(day, month, year);
  const destAge = destinationAge(dp);

  return {
    destinyPath: dp,
    personalYear: personalYear(day, month, today),
    destinationAge: destAge,
    peaks: peaks(day, month, year),
    peakAges: peakAges(destAge) as NumerologyResult["peakAges"],
    challenges: challenges(day, month, year),
    gematria: gematria(firstName, lastName),
  };
}
