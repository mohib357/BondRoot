import React from 'react';
import { Mail, MessageSquare } from 'lucide-react';

interface SocialLinksGridProps {
  isEnglish?: boolean;
  onMessageClick?: () => void;
}

// ─── Color configs per button ──────────────────────────────────────────────────
// outerBg   : the large outer disk (lighter shade)
// outerShadow: drop shadow on the outer disk
// innerBg   : the smaller inner disk (richer/darker shade)
// innerShadow: inset + drop on inner disk

interface ColorConfig {
  outerBg: string;       // CSS color / gradient string
  outerShadowDark: string;
  outerShadowLight: string;
  innerBg: string;
  innerShadowDark: string;
  innerHighlight: string; // top-left gloss on inner
}

// ─── SVG icons ─────────────────────────────────────────────────────────────────
function WhatsAppIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.988l-1.413 5.163 5.286-1.385c1.458.796 3.104 1.215 4.782 1.216h.004c5.505 0 9.989-4.478 9.99-9.984 0-2.668-1.038-5.176-2.925-7.062a9.927 9.927 0 0 0-7.064-2.92zm5.82 14.161c-.246.691-1.229 1.263-1.697 1.341-.468.079-1.077.112-1.74-.087-.401-.121-.918-.287-1.583-.574-2.793-1.202-4.617-4.032-4.757-4.218-.14-.187-1.139-1.516-1.139-2.891 0-1.376.721-2.052.978-2.332.257-.281.562-.351.75-.351.187 0 .374.002.538.01.176.008.411-.067.644.492.234.56.795 1.942.865 2.083.07.14.117.304.023.491-.093.187-.14.304-.28.468-.14.164-.295.367-.422.492-.14.14-.286.293-.123.573.164.281.728 1.198 1.564 1.943 1.076.958 1.982 1.255 2.263 1.396.281.14.445.117.608-.07.164-.187.702-.818.89-1.099.187-.281.374-.234.632-.14.257.094 1.637.772 1.918.913.281.14.468.211.538.328.07.117.07.679-.176 1.37z"/>
    </svg>
  );
}

function FacebookIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M24 12.073c0-6.627-4.873-12-10.875-12S2.25 5.446 2.25 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H9.078v-3.47h3.297V9.43c0-3.253 1.934-5.05 4.901-5.05 1.42 0 2.903.254 2.903.254v3.193h-1.637c-1.611 0-2.114.998-2.114 2.023v2.428h3.601l-.575 3.47h-3.026v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

// ─── The 3-layer concentric circle button ───────────────────────────────────────
// Layer structure (outside → in):
//   1. Outer disk  (outerSize)  — soft shadow rings, lighter bg
//   2. Inner disk  (innerSize)  — inset shadow top-left, darker bg
//   3. Icon center
interface LayeredBtnProps {
  href?: string;
  onClick?: () => void;
  title: string;
  label: string;
  outerBg: React.CSSProperties['background'];
  innerBg: React.CSSProperties['background'];
  // shadow colors (derived from main color)
  shadowDark: string;   // e.g. rgba(0,86,179,0.60)
  shadowLight: string;  // e.g. rgba(100,180,255,0.80)
  children: React.ReactNode;
}

function LayeredBtn({
  href, onClick, title, label,
  outerBg, innerBg, shadowDark, shadowLight,
  children,
}: LayeredBtnProps) {
  // Outer disk — large, with drop shadow bottom-right dark + top-left light
  const outerStyle: React.CSSProperties = {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: outerBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    boxShadow: `6px 8px 18px ${shadowDark}, -4px -4px 12px ${shadowLight}`,
    userSelect: 'none',
    WebkitUserSelect: 'none',
  };

  // Inner disk — smaller, sits on top, concave look with inset top-left highlight
  const innerStyle: React.CSSProperties = {
    width: 62,
    height: 62,
    borderRadius: '50%',
    background: innerBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    // inset top-left bright, inset bottom-right dark → "pushed in" rim
    boxShadow: `inset 3px 3px 8px ${shadowLight}, inset -3px -3px 8px ${shadowDark}`,
  };

  // Gloss highlight at top-left of inner disk
  const glossStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    pointerEvents: 'none',
    background:
      'radial-gradient(circle at 30% 28%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 55%)',
  };

  const handlePressIn = (el: HTMLElement) => {
    el.style.transform = 'scale(0.92)';
    el.style.boxShadow = `3px 4px 10px ${shadowDark}, -2px -2px 6px ${shadowLight}`;
  };
  const handlePressOut = (el: HTMLElement) => {
    el.style.transform = 'scale(1)';
    el.style.boxShadow = `6px 8px 18px ${shadowDark}, -4px -4px 12px ${shadowLight}`;
  };

  const eventProps = {
    onMouseDown: (e: React.MouseEvent<HTMLElement>) => handlePressIn(e.currentTarget),
    onMouseUp: (e: React.MouseEvent<HTMLElement>) => handlePressOut(e.currentTarget),
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => handlePressOut(e.currentTarget),
    onTouchStart: (e: React.TouchEvent<HTMLElement>) => handlePressIn(e.currentTarget),
    onTouchEnd: (e: React.TouchEvent<HTMLElement>) => handlePressOut(e.currentTarget),
  };

  const innerContent = (
    <div style={outerStyle} {...eventProps}>
      <div style={innerStyle}>
        <span style={glossStyle} aria-hidden />
        {children}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" title={title}
           style={{ display: 'block', lineHeight: 0, borderRadius: '50%' }}>
          {innerContent}
        </a>
      ) : (
        <button type="button" title={title}
                style={{ background: 'none', border: 'none', padding: 0, lineHeight: 0 }}
                onClick={onClick}>
          {innerContent}
        </button>
      )}
      <span style={{
        fontSize: 11,
        fontWeight: 700,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 1.2,
        letterSpacing: '0.01em',
      }}>
        {label}
      </span>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function SocialLinksGrid({ isEnglish = false, onMessageClick }: SocialLinksGridProps) {
  return (
    <div style={{ width: '100%', paddingTop: 12, paddingBottom: 12 }}>
      {/* Heading */}
      <p style={{
        fontSize: 10,
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 20,
      }}>
        {isEnglish ? 'Contact & Social Connect' : 'যোগাযোগ ও সোশ্যাল কানেক্ট'}
      </p>

      {/* 3-column grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px 8px',
        placeItems: 'center',
        padding: '0 4px',
      }}>

        {/* 1. বার্তা — indigo */}
        <LayeredBtn
          title={isEnglish ? 'Send Message' : 'সরাসরি বার্তা'}
          label={isEnglish ? 'Message' : 'বার্তা'}
          outerBg="linear-gradient(145deg, #818cf8, #4f46e5)"
          innerBg="linear-gradient(145deg, #4338ca, #6366f1)"
          shadowDark="rgba(55,48,163,0.55)"
          shadowLight="rgba(165,180,252,0.70)"
          onClick={onMessageClick}
        >
          <MessageSquare size={28} color="white" strokeWidth={1.8} />
        </LayeredBtn>

        {/* 2. WhatsApp — green */}
        <LayeredBtn
          href="https://wa.me/8801700000000"
          title="WhatsApp"
          label="WhatsApp"
          outerBg="linear-gradient(145deg, #4ade80, #16a34a)"
          innerBg="linear-gradient(145deg, #15803d, #22c55e)"
          shadowDark="rgba(20,83,45,0.55)"
          shadowLight="rgba(134,239,172,0.70)"
        >
          <WhatsAppIcon size={28} />
        </LayeredBtn>

        {/* 3. ইমেইল — sky blue */}
        <LayeredBtn
          href="mailto:muhibbul524@gmail.com"
          title={isEnglish ? 'Email' : 'ইমেইল'}
          label={isEnglish ? 'Email' : 'ইমেইল'}
          outerBg="linear-gradient(145deg, #7dd3fc, #0284c7)"
          innerBg="linear-gradient(145deg, #0369a1, #38bdf8)"
          shadowDark="rgba(3,105,161,0.55)"
          shadowLight="rgba(186,230,253,0.70)"
        >
          <Mail size={28} color="white" strokeWidth={1.8} />
        </LayeredBtn>

        {/* 4. Facebook — blue */}
        <LayeredBtn
          href="https://facebook.com/muhibbul524"
          title="Facebook"
          label="Facebook"
          outerBg="linear-gradient(145deg, #60a5fa, #1d4ed8)"
          innerBg="linear-gradient(145deg, #1e40af, #3b82f6)"
          shadowDark="rgba(30,64,175,0.55)"
          shadowLight="rgba(147,197,253,0.70)"
        >
          <FacebookIcon size={28} />
        </LayeredBtn>

        {/* 5. Instagram — warm gradient */}
        <LayeredBtn
          href="https://instagram.com/muhibbul524"
          title="Instagram"
          label="Instagram"
          outerBg="linear-gradient(145deg, #fbbf24, #ec4899)"
          innerBg="linear-gradient(145deg, #be185d, #f97316)"
          shadowDark="rgba(190,24,93,0.55)"
          shadowLight="rgba(251,191,36,0.60)"
        >
          <InstagramIcon size={28} />
        </LayeredBtn>

        {/* 6. placeholder — grid balance */}
        <div aria-hidden style={{ width: 80, height: 80 }} />

      </div>
    </div>
  );
}
