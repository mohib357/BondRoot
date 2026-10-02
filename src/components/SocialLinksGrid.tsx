import React from 'react';
import { Mail, MessageSquare } from 'lucide-react';

interface SocialLinksGridProps {
  isEnglish?: boolean;
  onMessageClick?: () => void;
}

// Deep neumorphic shadow for the 3D pressed-circle look
const shadowStyle: React.CSSProperties = {
  boxShadow:
    '8px 8px 20px rgba(0,0,0,0.25), -6px -6px 16px rgba(255,255,255,0.90), inset 2px 2px 5px rgba(255,255,255,0.50), inset -1px -1px 3px rgba(0,0,0,0.14)',
};

const pressedShadow =
  '3px 3px 8px rgba(0,0,0,0.25), -2px -2px 6px rgba(255,255,255,0.90), inset 5px 5px 12px rgba(0,0,0,0.20), inset -2px -2px 6px rgba(255,255,255,0.55)';

interface SocialBtnProps {
  href?: string;
  onClick?: () => void;
  title: string;
  label: string;
  /** tailwind bg-gradient-* classes; leave empty if you pass bgStyle */
  gradient?: string;
  /** raw CSS background (for multi-stop gradients like Instagram) */
  bgStyle?: React.CSSProperties;
  children: React.ReactNode;
}

function SocialBtn({ href, onClick, title, label, gradient = '', bgStyle, children }: SocialBtnProps) {
  const baseClass =
    `relative w-[68px] h-[68px] rounded-full ${gradient} text-white ` +
    'flex items-center justify-center transition-all duration-200 ' +
    'active:scale-90 hover:scale-110 cursor-pointer select-none';

  const combinedStyle: React.CSSProperties = { ...shadowStyle, ...(bgStyle ?? {}) };

  const gloss = (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-full"
      style={{
        background:
          'radial-gradient(circle at 32% 26%, rgba(255,255,255,0.60) 0%, rgba(255,255,255,0) 58%)',
      }}
    />
  );

  const handleDown = (e: React.MouseEvent<HTMLElement>) =>
    (e.currentTarget.style.boxShadow = pressedShadow);
  const handleUp = (e: React.MouseEvent<HTMLElement>) =>
    (e.currentTarget.style.boxShadow = shadowStyle.boxShadow as string);

  return (
    <div className="flex flex-col items-center gap-[7px]">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={title}
          className={baseClass}
          style={combinedStyle}
          onMouseDown={handleDown}
          onMouseUp={handleUp}
          onMouseLeave={handleUp}
        >
          {gloss}
          {children}
        </a>
      ) : (
        <button
          type="button"
          title={title}
          onClick={onClick}
          className={baseClass}
          style={combinedStyle}
          onMouseDown={handleDown}
          onMouseUp={handleUp}
          onMouseLeave={handleUp}
        >
          {gloss}
          {children}
        </button>
      )}
      <span className="text-[11px] font-bold text-slate-600 dark:text-zinc-300 text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

// ─── WhatsApp SVG ────────────────────────────────────────────────────────────
function WhatsAppIcon() {
  return (
    <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24">
      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.988l-1.413 5.163 5.286-1.385c1.458.796 3.104 1.215 4.782 1.216h.004c5.505 0 9.989-4.478 9.99-9.984 0-2.668-1.038-5.176-2.925-7.062a9.927 9.927 0 0 0-7.064-2.92zm5.82 14.161c-.246.691-1.229 1.263-1.697 1.341-.468.079-1.077.112-1.74-.087-.401-.121-.918-.287-1.583-.574-2.793-1.202-4.617-4.032-4.757-4.218-.14-.187-1.139-1.516-1.139-2.891 0-1.376.721-2.052.978-2.332.257-.281.562-.351.75-.351.187 0 .374.002.538.01.176.008.411-.067.644.492.234.56.795 1.942.865 2.083.07.14.117.304.023.491-.093.187-.14.304-.28.468-.14.164-.295.367-.422.492-.14.14-.286.293-.123.573.164.281.728 1.198 1.564 1.943 1.076.958 1.982 1.255 2.263 1.396.281.14.445.117.608-.07.164-.187.702-.818.89-1.099.187-.281.374-.234.632-.14.257.094 1.637.772 1.918.913.281.14.468.211.538.328.07.117.07.679-.176 1.37z" />
    </svg>
  );
}

// ─── Facebook SVG ─────────────────────────────────────────────────────────────
function FacebookIcon() {
  return (
    <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-4.873-12-10.875-12S2.25 5.446 2.25 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H9.078v-3.47h3.297V9.43c0-3.253 1.934-5.05 4.901-5.05 1.42 0 2.903.254 2.903.254v3.193h-1.637c-1.611 0-2.114.998-2.114 2.023v2.428h3.601l-.575 3.47h-3.026v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// ─── Instagram SVG ────────────────────────────────────────────────────────────
function InstagramIcon() {
  return (
    <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────
export default function SocialLinksGrid({ isEnglish = false, onMessageClick }: SocialLinksGridProps) {
  return (
    <div className="w-full py-3">
      {/* Section heading */}
      <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-zinc-500 text-center mb-5">
        {isEnglish ? 'Contact & Social Connect' : 'যোগাযোগ ও সোশ্যাল কানেক্ট'}
      </p>

      {/* 3-column neumorphic icon grid */}
      <div className="grid grid-cols-3 gap-y-6 gap-x-2 place-items-center">

        {/* Row 1 */}

        {/* 1. বার্তা */}
        <SocialBtn
          title={isEnglish ? 'Send Message' : 'সরাসরি বার্তা'}
          label={isEnglish ? 'Message' : 'বার্তা'}
          gradient="bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700"
          onClick={onMessageClick}
        >
          <MessageSquare className="w-8 h-8 text-white stroke-[1.8]" />
        </SocialBtn>

        {/* 2. WhatsApp */}
        <SocialBtn
          href="https://wa.me/8801700000000"
          title="WhatsApp"
          label="WhatsApp"
          gradient="bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600"
        >
          <WhatsAppIcon />
        </SocialBtn>

        {/* 3. ইমেইল */}
        <SocialBtn
          href="mailto:muhibbul524@gmail.com"
          title={isEnglish ? 'Email' : 'ইমেইল'}
          label={isEnglish ? 'Email' : 'ইমেইল'}
          gradient="bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600"
        >
          <Mail className="w-8 h-8 text-white stroke-[1.8]" />
        </SocialBtn>

        {/* Row 2 */}

        {/* 4. Facebook */}
        <SocialBtn
          href="https://facebook.com/muhibbul524"
          title="Facebook"
          label="Facebook"
          gradient="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800"
        >
          <FacebookIcon />
        </SocialBtn>

        {/* 5. Instagram */}
        <SocialBtn
          href="https://instagram.com/muhibbul524"
          title="Instagram"
          label="Instagram"
          bgStyle={{
            background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
          }}
        >
          <InstagramIcon />
        </SocialBtn>

        {/* 6. Empty placeholder — keeps grid balanced; replace with future icon */}
        <div aria-hidden className="w-[68px] h-[68px]" />

      </div>
    </div>
  );
}
