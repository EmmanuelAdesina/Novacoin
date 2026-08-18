'use client';

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════
   CONSTANTS & HELPERS
   ═══════════════════════════════════════════════════════════ */

const PAGE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://novacoin.zevcloud.app';
const COLORS = { terra: '#C9503E', sand: '#D4A574', sage: '#7C9082', lavender: '#9B8EC4', gold: '#C4A35A' };
const USERS = [
  { name: 'Amaka', color: '#9B8EC4', init: 'A' },
  { name: 'Daniel', color: '#7C9082', init: 'D' },
  { name: 'Tobi', color: '#C9503E', init: 'T' },
  { name: 'Zainab', color: '#C4A35A', init: 'Z' },
  { name: 'Chidi', color: '#D4A574', init: 'C' },
];

const ease = [0.22, 1, 0.36, 1];

function scrollTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }

/* ═══════════════════════════════════════════════════════════
   ANIMATED NUMBER
   ═══════════════════════════════════════════════════════════ */
function AnimNum({ value, className = '' }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const end = value;
    prev.current = end;
    if (start === end) return;
    const dur = 600;
    const t0 = performance.now();
    function tick(now: number) {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + (end - start) * e));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value]);
  return <span ref={ref} className={className}>{display.toLocaleString()}</span>;
}

/* ═══════════════════════════════════════════════════════════
   SECTION REVEAL (scroll-triggered)
   ═══════════════════════════════════════════════════════════ */
function Reveal({ children, delay = 0, className = '', direction = 'up' }: {
  children: React.ReactNode; delay?: number; className?: string; direction?: 'up' | 'left' | 'right' | 'scale';
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const initial = direction === 'left' ? { opacity: 0, x: -40 } : direction === 'right' ? { opacity: 0, x: 40 } : direction === 'scale' ? { opacity: 0, scale: 0.85 } : { opacity: 0, y: 30 };
  return (
    <motion.div ref={ref} initial={initial} animate={inView ? { opacity: 1, x: 0, y: 0, scale: 1 } : {}} transition={{ duration: 0.65, delay, ease }} className={className}>
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NOVACOIN LOGO
   ═══════════════════════════════════════════════════════════ */
function NovacoinLogo({ size = 'md' }: { size?: 'md' | 'sm' }) {
  const s = size === 'md' ? 32 : 22;
  return (
    <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <defs><linearGradient id="nc-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#C9503E" /><stop offset="0.5" stopColor="#D4A574" /><stop offset="1" stopColor="#C4A35A" /></linearGradient></defs>
        <rect width="32" height="32" rx="10" fill="url(#nc-g)" />
        <path d="M10 22V10L22 22V10" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <span className={`${size === 'md' ? 'text-sm font-bold' : 'text-xs font-bold'} tracking-tight text-[#2D1F14]`}>{'Nova'}<span className="font-medium text-[#2D1F14]/50">coin</span></span>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SOFT BUTTON
   ═══════════════════════════════════════════════════════════ */
function SoftButton({ children, onClick, variant = 'primary', className = '' }: {
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary'; className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 cursor-pointer select-none';
  const styles = variant === 'primary'
    ? 'bg-[#2D1F14] text-[#FFF9F5] px-7 py-3.5 text-sm hover:bg-[#3D2F24] shadow-sm hover:shadow-md'
    : 'bg-transparent text-[#2D1F14] px-7 py-3.5 text-sm border border-[#2D1F14]/12 hover:border-[#2D1F14]/25 hover:bg-[#2D1F14]/[0.03]';
  return (
    <motion.button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} whileTap={{ scale: 0.96 }} className={`${base} ${styles} ${className}`}>
      {children}
      <motion.span animate={{ x: hovered ? 3 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>→</motion.span>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════
   SELECT CARD (for feedback)
   ═══════════════════════════════════════════════════════════ */
function SelectCard({ label, sub, emoji, selected, onClick, multi = false }: {
  label: string; sub?: string; emoji?: string; selected: boolean; onClick: () => void; multi?: boolean;
}) {
  return (
    <motion.button onClick={onClick} whileHover={{ scale: 1.015, y: -1 }} whileTap={{ scale: 0.985 }}
      className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
        selected ? 'border-[#2D1F14] bg-[#2D1F14]/[0.03] shadow-md' : 'border-[#2D1F14]/[0.06] bg-white hover:border-[#2D1F14]/15 hover:shadow-sm'
      }`}>
      <div className="flex items-center gap-3">
        {emoji && <motion.span className="text-xl" animate={selected ? { scale: [1, 1.25, 1] } : {}} transition={{ duration: 0.3 }}>{emoji}</motion.span>}
        <div className="flex-1 min-w-0">
          <span className={`font-semibold text-sm block ${selected ? 'text-[#2D1F14]' : 'text-[#2D1F14]/70'}`}>{label}</span>
          {sub && <span className="text-xs text-[#8B7D6B] mt-0.5 block">{sub}</span>}
        </div>
        {selected && !multi && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-[#2D1F14] flex items-center justify-center shrink-0">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </motion.span>
        )}
        {multi && (
          <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${selected ? 'border-[#2D1F14] bg-[#2D1F14]' : 'border-[#2D1F14]/20 bg-white'}`}>
            {selected && <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></motion.svg>}
          </span>
        )}
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO: LIVING NETWORK WITH TRAVELING TRANSACTION
   ═══════════════════════════════════════════════════════════ */
function LivingHeroNetwork() {
  const [txIndex, setTxIndex] = useState(0);
  const [txActive, setTxActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const positions = [
    { x: 50, y: 15 },
    { x: 15, y: 55 },
    { x: 85, y: 45 },
    { x: 30, y: 85 },
    { x: 70, y: 80 },
  ];

  const transactions = [
    { from: 0, to: 1 },
    { from: 1, to: 3 },
    { from: 3, to: 4 },
    { from: 4, to: 2 },
    { from: 2, to: 0 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTxActive(true);
      setTimeout(() => {
        setTxIndex((p) => (p + 1) % transactions.length);
        setTxActive(false);
      }, 1200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const tx = transactions[txIndex];
  const fromPos = positions[tx.from];
  const toPos = positions[tx.to];
  const connections: [number, number][] = [[0,1],[0,2],[0,3],[1,3],[1,4],[2,4],[3,4],[2,3]];
  const svgLines = connections.map(([a, b]) => {
    const pa = positions[a]; const pb = positions[b];
    return `<line x1="${pa.x}" y1="${pa.y}" x2="${pb.x}" y2="${pb.y}" stroke="#2D1F14" stroke-width="0.3" stroke-opacity="0.08"/>`;
  }).join('');

  return (
    <div ref={containerRef} className="relative w-full max-w-sm mx-auto mt-8 md:mt-12 mb-2" style={{ aspectRatio: '4/3.5' }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" dangerouslySetInnerHTML={{ __html: svgLines }} />

      <AnimatePresence>
        {txActive && (
          <motion.div
            key={txIndex}
            initial={{ left: `${fromPos.x}%`, top: `${fromPos.y}%`, scale: 0.5, opacity: 0 }}
            animate={{ left: `${toPos.x}%`, top: `${toPos.y}%`, scale: [0.5, 1.3, 1, 0.6], opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #C9503E, #D4A574)', boxShadow: '0 4px 20px rgba(201,80,62,0.4)' }}>
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none"><path d="M10 22V10L22 22V10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {USERS.map((user, i) => {
        const pos = positions[i];
        const isSender = tx.from === i && txActive;
        const isReceiver = tx.to === i && txActive;
        return (
          <motion.div
            key={user.name}
            className="absolute z-10 flex flex-col items-center gap-1.5"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: isSender ? 1.15 : isReceiver ? [1, 1.2, 1] : 1,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 + i * 0.12 }}
          >
            <AnimatePresence>
              {isReceiver && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0.8 }}
                  animate={{ scale: 2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute -top-1 w-10 h-10 rounded-full border-2"
                  style={{ borderColor: user.color }}
                />
              )}
            </AnimatePresence>
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold relative"
              style={{ background: `linear-gradient(135deg, ${user.color}, ${user.color}dd)`, boxShadow: isSender ? `0 0 20px ${user.color}60` : `0 2px 8px ${user.color}30` }}>
              {user.init}
              {isSender && (
                <motion.div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C9503E] flex items-center justify-center"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
                  <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                </motion.div>
              )}
            </div>
            <span className="text-[9px] md:text-[10px] font-semibold text-[#2D1F14]/60">@{user.name.toLowerCase()}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
/* ═══════════════════════════════════════════════════════════
   INTERACTIVE "TRY IT" DEMO
   ═══════════════════════════════════════════════════════════ */
function TryItDemo() {
  const [phase, setPhase] = useState(0);
  // 0: enter amount, 1: got coin, 2: send to, 3: sent!, 4: idle

  const [amount, setAmount] = useState('');
  const [sendingName, setSendingName] = useState('');
  const [coinVisible, setCoinVisible] = useState(false);
  const [sentDone, setSentDone] = useState(false);

  const handleGetCoin = () => {
    if (!amount) return;
    setCoinVisible(true);
    setPhase(1);
  };

  const handleSend = () => {
    if (!sendingName) return;
    setPhase(2);
    setTimeout(() => { setSentDone(true); setPhase(3); }, 1500);
  };

  const handleReset = () => {
    setPhase(0); setAmount(''); setSendingName(''); setCoinVisible(false); setSentDone(false);
  };

  return (
    <div className="max-w-sm mx-auto">
      <div className="bg-white rounded-3xl border border-[#2D1F14]/[0.06] shadow-[0_4px_30px_rgba(45,31,20,0.06)] overflow-hidden">
        {/* Header bar */}
        <div className="bg-[#FFF9F5] px-5 py-2.5 flex items-center justify-between border-b border-[#2D1F14]/[0.04]">
          <span className="text-[10px] font-semibold text-[#8B7D6B] tracking-wide uppercase">NovaCoin</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C9082]" style={{ animation: 'pulse-soft 2s infinite' }}></span>
            <span className="text-[9px] text-[#7C9082] font-medium">Live demo</span>
          </div>
        </div>

        <div className="p-6 min-h-[220px] flex flex-col">
          <AnimatePresence mode="wait">
            {/* Phase 0: Enter amount */}
            {phase === 0 && (
              <motion.div key="p0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35, ease }}>
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#C9503E] mb-4">Try it yourself</p>
                <p className="text-lg font-black text-[#2D1F14] mb-1">How much naira?</p>
                <p className="text-xs text-[#8B7D6B] mb-5">Enter any amount. This is just a demo.</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[#8B7D6B]">₦</span>
                  <input
                    type="text" inputMode="numeric" value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="100" autoFocus
                    className="w-full bg-[#FFF9F5] rounded-2xl border-2 border-[#2D1F14]/[0.06] pl-9 pr-4 py-4 text-xl font-black text-[#2D1F14] placeholder:text-[#8B7D6B]/30 focus:outline-none focus:border-[#C9503E]/30 focus:ring-2 focus:ring-[#C9503E]/10 transition-all"
                  />
                </div>
                <motion.button
                  onClick={handleGetCoin} disabled={!amount}
                  whileTap={{ scale: 0.96 }}
                  className="mt-4 w-full bg-[#2D1F14] text-[#FFF9F5] font-bold text-sm py-4 rounded-2xl hover:bg-[#3D2F24] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  GET 1 NOVACOIN
                </motion.button>
              </motion.div>
            )}

            {/* Phase 1: Got the coin! */}
            {phase === 1 && (
              <motion.div key="p1" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4, ease }} className="text-center py-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                  className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #C9503E, #D4A574)', boxShadow: '0 8px 30px rgba(201,80,62,0.3)' }}
                >
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M10 22V10L22 22V10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                </motion.div>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-sm font-medium text-[#8B7D6B] mb-1">₦{parseInt(amount || '0').toLocaleString()}</motion.p>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-2xl font-black text-[#2D1F14]">1 NovaCoin</motion.p>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-4">
                  <p className="text-xs text-[#8B7D6B] mb-3">Now send it to someone.</p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#8B7D6B]">@</span>
                    <input
                      type="text" value={sendingName}
                      onChange={(e) => setSendingName(e.target.value)}
                      placeholder="Daniel" autoFocus
                      className="w-full bg-[#FFF9F5] rounded-xl border-2 border-[#2D1F14]/[0.06] pl-8 pr-4 py-3 text-sm font-semibold text-[#2D1F14] placeholder:text-[#8B7D6B]/40 focus:outline-none focus:border-[#9B8EC4]/30 focus:ring-2 focus:ring-[#9B8EC4]/10 transition-all"
                    />
                  </div>
                  <motion.button
                    onClick={handleSend} disabled={!sendingName}
                    whileTap={{ scale: 0.96 }}
                    className="mt-3 w-full bg-[#9B8EC4] text-white font-bold text-sm py-3.5 rounded-xl hover:bg-[#8A7DB5] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    SEND 1 NOVACOIN
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* Phase 2: Sending animation */}
            {phase === 2 && (
              <motion.div key="p2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center py-8">
                <div className="flex items-center gap-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9503E] to-[#D4A574] flex items-center justify-center text-white text-xs font-bold">You</div>
                  <div className="relative w-20 h-1 bg-[#2D1F14]/[0.06] rounded-full overflow-hidden">
                    <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: 'linear-gradient(90deg, #C9503E, #D4A574)' }}
                      initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 1.2, ease }} />
                    <motion.div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
                      style={{ background: 'linear-gradient(135deg, #C9503E, #D4A574)', boxShadow: '0 2px 8px rgba(201,80,62,0.4)' }}
                      initial={{ left: '0%' }} animate={{ left: '100%' }} transition={{ duration: 1.2, ease }} />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C9082] to-[#5A6F5E] flex items-center justify-center text-white text-xs font-bold">{sendingName[0]?.toUpperCase() || '?'}</div>
                </div>
                <p className="mt-4 text-xs text-[#8B7D6B]">Sending...</p>
              </motion.div>
            )}

            {/* Phase 3: Sent! */}
            {phase === 3 && (
              <motion.div key="p3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4, ease }} className="text-center py-6">
                {/* Celebration burst */}
                <motion.div className="relative inline-block">
                  {[...Array(6)].map((_, i) => (
                    <motion.div key={i} className="absolute w-2 h-2 rounded-full top-1/2 left-1/2"
                      style={{ background: [COLORS.terra, COLORS.gold, COLORS.sage, COLORS.lavender, COLORS.sand, COLORS.terra][i] }}
                      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                      animate={{ x: (Math.cos(i * 60 * Math.PI / 180)) * 40, y: (Math.sin(i * 60 * Math.PI / 180)) * 40, scale: 0, opacity: 0 }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                    />
                  ))}
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-[#7C9082]/10">
                    <span className="text-3xl">✨</span>
                  </motion.div>
                </motion.div>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="text-sm font-medium text-[#7C9082]">Sent!</motion.p>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="text-lg font-black text-[#2D1F14]">@{sendingName.toLowerCase()} received 1 NovaCoin</motion.p>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                  className="text-xs text-[#8B7D6B] mt-1">No real money moved. This was just a demo.</motion.p>
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                  onClick={handleReset} whileTap={{ scale: 0.96 }}
                  className="mt-5 text-xs font-semibold text-[#9B8EC4] hover:text-[#8A7DB5] cursor-pointer transition-colors">Try again →</motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENHANCED NETWORK VISUALIZATION
   ═══════════════════════════════════════════════════════════ */
function EnhancedNetwork() {
  const [sliderVal, setSliderVal] = useState(0);
  const stages = [
    { label: '10 people', count: 10, color: '#C9503E', connections: 8, communities: 1 },
    { label: '100 people', count: 100, color: '#D4A574', connections: 40, communities: 2 },
    { label: '1,000 people', count: 1000, color: '#7C9082', connections: 80, communities: 5 },
    { label: '10,000 people', count: 10000, color: '#9B8EC4', connections: 120, communities: 12 },
    { label: '100,000 people', count: 100000, color: '#C4A35A', connections: 180, communities: 30 },
    { label: '1,000,000 people', count: 1000000, color: '#C9503E', connections: 250, communities: 80 },
  ];
  const stage = stages[sliderVal];
  const nodeCount = Math.min(stage.count, 30);
  const connCount = Math.min(stage.connections, 40);

  const nodes = useRef<{ x: number; y: number; c: number }[]>([]);
  if (nodes.current.length !== nodeCount || nodes.current[0]?.c !== nodeCount) {
    nodes.current = Array.from({ length: nodeCount }, (_, i) => ({
      x: 8 + (Math.sin(i * 2.39996) * 0.5 + 0.5) * 284,
      y: 5 + (Math.cos(i * 3.72471) * 0.5 + 0.5) * 120,
      c: nodeCount,
    }));
  }

  return (
    <div className="space-y-6">
      <div className="relative bg-white rounded-2xl border border-[#2D1F14]/[0.04] shadow-[0_2px_20px_rgba(45,31,20,0.04)] p-4 overflow-hidden">
        <svg viewBox="0 0 300 130" className="w-full h-auto" style={{ minHeight: 100 }}>
          {Array.from({ length: connCount }).map((_, i) => {
            const a = i % nodeCount; const b = (i * 7 + 3) % nodeCount;
            if (a === b) return null;
            return (
              <motion.line key={`c-${sliderVal}-${i}`} x1={nodes.current[a]?.x || 0} y1={nodes.current[a]?.y || 0}
                x2={nodes.current[b]?.x || 0} y2={nodes.current[b]?.y || 0}
                stroke={stage.color} strokeOpacity={0.06 + sliderVal * 0.025} strokeWidth="0.8"
                initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.008 }}
              />
            );
          })}
          {nodes.current.map((pos, i) => (
            <motion.circle key={`n-${sliderVal}-${i}`} cx={pos.x} cy={pos.y}
              r={i === 0 ? 4 : 2 + sliderVal * 0.15}
              fill={stage.color}
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.5 + Math.random() * 0.5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: i * 0.015 }}
            />
          ))}
          {stage.count > nodeCount && (
            <motion.text key={`plus-${sliderVal}`} x={285} y={65} fill={stage.color} fontSize="11" fontWeight="600" opacity="0.4" textAnchor="end"
              initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>+{(stage.count - nodeCount).toLocaleString()}</motion.text>
          )}
        </svg>
        <motion.div key={stage.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-1">
          <span className="text-2xl font-black" style={{ color: stage.color }}><AnimNum value={stage.count} /></span>
          <span className="text-sm text-[#8B7D6B] ml-1">people</span>
          {stage.communities > 1 && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="ml-3 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${stage.color}12`, color: stage.color }}>
              {stage.communities} communities
            </motion.span>
          )}
        </motion.div>
      </div>
      <div className="px-2">
        <input type="range" min="0" max="5" step="1" value={sliderVal}
          onChange={(e) => setSliderVal(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#C9503E]"
          style={{ background: `linear-gradient(to right, ${stage.color} ${(sliderVal / 5) * 100}%, rgba(45,31,20,0.08) ${(sliderVal / 5) * 100}%)` }}
        />
        <div className="flex justify-between mt-1.5 text-[10px] text-[#8B7D6B]/40">
          <span>10</span><span>1M</span>
        </div>
      </div>
      <Reveal delay={0.2}>
        <p className="text-center text-sm text-[#2D1F14]/60 font-medium">
          More people <span style={{ color: stage.color }}>→</span> more connections <span style={{ color: stage.color }}>→</span> more places to use it.
        </p>
        <p className="text-center text-[10px] text-[#8B7D6B]/40 mt-1 italic">That's the idea.</p>
      </Reveal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MORPHING TYPOGRAPHY: BUY → HOLD → SEND → USE
   ═══════════════════════════════════════════════════════════ */
function MorphingWords() {
  const words = ['BUY', 'HOLD', 'SEND', 'USE'];
  const colors = [COLORS.terra, COLORS.sage, COLORS.lavender, COLORS.gold];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setIdx((p) => (p + 1) % words.length), 2000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="h-16 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span key={words[idx]}
          initial={{ opacity: 0, y: 30, rotateX: -40, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -30, rotateX: 40, filter: 'blur(6px)' }}
          transition={{ duration: 0.45, ease }}
          className="text-5xl md:text-6xl font-black tracking-tight"
          style={{ color: colors[idx] }}
        >{words[idx]}</motion.span>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   JUDGEMENT WALL
   ═══════════════════════════════════════════════════════════ */
function JudgementWall() {
  const opinions = [
    { emoji: '❤️', verdict: 'Would try it', quote: 'If everyone around me used it, I definitely would.', color: COLORS.terra },
    { emoji: '🤔', verdict: 'Not convinced', quote: "Why wouldn't I just use my bank?", color: COLORS.sand },
    { emoji: '🔥', verdict: 'Interesting', quote: 'The network idea is what makes this different.', color: COLORS.gold },
    { emoji: '😂', verdict: 'Honest take', quote: 'This could either be genius or madness.', color: COLORS.lavender },
    { emoji: '💡', verdict: 'I see it', quote: 'If I can pay at the cafeteria with it, yes.', color: COLORS.sage },
    { emoji: ' skeptical', verdict: 'Show me first', quote: "I'll believe it when I see it working.", color: COLORS.terra },
  ];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setActive((p) => (p + 1) % opinions.length), 4000);
    return () => clearInterval(iv);
  }, []);
  const op = opinions[active];
  return (
    <div className="max-w-md mx-auto">
      <Reveal>
        <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#8B7D6B] mb-6 text-center">The internet is judging us</p>
      </Reveal>
      <div className="relative h-[140px]">
        <AnimatePresence mode="wait">
          <motion.div key={active}
            initial={{ x: 80, opacity: 0, rotate: 2 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            exit={{ x: -80, opacity: 0, rotate: -2 }}
            transition={{ duration: 0.5, ease }}
            className="absolute inset-0 bg-white rounded-2xl p-6 border border-[#2D1F14]/[0.04] shadow-[0_2px_20px_rgba(45,31,20,0.04)] flex flex-col justify-center"
            style={{ borderLeft: `3px solid ${op.color}` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">{op.verdict.includes('skeptical') ? '🤨' : op.emoji}</span>
              <span className="text-[10px] font-bold tracking-[0.1em] uppercase" style={{ color: op.color }}>{op.verdict}</span>
            </div>
            <p className="text-sm font-medium text-[#2D1F14]/80 leading-relaxed italic">&ldquo;{op.quote}&rdquo;</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex justify-center gap-1.5 mt-4">
        {opinions.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === active ? 'bg-[#2D1F14] w-5' : 'bg-[#2D1F14]/15'}`} />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   VERDICT CARD (after feedback)
   ═══════════════════════════════════════════════════════════ */
function VerdictCard({ verdict, onShare }: { verdict: string; onShare: () => void }) {
  const verdictMap: Record<string, { emoji: string; label: string; color: string }> = {
    yes: { emoji: '❤️', label: 'Would try it', color: COLORS.terra },
    maybe: { emoji: '🤔', label: 'Not convinced yet', color: COLORS.gold },
    no: { emoji: '❌', label: "Doesn't see the point", color: '#8B7D6B' },
  };
  const v = verdictMap[verdict] || verdictMap.maybe;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-white rounded-3xl p-8 border border-[#2D1F14]/[0.06] shadow-[0_8px_40px_rgba(45,31,20,0.08)] text-center overflow-hidden"
    >
      {/* Shine effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-full w-1/2 h-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', animation: 'shimmer 2s ease-in-out 0.5s 1' }} />
      </div>
      <div className="relative">
        <motion.span className="text-5xl block mb-3" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}>{v.emoji}</motion.span>
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: v.color }}>Your verdict</p>
        <p className="text-2xl font-black text-[#2D1F14] mb-4">{v.label}</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: `${v.color}10` }}>
          <NovacoinLogo size="sm" />
          <span className="text-[10px] font-semibold text-[#2D1F14]/50">NovaCoin Concept</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP DOTS
   ═══════════════════════════════════════════════════════════ */
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div key={i} className={`rounded-full transition-all duration-300 ${i === current ? 'bg-[#2D1F14] w-6 h-2' : i < current ? 'bg-[#2D1F14]/30 w-2 h-2' : 'bg-[#2D1F14]/10 w-2 h-2'}`} layout />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCROLL PROGRESS BAR
   ═══════════════════════════════════════════════════════════ */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <motion.div className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left" style={{ scaleX, background: `linear-gradient(90deg, ${COLORS.terra}, ${COLORS.gold})` }} />
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */

export default function Page() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 350], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 350], [1, 0.97]);

  /* Feedback state */
  const [step, setStep] = useState(0);
  const [q1, setQ1] = useState<string | null>(null);
  const [q2, setQ2] = useState<string[]>([]);
  const [q3, setQ3] = useState<string | null>(null);
  const [q4, setQ4] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const submitFeedback = async () => {
    if (submitting) return;
    setSubmitting(true);
    try { await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'feedback', q1_what_is_it: q1, q2_use_cases: q2, q3_why_not: q3, q4_would_try: q4, open_feedback: feedbackText }) }); } catch {}
    setSubmitting(false); setSubmitted(true); setStep(5);
  };

  const submitInterest = async () => {
    if (submitting || !name.trim() || !contact.trim()) return;
    setSubmitting(true);
    try { await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'interest', name: name.trim(), contact: contact.trim() }) }); } catch {}
    setSubmitting(false); setStep(6);
  };

  const toggleMulti = (v: string) => setQ2((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : PAGE_URL;
  const copyLink = () => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const nav = (id: string) => { scrollTo(id); setMobileMenu(false); };

  return (
    <div className="min-h-screen bg-[#FFF9F5] text-[#2D1F14]">
      <ScrollProgress />

      {/* ═══ NAV ═══ */}
      <motion.nav initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className="fixed top-[2px] left-0 right-0 z-50 bg-[#FFF9F5]/80 backdrop-blur-xl border-b border-[#2D1F14]/[0.04]">
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between">
          <NovacoinLogo />
          <div className="hidden md:flex items-center gap-6 text-xs text-[#8B7D6B]">
            <button onClick={() => nav('try-it')} className="hover:text-[#2D1F14] transition-colors cursor-pointer">Try it</button>
            <button onClick={() => nav('the-idea')} className="hover:text-[#2D1F14] transition-colors cursor-pointer">The idea</button>
          </div>
          <motion.button onClick={() => nav('validate')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="text-xs font-semibold bg-[#2D1F14] text-[#FFF9F5] px-4 py-2 rounded-full hover:bg-[#3D2F24] transition-colors cursor-pointer">Give feedback</motion.button>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden ml-3 p-2 cursor-pointer" aria-label="Menu">
            <div className="w-4 flex flex-col gap-1">
              <span className={`block h-px bg-[#2D1F14] transition-all duration-300 ${mobileMenu ? 'rotate-45 translate-y-[3px]' : ''}`} />
              <span className={`block h-px bg-[#2D1F14] transition-all duration-300 ${mobileMenu ? '-rotate-45 -translate-y-[3px]' : ''}`} />
            </div>
          </button>
        </div>
        <AnimatePresence>{mobileMenu && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden overflow-hidden border-t border-[#2D1F14]/[0.04] bg-[#FFF9F5]/95 backdrop-blur-xl">
            <div className="px-5 py-4 space-y-3">
              <button onClick={() => nav('try-it')} className="block text-sm text-[#8B7D6B] hover:text-[#2D1F14] cursor-pointer">Try it</button>
              <button onClick={() => nav('the-idea')} className="block text-sm text-[#8B7D6B] hover:text-[#2D1F14] cursor-pointer">The idea</button>
              <button onClick={() => nav('validate')} className="block text-sm font-semibold text-[#C9503E] cursor-pointer">Give feedback</button>
            </div>
          </motion.div>
        )}</AnimatePresence>
      </motion.nav>

      {/* ═══════════════════════════════════════════════════════════════
         HERO: LIVING NETWORK
         ═══════════════════════════════════════════════════════════════ */}
      <motion.section style={{ opacity: heroOpacity, scale: heroScale }} className="relative pt-28 pb-8 md:pt-36 md:pb-16 px-5 overflow-hidden">
        {/* Ambient gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-25 pointer-events-none" style={{ background: 'radial-gradient(circle at 70% 20%, rgba(201,80,62,0.1) 0%, transparent 60%)', animation: 'blob 12s ease-in-out infinite' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle at 30% 80%, rgba(124,144,130,0.15) 0%, transparent 60%)', animation: 'blob 14s ease-in-out infinite 3s' }} />

        <div className="relative max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <span className="inline-flex items-center gap-2 bg-[#2D1F14]/[0.04] text-[#8B7D6B] text-[11px] font-medium px-4 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9503E]" style={{ animation: 'pulse-soft 2s infinite' }} />
              {"We're exploring an idea"}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25, ease }}
            className="mt-6 text-[clamp(2rem,6vw,3.4rem)] font-black leading-[1.06] tracking-tight text-[#2D1F14]">
            What if digital money
            <br />
            <span className="italic font-medium" style={{ color: '#C9503E' }}>felt this easy?</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-5 text-[#8B7D6B] text-base md:text-lg max-w-md mx-auto leading-relaxed">
            {"We're exploring a simple digital asset. Buy, hold, send, receive. Starting with everyday Nigerians."}
          </motion.p>

          <LivingHeroNetwork />

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <SoftButton onClick={() => nav('try-it')}>Try it yourself</SoftButton>
            <SoftButton variant="secondary" onClick={() => nav('validate')}>Skip to feedback</SoftButton>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════
         SOCIAL COIN CONCEPT
         ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-5">
        <div className="max-w-3xl mx-auto">
          <Reveal>
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
          </Reveal>
          <Reveal delay={0.15}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              {/* Message side */}
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
              {/* NovaCoin side */}
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
            </div>
            <div className="mt-8 text-center">
              <p className="text-[#2D1F14]/15 text-3xl font-black leading-none select-none" style={{ fontFamily: 'Georgia, serif' }}>&ldquo;</p>
              <p className="text-lg md:text-xl font-black text-[#2D1F14] -mt-3 leading-snug">
                Same energy.<br /><span className="italic font-medium" style={{ color: '#C9503E' }}>Different value.</span>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         MORPHING WORDS + WHAT IS THIS
         ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-5">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="text-center mb-6">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#C9503E] mb-3">How it works</p>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                So... what exactly is NovaCoin?
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <MorphingWords />
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-center text-[#8B7D6B] text-sm max-w-sm mx-auto leading-relaxed mt-4">
              {"It's an idea for a digital asset that people could buy with naira, keep, send to other people, receive from others, and eventually use across a growing network."}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         TRY IT: INTERACTIVE DEMO
         ═══════════════════════════════════════════════════════════════ */}
      <section id="try-it" className="py-16 md:py-24 px-5">
        <div className="max-w-lg mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#7C9082] mb-3">Don't just read about it</p>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Try it.</h2>
              <p className="mt-3 text-[#8B7D6B] text-sm max-w-xs mx-auto">No real money. No sign-up. Just a feel for how it could work.</p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <TryItDemo />
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         WHY NOT BANK TRANSFER?
         ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 px-5">
        <div className="max-w-2xl mx-auto">
          <Reveal>
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
                  <p className="text-sm text-[#8B7D6B]/60 italic">{'We don\'t know the answer yet. That\'s why we need your honest feedback.'}</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         ONE IMPORTANT THING
         ═══════════════════════════════════════════════════════════════ */}
      <section className="py-10 md:py-14 px-5">
        <div className="max-w-md mx-auto">
          <Reveal>
            <div className="flex items-start gap-3 bg-[#C9503E]/[0.04] rounded-2xl p-5 border border-[#C9503E]/10">
              <span className="text-lg mt-0.5">⚡</span>
              <div>
                <p className="text-sm font-bold text-[#2D1F14] mb-1">One important thing</p>
                <p className="text-[13px] text-[#2D1F14]/60 leading-relaxed">{"This isn't being presented as a guaranteed investment or a way to make money. We're exploring whether a digital asset can become useful because lots of people use it."}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         THE BIGGER IDEA (NETWORK)
         ═══════════════════════════════════════════════════════════════ */}
      <section id="the-idea" className="py-16 md:py-24 px-5">
        <div className="max-w-lg mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#9B8EC4] mb-3">The idea</p>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                The more people who use it,
                <br />
                <span className="italic font-medium">the more people you can use it with.</span>
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <EnhancedNetwork />
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         STARTING SMALL
         ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#D4A574] mb-3">Ground zero</p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Maybe it starts with one university.</h2>
            <p className="mt-4 text-[#8B7D6B] max-w-md mx-auto text-[15px] leading-relaxed">A few students. Then a few communities. Then thousands of people. We want to see what happens.</p>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-lg mx-auto">
            {[
              { num: 3000, label: 'students', emoji: '📚' },
              { num: 20, label: 'communities', emoji: '🌍' },
              { num: 10, label: 'creators', emoji: '🎨' },
              { num: 10, label: 'local businesses', emoji: '🏪' },
            ].map((item, i) => (
              <Reveal key={i} delay={0.1 + i * 0.08}>
                <motion.div whileHover={{ y: -4, shadow: '0 8px 30px rgba(45,31,20,0.1)' }} className="bg-white rounded-2xl px-4 py-4 border border-[#2D1F14]/[0.04] shadow-[0_1px_8px_rgba(45,31,20,0.03)] cursor-default">
                  <span className="text-lg block mb-1" style={{ animation: `float ${3.5 + i * 0.3}s ease-in-out infinite ${i * 0.3}s` }}>{item.emoji}</span>
                  <p className="text-lg font-black text-[#2D1F14]"><AnimNum value={item.num} /></p>
                  <p className="text-[10px] text-[#8B7D6B] uppercase tracking-wide">{item.label}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.4}>
            <p className="mt-3 text-[10px] text-[#8B7D6B]/40 italic">These are hypothetical examples, not existing traction.</p>
            <p className="mt-8 text-[15px] text-[#2D1F14]/70 max-w-sm mx-auto leading-relaxed">Could something like this grow from a small community into something much bigger?</p>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         JUDGEMENT WALL
         ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-5">
        <JudgementWall />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         VALIDATION: MULTI-STEP FEEDBACK
         ═══════════════════════════════════════════════════════════════ */}
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
                <motion.button onClick={() => setStep(1)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full bg-[#2D1F14] text-[#FFF9F5] font-bold text-sm py-4 rounded-2xl hover:bg-[#3D2F24] transition-all cursor-pointer">{"Let's go"}</motion.button>
              </motion.div>
            )}

            {/* STEP 1: WHAT IS IT */}
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
                    <SelectCard key={opt.value} label={opt.label} selected={q1 === opt.value} onClick={() => { setQ1(opt.value); setTimeout(() => setStep(2), 300); }} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: USE CASES (MULTI) */}
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
                    <SelectCard key={opt.value} label={opt.label} selected={q2.includes(opt.value)} multi onClick={() => toggleMulti(opt.value)} />
                  ))}
                </div>
                <motion.button onClick={() => setStep(3)} whileTap={{ scale: 0.98 }} className="mt-6 w-full bg-[#2D1F14] text-[#FFF9F5] font-semibold text-sm py-3.5 rounded-xl hover:bg-[#3D2F24] transition-all cursor-pointer">Continue</motion.button>
              </motion.div>
            )}

            {/* STEP 3: BIGGEST OBJECTION */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}>
                <StepDots current={2} total={4} />
                <p className="text-xs font-semibold text-[#8B7D6B]/50 mb-1">Question 3 of 4</p>
                <h3 className="text-xl font-black tracking-tight mb-6">What's the biggest reason you might <em>not</em> use it?</h3>
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
                    <SelectCard key={opt.value} label={opt.label} selected={q3 === opt.value} onClick={() => { setQ3(opt.value); setTimeout(() => setStep(4), 300); }} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 4: WOULD YOU TRY? */}
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
                    <motion.div key={opt.value} whileTap={{ scale: 0.98 }}>
                      <SelectCard emoji={opt.emoji} label={opt.label} selected={q4 === opt.value} onClick={() => { setQ4(opt.value); setTimeout(() => setStep(5), 300); }} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 5: VERDICT + OPEN FEEDBACK + SHARE */}
            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                {!submitted ? (
                  <>
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-black tracking-tight">What would make you want to use it?</h3>
                    </div>
                    <motion.div whileHover={{ shadow: '0 4px 20px rgba(45,31,20,0.06)' }} className="bg-white rounded-2xl p-6 border border-[#2D1F14]/[0.04] shadow-[0_1px_12px_rgba(45,31,20,0.04)]">
                      <div className="relative">
                        <span className="absolute left-3.5 top-3.5 text-sm text-[#8B7D6B] italic">{"I'd use it if..."}</span>
                        <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="" rows={4}
                          className="w-full bg-[#FFF9F5] rounded-xl border border-[#2D1F14]/[0.06] px-3.5 pt-8 pb-3 text-sm text-[#2D1F14] placeholder:text-transparent focus:outline-none focus:border-[#2D1F14]/15 focus:ring-1 focus:ring-[#2D1F14]/[0.06] resize-none transition-all" />
                      </div>
                      <p className="text-[10px] text-[#8B7D6B]/40 mt-2 italic">Tell us honestly. No marketing answer needed.</p>
                      <motion.button onClick={submitFeedback} disabled={submitting} whileTap={{ scale: 0.98 }}
                        className="mt-4 w-full bg-[#2D1F14] text-[#FFF9F5] font-bold text-sm py-3.5 rounded-xl hover:bg-[#3D2F24] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                        {submitting ? 'Sending...' : 'Send feedback'}
                      </motion.button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    {/* Verdict card */}
                    <div className="mb-8">
                      <VerdictCard verdict={q4 || 'maybe'} onShare={copyLink} />
                    </div>

                    <div className="text-center">
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-sm text-[#8B7D6B] max-w-xs mx-auto leading-relaxed">
                        This is an experiment. Your answer actually helps us decide whether we should build it.
                      </motion.p>
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-3 text-xs text-[#8B7D6B]/40">{"You're one of the people helping us test the idea."}</motion.p>
                    </div>

                    {/* Share */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
                      className="mt-8 bg-white rounded-2xl p-6 border border-[#2D1F14]/[0.04] shadow-[0_1px_8px_rgba(45,31,20,0.03)]">
                      <p className="text-sm font-semibold text-[#2D1F14] mb-1">Know someone who'd have a strong opinion?</p>
                      <p className="text-xs text-[#8B7D6B] mb-4">Challenge them.</p>
                      <div className="grid grid-cols-4 gap-2">
                        <motion.a href={`https://wa.me/?text=${encodeURIComponent('I just judged this idea - NovaCoin: ' + shareUrl)}`} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[#25D366]/[0.08] hover:bg-[#25D366]/[0.15] transition-colors">
                          <span className="text-lg">💬</span>
                          <span className="text-[10px] font-medium text-[#2D1F14]/60">WhatsApp</span>
                        </motion.a>
                        <motion.button onClick={copyLink} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[#2D1F14]/[0.04] hover:bg-[#2D1F14]/[0.08] transition-colors cursor-pointer">
                          <span className="text-lg">📋</span>
                          <span className="text-[10px] font-medium text-[#2D1F14]/60">{copied ? 'Copied!' : 'Copy'}</span>
                        </motion.button>
                        <motion.a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('I just gave my verdict on this idea - NovaCoin')}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[#1DA1F2]/[0.08] hover:bg-[#1DA1F2]/[0.15] transition-colors">
                          <span className="text-lg">𝕏</span>
                          <span className="text-[10px] font-medium text-[#2D1F14]/60">X</span>
                        </motion.a>
                        <motion.a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out this idea - NovaCoin')}`} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[#0088CC]/[0.08] hover:bg-[#0088CC]/[0.15] transition-colors">
                          <span className="text-lg">✈️</span>
                          <span className="text-[10px] font-medium text-[#2D1F14]/60">Telegram</span>
                        </motion.a>
                      </div>
                    </motion.div>

                    {/* Optional interest */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
                      className="mt-4 bg-white rounded-2xl p-6 border border-[#2D1F14]/[0.04] shadow-[#2D1F14]/[0.04]">
                      <p className="text-sm font-semibold text-[#2D1F14] mb-1">Want to hear what happens next?</p>
                      <p className="text-xs text-[#8B7D6B] mb-4">Completely optional.</p>
                      <div className="space-y-3">
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                          className="w-full bg-[#FFF9F5] rounded-xl border border-[#2D1F14]/[0.06] px-4 py-3 text-sm text-[#2D1F14] placeholder:text-[#8B7D6B]/50 focus:outline-none focus:border-[#2D1F14]/15 focus:ring-1 focus:ring-[#2D1F14]/[0.06] transition-all" />
                        <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="WhatsApp number or email"
                          className="w-full bg-[#FFF9F5] rounded-xl border border-[#2D1F14]/[0.06] px-4 py-3 text-sm text-[#2D1F14] placeholder:text-[#8B7D6B]/50 focus:outline-none focus:border-[#2D1F14]/15 focus:ring-1 focus:ring-[#2D1F14]/[0.06] transition-all" />
                        <motion.button onClick={submitInterest} disabled={!name.trim() || !contact.trim() || submitting} whileTap={{ scale: 0.98 }}
                          className="w-full bg-[#C9503E] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#B5432E] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                          {submitting ? 'Sending...' : 'Keep me posted'}
                        </motion.button>
                      </div>
                    </motion.div>
                  </>
                )}
              </motion.div>
            )}

            {/* STEP 6: INTEREST CONFIRMED */}
            {step === 6 && (
              <motion.div key="s6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center py-12">
                <motion.span className="text-4xl block mb-4" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.5, delay: 0.2 }}>🌸</motion.span>
                <h3 className="text-xl font-black tracking-tight">{"You'll hear from us."}</h3>
                <p className="mt-3 text-[#8B7D6B] text-sm">If this idea becomes something real, you'll be among the first to know.</p>
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
