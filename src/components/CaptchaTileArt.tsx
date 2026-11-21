import React, { useState } from 'react';
import { CAPTCHA_IMAGES } from '../game/assets';

export type TileArtKind =
  // Level 1: Traffic Lights
  | 'photo-traffic-main'
  | 'photo-traffic-crop-corner'
  | 'photo-espresso-tiny-light'
  | 'svg-cactus-tiny-light'
  | 'photo-desert-clean'
  | 'photo-bus-clean'
  | 'svg-stoplight-popsicle'
  | 'photo-van-clean'
  | 'svg-streetlamp-only'
  // Level 2: Buses
  | 'photo-bus-hidden-tree'
  | 'photo-bus-zoomed'
  | 'photo-boxy-van'
  | 'svg-bread-bus'
  | 'svg-usb-bus'
  | 'svg-toy-bus-grass'
  | 'svg-submarine-wheels'
  | 'photo-street-no-bus'
  | 'photo-espresso-clean'
  // Level 6: Water
  | 'photo-rain-reflection'
  | 'photo-desert-watermark'
  | 'photo-espresso-h2o'
  | 'svg-crying-cloud'
  | 'svg-dry-rock'
  | 'svg-empty-cup'
  | 'svg-fire-hydrant'
  | 'svg-desert-cactus'
  | 'svg-brick-wall'
  // Level 10: Never Existed
  | 'photo-impossible-stairs'
  | 'svg-bugfree-deploy'
  | 'svg-usb-first-try'
  | 'svg-monday-motivation'
  | 'svg-quiet-mech-kb'
  | 'photo-real-bus-10'
  | 'photo-real-espresso-10'
  | 'photo-real-street-10'
  | 'svg-real-traffic-cone';

interface CaptchaTileArtProps {
  kind: TileArtKind;
  alt: string;
  magnified?: boolean;
}

function PhotoFrame({
  src,
  alt,
  imgClass = 'object-cover',
  children,
}: {
  src: string;
  alt: string;
  imgClass?: string;
  children?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#181B21]">
      {!failed ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          decoding="async"
          draggable={false}
          onError={() => setFailed(true)}
          className={`h-full w-full select-none transition-transform duration-200 ${imgClass}`}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-[#181B21] p-2 text-center text-xs text-[#9BA1AE]">
          <span className="font-mono-tabular uppercase tracking-wider text-[#DC2626]">IMG</span>
          <span className="mt-1 line-clamp-2">{alt}</span>
        </div>
      )}
      {children}
    </div>
  );
}

function TinyTrafficLight({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 16 34"
      className={`pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${className}`}
      aria-hidden="true"
    >
      <rect x="2" y="1" width="12" height="27" rx="3" fill="#18181B" stroke="#52525B" strokeWidth="1.2" />
      <rect x="7" y="28" width="2" height="6" fill="#52525B" />
      <circle cx="8" cy="7" r="3" fill="#EF4444" />
      <circle cx="8" cy="14.5" r="3" fill="#F59E0B" />
      <circle cx="8" cy="22" r="3" fill="#22C55E" />
    </svg>
  );
}

export const CaptchaTileArt: React.FC<CaptchaTileArtProps> = React.memo(({ kind, alt, magnified }) => {
  switch (kind) {
    // --- LEVEL 1: TRAFFIC LIGHTS ---
    case 'photo-traffic-main':
      return <PhotoFrame src={CAPTCHA_IMAGES.streetCrossing} alt={alt} imgClass="object-cover object-top" />;

    case 'photo-traffic-crop-corner':
      return (
        <PhotoFrame
          src={CAPTCHA_IMAGES.streetCrossing}
          alt={alt}
          imgClass="object-cover scale-[1.55] object-[52%_14%]"
        />
      );

    case 'photo-espresso-tiny-light':
      return (
        <PhotoFrame src={CAPTCHA_IMAGES.cafeEspresso} alt={alt} imgClass="object-cover">
          <TinyTrafficLight
            className={`absolute right-[19%] top-[36%] transition-transform duration-200 ${
              magnified ? 'h-8 w-4 scale-125' : 'h-5 w-2.5 opacity-95'
            }`}
          />
        </PhotoFrame>
      );

    case 'svg-cactus-tiny-light':
      return (
        <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-b from-[#23272F] to-[#16191F]">
          <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
            <rect x="0" y="88" width="120" height="32" fill="#2A2420" />
            <polygon points="40,94 80,94 74,116 46,116" fill="#B45309" />
            <rect x="36" y="88" width="48" height="8" rx="2" fill="#D97706" />
            <rect x="52" y="34" width="16" height="56" rx="8" fill="#15803D" />
            <path d="M52 56 H40 A6 6 0 0 1 34 50 V42 A5 5 0 0 1 44 42 V48 H52" fill="#166534" />
            <path d="M68 62 H80 A6 6 0 0 0 86 56 V48 A5 5 0 0 0 76 48 V54 H68" fill="#15803D" />
          </svg>
          <TinyTrafficLight
            className={`absolute left-[18%] bottom-[26%] transition-transform duration-200 ${
              magnified ? 'h-8 w-4 scale-125' : 'h-4 w-2 opacity-90'
            }`}
          />
        </div>
      );

    case 'photo-desert-clean':
      return <PhotoFrame src={CAPTCHA_IMAGES.desertFlat} alt={alt} />;

    case 'photo-bus-clean':
      return <PhotoFrame src={CAPTCHA_IMAGES.cityBus} alt={alt} imgClass="object-cover object-bottom" />;

    case 'photo-van-clean':
      return <PhotoFrame src={CAPTCHA_IMAGES.boxyVan} alt={alt} />;

    case 'svg-stoplight-popsicle':
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#1B1F27]">
          <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
            <rect x="55" y="76" width="10" height="30" rx="4" fill="#D6B185" />
            <rect x="42" y="20" width="36" height="60" rx="14" fill="#EF4444" />
            <rect x="42" y="40" width="36" height="20" fill="#F59E0B" />
            <rect x="42" y="60" width="36" height="20" rx="6" fill="#22C55E" />
            <rect x="49" y="28" width="5" height="44" rx="2.5" fill="rgba(255,255,255,0.25)" />
            <text x="60" y="114" textAnchor="middle" fill="#9BA1AE" fontSize="8" fontFamily="monospace">
              POPSICLE
            </text>
          </svg>
        </div>
      );

    case 'svg-streetlamp-only':
      return (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[#171B24] to-[#0F1218]">
          <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
            <rect x="57" y="24" width="6" height="96" fill="#52525B" />
            <path d="M60 26 Q60 16 80 18" stroke="#52525B" strokeWidth="5" fill="none" />
            <ellipse cx="82" cy="22" rx="10" ry="4" fill="#FDE68A" />
            <polygon points="72,24 92,24 106,86 58,86" fill="rgba(253,230,138,0.1)" />
          </svg>
        </div>
      );

    // --- LEVEL 2: BUSES ---
    case 'photo-bus-hidden-tree':
      return <PhotoFrame src={CAPTCHA_IMAGES.cityBus} alt={alt} />;

    case 'photo-bus-zoomed':
      return (
        <PhotoFrame
          src={CAPTCHA_IMAGES.cityBus}
          alt={alt}
          imgClass="object-cover scale-[1.4] object-[72%_66%]"
        />
      );

    case 'photo-boxy-van':
      return <PhotoFrame src={CAPTCHA_IMAGES.boxyVan} alt={alt} />;

    case 'svg-bread-bus':
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#1F1C18]">
          <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
            <rect x="0" y="88" width="120" height="32" fill="#2B2621" />
            <rect x="16" y="42" width="88" height="44" rx="14" fill="#D97706" stroke="#92400E" strokeWidth="3" />
            <path d="M22 48 Q60 32 98 48" fill="#F59E0B" />
            <rect x="26" y="54" width="14" height="12" rx="2" fill="#3F2E1E" stroke="#FDE68A" strokeWidth="1.5" />
            <rect x="46" y="54" width="14" height="12" rx="2" fill="#3F2E1E" stroke="#FDE68A" strokeWidth="1.5" />
            <rect x="66" y="54" width="14" height="12" rx="2" fill="#3F2E1E" stroke="#FDE68A" strokeWidth="1.5" />
            <rect x="86" y="54" width="10" height="12" rx="2" fill="#3F2E1E" stroke="#FDE68A" strokeWidth="1.5" />
            <text x="60" y="106" textAnchor="middle" fill="#D6D3D1" fontSize="8" fontFamily="monospace">
              BRIOCHE LOAF
            </text>
          </svg>
        </div>
      );

    case 'svg-usb-bus':
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#0F241A]">
          <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
            <path d="M12 30 H48 L60 44 H108" stroke="#34D399" strokeWidth="2.5" fill="none" opacity="0.6" />
            <path d="M12 60 H108" stroke="#34D399" strokeWidth="2.5" fill="none" opacity="0.6" />
            <path d="M12 90 H52 L64 76 H108" stroke="#34D399" strokeWidth="2.5" fill="none" opacity="0.6" />
            <rect x="34" y="38" width="52" height="44" rx="4" fill="#18181B" stroke="#6EE7B7" strokeWidth="2" />
            <text x="60" y="58" textAnchor="middle" fill="#F2F0EB" fontSize="11" fontWeight="bold" fontFamily="monospace">
              USB BUS
            </text>
            <text x="60" y="72" textAnchor="middle" fill="#6EE7B7" fontSize="8" fontFamily="monospace">
              5V SERIAL
            </text>
          </svg>
        </div>
      );

    case 'svg-toy-bus-grass':
      return (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[#1E2B22] to-[#132017]">
          <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
            <rect x="0" y="74" width="120" height="46" fill="#166534" />
            <rect x="34" y="56" width="52" height="24" rx="4" fill="#EAB308" stroke="#18181B" strokeWidth="2" />
            <rect x="40" y="61" width="9" height="8" fill="#1E293B" />
            <rect x="52" y="61" width="9" height="8" fill="#1E293B" />
            <rect x="64" y="61" width="9" height="8" fill="#1E293B" />
            <rect x="76" y="61" width="7" height="8" fill="#1E293B" />
            <circle cx="46" cy="81" r="5" fill="#18181B" stroke="#A1A1AA" strokeWidth="1.5" />
            <circle cx="74" cy="81" r="5" fill="#18181B" stroke="#A1A1AA" strokeWidth="1.5" />
            <path d="M20 88 L25 70 L30 88 M88 90 L93 72 L98 90" stroke="#22C55E" strokeWidth="2" fill="none" />
          </svg>
        </div>
      );

    case 'svg-submarine-wheels':
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#112233]">
          <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
            <rect x="54" y="28" width="14" height="20" rx="3" fill="#FACC15" />
            <rect x="60" y="18" width="4" height="12" fill="#FACC15" />
            <rect x="60" y="18" width="12" height="4" fill="#FACC15" />
            <ellipse cx="60" cy="64" rx="42" ry="20" fill="#EAB308" stroke="#854D0E" strokeWidth="2" />
            <circle cx="42" cy="64" r="6" fill="#38BDF8" stroke="#1E293B" strokeWidth="2" />
            <circle cx="60" cy="64" r="6" fill="#38BDF8" stroke="#1E293B" strokeWidth="2" />
            <circle cx="78" cy="64" r="6" fill="#38BDF8" stroke="#1E293B" strokeWidth="2" />
            <circle cx="40" cy="86" r="7" fill="#18181B" stroke="#71717A" strokeWidth="2" />
            <circle cx="80" cy="86" r="7" fill="#18181B" stroke="#71717A" strokeWidth="2" />
          </svg>
        </div>
      );

    case 'photo-street-no-bus':
      return (
        <PhotoFrame
          src={CAPTCHA_IMAGES.streetCrossing}
          alt={alt}
          imgClass="object-cover object-bottom"
        />
      );

    case 'photo-espresso-clean':
      return <PhotoFrame src={CAPTCHA_IMAGES.cafeEspresso} alt={alt} />;

    // --- LEVEL 6: WATER ---
    case 'photo-rain-reflection':
      return (
        <PhotoFrame
          src={CAPTCHA_IMAGES.streetCrossing}
          alt={alt}
          imgClass="object-cover object-bottom scale-110"
        />
      );

    case 'photo-desert-watermark':
      return (
        <PhotoFrame src={CAPTCHA_IMAGES.desertFlat} alt={alt}>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/15">
            <span className="-rotate-25 select-none border-y border-white/60 bg-black/35 px-3 py-0.5 font-mono text-[11px] font-bold tracking-[0.2em] text-white/90">
              WATERMARK
            </span>
          </div>
        </PhotoFrame>
      );

    case 'photo-espresso-h2o':
      return <PhotoFrame src={CAPTCHA_IMAGES.cafeEspresso} alt={alt} imgClass="object-cover object-left" />;

    case 'svg-crying-cloud':
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#161B26]">
          <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
            <path
              d="M34 68 H86 A16 16 0 0 0 86 38 A22 22 0 0 0 44 34 A16 16 0 0 0 34 68 Z"
              fill="#CBD5E1"
            />
            <circle cx="50" cy="50" r="3" fill="#0F172A" />
            <circle cx="70" cy="50" r="3" fill="#0F172A" />
            <path d="M52 60 Q60 54 68 60" stroke="#0F172A" strokeWidth="2.5" fill="none" />
            <path d="M48 74 L44 88 M60 76 L56 92 M72 74 L68 88" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'svg-dry-rock':
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#1F1D1B]">
          <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
            <polygon points="24,86 38,44 74,38 96,68 88,88" fill="#78716C" stroke="#44403C" strokeWidth="2.5" />
            <polygon points="38,44 74,38 66,64 34,68" fill="#A8A29E" opacity="0.45" />
            <text x="60" y="106" textAnchor="middle" fill="#A8A29E" fontSize="8" fontFamily="monospace">
              DRY ROCK
            </text>
          </svg>
        </div>
      );

    case 'svg-empty-cup':
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#191B20]">
          <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
            <polygon points="36,34 84,34 76,92 44,92" fill="none" stroke="#94A3B8" strokeWidth="3" />
            <ellipse cx="60" cy="34" rx="24" ry="5" fill="#1E293B" stroke="#94A3B8" strokeWidth="2.5" />
            <text x="60" y="68" textAnchor="middle" fill="#64748B" fontSize="9" fontFamily="monospace">
              0% H2O
            </text>
          </svg>
        </div>
      );

    case 'svg-fire-hydrant':
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#1C1919]">
          <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
            <rect x="44" y="42" width="32" height="52" rx="4" fill="#DC2626" />
            <path d="M42 42 Q60 22 78 42 Z" fill="#B91C1C" />
            <rect x="34" y="54" width="12" height="12" rx="2" fill="#991B1B" />
            <rect x="74" y="54" width="12" height="12" rx="2" fill="#991B1B" />
            <rect x="36" y="92" width="48" height="8" rx="2" fill="#7F1D1D" />
            <text x="60" y="112" textAnchor="middle" fill="#FCA5A5" fontSize="7.5" fontFamily="monospace">
              OUT OF ORDER
            </text>
          </svg>
        </div>
      );

    case 'svg-desert-cactus':
      return <PhotoFrame src={CAPTCHA_IMAGES.desertFlat} alt={alt} imgClass="object-cover object-bottom" />;

    case 'svg-brick-wall':
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#2A1B18]">
          <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
            <rect x="6" y="16" width="48" height="22" rx="2" fill="#9A3412" />
            <rect x="60" y="16" width="54" height="22" rx="2" fill="#7C2D12" />
            <rect x="24" y="44" width="52" height="22" rx="2" fill="#B45309" />
            <rect x="82" y="44" width="32" height="22" rx="2" fill="#9A3412" />
            <rect x="6" y="72" width="52" height="22" rx="2" fill="#7C2D12" />
            <rect x="64" y="72" width="50" height="22" rx="2" fill="#9A3412" />
          </svg>
        </div>
      );

    // --- LEVEL 10: NEVER EXISTED ---
    case 'photo-impossible-stairs':
      return <PhotoFrame src={CAPTCHA_IMAGES.impossibleStairs} alt={alt} />;

    case 'svg-bugfree-deploy':
      return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-[#101B16] p-2 text-center">
          <svg viewBox="0 0 80 48" className="mb-1 h-9 w-14" aria-hidden="true">
            <ellipse cx="40" cy="10" rx="18" ry="5" fill="none" stroke="#FACC15" strokeWidth="2.5" />
            <rect x="16" y="18" width="48" height="26" rx="4" fill="#14532D" stroke="#4ADE80" strokeWidth="2" />
            <text x="40" y="35" textAnchor="middle" fill="#DCFCE7" fontSize="9" fontFamily="monospace">
              0 BUGS
            </text>
          </svg>
          <span className="font-mono text-[10px] font-semibold leading-tight text-[#DCFCE7]">
            Friday 5pm Prod Deploy
          </span>
        </div>
      );

    case 'svg-usb-first-try':
      return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-[#181724] p-2 text-center">
          <svg viewBox="0 0 80 48" className="mb-1 h-9 w-14" aria-hidden="true">
            <rect x="14" y="16" width="22" height="16" rx="2" fill="#94A3B8" />
            <rect x="18" y="20" width="5" height="3" fill="#0F172A" />
            <rect x="18" y="25" width="5" height="3" fill="#0F172A" />
            <rect x="36" y="12" width="30" height="24" rx="4" fill="#334155" stroke="#E2E8F0" strokeWidth="1.5" />
            <text x="51" y="27" textAnchor="middle" fill="#FACC15" fontSize="9" fontWeight="bold">
              1ST TRY
            </text>
          </svg>
          <span className="font-mono text-[10px] font-semibold leading-tight text-[#E2E8F0]">
            USB-A Plugged Right First Try
          </span>
        </div>
      );

    case 'svg-monday-motivation':
      return (
        <div className="flex h-full w-full flex-col items-center justify-center border border-dashed border-[#3F4451] bg-[#121419] p-2 text-center">
          <span className="font-mono text-[11px] font-bold text-[#EF4444]">404</span>
          <span className="mt-1 font-mono text-[10px] leading-tight text-[#9BA1AE]">
            Your Motivation on Monday
          </span>
        </div>
      );

    case 'svg-quiet-mech-kb':
      return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-[#1A181E] p-2 text-center">
          <svg viewBox="0 0 80 44" className="mb-1 h-8 w-14" aria-hidden="true">
            <rect x="6" y="10" width="68" height="26" rx="4" fill="#27272A" stroke="#A1A1AA" strokeWidth="1.5" />
            <rect x="12" y="15" width="8" height="7" rx="1" fill="#52525B" />
            <rect x="23" y="15" width="8" height="7" rx="1" fill="#52525B" />
            <rect x="34" y="15" width="8" height="7" rx="1" fill="#52525B" />
            <rect x="45" y="15" width="8" height="7" rx="1" fill="#52525B" />
            <rect x="56" y="15" width="12" height="7" rx="1" fill="#52525B" />
            <rect x="20" y="25" width="40" height="6" rx="1" fill="#71717A" />
          </svg>
          <span className="font-mono text-[10px] font-semibold leading-tight text-[#E4E4E7]">
            Silent Blue-Switch Keyboard
          </span>
        </div>
      );

    case 'photo-real-bus-10':
      return <PhotoFrame src={CAPTCHA_IMAGES.cityBus} alt={alt} />;

    case 'photo-real-espresso-10':
      return <PhotoFrame src={CAPTCHA_IMAGES.cafeEspresso} alt={alt} />;

    case 'photo-real-street-10':
      return <PhotoFrame src={CAPTCHA_IMAGES.streetCrossing} alt={alt} />;

    case 'svg-real-traffic-cone':
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#1B1D22]">
          <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
            <polygon points="54,22 66,22 86,94 34,94" fill="#EA580C" />
            <polygon points="48,46 72,46 76,58 44,58" fill="#F8FAFC" />
            <polygon points="41,70 79,70 82,80 38,80" fill="#F8FAFC" />
            <rect x="24" y="94" width="72" height="10" rx="2" fill="#C2410C" />
          </svg>
        </div>
      );
  }
});
CaptchaTileArt.displayName = 'CaptchaTileArt';
