'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

const NAME = 'Novacoin';

function useCountUp(end: number, duration = 2000, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const start = Date.now();
      const step = () => {
        const p = Math.min((Date.now() - start) / duration, 1);
        setVal(Math.floor((1 - Math.pow(1 - p, 3)) * end));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(t);
  }, [end, duration, delay]);
  return val;
}

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

/* ═══════════════════════════════════════════════════════════════
   NOVACOIN LOGO
   ═══════════════════════════════════════════════════════════════ */
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
        <path
          d="M10 22V10L22 22V10"
          stroke="white"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span className={`${isMd ? 'text-sm font-bold' : 'text-xs font-bold'} tracking-tight text-[#2D1F14]`}>
        Nova
        <span className="font-medium text-[#2D1F14]/50">coin</span>
      </span>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO ANIMATED EXCHANGE VISUAL
   ═══════════════════════════════════════════════════════════════ */
function HeroExchangeVisual() {
  return (
    <div className="relative w-full max-w-sm mx-auto mt-10 md:mt-14 mb-4">
      {/* Soft background shape */}
      <div
        className="absolute inset-0 -m-6 opacity-40"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(201,80,62,0.12) 0%, transparent 70%)',
          animation: 'blob 10s ease-in-out infinite',
        }}
      />

      <div className="relative flex flex-col items-center gap-5">
        {/* Sender */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3.5 shadow-[0_2px_20px_rgba(45,31,20,0.06)]"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D4A574] to-[#C9503E] flex items-center justify-center text-white text-xs font-bold">A</div>
          <div>
            <p className="text-sm font-semibold text-[#2D1F14]">@Amaka</p>
            <p className="text-xs text-[#8B7D6B]">sending</p>
          </div>
        </motion.div>

        {/* Animated transfer line + bubble */}
        <div className="relative w-px h-10">
          <div className="absolute inset-0 w-px bg-[#2D1F14]/10" />
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#C9503E]/10 flex items-center justify-center"
            initial={{ y: 0, opacity: 0.6 }}
            animate={{ y: 40, opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-xs font-bold text-[#C9503E]">200</span>
          </motion.div>
        </div>

        {/* Asset bubble */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-[#2D1F14] text-[#FFF9F5] px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg"
          style={{ animation: 'float 4s ease-in-out infinite' }}
        >
          200 {NAME}
        </motion.div>

        {/* Animated transfer line 2 */}
        <div className="relative w-px h-10">
          <div className="absolute inset-0 w-px bg-[#2D1F14]/10" />
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#7C9082]"
            initial={{ y: 0, opacity: 0.4 }}
            animate={{ y: 40, opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
        </div>

        {/* Receiver */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3.5 shadow-[0_2px_20px_rgba(45,31,20,0.06)]"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C9082] to-[#5A6F5E] flex items-center justify-center text-white text-xs font-bold">D</div>
          <div>
            <p className="text-sm font-semibold text-[#2D1F14]">@Daniel</p>
            <p className="text-xs text-[#8B7D6B]">received</p>
          </div>
          <motion.span
            className="ml-2 text-lg"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
          >✨</motion.span>
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION: IT'S THAT SIMPLE
   ═══════════════════════════════════════════════════════════════ */
function SimpleFlow() {
  const steps = [
    { label: 'BUY', title: 'Start with ₦', desc: '₦10,000', sub: '↓', result: `1,250 ${NAME}`, color: '#C9503E', bg: '#C9503E08' },
    { label: 'HOLD', title: 'Your balance', desc: `1,250 ${NAME}`, sub: `≈ ₦10,000`, result: '', color: '#7C9082', bg: '#7C908208' },
    { label: 'SEND', title: 'Send it to anyone', desc: `Send 250 ${NAME}`, sub: 'to:', result: '@Daniel', color: '#9B8EC4', bg: '#9B8EC408' },
    { label: 'RECEIVE', title: 'It arrives', desc: 'Received', sub: '', result: '✨', color: '#C4A35A', bg: '#C4A35A08' },
    { label: 'USE', title: 'Or spend it', desc: 'Paid', sub: '', result: '@CampusCafe', color: '#D4A574', bg: '#D4A57408' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 md:gap-4">
      {steps.map((s, i) => (
        <FadeIn key={i} delay={i * 0.1}>
          <div className="relative bg-white rounded-2xl p-5 border border-[#2D1F14]/[0.06] shadow-[0_1px_12px_rgba(45,31,20,0.04)] hover:shadow-[0_4px_24px_rgba(45,31,20,0.08)] transition-shadow duration-500">
            <span
              className="inline-block text-[10px] font-bold tracking-[0.15em] uppercase mb-3 px-2.5 py-1 rounded-full"
              style={{ color: s.color, backgroundColor: s.bg }}
            >
              {s.label}
            </span>
            <p className="text-xs text-[#8B7D6B] mb-1">{s.title}</p>
            <p className="text-lg font-bold text-[#2D1F14] leading-tight">{s.desc}</p>
            {s.sub && <p className="text-sm text-[#8B7D6B] mt-1">{s.sub}</p>}
            {s.result && (
              <p className="text-base font-semibold mt-2" style={{ color: s.color }}>{s.result}</p>
            )}
            {/* Connector arrow on desktop */}
            {i < 4 && (
              <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-[#2D1F14]/20 text-sm">
                →
              </div>
            )}
          </div>
        </FadeIn>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION: THE BIGGER IDEA — GROWING NETWORK
   ═══════════════════════════════════════════════════════════════ */
function NetworkGrowth() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const stages = [
    { label: 'YOU', count: 1, color: '#C9503E' },
    { label: 'YOU + 1 FRIEND', count: 2, color: '#C9503E' },
    { label: '10 PEOPLE', count: 10, color: '#D4A574' },
    { label: '100 PEOPLE', count: 100, color: '#7C9082' },
    { label: '1,000 PEOPLE', count: 1000, color: '#9B8EC4' },
    { label: '10,000 PEOPLE', count: 10000, color: '#C4A35A' },
    { label: '1,000,000 PEOPLE', count: 1000000, color: '#C9503E' },
  ];

  return (
    <div ref={ref} className="space-y-3">
      {stages.map((stage, i) => {
        const nodeCount = Math.min(stage.count, 20);
        const showLabel = i === stages.length - 1;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4"
          >
            <span className={`text-xs font-medium w-28 md:w-36 shrink-0 ${showLabel ? 'text-[#C9503E] font-bold' : 'text-[#8B7D6B]'}`}>
              {stage.label}
            </span>
            <div className="flex-1 flex items-center gap-1 min-w-0">
              {/* Connection lines */}
              <svg className="shrink-0" width={nodeCount * 18 + 10} height="24" style={{ overflow: 'visible' }}>
                {nodeCount > 1 && Array.from({ length: Math.min(nodeCount - 1, 8) }).map((_, j) => (
                  <line
                    key={j}
                    x1={j * 18 + 12} y1={12}
                    x2={(j + 1) * 18 + 4} y2={12}
                    stroke={stage.color}
                    strokeOpacity={0.15}
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    style={{ animation: 'dash-flow 1.5s linear infinite' }}
                  />
                ))}
                {/* Nodes */}
                {Array.from({ length: nodeCount }).map((_, j) => (
                  <motion.circle
                    key={j}
                    cx={j * 18 + 8}
                    cy={12}
                    r={i === 0 ? 6 : 4}
                    fill={stage.color}
                    initial={{ scale: 0 }}
                    animate={inView ? { scale: 1 } : {}}
                    transition={{
                      delay: i * 0.12 + j * 0.03,
                      type: 'spring',
                      stiffness: 400,
                      damping: 20,
                    }}
                  />
                ))}
                {/* Overflow indicator */}
                {stage.count > 20 && (
                  <text x={nodeCount * 18 + 14} y={16} fill={stage.color} fontSize="11" fontWeight="600" opacity="0.6">
                    +{stage.count - 20}
                  </text>
                )}
              </svg>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION: STARTING SMALL
   ═══════════════════════════════════════════════════════════════ */
function StartingSmall() {
  const bubbles = [
    { label: 'Students', emoji: '📚', color: '#C9503E', delay: 0 },
    { label: 'Creators', emoji: '🎨', color: '#9B8EC4', delay: 0.08 },
    { label: 'Friends', emoji: '💜', color: '#D4A574', delay: 0.16 },
    { label: 'Communities', emoji: '🌍', color: '#7C9082', delay: 0.24 },
    { label: 'Small businesses', emoji: '🏪', color: '#C4A35A', delay: 0.32 },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {bubbles.map((b, i) => (
        <FadeIn key={i} delay={b.delay}>
          <motion.div
            whileHover={{ scale: 1.06, y: -2 }}
            className="flex items-center gap-2.5 bg-white rounded-full px-5 py-3 border border-[#2D1F14]/[0.06] shadow-[0_1px_8px_rgba(45,31,20,0.04)] cursor-default"
          >
            <span className="text-xl" style={{ animation: `float ${3.5 + i * 0.4}s ease-in-out infinite ${i * 0.5}s` }}>{b.emoji}</span>
            <span className="text-sm font-medium text-[#2D1F14]">{b.label}</span>
          </motion.div>
        </FadeIn>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION: VALIDATION CTA
   ═══════════════════════════════════════════════════════════════ */
function ValidationResponse({ emoji, label, color, selected, onClick }: {
  emoji: string; label: string; color: string; selected: boolean; onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
        selected
          ? 'border-[#2D1F14] bg-[#2D1F14]/[0.03] shadow-md'
          : 'border-[#2D1F14]/[0.06] bg-white hover:border-[#2D1F14]/15 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3">
        <motion.span
          className="text-2xl"
          animate={selected ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {emoji}
        </motion.span>
        <span className={`font-semibold text-sm ${selected ? 'text-[#2D1F14]' : 'text-[#2D1F14]/70'}`}>
          {label}
        </span>
        {selected && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto w-5 h-5 rounded-full bg-[#2D1F14] flex items-center justify-center"
          >
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.span>
        )}
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function Page() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroY = useTransform(scrollY, [0, 300], [0, 30]);
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (feedbackText.trim() || contact.trim()) {
      setSubmitted(true);
    }
  };

  const handleInterest = () => {
    if (name.trim() && contact.trim()) {
      setSubmitted(true);
    }
  };

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-[#FFF9F5] text-[#2D1F14]">
      {/* ─── NAV ─── */}
      <motion.nav
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#FFF9F5]/80 backdrop-blur-lg border-b border-[#2D1F14]/[0.04]"
      >
        <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <NovacoinLogo />
          <div className="hidden md:flex items-center gap-6 text-xs text-[#8B7D6B]">
            <button onClick={() => scrollTo('simple')} className="hover:text-[#2D1F14] transition-colors cursor-pointer">How it works</button>
            <button onClick={() => scrollTo('bigger')} className="hover:text-[#2D1F14] transition-colors cursor-pointer">The idea</button>
            <button onClick={() => scrollTo('honest')} className="hover:text-[#2D1F14] transition-colors cursor-pointer">Honest talk</button>
          </div>
          <button
            onClick={() => scrollTo('validate')}
            className="text-xs font-semibold bg-[#2D1F14] text-[#FFF9F5] px-4 py-2 rounded-full hover:bg-[#3D2F24] transition-colors cursor-pointer"
          >
            Share your take
          </button>
        </div>
      </motion.nav>

      {/* ═════════════════ HERO ═══════════════ */}
      <motion.section
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative pt-28 pb-16 md:pt-36 md:pb-24 px-5 overflow-hidden"
      >
        {/* Warm background accent */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-30 pointer-events-none" style={{
          background: 'radial-gradient(circle at 70% 20%, rgba(201,80,62,0.1) 0%, transparent 60%)',
          animation: 'blob 12s ease-in-out infinite',
        }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-20 pointer-events-none" style={{
          background: 'radial-gradient(circle at 30% 80%, rgba(124,144,130,0.15) 0%, transparent 60%)',
          animation: 'blob 14s ease-in-out infinite 3s',
        }} />

        <div className="relative max-w-2xl mx-auto text-center">
          {/* Exploration badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2 bg-[#2D1F14]/[0.04] text-[#8B7D6B] text-[11px] font-medium px-4 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9503E]" style={{ animation: 'pulse-soft 2s infinite' }} />
              We&apos;re exploring an idea
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-[clamp(1.9rem,5.5vw,3.2rem)] font-black leading-[1.08] tracking-tight text-[#2D1F14]"
          >
            What if digital money
            <br />
            <span className="italic font-medium" style={{ color: '#C9503E' }}>
              felt this easy?
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="mt-5 text-[#8B7D6B] text-base md:text-lg max-w-md mx-auto leading-relaxed"
          >
            A new digital asset we&apos;re exploring for everyday Nigerians — built to be easy to buy, hold, send and use.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <SoftButton onClick={() => scrollTo('simple')}>See how it works</SoftButton>
            <SoftButton variant="secondary" onClick={() => scrollTo('validate')}>Tell us what you think</SoftButton>
          </motion.div>

          {/* Hero visual */}
          <HeroExchangeVisual />
        </div>
      </motion.section>

      {/* ═══════════════ IT&apos;S THAT SIMPLE ═══════════════ */}
      <section id="simple" className="py-16 md:py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#C9503E] mb-3">The flow</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                It&apos;s that simple.
              </h2>
              <p className="mt-3 text-[#8B7D6B] max-w-sm mx-auto text-sm">
                Five steps. No jargon. No complicated screens. Just people moving value.
              </p>
            </div>
          </FadeIn>
          <SimpleFlow />
        </div>
      </section>

      {/* ═══════════════ BUILT FOR PEOPLE ═══════════════ */}
      <section className="py-16 md:py-20 px-5">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#7C9082] mb-3">No crypto degree required</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                You shouldn&apos;t need to understand crypto
                <br className="hidden md:block" />
                <span className="italic font-medium"> to use it.</span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { text: 'No complicated wallets.', icon: '🪃' },
              { text: 'No confusing screens.', icon: '🧘' },
              { text: 'No blockchain knowledge required.', icon: '🌿' },
              { text: 'Just buy, hold, send and receive.', icon: '🤲' },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="flex items-center gap-4 bg-white rounded-2xl px-6 py-5 border border-[#2D1F14]/[0.04] shadow-[0_1px_8px_rgba(45,31,20,0.03)]">
                  <span className="text-2xl">{item.icon}</span>
                  <p className="text-[15px] font-medium text-[#2D1F14]/80">{item.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ THE BIGGER IDEA ═══════════════ */}
      <section id="bigger" className="py-16 md:py-24 px-5">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#9B8EC4] mb-3">The real question</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                What happens when everyone can use
                <br className="hidden md:block" />
                <span className="italic font-medium"> the same digital asset?</span>
              </h2>
            </div>
          </FadeIn>

          <div className="max-w-xl mx-auto">
            <NetworkGrowth />
          </div>

          <FadeIn delay={0.5}>
            <p className="text-center mt-12 text-[#8B7D6B] text-base max-w-sm mx-auto leading-relaxed">
              The more people who use it, the more useful it becomes.
              <br />
              <span className="text-sm text-[#8B7D6B]/60">Imagine sending money as easily as sending a message.</span>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════ STARTING SMALL ═══════════════ */}
      <section className="py-16 md:py-20 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#D4A574] mb-3">Ground zero</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Maybe it starts with us.
            </h2>
            <p className="mt-4 text-[#8B7D6B] max-w-md mx-auto text-[15px] leading-relaxed">
              A university. A few communities. A few thousand people.
              <br />
              Then we see what happens.
            </p>
          </FadeIn>

          <div className="mt-10">
            <StartingSmall />
          </div>

          {/* Campus illustration hint */}
          <FadeIn delay={0.3}>
            <div className="mt-12 inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-4 border border-[#2D1F14]/[0.04] shadow-[0_1px_12px_rgba(45,31,20,0.04)]">
              <span className="text-2xl">🏫</span>
              <div className="text-left">
                <p className="text-sm font-semibold text-[#2D1F14]">Starting with campus communities</p>
                <p className="text-xs text-[#8B7D6B]">Where networks naturally form</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════ HONEST TALK ═══════════════ */}
      <section id="honest" className="py-16 md:py-24 px-5">
        <div className="max-w-2xl mx-auto">
          <FadeIn>
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#2D1F14]/[0.04] shadow-[0_2px_20px_rgba(45,31,20,0.04)] text-center relative overflow-hidden">
              {/* Subtle accent */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 opacity-30 pointer-events-none" style={{
                background: 'radial-gradient(circle, rgba(201,80,62,0.1) 0%, transparent 70%)',
              }} />

              <div className="relative">
                <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#8B7D6B] mb-4">Being honest</p>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-snug">
                  We&apos;re not saying this will work.
                  <br />
                  <span className="text-[#8B7D6B] font-medium italic">We&apos;re trying to find out.</span>
                </h2>

                <div className="mt-8 space-y-3 text-left max-w-xs mx-auto">
                  {[
                    'Would you use it?',
                    'Would you buy it?',
                    'Would you send it to a friend?',
                    'What would make you trust it?',
                  ].map((q, i) => (
                    <FadeIn key={i} delay={i * 0.06}>
                      <p className="text-[15px] text-[#2D1F14]/70 flex items-center gap-3">
                        <span className="w-1 h-1 rounded-full bg-[#C9503E] shrink-0" />
                        {q}
                      </p>
                    </FadeIn>
                  ))}
                </div>

                <p className="mt-8 text-sm text-[#8B7D6B]/60 italic">
                  Maybe this becomes something huge. Maybe it doesn&apos;t.
                  <br />
                  We want to find out.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════ VALIDATION CTA ═══════════════ */}
      <section id="validate" className="py-16 md:py-24 px-5">
        <div className="max-w-lg mx-auto">
          <FadeIn>
            <div className="text-center mb-10">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#C9503E] mb-3">
                Your honest opinion is more valuable than a like.
              </p>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                Okay. Would you actually use this?
              </h2>
            </div>
          </FadeIn>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Response choices */}
                <div className="space-y-3 mb-8">
                  {[
                    { emoji: '❤️', label: 'YES, I\'D TRY IT', value: 'yes' },
                    { emoji: '🤔', label: 'MAYBE — TELL ME MORE', value: 'maybe' },
                    { emoji: '😐', label: 'I DON\'T GET IT YET', value: 'dontget' },
                    { emoji: '❌', label: 'NOT FOR ME', value: 'no' },
                  ].map((opt) => (
                    <ValidationResponse
                      key={opt.value}
                      emoji={opt.emoji}
                      label={opt.label}
                      color="#2D1F14"
                      selected={selectedResponse === opt.value}
                      onClick={() => setSelectedResponse(opt.value)}
                    />
                  ))}
                </div>

                {/* Optional feedback */}
                <FadeIn delay={0.2}>
                  <div className="bg-white rounded-2xl p-6 border border-[#2D1F14]/[0.04] shadow-[0_1px_8px_rgba(45,31,20,0.03)] mb-4">
                    <label className="block text-sm font-semibold text-[#2D1F14] mb-2">
                      What would make you use it?
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3.5 text-sm text-[#8B7D6B] italic">I&apos;d use it if...</span>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder=""
                        rows={3}
                        className="w-full bg-[#FFF9F5] rounded-xl border border-[#2D1F14]/[0.06] px-3.5 pt-8 pb-3 text-sm text-[#2D1F14] placeholder:text-transparent focus:outline-none focus:border-[#2D1F14]/15 focus:ring-1 focus:ring-[#2D1F14]/[0.06] resize-none transition-all"
                      />
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={!feedbackText.trim() && !selectedResponse}
                      className="mt-3 w-full bg-[#2D1F14] text-[#FFF9F5] font-semibold text-sm py-3 rounded-xl hover:bg-[#3D2F24] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      Send feedback
                    </button>
                  </div>
                </FadeIn>

                {/* Join conversation */}
                <FadeIn delay={0.3}>
                  <div className="bg-white rounded-2xl p-6 border border-[#2D1F14]/[0.04] shadow-[0_1px_8px_rgba(45,31,20,0.03)]">
                    <p className="text-sm font-semibold text-[#2D1F14] mb-1">Join the early conversation</p>
                    <p className="text-xs text-[#8B7D6B] mb-4">Be the first to know if this becomes real.</p>

                    <div className="space-y-3">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full bg-[#FFF9F5] rounded-xl border border-[#2D1F14]/[0.06] px-4 py-3 text-sm text-[#2D1F14] placeholder:text-[#8B7D6B]/50 focus:outline-none focus:border-[#2D1F14]/15 focus:ring-1 focus:ring-[#2D1F14]/[0.06] transition-all"
                      />
                      <input
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="Email or WhatsApp number"
                        className="w-full bg-[#FFF9F5] rounded-xl border border-[#2D1F14]/[0.06] px-4 py-3 text-sm text-[#2D1F14] placeholder:text-[#8B7D6B]/50 focus:outline-none focus:border-[#2D1F14]/15 focus:ring-1 focus:ring-[#2D1F14]/[0.06] transition-all"
                      />
                      <button
                        onClick={handleInterest}
                        disabled={!name.trim() || !contact.trim()}
                        className="w-full bg-[#C9503E] text-white font-semibold text-sm py-3 rounded-xl hover:bg-[#B5432E] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        I&apos;m interested
                      </button>
                    </div>
                  </div>
                </FadeIn>
              </motion.div>
            ) : (
              <motion.div
                key="thanks"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-center py-12"
              >
                <motion.span
                  className="text-5xl block mb-5"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  🌸
                </motion.span>
                <h3 className="text-2xl font-black tracking-tight">Thank you.</h3>
                <p className="mt-3 text-[#8B7D6B] text-sm max-w-xs mx-auto leading-relaxed">
                  Your response means a lot. We&apos;re reading every single one.
                  <br />
                  <span className="text-xs text-[#8B7D6B]/60 mt-2 block">
                    This idea only works if real people want it.
                  </span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-[#2D1F14]/[0.04] px-5 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <NovacoinLogo size="sm" />
            <span className="text-[10px] text-[#8B7D6B]/40">·</span>
            <span className="text-[10px] text-[#8B7D6B]/40">Concept prototype</span>
          </div>
          <p className="text-[10px] text-[#8B7D6B]/30 text-center">
            Not a financial product. Not investment advice. Just an idea being explored.
          </p>
        </div>
      </footer>
    </div>
  );
}