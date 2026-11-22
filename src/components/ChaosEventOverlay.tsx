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
      const t2 = window.setTimeout(() => onDismissRef.current('Verification successful. Just kidding.'), 1900);
      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
    }

    if (eventType === 'admin-message') {
      const t = window.setTimeout(() => onDismissRef.current(), 5200);
      return () => window.clearTimeout(t);
    }
  }, [eventId, eventType]);

  if (!event) return null;

  // Non-blocking quiet Administrator notification
  if (event.type === 'admin-message') {
    return (
      <div
        role="status"
        className="animate-stage-enter fixed bottom-4 right-4 z-40 w-[calc(100%-2rem)] max-w-sm rounded-md border border-[#333333] bg-[#191919] p-3.5"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#B84B4B]">
            <Terminal className="h-3.5 w-3.5" />
            {event.headline}
          </div>
          <button
            type="button"
            onClick={() => onDismissRef.current()}
            aria-label="Dismiss administrator message"
            className="rounded p-1 text-[#929292] hover:text-[#EEEEEE]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-[#D0D0D0]">{event.body}</p>
      </div>
    );
  }

  // Modal interruptions styled as believable system notices
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={event.headline}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
    >
      {event.type === 'stuck-99' && (
        <div className="animate-stage-enter w-full max-w-sm rounded-md border border-[#333333] bg-[#191919] p-5">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#B84B4B]">
            {event.headline}
          </div>
          <p className="mt-2 text-sm text-[#EEEEEE]">{event.body}</p>
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-xs bg-[#222222]">
            <div className="h-full w-[99%] bg-[#B84B4B]" />
          </div>
          <div className="mt-1.5 flex items-center justify-between font-mono-tabular text-xs text-[#929292]">
            <span>Comparing session signature...</span>
            <span>99%</span>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.click();
              onDismissRef.current('Fine, skipping the last 1%. Impatient human.');
            }}
            className="mt-4 min-h-[44px] w-full rounded border border-[#333333] bg-[#222222] px-4 py-2 text-xs font-semibold text-[#EEEEEE] transition-colors hover:border-[#666666]"
          >
            Kick Progress Bar
          </button>
        </div>
      )}

      {event.type === 'fake-crash' && (
        <div className="animate-stage-enter w-full max-w-md rounded-md border border-[#B84B4B] bg-[#191919] p-5 font-mono">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B84B4B]">
            <AlertTriangle className="h-4 w-4" />
            {event.headline}
          </div>
          <p className="mt-2.5 font-sans text-xs leading-relaxed text-[#EEEEEE]">
            {event.body}
          </p>
          <div className="mt-3 rounded border border-[#262626] bg-[#111111] p-2.5 text-[11px] text-[#929292]">
            ERR_IDENTITY_OVERLAP · MODULE 404 · ORIGINAL_SESSION=UNCONFIRMED
          </div>
          <button
            type="button"
            onClick={() => {
              sound.glitch();
              onDismissRef.current('Session restored. Please disregard the previous notification.');
            }}
            className="mt-4 min-h-[44px] w-full rounded bg-[#B84B4B] px-4 py-2.5 font-sans text-sm font-semibold text-[#EEEEEE] hover:bg-[#A03E3E]"
          >
            Slap Server to Reboot
          </button>
        </div>
      )}

      {event.type === 'meta-verify' && (
        <div className="animate-stage-enter w-full max-w-sm rounded-md border border-[#333333] bg-[#191919] p-5">
          <div className="font-mono text-[11px] uppercase tracking-wider text-[#929292]">
            {event.headline}
          </div>
          <p className="mt-2 text-sm font-medium text-[#EEEEEE]">{event.body}</p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => {
                sound.click();
                onDismissRef.current('Suspicious denial recorded.');
              }}
              className="min-h-[44px] flex-1 rounded border border-[#333333] bg-[#222222] px-3 py-2 text-xs font-semibold text-[#EEEEEE] transition-colors hover:border-[#666666]"
            >
              No, I am working
            </button>
            <button
              type="button"
              onClick={() => {
                sound.click();
                onDismissRef.current('Honesty respected. Returning to verification.');
              }}
              className="min-h-[44px] flex-1 rounded bg-[#B84B4B] px-3 py-2 text-xs font-semibold text-[#EEEEEE] transition-colors hover:bg-[#A03E3E]"
            >
              Yes, send help
            </button>
          </div>
        </div>
      )}

      {event.type === 'fake-success' && (
        <div
          className={`w-full max-w-sm rounded-md border p-6 text-center transition-colors duration-150 ${
            betrayed
              ? 'animate-shake border-[#B84B4B] bg-[#191919]'
              : 'border-[#4E8A63] bg-[#16211A]'
          }`}
        >
          {!betrayed ? (
            <>
              <CheckCircle2 className="mx-auto h-10 w-10 text-[#89B898]" />
              <h3 className="mt-3 text-lg font-semibold text-[#EEEEEE]">
                Verification successful.
              </h3>
              <p className="mt-1 text-xs text-[#89B898]">
                Original identity could not be confirmed...
              </p>
            </>
          ) : (
            <>
              <AlertTriangle className="mx-auto h-10 w-10 text-[#B84B4B]" />
              <h3 className="mt-3 text-lg font-semibold text-[#EEEEEE]">
                Just kidding.
              </h3>
              <p className="mt-1 text-xs text-[#929292]">
                Did you really think verification ends that easily?
              </p>
              <button
                type="button"
                onClick={() => onDismissRef.current('Verification successful. Just kidding.')}
                className="mt-4 min-h-[44px] rounded border border-[#333333] bg-[#222222] px-4 py-1.5 text-xs font-semibold text-[#EEEEEE] transition-colors hover:border-[#B84B4B]"
              >
                Continue
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
