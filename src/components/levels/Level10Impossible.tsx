import React, { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { evaluateGridSelection } from '../../game/engine';
import type { LevelComponentProps } from '../../game/types';
import { sound } from '../../utils/sound';
import { CaptchaTileArt, type TileArtKind } from '../CaptchaTileArt';

interface ImpossibleTile {
  id: string;
  art: TileArtKind;
  label: string;
  neverExisted: boolean;
}

const TILES: ImpossibleTile[] = [
  { id: 'imp-1', art: 'photo-impossible-stairs', label: 'Impossible Penrose staircase floating in glass orb', neverExisted: true },
  { id: 'imp-2', art: 'photo-real-bus-10', label: 'Ordinary red double-decker city bus', neverExisted: false },
  { id: 'imp-3', art: 'svg-bugfree-deploy', label: 'A bug-free Friday 5pm production deploy', neverExisted: true },
  { id: 'imp-4', art: 'photo-real-espresso-10', label: 'Cup of espresso and croissant', neverExisted: false },
  { id: 'imp-5', art: 'svg-usb-first-try', label: 'USB-A cable plugged in right side up on the first try', neverExisted: true },
  { id: 'imp-6', art: 'svg-real-traffic-cone', label: 'Orange striped traffic cone', neverExisted: false },
  { id: 'imp-7', art: 'svg-monday-motivation', label: '404 Your Motivation on Monday', neverExisted: true },
  { id: 'imp-8', art: 'photo-real-street-10', label: 'Rainy city street crosswalk', neverExisted: false },
  { id: 'imp-9', art: 'svg-quiet-mech-kb', label: 'Silent blue-switch mechanical keyboard', neverExisted: true },
];

const REQUIRED = TILES.filter((t) => t.neverExisted).map((t) => t.id);

export const Level10Impossible: React.FC<LevelComponentProps> = ({
  shuffleSeed,
  onSuccess,
  onFail,
}) => {
  const [selected, setSelected] = useState<string[]>([]);

  const ordered = useMemo(() => {
    if (shuffleSeed === 0) return TILES;
    const copy = [...TILES];
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
      return exists ? prev.filter((x) => x !== id) : [...prev, id];
    });
  };

  const handleVerify = () => {
    const result = evaluateGridSelection(selected, REQUIRED);
    if (result.passed) {
      onSuccess('Painfully accurate grasp of human disappointment. Passing you reluctantly.');
      return;
    }
    if (result.extra.length > 0) {
      onFail('Coffee, buses, streets, and traffic cones definitely exist. Step outside sometime.');
      return;
    }
    onFail(
      'You missed a myth! Remember: Penrose stairs, bug-free Friday deploys, 1st-try USB-A, Monday motivation, and silent blue switches are all fiction.',
    );
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
              className={`relative aspect-square w-full overflow-hidden rounded-md border-2 transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF4444] ${
                isSelected
                  ? 'scale-[0.96] border-[#EF4444] ring-2 ring-[#EF4444]/40'
                  : 'border-[#252A34] hover:border-[#525A6B]'
              }`}
            >
              <CaptchaTileArt kind={tile.art} alt={tile.label} />
              {isSelected && (
                <span className="animate-pop absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#DC2626] text-white shadow-md">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-[#9BA1AE]">
          Selected: <strong className="font-mono-tabular text-[#F2F0EB]">{selected.length}</strong> / 5 myths
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
