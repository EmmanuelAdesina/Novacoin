'use client';

import { Fragment, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */

const NAME = 'Novacoin';
const PAGE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://novacoin.zevcloud.app';

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Soft button */
function SoftButton({ children, onClick, variant = 'primary', className = '' }: {
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary'; className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 cursor-pointer select-none';
  const styles = variant === 'primary'
    ? 'bg-[#2D1F14] text-[#FFF9F5] px-7 py-3.5 text-sm hover:bg-[#3D2F24] shadow-sm hover:shadow-md'
    : 'bg-transparent text-[#2D1F14] px-7 py-3.5 text-sm border border-[#2D1F14]/12 hover:border-[#2D1F14]/25 hover:bg-[#2D1F14]/[0.03]';
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileTap={{ scale: 0.97 }}
      className={`${base} ${styles} ${className}`}
    >
      {children}
      <motion.span animate={{ x: hovered ? 3 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
        →
      </motion.span>
    </motion.button>
  );
}

/* Selectable card */
function SelectCard({ label, sub, emoji, selected, onClick, multi = false }: {
  label: string; sub?: string; emoji?: string; selected: boolean; onClick: () => void; multi?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.015, y: -1 }}
      whileTap={{ scale: 0.985 }}
      className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
        selected
          ? 'border-[#2D1F14] bg-[#2D1F14]/[0.03] shadow-md'
          : 'border-[#2D1F14]/[0.06] bg-white hover:border-[#2D1F14]/15 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3">
        {emoji && (
          <motion.span
            className="text-xl"
            animate={selected ? { scale: [1, 1.25, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {emoji}
          </motion.span>
        )}
        <div className="flex-1 min-w-0">
          <span className={`font-semibold text-sm block ${selected ? 'text-[#2D1F14]' : 'text-[#2D1F14]/70'}`}>{label}</span>
          {sub && <span className="text-xs text-[#8B7D6B] mt-0.5 block">{sub}</span>}
        </div>
        {selected && !multi && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-5 h-5 rounded-full bg-[#2D1F14] flex items-center justify-center shrink-0"
          >
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.span>
        )}
        {multi && (
          <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
            selected ? 'border-[#2D1F14] bg-[#2D1F14]' : 'border-[#2D1F14]/20 bg-white'
          }`}>
            {selected && (
              <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </motion.svg>
            )}
          </span>
        )}
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════
   NOVACOIN LOGO
   ═══════════════════════════════════════════════════════════ */
function NovacoinLogo({ size = 'md' }: { size?: 'md' | 'sm' }) {
  const isMd = size === 'md';
  return (
    <motion.div
      className="flex items-center gap-2"
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <svg width={isMd ? 32 : 22} height={isMd ? 32 : 22} viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="nc-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#C9503E" />
            <stop offset="0.5" stopColor="#D4A574" />
            <stop offset="1" stopColor="#C4A35A" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="10" fill="url(#nc-grad)" />
        <path d="M10 22V10L22 22V10" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <span className={`${isMd ? 'text-sm font-bold' : 'text-xs font-bold'} tracking-tight text-[#2D1F14]`}>{'Nova'}<span className="font-medium text-[#2D1F14]/50">coin</span></span>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO: SIMPLE BUY→SEND FLOW VISUAL
   ═══════════════════════════════════════════════════════════ */
function HeroFlowVisual() {
  const steps = [
    { label: 'BUY', main: '₦100 → 1 NovaCoin', sub: 'Example only', color: '#C9503E' },
    { label: 'HOLD', main: '1 NovaCoin', sub: 'In your account', color: '#7C9082' },
    { label: 'SEND', main: 'Send 1 NovaCoin to @Daniel', sub: '', color: '#9B8EC4' },
    { label: 'RECEIVE', main: '@Daniel received 1 NovaCoin', sub: '', color: '#C4A35A' },
  ];

  return (
    <div className="relative w-full max-w-xs mx-auto mt-10 md:mt-14 mb-4">
      <div className="absolute inset-0 -m-6 opacity-40 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 40%, rgba(201,80,62,0.12) 0%, transparent 70%)',
        animation: 'blob 10s ease-in-out infinite',
      }} />
      <div className="relative flex flex-col items-center gap-2.5">
        {steps.map((s, i) => (
          <Fragment key={i}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
              className="w-full bg-white rounded-2xl px-5 py-3.5 shadow-[0_2px_16px_rgba(45,31,20,0.05)] border border-[#2D1F14]/[0.04]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: s.color }}>{s.label}</span>
                {s.sub && <span className="text-[10px] text-[#8B7D6B]/60 italic">{s.sub}</span>}
              </div>
              <p className="mt-1 text-sm font-semibold text-[#2D1F14] leading-snug">{s.main}</p>
            </motion.div>
            {i < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 + i * 0.15 }}
                className="text-[#8B7D6B]/25 text-xs -my-1"
              >↓</motion.div>
            )}
          </Fragment>
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center mt-5 text-[10px] text-[#8B7D6B]/40 italic tracking-wide"
      >
        Example only. Price is not final.
      </motion.p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SOCIAL COIN CONCEPT: MESSAGE COMPARISON
   ═══════════════════════════════════════════════════════════ */
function SocialCoinConcept() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div ref={ref} className="max-w-md mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Message side */}
        <FadeIn delay={0.1}>
          <div className="bg-white rounded-2xl p-5 border border-[#2D1F14]/[0.04] shadow-[0_2px_16px_rgba(45,31,20,0.05)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#9B8EC4] to-[#7C6FAF] flex items-center justify-center text-white text-[9px] font-bold">A</div>
              <span className="text-[11px] font-semibold text-[#2D1F14]">Amaka</span>
            </div>
            <div className="bg-[#9B8EC4]/[0.08] rounded-2xl rounded-tl-md px-4 py-3">
              <p className="text-sm text-[#2D1F14]/80">Hey! Thanks for the data 💜</p>
            </div>
            <p className="mt-3 text-[10px] text-[#8B7D6B]/40 text-center">Sending a message</p>
          </div>
        </FadeIn>

        {/* NovaCoin side */}
        <FadeIn delay={0.25}>
          <div className="bg-white rounded-2xl p-5 border border-[#C9503E]/[0.12] shadow-[0_2px_16px_rgba(45,31,20,0.05)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C9503E] to-[#D4A574] flex items-center justify-center text-white text-[9px] font-bold">A</div>
              <span className="text-[11px] font-semibold text-[#2D1F14]">Amaka</span>
            </div>
            <div className="bg-[#C9503E]/[0.06] rounded-2xl rounded-tl-md px-4 py-3">
              <p className="text-sm font-semibold text-[#2D1F14]">Sent you 1 NovaCoin ✨</p>
            </div>
            <p className="mt-3 text-[10px] text-[#C9503E]/50 text-center font-medium">Sending money</p>
          </div>
        </FadeIn>
      </div>

      {/* Big idea line */}
      <FadeIn delay={0.4}>
        <div className="mt-8 text-center">
          <p className="text-[#2D1F14]/20 text-3xl font-black leading-none select-none" style={{ fontFamily: 'Georgia, serif' }}>
            &ldquo;
          </p>
          <p className="text-lg md:text-xl font-black text-[#2D1F14] -mt-3 leading-snug">
            Same energy.
            <br />
            <span className="italic font-medium" style={{ color: '#C9503E' }}>Different value.</span>
          </p>
        </div>
      </FadeIn>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION: INTERACTIVE NETWORK VISUALIZATION
   ═══════════════════════════════════════════════════════════ */
function InteractiveNetwork() {
  const [sliderVal, setSliderVal] = useState(0);
  const stages = [
    { label: '10 people', count: 10, color: '#C9503E' },
    { label: '100 people', count: 100, color: '#D4A574' },
    { label: '1,000 people', count: 1000, color: '#7C9082' },
    { label: '10,000 people', count: 10000, color: '#9B8EC4' },
    { label: '100,000 people', count: 100000, color: '#C4A35A' },
    { label: '1,000,000 people', count: 1000000, color: '#C9503E' },
  ];
  const stage = stages[sliderVal];
  const nodeCount = Math.min(stage.count, 24);
  const connectionCount = Math.min(Math.floor(nodeCount * 1.5), 30);

  const nodes = useRef<{ x: number; y: number }[]>([]);
  if (nodes.current.length !== nodeCount) {
    nodes.current = Array.from({ length: nodeCount }, (_, i) => ({
      x: 20 + (Math.sin(i * 2.39996) * 0.5 + 0.5) * 260,
      y: 10 + (Math.cos(i * 3.72471) * 0.5 + 0.5) * 110,
    }));
  }

  return (
    <div className="space-y-6">
      <div className="relative bg-white rounded-2xl border border-[#2D1F14]/[0.04] shadow-[0_2px_16px_rgba(45,31,20,0.04)] p-4 overflow-hidden">
        <svg viewBox="0 0 300 130" className="w-full h-auto" style={{ minHeight: 100 }}>
          {Array.from({ length: connectionCount }).map((_, i) => {
            const a = i % nodeCount;
            const b = (i * 7 + 3) % nodeCount;
            if (a === b) return null;
            return (
              <motion.line
                key={`c-${i}`}
                x1={nodes.current[a]?.x || 0} y1={nodes.current[a]?.y || 0}
                x2={nodes.current[b]?.x || 0} y2={nodes.current[b]?.y || 0}
                stroke={stage.color} strokeOpacity={0.12 + sliderVal * 0.02} strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: i * 0.01 }}
              />
            );
          })}
          {nodes.current.map((pos, i) => (
            <motion.circle
              key={`n-${i}`} cx={pos.x} cy={pos.y}
              r={i === 0 ? 5 : 3 + sliderVal * 0.2}
              fill={stage.color}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.7 + Math.random() * 0.3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: i * 0.02 }}
            />
          ))}
          {stage.count > nodeCount && (
            <text x={270} y={65} fill={stage.color} fontSize="11" fontWeight="600" opacity="0.5" textAnchor="end">
              +{(stage.count - nodeCount).toLocaleString()}
            </text>
          )}
        </svg>
        <motion.div key={stage.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-2">
          <span className="text-lg font-black" style={{ color: stage.color }}>{stage.label}</span>
        </motion.div>
      </div>
      <div className="px-2">
        <input
          type="range" min="0" max="5" step="1" value={sliderVal}
          onChange={(e) => setSliderVal(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#C9503E]"
          style={{ background: `linear-gradient(to right, #C9503E ${(sliderVal / 5) * 100}%, rgba(45,31,20,0.1) ${(sliderVal / 5) * 100}%)` }}
        />
        <div className="flex justify-between mt-1.5 text-[10px] text-[#8B7D6B]/50">
          <span>10</span>
          <span>1M</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION: IMAGINE THIS (LIFE SCENARIO)
   ═══════════════════════════════════════════════════════════ */
function ImagineScenario() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div ref={ref} className="max-w-sm mx-auto">
      <div className="space-y-4">
        <FadeIn>
          <p className="text-center text-[15px] text-[#2D1F14]/70 font-medium">You owe your friend ₦100.</p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="bg-white rounded-3xl border border-[#2D1F14]/[0.06] shadow-[0_4px_24px_rgba(45,31,20,0.06)] overflow-hidden">
            <div className="bg-[#FFF9F5] px-5 py-2 flex items-center justify-center">
              <span className="text-[10px] font-medium text-[#8B7D6B]">NovaCoin</span>
            </div>
            <div className="px-6 py-5 space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C9082] to-[#5A6F5E] flex items-center justify-center text-white text-[10px] font-bold">D</div>
                <span className="text-sm font-semibold text-[#2D1F14]">@Daniel</span>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }} className="text-center">
                <p className="text-3xl font-black text-[#2D1F14]">1 NovaCoin</p>
                <p className="text-xs text-[#8B7D6B] mt-0.5">≈ ₦100</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.7 }}>
                <div className="w-full bg-[#2D1F14] text-[#FFF9F5] font-semibold text-sm py-3 rounded-xl text-center">SEND</div>
              </motion.div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.5}>
          <div className="text-center text-[#8B7D6B]/25 text-lg">↓</div>
        </FadeIn>

        <FadeIn delay={0.6}>
          <div className="bg-[#7C9082]/[0.06] rounded-2xl px-6 py-4 text-center border border-[#7C9082]/10">
            <p className="text-sm font-semibold text-[#7C9082]">Sent!</p>
            <p className="text-[15px] text-[#2D1F14]/80 mt-1">Daniel received 1 NovaCoin.</p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION: USE CASES
   ═══════════════════════════════════════════════════════════ */
function UseCases() {
  const cases = [
    { emoji: '👥', title: 'Send money', desc: 'Send it to friends and family.', color: '#C9503E' },
    { emoji: '🛍️', title: 'Pay', desc: 'Use it with businesses that accept it.', color: '#D4A574' },
    { emoji: '💰', title: 'Hold', desc: 'Keep some as a digital asset.', color: '#7C9082' },
    { emoji: '🎁', title: 'Receive', desc: 'Get paid or receive money from someone.', color: '#9B8EC4' },
    { emoji: '🌍', title: 'Join the network', desc: 'Be part of a growing community using the same asset.', color: '#C4A35A' },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {cases.map((c, i) => (
        <FadeIn key={i} delay={i * 0.08}>
          <div className="bg-white rounded-2xl px-6 py-5 border border-[#2D1F14]/[0.04] shadow-[0_1px_12px_rgba(45,31,20,0.04)] hover:shadow-[0_4px_20px_rgba(45,31,20,0.08)] transition-shadow duration-500">
            <span className="text-2xl block mb-2" style={{ animation: `float ${3.5 + i * 0.3}s ease-in-out infinite ${i * 0.4}s` }}>{c.emoji}</span>
            <p className="font-semibold text-sm text-[#2D1F14]">{c.title}</p>
            <p className="text-xs text-[#8B7D6B] mt-1 leading-relaxed">{c.desc}</p>
          </div>
        </FadeIn>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FEEDBACK: STEP DOTS
   ═══════════════════════════════════════════════════════════ */
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className={`rounded-full transition-all duration-300 ${i === current ? 'bg-[#2D1F14] w-6' : i < current ? 'bg-[#2D1F14]/30 w-2' : 'bg-[#2D1F14]/10 w-2'}`}
          layout
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */

export default function Page() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroY = useTransform(scrollY, [0, 300], [0, 30]);

  /* Feedback state */
  const [step, setStep] = useState(0);
  const [q1WhatIsIt, setQ1WhatIsIt] = useState<string | null>(null);
  const [q2UseCases, setQ2UseCases] = useState<string[]>([]);
  const [q3WhyNot, setQ3WhyNot] = useState<string | null>(null);
  const [q4WouldTry, setQ4WouldTry] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const submitFeedback = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'feedback', q1_what_is_it: q1WhatIsIt, q2_use_cases: q2UseCases, q3_why_not: q3WhyNot, q4_would_try: q4WouldTry, open_feedback: feedbackText }),
      });
    } catch { /* show thanks anyway */ }
    setSubmitting(false);
    setSubmitted(true);
    setStep(5);
  };

  const submitInterest = async () => {
    if (submitting || !name.trim() || !contact.trim()) return;
    setSubmitting(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'interest', name: name.trim(), contact: contact.trim() }),
      });
    } catch { /* show thanks anyway */ }
    setSubmitting(false);
    setStep(6);
  };

  const toggleMultiSelect = (val: string) => {
    setQ2UseCases((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : PAGE_URL;
  const copyLink = () => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); };

  return (
    <div className="min-h-screen bg-[#FFF9F5] text-[#2D1F14]">
      {/* NAV */}
      <motion.nav
        initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#FFF9F5]/80 backdrop-blur-lg border-b border-[#2D1F14]/[0.04]"
      >
        <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <NovacoinLogo />
          <div className="hidden md:flex items-center gap-6 text-xs text-[#8B7D6B]">
            <button onClick={() => scrollTo('what-is')} className="hover:text-[#2D1F14] transition-colors cursor-pointer">What is this?</button>
            <button onClick={() => scrollTo('how-it-works')} className="hover:text-[#2D1F14] transition-colors cursor-pointer">How it works</button>
            <button onClick={() => scrollTo('the-idea')} className="hover:text-[#2D1F14] transition-colors cursor-pointer">The idea</button>
          </div>
          <button onClick={() => scrollTo('validate')} className="text-xs font-semibold bg-[#2D1F14] text-[#FFF9F5] px-4 py-2 rounded-full hover:bg-[#3D2F24] transition-colors cursor-pointer">Give feedback</button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden ml-3 p-2 cursor-pointer" aria-label="Menu">
            <div className="w-4 flex flex-col gap-1">
              <span className={`block h-px bg-[#2D1F14] transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-[3px]' : ''}`} />
              <span className={`block h-px bg-[#2D1F14] transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-[3px]' : ''}`} />
            </div>
          </button>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden overflow-hidden border-t border-[#2D1F14]/[0.04] bg-[#FFF9F5]/95 backdrop-blur-lg">
              <div className="px-5 py-4 space-y-3">
                <button onClick={() => scrollTo('what-is')} className="block text-sm text-[#8B7D6B] hover:text-[#2D1F14] cursor-pointer">What is this?</button>
                <button onClick={() => scrollTo('how-it-works')} className="block text-sm text-[#8B7D6B] hover:text-[#2D1F14] cursor-pointer">How it works</button>
                <button onClick={() => scrollTo('the-idea')} className="block text-sm text-[#8B7D6B] hover:text-[#2D1F14] cursor-pointer">The idea</button>
                <button onClick={() => scrollTo('validate')} className="block text-sm font-semibold text-[#C9503E] cursor-pointer">Give feedback</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ══════════ HERO ══════════ */}
      <motion.section style={{ opacity: heroOpacity, y: heroY }} className="relative pt-28 pb-16 md:pt-36 md:pb-24 px-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle at 70% 20%, rgba(201,80,62,0.1) 0%, transparent 60%)', animation: 'blob 12s ease-in-out infinite' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle at 30% 80%, rgba(124,144,130,0.15) 0%, transparent 60%)', animation: 'blob 14s ease-in-out infinite 3s' }} />

        <div className="relative max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <span className="inline-flex items-center gap-2 bg-[#2D1F14]/[0.04] text-[#8B7D6B] text-[11px] font-medium px-4 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9503E]" style={{ animation: 'pulse-soft 2s infinite' }} />
              {"We're exploring an idea"}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-[clamp(1.9rem,5.5vw,3.2rem)] font-black leading-[1.08] tracking-tight text-[#2D1F14]"
          >
            What if digital money
            <br />
            <span className="italic font-medium" style={{ color: '#C9503E' }}>felt this easy?</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }} className="mt-5 text-[#8B7D6B] text-base md:text-lg max-w-md mx-auto leading-relaxed">
            {"We're exploring a simple digital asset that people could buy, hold, send and receive, starting with everyday Nigerians."}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <SoftButton onClick={() => scrollTo('what-is')}>Learn more</SoftButton>
            <SoftButton variant="secondary" onClick={() => scrollTo('validate')}>Give feedback</SoftButton>
          </motion.div>

          <HeroFlowVisual />
        </div>
      </motion.section>

      {/* ══════════ SOCIAL COIN CONCEPT ══════════ */}
      <section className="py-16 md:py-24 px-5">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="text-center mb-10">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#9B8EC4] mb-3">The feeling</p>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                Imagine sending money
                <br />
                <span className="italic font-medium" style={{ color: '#9B8EC4' }}>like sending a message.</span>
              </h2>
              <p className="mt-4 text-[#8B7D6B] max-w-sm mx-auto text-sm leading-relaxed">
                {"That's the idea. Same casual energy. Same speed. But you're sending actual value, not just words."}
              </p>
            </div>
          </FadeIn>
          <SocialCoinConcept />
        </div>
      </section>

      {/* ══════════ WHAT IS THIS? ══════════ */}
      <section id="what-is" className="py-16 md:py-24 px-5">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                So... what exactly is NovaCoin?
              </h2>
              <p className="mt-4 text-[#8B7D6B] text-[15px] max-w-md mx-auto leading-relaxed">
                {"It's an idea for a digital asset that people could buy with naira, keep, send to other people, receive from others, and eventually use across a growing network."}
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'BUY', desc: 'Use naira to get it.', emoji: '💳', color: '#C9503E' },
              { label: 'HOLD', desc: 'Keep it in your account.', emoji: '💰', color: '#7C9082' },
              { label: 'SEND', desc: 'Send it to another person.', emoji: '✉️', color: '#9B8EC4' },
              { label: 'USE', desc: 'Use it wherever the network accepts it.', emoji: '🎮', color: '#C4A35A' },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#2D1F14]/[0.04] shadow-[0_1px_12px_rgba(45,31,20,0.04)] text-center hover:shadow-[0_4px_20px_rgba(45,31,20,0.08)] transition-shadow duration-500">
                  <span className="text-2xl block mb-3" style={{ animation: `float ${3.5 + i * 0.3}s ease-in-out infinite ${i * 0.3}s` }}>{item.emoji}</span>
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: item.color }}>{item.label}</p>
                  <p className="text-sm font-medium text-[#2D1F14]/80">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ IMAGINE THIS ══════════ */}
      <section className="py-16 md:py-20 px-5">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Imagine this.</h2>
            </div>
          </FadeIn>
          <ImagineScenario />
          <FadeIn delay={0.7}>
            <p className="text-center mt-10 text-[#8B7D6B] text-[15px] max-w-sm mx-auto leading-relaxed">
              Now imagine thousands of people around you can do the same.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS (USE CASES) ══════════ */}
      <section id="how-it-works" className="py-16 md:py-24 px-5">
        <div className="max-w-lg mx-auto">
          <FadeIn>
            <div className="text-center mb-10">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#C9503E] mb-3">What could people actually use it for?</p>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">A few possibilities.</h2>
            </div>
          </FadeIn>
          <UseCases />
        </div>
      </section>

      {/* ══════════ WHY NOT BANK TRANSFER? ══════════ */}
      <section className="py-16 md:py-20 px-5">
        <div className="max-w-2xl mx-auto">
          <FadeIn>
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#2D1F14]/[0.04] shadow-[0_2px_20px_rgba(45,31,20,0.04)] text-center relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(201,80,62,0.1) 0%, transparent 70%)' }} />
              <div className="relative">
                <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#8B7D6B] mb-4">You might be thinking...</p>
                <h2 className="text-xl md:text-2xl font-black tracking-tight leading-snug">
                  &ldquo;Why not just use bank transfer?&rdquo;
                </h2>
                <div className="mt-8 space-y-4">
                  <p className="text-[15px] text-[#2D1F14]/70 leading-relaxed">{"That's exactly what we're trying to understand."}</p>
                  <p className="text-[15px] text-[#2D1F14] font-medium leading-relaxed">What would make a new digital asset useful enough that people would actually choose it?</p>
                  <p className="text-sm text-[#8B7D6B]/60 italic">{"We don't know the answer yet. That's why we need your honest feedback."}</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════ ONE IMPORTANT THING ══════════ */}
      <section className="py-10 md:py-14 px-5">
        <div className="max-w-md mx-auto">
          <FadeIn>
            <div className="flex items-start gap-3 bg-[#C9503E]/[0.04] rounded-2xl p-5 border border-[#C9503E]/10">
              <span className="text-lg mt-0.5">⚡</span>
              <div>
                <p className="text-sm font-bold text-[#2D1F14] mb-1">One important thing</p>
                <p className="text-[13px] text-[#2D1F14]/60 leading-relaxed">{"This isn't being presented as a guaranteed investment or a way to make money. We're exploring whether a digital asset can become useful because lots of people use it."}</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════ THE BIGGER IDEA (NETWORK) ══════════ */}
      <section id="the-idea" className="py-16 md:py-24 px-5">
        <div className="max-w-lg mx-auto">
          <FadeIn>
            <div className="text-center mb-10">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#9B8EC4] mb-3">The idea</p>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                The more people who use it,
                <br />
                <span className="italic font-medium">the more people you can use it with.</span>
              </h2>
            </div>
          </FadeIn>
          <InteractiveNetwork />
        </div>
      </section>

      {/* ══════════ STARTING SMALL (UNIVERSITY) ══════════ */}
      <section className="py-16 md:py-20 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#D4A574] mb-3">Ground zero</p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Maybe it starts with one university.</h2>
            <p className="mt-4 text-[#8B7D6B] max-w-md mx-auto text-[15px] leading-relaxed">A few students. Then a few communities. Then thousands of people. We want to see what happens.</p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-lg mx-auto">
              {[
                { num: '3,000', label: 'students', emoji: '📚' },
                { num: '20', label: 'communities', emoji: '🌍' },
                { num: '10', label: 'creators', emoji: '🎨' },
                { num: '10', label: 'local businesses', emoji: '🏪' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl px-4 py-4 border border-[#2D1F14]/[0.04] shadow-[0_1px_8px_rgba(45,31,20,0.03)]">
                  <span className="text-lg block mb-1">{item.emoji}</span>
                  <p className="text-lg font-black text-[#2D1F14]">{item.num}</p>
                  <p className="text-[10px] text-[#8B7D6B] uppercase tracking-wide">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-[#8B7D6B]/40 italic">These are hypothetical examples, not existing traction.</p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p className="mt-8 text-[15px] text-[#2D1F14]/70 max-w-sm mx-auto leading-relaxed">Could something like this grow from a small community into something much bigger?</p>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════ VALIDATION: MULTI-STEP FEEDBACK ══════════════ */}
      <section id="validate" className="py-16 md:py-24 px-5">
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            {/* STEP 0: INTRO */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                <div className="text-center mb-8">
                  <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#C9503E] mb-3">Your honest opinion is more valuable than a like.</p>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight">Okay. Would you actually use this?</h2>
                  <p className="mt-3 text-[#8B7D6B] text-sm max-w-sm mx-auto">4 quick questions. No sign-up required. Takes about 30 seconds.</p>
                </div>
                <button onClick={() => setStep(1)} className="w-full bg-[#2D1F14] text-[#FFF9F5] font-semibold text-sm py-4 rounded-2xl hover:bg-[#3D2F24] transition-all cursor-pointer">{"Let's go"}</button>
              </motion.div>
            )}

            {/* STEP 1: WHAT DO YOU THINK THIS IS? */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}>
                <StepDots current={0} total={4} />
                <p className="text-xs font-semibold text-[#8B7D6B]/50 mb-1">Question 1 of 4</p>
                <h3 className="text-xl font-black tracking-tight mb-6">What do you think NovaCoin is?</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Digital money', value: 'digital-money' },
                    { label: 'An investment', value: 'investment' },
                    { label: 'A payment app', value: 'payment-app' },
                    { label: `I'm honestly not sure`, value: 'not-sure' },
                  ].map((opt) => (
                    <SelectCard key={opt.value} label={opt.label} selected={q1WhatIsIt === opt.value} onClick={() => { setQ1WhatIsIt(opt.value); setTimeout(() => setStep(2), 300); }} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: WHAT WOULD YOU USE IT FOR? (MULTI) */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}>
                <StepDots current={1} total={4} />
                <p className="text-xs font-semibold text-[#8B7D6B]/50 mb-1">Question 2 of 4</p>
                <h3 className="text-xl font-black tracking-tight mb-2">What would you actually use it for?</h3>
                <p className="text-xs text-[#8B7D6B]/50 mb-6">Pick as many as you like.</p>
                <div className="space-y-3">
                  {[
                    { label: 'Send money to friends', value: 'send-friends' },
                    { label: 'Hold it', value: 'hold' },
                    { label: 'Pay for things', value: 'pay' },
                    { label: 'Receive money', value: 'receive' },
                    { label: 'Send money to family', value: 'send-family' },
                    { label: 'Use it with online communities', value: 'communities' },
                    { label: `I don't see a use for it yet`, value: 'no-use' },
                  ].map((opt) => (
                    <SelectCard key={opt.value} label={opt.label} selected={q2UseCases.includes(opt.value)} multi onClick={() => toggleMultiSelect(opt.value)} />
                  ))}
                </div>
                <button onClick={() => setStep(3)} className="mt-6 w-full bg-[#2D1F14] text-[#FFF9F5] font-semibold text-sm py-3.5 rounded-xl hover:bg-[#3D2F24] transition-all cursor-pointer">Continue</button>
              </motion.div>
            )}

            {/* STEP 3: BIGGEST REASON YOU MIGHT NOT */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}>
                <StepDots current={2} total={4} />
                <p className="text-xs font-semibold text-[#8B7D6B]/50 mb-1">Question 3 of 4</p>
                <h3 className="text-xl font-black tracking-tight mb-6">What{"'"}s the biggest reason you might <em>not</em> use it?</h3>
                <div className="space-y-3">
                  {[
                    { label: `I already use bank transfers`, value: 'bank-transfer' },
                    { label: `I don't trust digital assets`, value: 'no-trust' },
                    { label: `I don't understand them`, value: 'dont-understand' },
                    { label: 'I would worry about losing money', value: 'lose-money' },
                    { label: 'I would worry about scams', value: 'scams' },
                    { label: `I don't see the need`, value: 'no-need' },
                    { label: 'Something else', value: 'other' },
                  ].map((opt) => (
                    <SelectCard key={opt.value} label={opt.label} selected={q3WhyNot === opt.value} onClick={() => { setQ3WhyNot(opt.value); setTimeout(() => setStep(4), 300); }} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 4: WOULD YOU ACTUALLY TRY IT? */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}>
                <StepDots current={3} total={4} />
                <p className="text-xs font-semibold text-[#8B7D6B]/50 mb-1">Question 4 of 4</p>
                <h3 className="text-xl font-black tracking-tight mb-2">Now be honest...</h3>
                <h3 className="text-2xl font-black tracking-tight mb-6">Would you actually try it?</h3>
                <div className="space-y-3">
                  {[
                    { emoji: '❤️', label: `YES, I'D TRY IT`, value: 'yes' },
                    { emoji: '🤔', label: `MAYBE, I'M NOT CONVINCED`, value: 'maybe' },
                    { emoji: '❌', label: `NO, I DON'T SEE THE POINT`, value: 'no' },
                  ].map((opt) => (
                    <SelectCard key={opt.value} emoji={opt.emoji} label={opt.label} selected={q4WouldTry === opt.value} onClick={() => { setQ4WouldTry(opt.value); setTimeout(() => setStep(5), 300); }} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 5: OPEN-ENDED + SUBMIT + SHARE */}
            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                {!submitted ? (
                  <>
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-black tracking-tight">What would make you want to use it?</h3>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-[#2D1F14]/[0.04] shadow-[0_1px_12px_rgba(45,31,20,0.04)]">
                      <div className="relative">
                        <span className="absolute left-3.5 top-3.5 text-sm text-[#8B7D6B] italic">{"I'd use it if..."}</span>
                        <textarea
                          value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="" rows={4}
                          className="w-full bg-[#FFF9F5] rounded-xl border border-[#2D1F14]/[0.06] px-3.5 pt-8 pb-3 text-sm text-[#2D1F14] placeholder:text-transparent focus:outline-none focus:border-[#2D1F14]/15 focus:ring-1 focus:ring-[#2D1F14]/[0.06] resize-none transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-[#8B7D6B]/40 mt-2 italic">Tell us honestly. No marketing answer needed.</p>
                      <button onClick={submitFeedback} disabled={submitting} className="mt-4 w-full bg-[#2D1F14] text-[#FFF9F5] font-semibold text-sm py-3.5 rounded-xl hover:bg-[#3D2F24] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                        {submitting ? 'Sending...' : 'Send feedback'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <motion.span className="text-5xl block mb-4" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.5, delay: 0.2 }}>❤️</motion.span>
                      <h3 className="text-2xl font-black tracking-tight">Thanks for being honest.</h3>
                      <p className="mt-3 text-[#8B7D6B] text-sm max-w-xs mx-auto leading-relaxed">This is an experiment. Your answer actually helps us decide whether we should build it.</p>
                      <p className="mt-4 text-xs text-[#8B7D6B]/40">{"You're one of the people helping us test the idea."}</p>
                    </div>

                    {/* Share */}
                    <div className="mt-8 bg-white rounded-2xl p-6 border border-[#2D1F14]/[0.04] shadow-[0_1px_8px_rgba(45,31,20,0.03)]">
                      <p className="text-sm font-semibold text-[#2D1F14] mb-1">Know someone who{"'"}d have a strong opinion?</p>
                      <p className="text-xs text-[#8B7D6B] mb-4">Share the idea</p>
                      <div className="grid grid-cols-4 gap-2">
                        <a href={`https://wa.me/?text=${encodeURIComponent('Check out this idea I found - NovaCoin: ' + shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[#25D366]/[0.08] hover:bg-[#25D366]/[0.15] transition-colors">
                          <span className="text-lg">💬</span>
                          <span className="text-[10px] font-medium text-[#2D1F14]/60">WhatsApp</span>
                        </a>
                        <button onClick={copyLink} className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[#2D1F14]/[0.04] hover:bg-[#2D1F14]/[0.08] transition-colors cursor-pointer">
                          <span className="text-lg">📋</span>
                          <span className="text-[10px] font-medium text-[#2D1F14]/60">{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out this idea - NovaCoin')}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[#1DA1F2]/[0.08] hover:bg-[#1DA1F2]/[0.15] transition-colors">
                          <span className="text-lg">𝕏</span>
                          <span className="text-[10px] font-medium text-[#2D1F14]/60">X</span>
                        </a>
                        <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out this idea - NovaCoin')}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[#0088CC]/[0.08] hover:bg-[#0088CC]/[0.15] transition-colors">
                          <span className="text-lg">✈️</span>
                          <span className="text-[10px] font-medium text-[#2D1F14]/60">Telegram</span>
                        </a>
                      </div>
                    </div>

                    {/* Optional interest */}
                    <div className="mt-4 bg-white rounded-2xl p-6 border border-[#2D1F14]/[0.04] shadow-[0_1px_8px_rgba(45,31,20,0.03)]">
                      <p className="text-sm font-semibold text-[#2D1F14] mb-1">Want to hear what happens next?</p>
                      <p className="text-xs text-[#8B7D6B] mb-4">Completely optional.</p>
                      <div className="space-y-3">
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full bg-[#FFF9F5] rounded-xl border border-[#2D1F14]/[0.06] px-4 py-3 text-sm text-[#2D1F14] placeholder:text-[#8B7D6B]/50 focus:outline-none focus:border-[#2D1F14]/15 focus:ring-1 focus:ring-[#2D1F14]/[0.06] transition-all" />
                        <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="WhatsApp number or email" className="w-full bg-[#FFF9F5] rounded-xl border border-[#2D1F14]/[0.06] px-4 py-3 text-sm text-[#2D1F14] placeholder:text-[#8B7D6B]/50 focus:outline-none focus:border-[#2D1F14]/15 focus:ring-1 focus:ring-[#2D1F14]/[0.06] transition-all" />
                        <button onClick={submitInterest} disabled={!name.trim() || !contact.trim() || submitting} className="w-full bg-[#C9503E] text-white font-semibold text-sm py-3 rounded-xl hover:bg-[#B5432E] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                          {submitting ? 'Sending...' : 'Keep me posted'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* STEP 6: INTEREST CONFIRMED */}
            {step === 6 && (
              <motion.div key="s6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center py-12">
                <motion.span className="text-4xl block mb-4" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.5, delay: 0.2 }}>🌸</motion.span>
                <h3 className="text-xl font-black tracking-tight">{"You'll hear from us."}</h3>
                <p className="mt-3 text-[#8B7D6B] text-sm">If this idea becomes something real, you{"'"}ll be among the first to know.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#2D1F14]/[0.04] px-5 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <NovacoinLogo size="sm" />
            <span className="text-[10px] text-[#8B7D6B]/40">·</span>
            <span className="text-[10px] text-[#8B7D6B]/40">Concept prototype</span>
          </div>
          <p className="text-[10px] text-[#8B7D6B]/30 text-center">Not a financial product. Not investment advice. Just an idea being explored.</p>
        </div>
      </footer>
    </div>
  );
}
