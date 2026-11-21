import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Terminal, X } from 'lucide-react';
import type { ChaosEventState } from '../game/types';
import { sound } from '../utils/sound';

interface ChaosEventOverlayProps {
  event: ChaosEventState | null;
  onDismiss: (note?: string) => void;
}

export const ChaosEventOverlay: React.FC<ChaosEventOverlayProps> = ({
  event,
  onDismiss,
}) => {
  const [betrayed, setBetrayed] = useState(false);
  const onDismissRef = React.useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const eventId = event?.id ?? null;
  const eventType = event?.type ?? null;

  useEffect(() => {
    setBetrayed(false);
    if (!eventId || !eventType) return;

    if (eventType === 'fake-success') {
      sound.fakeSuccessBetrayal();
      const t1 = window.setTimeout(() => setBetrayed(true), 800);
      const t2 = window.setTimeout(() => onDismissRef.current('You passed! Just kidding.'), 1900);
      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
    }

    if (eventType === 'admin-message') {
      const t = window.setTimeout(() => onDismissRef.current(), 4600);
      return () => window.clearTimeout(t);
    }
  }, [eventId, eventType]);

  if (!event) return null;

  // Non-blocking Admin toast in bottom-right corner
  if (event.type === 'admin-message') {
    return (
      <div
        role="status"
        className="animate-stage-enter fixed bottom-4 right-4 z-40 w-[calc(100%-2rem)] max-w-sm rounded-md border border-[#3F4451] bg-[#14171E] p-3.5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#F59E0B]">
            <Terminal className="h-3.5 w-3.5" />
            {event.headline}
          </div>
          <button
            type="button"
            onClick={() => onDismissRef.current()}
            aria-label="Dismiss administrator message"
            className="rounded p-1 text-[#717786] hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-[#D1D5DB]">{event.body}</p>
      </div>
    );
  }

  // Modal interruptions (funny, fast, 1-click dismissible)
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={event.headline}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
    >
      {event.type === 'stuck-99' && (
        <div className="animate-stage-enter w-full max-w-sm rounded-md border border-[#2C313C] bg-[#14161A] p-5 shadow-2xl">
          <div className="font-mono text-xs uppercase tracking-wider text-[#EF4444]">
            {event.headline}
          </div>
          <p className="mt-2 text-sm text-[#F2F0EB]">{event.body}</p>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-sm bg-[#20242E]">
            <div className="h-full w-[99%] bg-[#DC2626]" />
          </div>
          <div className="mt-1.5 flex items-center justify-between font-mono-tabular text-xs text-[#9BA1AE]">
            <span>Estimating soul weight...</span>
            <span>99%</span>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.click();
              onDismissRef.current('Fine, skipping the last 1%. Impatient human.');
            }}
            className="mt-4 min-h-[44px] w-full rounded-md border border-[#3F4451] bg-[#1D2129] px-4 py-2 text-xs font-semibold text-[#F2F0EB] transition-colors hover:border-[#EF4444] active:scale-[0.98]"
          >
            Kick Progress Bar
          </button>
        </div>
      )}

      {event.type === 'fake-crash' && (
        <div className="animate-stage-enter w-full max-w-md rounded-md border-2 border-[#DC2626] bg-[#160B0D] p-5 font-mono shadow-2xl">
          <div className="flex items-center gap-2 text-sm font-bold text-[#EF4444]">
            <AlertTriangle className="h-5 w-5" />
            {event.headline}
          </div>
          <p className="mt-2.5 text-xs leading-relaxed text-[#FCA5A5]">{event.body}</p>
          <div className="mt-3 rounded bg-black/40 p-2.5 text-[11px] text-[#9BA1AE]">
            ERR_EMOTIONAL_DAMAGE · LINE 404 · BLAMING_USER=TRUE
          </div>
          <button
            type="button"
            onClick={() => {
              sound.glitch();
              onDismissRef.current('Server slapped back into consciousness.');
            }}
            className="mt-4 min-h-[44px] w-full rounded-md bg-[#DC2626] px-4 py-2.5 font-sans text-sm font-semibold text-white hover:bg-[#B91C1C]"
          >
            Slap Server to Reboot
          </button>
        </div>
      )}

      {event.type === 'meta-verify' && (
        <div className="animate-stage-enter w-full max-w-sm rounded-md border border-[#3F4451] bg-[#14161A] p-5 shadow-2xl">
          <div className="font-mono text-xs uppercase tracking-wider text-[#F59E0B]">
            {event.headline}
          </div>
          <p className="mt-2 text-sm font-medium text-[#F2F0EB]">{event.body}</p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => {
                sound.click();
                onDismissRef.current('Suspicious denial recorded.');
              }}
              className="min-h-[44px] flex-1 rounded-md border border-[#3F4451] bg-[#1D2129] px-3 py-2 text-xs font-semibold text-[#F2F0EB] transition-colors hover:border-[#EF4444] active:scale-[0.98]"
            >
              No, I am working
            </button>
            <button
              type="button"
              onClick={() => {
                sound.click();
                onDismissRef.current('Honesty respected. Returning to your torment.');
              }}
              className="min-h-[44px] flex-1 rounded-md bg-[#DC2626] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#B91C1C] active:scale-[0.98]"
            >
              Yes, send help
            </button>
          </div>
        </div>
      )}

      {event.type === 'fake-success' && (
        <div
          className={`w-full max-w-sm rounded-md border-2 p-6 text-center shadow-2xl transition-colors duration-150 ${
            betrayed
              ? 'animate-shake border-[#DC2626] bg-[#1C0D0F]'
              : 'border-[#22C55E] bg-[#0D1E14]'
          }`}
        >
          {!betrayed ? (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-[#22C55E]" />
              <h3 className="mt-3 font-display text-xl font-bold text-[#DCFCE7]">
                HUMAN VERIFIED!
              </h3>
              <p className="mt-1 text-xs text-[#86EFAC]">Unlocking the entire internet...</p>
            </>
          ) : (
            <>
              <AlertTriangle className="mx-auto h-12 w-12 text-[#EF4444]" />
              <h3 className="mt-3 font-display text-xl font-bold text-[#FCA5A5]">
                JUST KIDDING.
              </h3>
              <p className="mt-1 text-xs text-[#F2F0EB]">
                Did you really think it would be that easy?
              </p>
              <button
                type="button"
                onClick={() => onDismissRef.current('You passed! Just kidding.')}
                className="mt-4 min-h-[44px] rounded-md border border-[#DC2626]/60 bg-[#2A1215] px-4 py-1.5 text-xs font-semibold text-[#FCA5A5] transition-colors hover:bg-[#DC2626] hover:text-white active:scale-[0.98]"
              >
                Ugh, Continue
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
