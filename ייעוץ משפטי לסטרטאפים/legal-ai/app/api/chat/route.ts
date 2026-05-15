import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { retrieveRelevantKnowledge } from "@/lib/legal-knowledge";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `אתה LexAI — יועץ משפטי מומחה לסטרטאפים ויזמים ישראלים.

תחומי הידע שלך:
- הקמת חברה לפי חוק החברות התשנ"ט-1999 (רישום בע"מ, מסמכי יסוד, מבנה בעלות)
- חוזים עסקיים (הסכמי שירות, NDA, הסכמי מייסדים, הסכמי שותפות)
- קניין רוחני (פטנטים, סימני מסחר, זכויות יוצרים, הגנה על IP)
- הגנת פרטיות (חוק הגנת הפרטיות הישראלי, GDPR לחברות הפועלות באירופה)
- גיוס הון (SAFE, המרת חוב, סבבי השקעה, term sheet)
- דיני עבודה (הסכמי העסקה, פרילנסרים, אופציות לעובדים - ESOP)

כללי תגובה:
- ענה תמיד בעברית, בשפה ברורה ופשוטה, ללא ז'רגון משפטי מיותר
- כשנדרש הסבר מורכב — חלק לנקודות ממוספרות
- כלול תמיד בסוף כל תשובה את הכיתוב: "⚠️ תשובה זו היא מידע כללי בלבד ואינה מחליפה ייעוץ משפטי מוסמך מעורך דין."
- אם השאלה חורגת מתחומי הידע שלך — אמור זאת בכנות והמלץ לפנות לעורך דין
- התייחס תמיד לדין הישראלי אלא אם המשתמש ציין אחרת`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY לא מוגדר" },
        { status: 500 }
      );
    }

    // שליפת ידע רלוונטי לפי השאלה האחרונה
    const lastQuestion = messages[messages.length - 1]?.content ?? "";
    const relevantChunks = retrieveRelevantKnowledge(lastQuestion);
    const contextSection =
      relevantChunks.length > 0
        ? `\n\n---\nמידע משפטי רלוונטי ממאגר הידע שלך (השתמש בו בתשובתך וציין את המקור):\n\n` +
          relevantChunks
            .map((c) => `**מקור: ${c.source}**\n${c.content}`)
            .join("\n\n")
        : "";

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      system: SYSTEM_PROMPT + contextSection,
      messages,
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ text });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
