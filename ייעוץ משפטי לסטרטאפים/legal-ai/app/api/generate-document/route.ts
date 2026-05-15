import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { DOCUMENT_TEMPLATES } from "@/lib/document-templates";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { templateId, fields } = await req.json();

    const template = DOCUMENT_TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      return NextResponse.json({ error: "תבנית לא נמצאה" }, { status: 404 });
    }

    const prompt = template.prompt(fields);

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      system: `אתה עורך דין ישראלי מומחה בדיני חברות וחוזים.
אתה כותב מסמכים משפטיים מקצועיים, מלאים ומפורטים בעברית.
המסמכים שלך:
- מנוסחים בשפה משפטית רשמית
- כוללים את כל הסעיפים הדרושים
- מתאימים לדין הישראלי
- ניתנים לחתימה מיידית לאחר בדיקת עורך דין

בסוף כל מסמך כלול תמיד: "⚠️ מסמך זה נוצר על ידי AI ומומלץ לאמת עם עורך דין מוסמך לפני חתימה."`,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ document: text });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
