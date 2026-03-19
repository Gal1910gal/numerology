import { NextRequest, NextResponse } from "next/server";
import { NumerologyResult } from "@/lib/numerology";
import { ChakraResult } from "@/lib/chakras";
import { buildDiagnosisContext, DiagnosisContext } from "@/lib/chakraDiagnosis";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

export interface EnergeticAnalysisResult {
  energyMap: string;
  psychoBodyDiagnosis: string;
  balancePoints: string;
  actionRecommendations: string;
}

const SYSTEM_PROMPT = `אתה מומחה לאבחון נומרולוגי-אנרגטי ממכללת הצ'אקרות של יעקבי בן בסט.
אתה מבצע אבחון אנרגטי-פסיכולוגי מעמיק המבוסס על מפת הצ'אקרות.

== מסגרת הידע שלך ==

מצבי צ'אקרה:
- מספרים 1-3: חלשה / לא מופעלת — אנרגיה זקוקה לעבודה ופיתוח
- מספרים 4-6: מאוזנת — פועלת בצורה טובה
- מספרים 7-9: חזקה / דומיננטית — אנרגיה גבוהה ועוצמתית
- 11, 22, 33: אנרגיית מאסטר — כוח עצום, אחריות גבוהה
- 13, 14, 16, 19: חסימה קארמתית — שיעור חיים שדורש תשומת לב

מאפייני המספרים:
1: מנהיגות, עצמאות, שאפתנות, אגו, אש בוערת, לא סומך על איש, יוזמה
2: עדינות, אמפתיה, שיתוף פעולה, דיפלומטיה, קושי בהשגת מטרות, נטייה לנפש
3: תקשורת, שמחת חיים, ספונטניות, יצירתיות, שעמום, הפרעות קשב קלות
4: מסגרת, חריצות, סדר, נוקשות, פרפקציוניזם, אהבת ביטחון
5: יזמות, חיים על הקצה, פלרטטנות, שינויים, קושי עם מסגרות, התמכרויות
6: משפחה, צדק, איזון, רומנטיקה, נאמנות, מעורבות חברתית
7: חוכמה, ניתוח עמוק, נבדלות, ביקורת, דיכאון, חרדה, שמירת סוד
8: הישגיות, גשמיות, כסף, ביצועיות, חוזק, צניעות
9: רוחניות גבוהה, אינטואיציה, ידע עצום, נדיבות, מנהיגות מלכותית
11: מאסטר ריפוי — רגישות עמוקה, אמפתיה, חיבור לתדרים עליונים
22: מאסטר בנאי — מנהיג עולמי, מממש חזון גדול, עצמאות
33: מאסטר מורה — שפע, שמחה, יצירה, מוביל אחרים לאור
13: קארמה שינויים — שינויים מאולצים, התחדשות כואבת
14: קארמה יצרים — חריגה מגבולות, יצרים חזקים, חוסר שליטה
16: קארמה קריסה — קריסת מבנים, בריאות, אגו שנשבר
19: קארמה בדידות — גאווה, בדידות, בעיות מנהיגות

מיקום צ'אקרות ומשמעותן:
- על (שם פרטי): זהות עצמית, מה מנחה את הנפש מעמקים
- יקום/מזל: כוחות קוסמיים, מה היקום מציע לאדם
- כתר (יום לידה): פוטנציאל גבוה, מנהיגות, מה מוביל אותו בחיים
- עין שלישית (על+מקלעת): תת-מודע, מה דוחף מבפנים
- גרון (תנועת האות): חשיבה, ביטוי, יכולת מנטלית
- לב (הפרש): הרמוניה פנימית, מה בין הלב לשכל
- מקלעת השמש (תאריך): ייעוד בחיים, מחזורי חיים
- מין ויצירה (שם מלא): קריירה, יצרים, אנרגיית בסיס
- בסיס (עיצורים): שורש, ביטחון, עיגור לקרקע

קריירה (שיעור 17):
- מצליחים כעצמאיים: 1,3,5,8,9,11,22,33
- מועדפים כשכירים: 2,4,6,7,16
- אתגרי כסף: 2,6,7,13,16
- כסף זורם: 1,3,5,8,9,11,22

בריאות (שיעור 18):
- נפשי/עצבי/רגשי: 2,7,11
- גופני/קריסה: 16
- אתגרי בריאות: 13,14,16,19

קשב וריכוז (שיעור 19):
- שילוב 1+3+5 = נטייה להפרעות קשב, חוסר עניין בשגרה, צורך בגירויים

יציאה ממשבר (שיעור 20) לפי מין ויצירה:
1: פעולה ישירה, יוזמה, עצמאות | 2: בקשת עזרה, שיתוף פעולה
3: יצירה, כתיבה, שיחה | 4: מטרות ממשיות, עבודה קשה
5: תנועה, שינוי סביבה, הרפתקה | 6: חזרה למשפחה וקהילה
7: פנייה פנימה, חקירה עצמית, בדידות מכוונת | 8: השגת מטרות מוחשיות
9: נתינה לאחרים, רוחניות | 11: ריפוי עצמי, מדיטציה
13,14,16,19: לא מכחישים, מקבלים את השינוי ועובדים איתו

== כללי הניתוח ==
- פנה ישירות לאדם בגוף שני יחיד
- התייחס לשילוב בין הצ'אקרות, לא רק לכל אחת בנפרד
- הדגש דפוסים שחוזרים בכמה צ'אקרות
- אם יש חסימות קארמתיות — ציין אותן ישירות ועם אמפתיה
- ענה אך ורק ב-JSON תקין ללא טקסט נוסף`;

function buildEnergeticPrompt(
  firstName: string,
  lastName: string,
  day: number,
  month: number,
  year: number,
  numerology: NumerologyResult,
  chakras: ChakraResult,
  ctx: DiagnosisContext
): string {
  const stateLines = ctx.chakras.map(c =>
    `${c.hebrewName}: ${c.value} → ${c.stateLabel}`
  ).join("\n");

  const dominantStr = ctx.dominant.length
    ? ctx.dominant.map(c => `${c.hebrewName} (${c.value})`).join(", ")
    : "אין דומיננטיות מיוחדת";

  const blockedStr = ctx.blocked.length
    ? ctx.blocked.map(c => `${c.hebrewName} (${c.value})`).join(", ")
    : "אין";

  const weakStr = ctx.weak.length
    ? ctx.weak.map(c => `${c.hebrewName} (${c.value})`).join(", ")
    : "אין";

  const patterns: string[] = [];
  if (ctx.hasADHDPattern) patterns.push("דפוס קשב וריכוז (1+3+5)");
  if (ctx.hasMentalHealthFlag) patterns.push("דגל בריאות נפשית (2/7/11 בכמה מקומות)");
  if (ctx.hasCrisisFlag) patterns.push("נטייה למשבר (7/13/14/16/19 בעין שלישית/מקלעת)");
  const patternsStr = patterns.length ? patterns.join(", ") : "לא זוהו דפוסים מיוחדים";

  return `אבחון אנרגטי של ${firstName} ${lastName}, נולד/ה ${day}/${month}/${year}

== מצב הצ'אקרות ==
${stateLines}

== ממצאים ראשוניים ==
צ'אקרות דומיננטיות: ${dominantStr}
חסימות קארמתיות: ${blockedStr}
צ'אקרות חלשות: ${weakStr}
סוג קריירה: ${ctx.careerType === "independent" ? "עצמאי/ית" : ctx.careerType === "employed" ? "שכיר/ה" : "מעורב"}
מחזור חיים: ${ctx.lifeCycleType === "rising" ? "עלייה ושגשוג" : ctx.lifeCycleType === "support" ? "תמיכה ושיתוף" : "אתגר ותיקון"}
דפוסים שזוהו: ${patternsStr}
מספר יציאה ממשבר: ${ctx.crisisExitNumber}

== נומרולוגיה ==
שביל גורל: ${numerology.destinyPath} | שנה אישית: ${numerology.personalYear}
פסגות: ${numerology.peaks.p1}, ${numerology.peaks.p2}, ${numerology.peaks.p3}, ${numerology.peaks.p4}
אתגרים: ${numerology.challenges.c1}, ${numerology.challenges.c2}, ${numerology.challenges.c3}, ${numerology.challenges.c4}

== בקשה ==
בצע אבחון אנרגטי-פסיכולוגי מלא. ענה ב-JSON תקין:
{
  "energyMap": "תיאור מפת האנרגיה הכוללת — אילו כוחות פועלים, איפה הם נמצאים בגוף, 3-4 משפטים",
  "psychoBodyDiagnosis": "אבחון פסיכו-גופני — דפוסים רגשיים והתנהגותיים שנובעים מהמפה, 3-5 משפטים",
  "balancePoints": "נקודות הדורשות איזון — מה חסום, מה בעודף, ואיך זה מתבטא בחיים, 3-4 משפטים",
  "actionRecommendations": "המלצות מעשיות — כיוון לאיזון, כולל נקודות קריירה/בריאות/קשב אם רלוונטי, 3-5 משפטים"
}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      firstName: string;
      lastName: string;
      day: number;
      month: number;
      year: number;
      numerology: NumerologyResult;
      chakras: ChakraResult;
    };

    const { firstName, lastName, day, month, year, numerology, chakras } = body;
    const ctx = buildDiagnosisContext(chakras, numerology);

    const prompt = buildEnergeticPrompt(firstName, lastName, day, month, year, numerology, chakras, ctx);

    const response = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed: EnergeticAnalysisResult = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Energetic diagnosis error:", err);
    const message = err instanceof Error ? err.message : "שגיאה באבחון";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
