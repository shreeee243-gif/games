import React, { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { evaluateGridSelection } from '../../game/engine';
import type { LevelComponentProps } from '../../game/types';
import { sound } from '../../utils/sound';
import { CaptchaTileArt, type TileArtKind } from '../CaptchaTileArt';

interface WaterTile {
  id: string;
  art: TileArtKind;
  label: string;
  hint: string;
  isWater: boolean;
}

const WATER_TILES: WaterTile[] = [
  { id: 'w-1', art: 'photo-rain-reflection', label: 'Rain-soaked street reflection', hint: 'Obvious rain puddle', isWater: true },
  { id: 'w-2', art: 'svg-dry-rock', label: 'Dry gray rock', hint: 'Zero hydration detected', isWater: false },
  { id: 'w-3', art: 'photo-desert-watermark', label: 'Dry desert photo stamped with a giant WATERMARK', hint: 'Literally says WATER on it', isWater: true },
  { id: 'w-4', art: 'svg-empty-cup', label: 'Empty glass labeled 0% H2O', hint: 'Bone dry glass', isWater: false },
  { id: 'w-5', art: 'photo-espresso-h2o', label: 'Hot cup of black espresso', hint: 'Chemically 98% water', isWater: true },
  { id: 'w-6', art: 'svg-fire-hydrant', label: 'Broken fire hydrant labeled OUT OF ORDER', hint: 'Shut off since 2018', isWater: false },
  { id: 'w-7', art: 'svg-crying-cloud', label: 'Crying cloud shedding blue tears', hint: 'Emotional precipitation', isWater: true },
  { id: 'w-8', art: 'svg-desert-cactus', label: 'Cracked dry desert floor', hint: 'Just sand and despair', isWater: false },
  { id: 'w-9', art: 'svg-brick-wall', label: 'Dry red brick wall', hint: 'Masonry, not H2O', isWater: false },
];

const REQUIRED = WATER_TILES.filter((t) => t.isWater).map((t) => t.id);

export const Level06Water: React.FC<LevelComponentProps> = ({
  levelAttempts,
  shuffleSeed,
  onSuccess,
  onFail,
}) => {
  const [selected, setSelected] = useState<string[]>([]);

  const ordered = useMemo(() => {
    if (shuffleSeed === 0) return WATER_TILES;
    const copy = [...WATER_TILES];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = (shuffleSeed * (i + 5)) % (i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [shuffleSeed]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const exists = prev.includes(id);
      sound.tileToggle(!exists);
      return exists ? prev.filter((x) => x !== id) : [...prev, id];
    });
  };

  const handleVerify = () => {
    const result = evaluateGridSelection(selected, REQUIRED);
    if (result.passed) {
      onSuccess('Pedantic chemistry AND terrible puns mastered. Moving on.');
      return;
    }
    if (result.missed.includes('w-3')) {
      onFail('You skipped the desert! It has a giant WATERMARK on it. That legally contains water.');
      return;
    }
    if (result.missed.includes('w-5')) {
      onFail('Coffee is 98% water. Did you skip human biology class?');
      return;
    }
    if (result.extra.includes('w-6')) {
      onFail('That fire hydrant clearly says OUT OF ORDER. Dry as a desert.');
      return;
    }
    onFail('Incorrect hydration audit. Remember: rain, watermarks, espresso, and cloud tears all count.');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {ordered.map((tile) => {
          const isSelected = selected.includes(tile.id);
          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => toggle(tile.id)}
              aria-pressed={isSelected}
              aria-label={tile.label}
              title={levelAttempts > 0 ? tile.hint : undefined}
              className={`group relative aspect-square w-full overflow-hidden rounded-md border-2 transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF4444] ${
                isSelected
                  ? 'scale-[0.96] border-[#EF4444] ring-2 ring-[#EF4444]/40'
                  : 'border-[#252A34] hover:border-[#525A6B]'
              }`}
            >
              <CaptchaTileArt kind={tile.art} alt={tile.label} />
              {levelAttempts >= 1 && (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/80 px-1 py-0.5 text-[10px] leading-tight text-[#E5E7EB]">
                  {tile.hint}
                </span>
              )}
              {isSelected && (
                <span className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#DC2626] text-white shadow-md">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-[#9BA1AE]">
          Selected: <strong className="font-mono-tabular text-[#F2F0EB]">{selected.length}</strong>
        </span>
        <button
          type="button"
          onClick={handleVerify}
          className="min-h-[44px] rounded-md bg-[#DC2626] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B91C1C] active:scale-[0.98]"
        >
          Verify
        </button>
      </div>
    </div>
  );
};
