export interface DocumentField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
  required: boolean;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  fields: DocumentField[];
  prompt: (fields: Record<string, string>) => string;
}

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: "nda",
    title: "הסכם סודיות (NDA)",
    description: "הגן על המידע הסודי שלך מול שותפים, לקוחות או עובדים",
    icon: "🔒",
    fields: [
      { name: "company_name", label: "שם החברה המגלה", type: "text", placeholder: "לדוגמה: טכנולוגיות א.ב בע\"מ", required: true },
      { name: "other_party", label: "שם הצד המקבל", type: "text", placeholder: "שם אדם או חברה", required: true },
      { name: "purpose", label: "מטרת הגילוי", type: "textarea", placeholder: "לדוגמה: בחינת שיתוף פעולה עסקי בתחום פיתוח תוכנה", required: true },
      { name: "duration_years", label: "תקופת הסודיות (שנים)", type: "select", options: ["1", "2", "3", "5"], required: true },
      { name: "governing_law", label: "מקום השיפוט", type: "select", options: ["תל אביב", "ירושלים", "חיפה", "באר שבע"], required: true },
    ],
    prompt: (f) => `צור הסכם סודיות (NDA) מקצועי ומחייב בעברית עבור:
- חברה מגלה: ${f.company_name}
- צד מקבל: ${f.other_party}
- מטרת הגילוי: ${f.purpose}
- תקופת סודיות: ${f.duration_years} שנים
- מקום שיפוט: ${f.governing_law}

ההסכם יכלול:
1. הגדרת "מידע סודי" (כולל חריגים)
2. התחייבויות הצד המקבל
3. הגבלות שימוש
4. תקופת ההסכם
5. סעיף פיצוי מוסכם בגין הפרה
6. סעיף שיפוי
7. חתימות

כתוב כהסכם משפטי מלא ומפורט, בשפה עברית משפטית רשמית. כלול מקום לתאריך וחתימות בסוף.`,
  },
  {
    id: "service",
    title: "הסכם שירות",
    description: "הסכם מקצועי עם קבלן, פרילנסר או ספק שירות",
    icon: "🤝",
    fields: [
      { name: "client_name", label: "שם הלקוח (מזמין השירות)", type: "text", placeholder: "שם חברה או אדם", required: true },
      { name: "provider_name", label: "שם נותן השירות", type: "text", placeholder: "שם חברה או פרילנסר", required: true },
      { name: "service_description", label: "תיאור השירות", type: "textarea", placeholder: "לדוגמה: פיתוח אפליקציית מובייל לפלטפורמת iOS ו-Android", required: true },
      { name: "payment_amount", label: "תמורה (₪)", type: "text", placeholder: "לדוגמה: 50,000", required: true },
      { name: "payment_terms", label: "תנאי תשלום", type: "select", options: ["שוטף+30", "50% מראש 50% בסיום", "שלושה תשלומים שווים", "תשלום מלא מראש"], required: true },
      { name: "duration", label: "משך ההתקשרות", type: "text", placeholder: "לדוגמה: 3 חודשים", required: true },
      { name: "ip_ownership", label: "בעלות על קניין רוחני", type: "select", options: ["הלקוח (מומלץ)", "נותן השירות", "בעלות משותפת"], required: true },
    ],
    prompt: (f) => `צור הסכם שירות מקצועי ומחייב בעברית עבור:
- לקוח: ${f.client_name}
- נותן שירות: ${f.provider_name}
- השירות: ${f.service_description}
- תמורה: ₪${f.payment_amount}
- תנאי תשלום: ${f.payment_terms}
- משך: ${f.duration}
- בעלות IP: ${f.ip_ownership}

ההסכם יכלול:
1. הגדרות ופרשנות
2. היקף השירות ומסירות
3. לוח זמנים
4. תמורה ותשלומים
5. בעלות על קניין רוחני (מפורש ומלא)
6. סודיות
7. הצהרות הדדיות
8. אחריות ושיפוי
9. סיום ההסכם
10. סעיף שיפוט וחוק חל

כתוב כהסכם משפטי מלא ומפורט בעברית משפטית רשמית.`,
  },
  {
    id: "founders",
    title: "הסכם מייסדים",
    description: "הסדר את היחסים בין מייסדי החברה מהיום הראשון",
    icon: "🚀",
    fields: [
      { name: "company_name", label: "שם החברה", type: "text", placeholder: "לדוגמה: סטרטאפ טכנולוגיות בע\"מ", required: true },
      { name: "founder1_name", label: "שם מייסד 1", type: "text", placeholder: "שם מלא", required: true },
      { name: "founder1_role", label: "תפקיד מייסד 1", type: "text", placeholder: "לדוגמה: CEO", required: true },
      { name: "founder1_shares", label: "אחוז מניות מייסד 1", type: "text", placeholder: "לדוגמה: 60", required: true },
      { name: "founder2_name", label: "שם מייסד 2", type: "text", placeholder: "שם מלא", required: true },
      { name: "founder2_role", label: "תפקיד מייסד 2", type: "text", placeholder: "לדוגמה: CTO", required: true },
      { name: "founder2_shares", label: "אחוז מניות מייסד 2", type: "text", placeholder: "לדוגמה: 40", required: true },
      { name: "vesting_years", label: "תקופת Vesting (שנים)", type: "select", options: ["3", "4"], required: true },
      { name: "business_description", label: "תיאור עסקי החברה", type: "textarea", placeholder: "לדוגמה: פיתוח ושיווק פלטפורמת SaaS לניהול לוגיסטיקה", required: true },
    ],
    prompt: (f) => `צור הסכם מייסדים מקצועי ומחייב בעברית עבור:
- חברה: ${f.company_name}
- עסקי החברה: ${f.business_description}
- מייסד 1: ${f.founder1_name}, תפקיד: ${f.founder1_role}, אחזקה: ${f.founder1_shares}%
- מייסד 2: ${f.founder2_name}, תפקיד: ${f.founder2_role}, אחזקה: ${f.founder2_shares}%
- תקופת Vesting: ${f.vesting_years} שנים (עם cliff של שנה)

ההסכם יכלול:
1. מבנה ההחזקות ומסמכי יסוד
2. מנגנון Vesting מפורט (כולל cliff, Good/Bad Leaver)
3. תפקידים, סמכויות ומשכורות
4. קבלת החלטות (רוב רגיל / מיוחד / פה אחד)
5. זכות סירוב ראשונה (ROFR)
6. הגנת מיעוט
7. סעיף אי-תחרות ואי-שידול
8. מנגנון יציאה ופירוק
9. יישוב סכסוכים

כתוב כהסכם משפטי מלא ומפורט בעברית משפטית רשמית.`,
  },
];
