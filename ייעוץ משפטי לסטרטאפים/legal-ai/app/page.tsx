import Link from "next/link";
import Image from "next/image";

const features = [
  {
    title: "שאל כל שאלה משפטית",
    description:
      "הצ'אטבוט שלנו מתמחה בדיני סטרטאפים ישראליים — הקמת חברה, חוזים, קניין רוחני, גיוס הון ועוד. תשובה מיידית בעברית.",
    highlight: "מותאם לדין הישראלי",
    highlightSub: "Legal AI מכיר את חוק החברות, SAFE, ESOP וכל מה שצריך לסטרטאפ.",
    mockup: (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-4 py-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-300" />
          <div className="w-2 h-2 rounded-full bg-gray-300" />
          <div className="w-2 h-2 rounded-full bg-gray-300" />
        </div>
        <div className="p-5 flex flex-col gap-3 text-sm">
          <div className="self-end bg-black text-white rounded-xl px-4 py-2 max-w-[70%]">
            איך מקימים חברת בע&quot;מ בישראל?
          </div>
          <div className="self-start bg-gray-100 text-gray-800 rounded-xl px-4 py-2 max-w-[85%] leading-relaxed">
            הקמת חברה בישראל כוללת 3 שלבים עיקריים: הכנת תקנון, הגשה לרשם החברות ותשלום אגרה של כ-2,600 ₪. התהליך לוקח 3-5 ימי עסקים...
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "מסמכים משפטיים תוך דקות",
    description:
      "NDA, הסכם מייסדים, הסכם שירות, תנאי שימוש — מלא את הפרטים ו-Legal AI מייצר מסמך מותאם אישית שמוכן להורדה.",
    highlight: "NDA מוכן תוך 2 דקות",
    highlightSub: "ענה על כמה שאלות פשוטות וקבל מסמך משפטי מקצועי — בחינם.",
    mockup: (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-4 py-3 text-sm font-medium text-gray-700">
          📄 הסכם סודיות (NDA)
        </div>
        <div className="p-5 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">שם הצד המגלה</label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">טק סטארט בע&quot;מ</div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">שם הצד המקבל</label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">יועץ חיצוני בע&quot;מ</div>
          </div>
          <div className="bg-black text-white text-center rounded-lg py-2 text-sm font-medium mt-1">
            צור מסמך ←
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "ידע משפטי מעמיק",
    description:
      "Legal AI מכיר את כל התחומים הרלוונטיים לסטרטאפ ישראלי — מחוק החברות ועד GDPR, מ-SAFE ועד אופציות לעובדים.",
    highlight: "מותאם לדין הישראלי",
    highlightSub: "כולל חוק החברות, חוק הגנת הפרטיות, חוק הפטנטים ופסיקה עדכנית.",
    mockup: (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 grid grid-cols-2 gap-2">
          {["הקמת חברה", "הסכמי מייסדים", "גיוס הון ו-SAFE", "הסכמי NDA", "קניין רוחני", "דיני עבודה"].map((area) => (
            <div key={area} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 text-center">
              {area}
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const pricing = [
  {
    name: "חינמי",
    price: "₪0",
    sub: "לתמיד",
    features: ["5 שאלות ביום", "2 מסמכים בחודש", "גישה לכל התחומים"],
    cta: "התחל בחינם",
    ctaStyle: "border border-gray-300 hover:border-gray-500 text-gray-900",
    highlight: false,
  },
  {
    name: "פרו",
    price: "₪49",
    sub: "לחודש",
    features: ["שאלות ללא הגבלה", "מסמכים ללא הגבלה", "היסטוריית שיחות", "עדיפות בתגובה"],
    cta: "הצטרף עכשיו →",
    ctaStyle: "bg-black text-white hover:bg-gray-800",
    highlight: true,
  },
  {
    name: "עסקי",
    price: "₪149",
    sub: "לחודש",
    features: ["הכל בפרו", "עד 5 משתמשים", "API גישה", "תמיכה מועדפת"],
    cta: "צור קשר",
    ctaStyle: "border border-gray-300 hover:border-gray-500 text-gray-900",
    highlight: false,
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen bg-white text-gray-900">
      {/* Navbar */}
      <nav className="border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-10">
        <span className="text-lg font-bold tracking-tight shrink-0">Legal AI ⚖️</span>
        <div className="flex items-center gap-3 sm:gap-6 text-sm">
          <Link href="/chat" className="hidden sm:block text-gray-600 hover:text-gray-900 transition-colors">צ&apos;אטבוט</Link>
          <Link href="/documents" className="hidden sm:block text-gray-600 hover:text-gray-900 transition-colors">מסמכים</Link>
          <Link href="/chat" className="text-sm font-medium text-gray-900 border border-gray-300 px-3 sm:px-4 py-1.5 rounded-lg hover:border-gray-500 transition-colors whitespace-nowrap">
            התחברות
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 sm:px-6 py-12 sm:py-20 max-w-6xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Text */}
          <div className="flex-1 flex flex-col gap-5 w-full">
            <div className="inline-block self-start bg-gray-100 text-gray-600 text-xs px-4 py-1.5 rounded-full font-medium tracking-wide uppercase">
              יועץ משפטי חכם לסטרטאפים ישראליים
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black uppercase leading-tight tracking-tight">
              ייעוץ משפטי מקצועי, בלי להמתין לעורך דין
            </h1>
            <p className="text-gray-500 text-base sm:text-lg leading-relaxed">
              שאל שאלות משפטיות, צור חוזים ומסמכים, וקבל הנחיה מותאמת לדין הישראלי — תוך שניות.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/chat" className="bg-black hover:bg-gray-800 transition-colors text-white font-semibold px-6 sm:px-8 py-3 rounded-xl text-center text-sm sm:text-base">
                התחל שיחה משפטית ←
              </Link>
              <Link href="/documents" className="border border-gray-300 hover:border-gray-500 transition-colors text-gray-700 font-semibold px-6 sm:px-8 py-3 rounded-xl text-center text-sm sm:text-base">
                צור מסמך משפטי
              </Link>
            </div>
            <p className="text-gray-400 text-xs">* השירות אינו מחליף ייעוץ משפטי מוסמך מעורך דין</p>
          </div>

          {/* Hero image */}
          <div className="flex-1 relative w-full">
            <div className="relative rounded-2xl overflow-hidden shadow-xl h-56 sm:h-72 lg:h-96 w-full">
              <Image
                src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80"
                alt="סמל צדק ומשפט"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          </div>
        </div>
      </section>

      {/* Law imagery strip */}
      <section className="w-full h-40 sm:h-56 relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1600&q=80"
          alt="בית משפט"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center px-4">
          <p className="text-white text-lg sm:text-2xl font-black uppercase tracking-widest text-center">
            הידע המשפטי שלך — בהישג יד
          </p>
        </div>
      </section>

      {/* Features */}
      {features.map((f, i) => (
        <section
          key={f.title}
          className={`px-4 sm:px-6 py-12 sm:py-20 ${i % 2 === 1 ? "bg-gray-50" : "bg-white"}`}
        >
          <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
            <div className={`flex-1 flex flex-col gap-5 w-full ${i % 2 === 1 ? "lg:order-2" : ""}`}>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight">{f.title}</h2>
              <p className="text-gray-500 leading-relaxed text-sm sm:text-base">{f.description}</p>
              <div className="bg-yellow-400 rounded-2xl p-4 sm:p-5 max-w-sm">
                <p className="font-black uppercase text-sm tracking-wide mb-2">{f.highlight}</p>
                <p className="text-sm leading-relaxed">{f.highlightSub}</p>
              </div>
            </div>
            <div className={`flex-1 w-full ${i % 2 === 1 ? "lg:order-1" : ""}`}>
              {f.mockup}
            </div>
          </div>
        </section>
      ))}

      {/* Law books image section */}
      <section className="px-4 sm:px-6 py-12 sm:py-16 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 items-center">
          <div className="flex-1 relative h-48 sm:h-64 rounded-2xl overflow-hidden shadow-md w-full">
            <Image
              src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80"
              alt="ספרי משפט"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">מבוסס על הדין הישראלי</h2>
            <p className="text-gray-500 leading-relaxed text-sm sm:text-base">
              Legal AI מתמחה בחקיקה ובפסיקה הישראלית — חוק החברות, חוק החוזים, חוק הגנת הפרטיות, חוק הפטנטים ועוד. לא תרגום מאנגלית, אלא ידע מקורי.
            </p>
            <Link href="/chat" className="self-start bg-black hover:bg-gray-800 transition-colors text-white font-semibold px-6 py-3 rounded-xl text-sm">
              שאל עכשיו ←
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-center mb-4 tracking-tight">תמחור</h2>
          <p className="text-gray-500 text-center mb-10 sm:mb-12">התחל בחינם, שדרג כשתצטרך.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {pricing.map((p) => (
              <div
                key={p.name}
                className={`border rounded-2xl p-6 flex flex-col gap-4 bg-white ${p.highlight ? "border-black shadow-lg" : "border-gray-200"}`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{p.name}</p>
                  <p className="text-4xl font-black">{p.price}</p>
                  <p className="text-sm text-gray-400">{p.sub}</p>
                </div>
                <ul className="flex flex-col gap-2 flex-1">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-gray-400">✓</span> {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/chat"
                  className={`text-center font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm ${p.ctaStyle}`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 text-center bg-white">
        <h2 className="text-3xl sm:text-4xl font-black uppercase mb-4 tracking-tight">התחל עכשיו — בחינם</h2>
        <p className="text-gray-500 mb-8">שאל את השאלה המשפטית הראשונה שלך ללא הרשמה.</p>
        <Link
          href="/chat"
          className="bg-black hover:bg-gray-800 transition-colors text-white font-semibold px-10 py-3 rounded-xl text-lg inline-block"
        >
          התחל שיחה ←
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 text-center text-gray-400 text-xs py-6 px-6">
        Legal AI © {new Date().getFullYear()} — אינו מחליף ייעוץ מעורך דין מוסמך
      </footer>
    </main>
  );
}
