import { reduce, sumLetters, sumConsonants, sumVowels, digitSum } from "./numerology";

export interface ChakraResult {
  basis: number;          // בסיס – עיצורי שם פרטי + משפחה
  sexAndCreation: number; // מין ויצירה – כל אותיות פרטי + משפחה
  solarPlexus: number;    // מקלעת השמש – יום + חודש + שנה
  heart: number;          // לב – הפרש מין ויצירה ↔ מקלעת השמש
  throat: number;         // גרון – אהו"י פרטי + משפחה
  thirdEye: number;       // עין שלישית – מין ויצירה + מקלעת השמש
  crown: number;          // כתר – יום הלידה
  universe: number;       // יקום – מזל אסטרולוגי
  super_: number;         // על – כל אותיות שם פרטי
  zodiacName: string;
}

export function getZodiac(day: number, month: number): { name: string; value: number } {
  const signs = [
    { name: "טלה",    value: 9,  check: (d:number,m:number) => (m===3&&d>=21)||(m===4&&d<=19) },
    { name: "שור",    value: 33, check: (d:number,m:number) => (m===4&&d>=20)||(m===5&&d<=20) },
    { name: "תאומים", value: 5,  check: (d:number,m:number) => (m===5&&d>=21)||(m===6&&d<=20) },
    { name: "סרטן",   value: 2,  check: (d:number,m:number) => (m===6&&d>=21)||(m===7&&d<=22) },
    { name: "אריה",   value: 1,  check: (d:number,m:number) => (m===7&&d>=23)||(m===8&&d<=22) },
    { name: "בתולה",  value: 4,  check: (d:number,m:number) => (m===8&&d>=23)||(m===9&&d<=22) },
    { name: "מאזנים", value: 6,  check: (d:number,m:number) => (m===9&&d>=23)||(m===10&&d<=22) },
    { name: "עקרב",   value: 22, check: (d:number,m:number) => (m===10&&d>=23)||(m===11&&d<=21) },
    { name: "קשת",    value: 3,  check: (d:number,m:number) => (m===11&&d>=22)||(m===12&&d<=21) },
    { name: "גדי",    value: 8,  check: (d:number,m:number) => (m===12&&d>=22)||(m===1&&d<=19) },
    { name: "דלי",    value: 11, check: (d:number,m:number) => (m===1&&d>=20)||(m===2&&d<=18) },
    { name: "דגים",   value: 7,  check: (d:number,m:number) => (m===2&&d>=19)||(m===3&&d<=20) },
  ];
  for (const s of signs) if (s.check(day, month)) return { name: s.name, value: s.value };
  return { name: "לא ידוע", value: 0 };
}

export function calculateChakras(
  firstName: string,
  lastName: string,
  day: number,
  month: number,
  year: number
): ChakraResult {
  const f = firstName.replace(/\s/g, "");
  const l = lastName.replace(/\s/g, "");

  // בסיס: עיצורים בלבד
  const basis = reduce(reduce(sumConsonants(f)) + reduce(sumConsonants(l)));

  // מין ויצירה: כל האותיות
  const sexFirst = reduce(sumLetters(f));
  const sexLast  = reduce(sumLetters(l));
  const sexAndCreation = reduce(sexFirst + sexLast);

  // מקלעת השמש: יום + חודש + שנה (כל אחד מצומצם)
  const solarPlexus = reduce(reduce(digitSum(day)) + reduce(digitSum(month)) + reduce(digitSum(year)));

  // לב: |מין ויצירה − מקלעת השמש|
  // משתמשים בספרה הבסיסית (14→5, 22→4 וכד') כדי שהתוצאה תהיה תמיד 0–8
  function singleDigit(n: number): number {
    while (n > 9) n = [...String(n)].reduce((s, d) => s + +d, 0);
    return n;
  }
  const heart = reduce(Math.abs(singleDigit(sexAndCreation) - singleDigit(solarPlexus)));

  // גרון: אהו"י
  const throat = reduce(reduce(sumVowels(f)) + reduce(sumVowels(l)));

  // עין שלישית: סכום מין ויצירה + מקלעת השמש
  const thirdEye = reduce(sexAndCreation + solarPlexus);

  // כתר: יום הלידה
  const crown = reduce(digitSum(day));

  // יקום: מזל
  const zodiac = getZodiac(day, month);

  // על: כל אותיות שם פרטי בלבד
  const super_ = reduce(sumLetters(f));

  return { basis, sexAndCreation, solarPlexus, heart, throat, thirdEye, crown, universe: zodiac.value, super_, zodiacName: zodiac.name };
}
