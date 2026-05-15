"use client";

import Link from "next/link";
import { useState } from "react";
import { DOCUMENT_TEMPLATES, DocumentTemplate } from "@/lib/document-templates";

export default function DocumentsPage() {
  const [selected, setSelected] = useState<DocumentTemplate | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  function selectTemplate(t: DocumentTemplate) {
    setSelected(t);
    setFields({});
    setResult("");
  }

  async function generate() {
    if (!selected) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selected.id, fields }),
      });
      const data = await res.json();
      setResult(data.document || "אירעה שגיאה, נסה שוב.");
    } catch {
      setResult("אירעה שגיאה, נסה שוב.");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(result);
  }

  function downloadPDF() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${selected?.title ?? "מסמך משפטי"}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; direction: rtl; line-height: 1.8; padding: 40px; color: #111; font-size: 13px; }
    h1, h2, h3 { margin-top: 1.5em; }
    pre, p { white-space: pre-wrap; word-break: break-word; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body><pre>${result.replace(/</g, "&lt;")}</pre>
<script>window.onload = () => { window.print(); window.close(); }</script>
</body></html>`);
    printWindow.document.close();
  }

  const allFilled = selected?.fields
    .filter((f) => f.required)
    .every((f) => fields[f.name]?.trim());

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 bg-white">
        <Link href="/" className="text-lg font-bold tracking-tight text-gray-900">Legal AI ⚖️</Link>
        <Link href="/chat" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          צ&apos;אטבוט ←
        </Link>
      </nav>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">מחולל מסמכים משפטיים</h1>
        <p className="text-gray-500 mb-8">בחר סוג מסמך, מלא את הפרטים — וקבל מסמך מוכן תוך שניות.</p>

        {/* Template selection */}
        {!selected && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DOCUMENT_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTemplate(t)}
                className="bg-white border border-gray-200 hover:border-gray-400 hover:shadow-md rounded-2xl p-6 text-right flex flex-col gap-3 transition-all"
              >
                <span className="text-3xl">{t.icon}</span>
                <h3 className="font-semibold text-lg text-gray-900">{t.title}</h3>
                <p className="text-gray-500 text-sm">{t.description}</p>
              </button>
            ))}
          </div>
        )}

        {/* Form */}
        {selected && !result && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">{selected.icon}</span>
              <h2 className="text-xl font-semibold text-gray-900">{selected.title}</h2>
              <button
                onClick={() => setSelected(null)}
                className="mr-auto text-gray-400 hover:text-gray-700 text-sm transition-colors"
              >
                ← חזור
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {selected.fields.map((f) => (
                <div key={f.name} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    {f.label}
                    {f.required && <span className="text-red-500 mr-1">*</span>}
                  </label>
                  {f.type === "textarea" ? (
                    <textarea
                      rows={3}
                      placeholder={f.placeholder}
                      value={fields[f.name] || ""}
                      onChange={(e) => setFields({ ...fields, [f.name]: e.target.value })}
                      className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-500 transition-colors resize-none"
                    />
                  ) : f.type === "select" ? (
                    <select
                      value={fields[f.name] || ""}
                      onChange={(e) => setFields({ ...fields, [f.name]: e.target.value })}
                      className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-gray-500 transition-colors"
                    >
                      <option value="">בחר...</option>
                      {f.options?.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder={f.placeholder}
                      value={fields[f.name] || ""}
                      onChange={(e) => setFields({ ...fields, [f.name]: e.target.value })}
                      className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-500 transition-colors"
                    />
                  )}
                </div>
              ))}

              <button
                onClick={generate}
                disabled={!allFilled || loading}
                className="mt-2 bg-black hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white font-semibold px-6 py-3 rounded-xl"
              >
                {loading ? "מייצר מסמך..." : "צור מסמך ←"}
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">המסמך מוכן</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => { setResult(""); setFields({}); }}
                  className="text-sm border border-gray-200 hover:border-gray-400 text-gray-600 px-4 py-2 rounded-xl transition-colors"
                >
                  מסמך חדש
                </button>
                <button
                  onClick={copyToClipboard}
                  className="text-sm border border-gray-200 hover:border-gray-400 text-gray-600 px-4 py-2 rounded-xl transition-colors"
                >
                  העתק מסמך
                </button>
                <button
                  onClick={downloadPDF}
                  className="text-sm bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  הורד PDF ↓
                </button>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 whitespace-pre-wrap text-sm text-gray-800 leading-relaxed max-h-[600px] overflow-y-auto">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
