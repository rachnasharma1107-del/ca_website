// app/services/page.tsx
"use client";

import Timeline, { JourneyItem } from "@/components/ui/timeline";
import { ArrowDown, Award, Building2, CheckCircle2, ShieldCheck } from "lucide-react";

// Timeline events based on firm history
const topTimelineEvents: JourneyItem[] = [
  {
    id: "1973-august",
    year: "1973",
    month: "August",
    content: "Praveen Aggarwal & Co. established on 30th August 1973 in New Delhi.",
  },
  {
    id: "2003-may",
    year: "2003",
    month: "May",
    content: "Expansion into technology & DISA-certified risk & systems management.",
  },
  {
    id: "2016-june",
    year: "2016",
    month: "June",
    content: "Scale-up of Audit, Ind AS, and Direct Tax consultation practice.",
  },
];

const bottomTimelineEvents: JourneyItem[] = [
  {
    id: "1990-september",
    year: "1990",
    month: "September",
    content: "Registered with Reserve Bank of India (Regn. No. 105802) for financial sector audits.",
  },
  {
    id: "2010-january",
    year: "2010",
    month: "January",
    content: "Empaneled with CAG of India (DE0218) for Public Sector & Bank audits.",
  },
  {
    id: "2026-current",
    year: "2026",
    month: "May",
    content: "Comprehensive advisory across Tax, Transfer Pricing, GST, and Business Transformation.",
  },
];

export default function ServicesPage() {
  return (
    <main className="bg-[#073B5C] text-white min-h-screen">
      {/* Intro Section */}
      <section className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF4FA]/10 text-[#F5761B] text-xs font-semibold tracking-wider uppercase">
          <ShieldCheck className="w-4 h-4 text-[#33AE40]" />
          Chartered Accountants • Est. 1973
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
          Over 50 Years of <span className="text-[#F5761B]">Financial Excellence</span>
        </h1>

        <p className="text-base sm:text-lg text-[#EAF4FA] max-w-2xl leading-relaxed">
          Delivering sustainable, efficient, and reliable professional services across Audit & Assurance, Direct/Indirect Taxation, and Business Advisory.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-4 text-left">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <Award className="w-6 h-6 text-[#F5761B] mb-2" />
            <h3 className="font-semibold text-white">CAG Empaneled</h3>
            <p className="text-xs text-[#EAF4FA] mt-1">Regn No. DE0218 for Public Sector Banks & Undertakings</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <Building2 className="w-6 h-6 text-[#33AE40] mb-2" />
            <h3 className="font-semibold text-white">RBI Registered</h3>
            <p className="text-xs text-[#EAF4FA] mt-1">Regn No. 105802 since September 30, 1990</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <CheckCircle2 className="w-6 h-6 text-[#F5761B] mb-2" />
            <h3 className="font-semibold text-white">Full Assurance</h3>
            <p className="text-xs text-[#EAF4FA] mt-1">Ind AS, Tax Audits, Transfer Pricing & Advisory</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#EAF4FA] mt-6 animate-bounce">
          <span>Scroll down to explore journey</span>
          <ArrowDown className="w-4 h-4 text-[#F5761B]" />
        </div>
      </section>

      {/* Interactive Horizontal Timeline */}
      <Timeline
        title="Our Storyline"
        periodLabel="1973 — 2026"
        backgroundColor="#073B5C"
        textColor="#FFFFFF"
        mutedTextColor="#EAF4FA"
        activeColor="#F5761B"
        imageUrl="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop"
        imageAlt="Praveen Aggarwal & Co. Office"
        topData={topTimelineEvents}
        bottomData={bottomTimelineEvents}
        duration={1.2}
      />

      {/* Outro Section */}
      <section className="flex min-h-screen items-center justify-center px-6 text-center text-[#EAF4FA]">
        <div className="max-w-xl space-y-4">
          <h2 className="text-3xl font-bold text-white">Ready to partner with us?</h2>
          <p className="text-sm leading-relaxed">
            Head Office: 23 LGF, Bhai Veer Singh Marg, Gole Market, New Delhi – 110001
          </p>
        </div>
      </section>
    </main>
  );
}