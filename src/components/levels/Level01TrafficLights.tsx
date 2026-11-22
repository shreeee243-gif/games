import React, { useMemo, useState } from 'react';
import { Check, Search } from 'lucide-react';
import { evaluateGridSelection } from '../../game/engine';
import type { LevelComponentProps } from '../../game/types';
import { sound } from '../../utils/sound';
import { CaptchaTileArt, type TileArtKind } from '../CaptchaTileArt';

interface GridItem {
  id: string;
  art: TileArtKind;
  label: string;
  isTarget: boolean;
  tiny?: boolean;
}

const ITEMS: GridItem[] = [
  { id: 'tl-1', art: 'photo-traffic-main', label: 'Rainy street intersection with overhead traffic light', isTarget: true },
  { id: 'tl-2', art: 'photo-desert-clean', label: 'Dry desert horizon', isTarget: false },
  { id: 'tl-3', art: 'photo-espresso-tiny-light', label: 'Cafe espresso cup with a microscopic traffic light near the handle', isTarget: true, tiny: true },
  { id: 'tl-4', art: 'svg-stoplight-popsicle', label: 'Tri-color popsicle shaped suspiciously like a stoplight', isTarget: false },
  { id: 'tl-5', art: 'photo-traffic-crop-corner', label: 'Close-up of hanging dusk traffic signal', isTarget: true },
  { id: 'tl-6', art: 'photo-bus-clean', label: 'Red bus behind leafy tree', isTarget: false },
  { id: 'tl-7', art: 'svg-cactus-tiny-light', label: 'Potted cactus with a tiny traffic light hiding by the pot', isTarget: true, tiny: true },
  { id: 'tl-8', art: 'svg-streetlamp-only', label: 'Single street lamp at night', isTarget: false },
  { id: 'tl-9', art: 'photo-van-clean', label: 'Yellow delivery van on city street', isTarget: false },
];

const REQUIRED = ITEMS.filter((i) => i.isTarget).map((i) => i.id);

export const Level01TrafficLights: React.FC<LevelComponentProps> = ({
  levelAttempts,
  shuffleSeed,
  onSuccess,
  onFail,
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [magnify, setMagnify] = useState(false);

  const orderedItems = useMemo(() => {
    if (shuffleSeed === 0) return ITEMS;
    const copy = [...ITEMS];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = (shuffleSeed * (i + 7)) % (i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [shuffleSeed]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const exists = prev.includes(id);
      sound.tileToggle(!exists);
      return exists ? prev.filter((item) => item !== id) : [...prev, id];
    });
  };

  const handleVerify = () => {
    const result = evaluateGridSelection(selected, REQUIRED);
    if (result.passed) {
      onSuccess('Wait, you actually spotted the 4-pixel espresso traffic light?');
      return;
    }
    if (result.extra.includes('tl-4')) {
      onFail('That is a frozen fruit popsicle. Are your optical sensors overheating?');
      return;
    }
    if (result.missed.includes('tl-3') || result.missed.includes('tl-7')) {
      onFail(
        'Missed a traffic light. Look closer at the coffee table and the cactus—yes, those 8 pixels legally count.',
      );
      return;
    }
    onFail('Incomplete selection. Re-scan every square like your citizenship depends on it.');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#929292]">
        <span>
          Selected: <strong className="font-mono-tabular text-[#EEEEEE]">{selected.length}</strong>
        </span>
        {levelAttempts >= 1 && (
          <button
            type="button"
            onClick={() => {
              sound.click();
              setMagnify((m) => !m);
            }}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-[#333333] bg-[#222222] px-3 py-1.5 text-xs font-medium text-[#EEEEEE] transition-colors hover:border-[#B84B4B] hover:text-white active:scale-[0.98]"
          >
            <Search className="h-3.5 w-3.5 text-[#D48A8A]" />
            {magnify ? 'Disable Squint Lens' : 'Enable Squint Lens'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {orderedItems.map((item) => {
          const isSelected = selected.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              aria-pressed={isSelected}
              aria-label={item.label}
              className={`group relative aspect-square w-full overflow-hidden rounded-md border-2 transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B84B4B] ${
                isSelected
                  ? 'scale-[0.96] border-[#B84B4B] ring-1 ring-[#B84B4B]/40'
                  : 'border-[#333333] hover:border-[#555555]'
              }`}
            >
              <CaptchaTileArt kind={item.art} alt={item.label} magnified={magnify} />
              {isSelected && (
                <span className="animate-pop absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#B84B4B] text-[#EEEEEE]">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-[#929292]">
          {levelAttempts > 0 ? 'Hint: Tiny decorative signals still count.' : 'Click every qualifying tile.'}
        </span>
        <button
          type="button"
          onClick={handleVerify}
          className="min-h-[44px] rounded-md bg-[#B84B4B] px-6 py-2.5 text-sm font-semibold text-[#EEEEEE] transition-colors hover:bg-[#A03E3E] active:scale-[0.98]"
        >
          Verify
        </button>
      </div>
    </div>
  );
};
