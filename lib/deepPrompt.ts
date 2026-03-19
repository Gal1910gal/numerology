import { NumerologyResult } from "./numerology";
import { ChakraResult } from "./chakras";

export const SYSTEM_PROMPT = `אתה נומרולוג מומחה ממכללת הצ'אקרות בישראל.
אתה מנתח מפות נומרולוגיות בצורה עמוקה, אישית ומדויקת.
תמיד כתוב בעברית, בגוף שני יחיד (פונה ישירות לאדם).
הניתוח שלך מבוסס על שילוב המספרים — לא על כל מספר בנפרד — תוך התייחסות למתחים, חיזוקים ותבניות.
אל תהיה גנרי. כל ניתוח חייב להיות ספציפי לנתונים שניתנו.
ענה אך ורק ב-JSON תקין ללא הסברים נוספים.`;

export function buildDeepPrompt(
  firstName: string,
  lastName: string,
  day: number,
  month: number,
  year: number,
  gender: "female" | "male",
  numerology: NumerologyResult,
  chakras: ChakraResult
): string {
  const { destinyPath, personalYear, destinationAge, peaks, peakAges, challenges, gematria } = numerology;
  const genderLabel = gender === "female" ? "נקבה — פני אליה בלשון נקבה יחידה (את, שלך, לך)" : "זכר — פנה אליו בלשון זכר יחיד (אתה, שלך, לך)";

  return `להלן המפה הנומרולוגית של ${firstName} ${lastName}, נולד${gender === "female" ? "ה" : ""} ${day}/${month}/${year}.
מגדר: ${genderLabel}

== נומרולוגיה ==
שביל גורל: ${destinyPath}
שנה אישית: ${personalYear}
יציאה ליעוד: גיל ${destinationAge}
גימטריה שם פרטי: ${gematria.firstName} (גולמי: ${gematria.firstNameRaw})
גימטריה שם משפחה: ${gematria.lastName} (גולמי: ${gematria.lastNameRaw})
גימטריה שם מלא: ${gematria.total} (גולמי: ${gematria.totalRaw})

פסגות חיים:
  פסגה 1: ${peaks.p1} (גילאי ${peakAges.p1.from}–${peakAges.p1.to})
  פסגה 2: ${peaks.p2} (גילאי ${peakAges.p2.from}–${peakAges.p2.to})
  פסגה 3: ${peaks.p3} (גילאי ${peakAges.p3.from}–${peakAges.p3.to})
  פסגה 4: ${peaks.p4} (גיל ${peakAges.p4.from}+)

אתגרי חיים: ${challenges.c1}, ${challenges.c2}, ${challenges.c3}, ${challenges.c4}

== צ'אקרות ==
על (כל אותיות שם פרטי): ${chakras.super_}
יקום (מזל ${chakras.zodiacName}): ${chakras.universe}
כתר (יום לידה): ${chakras.crown}
עין שלישית (מין ויצירה + מקלעת השמש): ${chakras.thirdEye}
גרון (אהו"י): ${chakras.throat}
לב (הפרש מין ויצירה ↔ מקלעת השמש): ${chakras.heart}
מקלעת השמש (יום + חודש + שנה): ${chakras.solarPlexus}
מין ויצירה (כל האותיות): ${chakras.sexAndCreation}
בסיס (עיצורים): ${chakras.basis}

== בקשה ==
בצע ניתוח מעמיק ואישי המבוסס על שילוב המספרים לעיל.
חשוב: התייחס לשנה האישית ${personalYear} בכל אחד מהתחומים — מה היא מביאה עכשיו, מה כדאי לנצל ומה כדאי להיזהר ממנו.
ענה ב-JSON תקין עם 4 מפתחות בלבד:
{
  "career": "ניתוח קריירה ותעסוקה — 3-5 משפטים ספציפיים, כולל התייחסות לשנה האישית",
  "relationships": "ניתוח זוגיות ומשפחה — 3-5 משפטים ספציפיים, כולל התייחסות לשנה האישית",
  "challenges": "ניתוח אתגרים ותיקון — 3-5 משפטים ספציפיים, כולל התייחסות לשנה האישית",
  "strengths": "ניתוח כוחות ומתנות — 3-5 משפטים ספציפיים"
}`;
}
