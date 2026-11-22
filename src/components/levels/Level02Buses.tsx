import React, { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { evaluateGridSelection } from '../../game/engine';
import type { LevelComponentProps } from '../../game/types';
import { sound } from '../../utils/sound';
import { CaptchaTileArt, type TileArtKind } from '../CaptchaTileArt';

interface BusTile {
  id: string;
  art: TileArtKind;
  label: string;
  isActualBus: boolean;
  isAmendedBus: boolean;
}

const TILES: BusTile[] = [
  { id: 'bus-1', art: 'photo-bus-hidden-tree', label: 'Red city bus partially hidden behind tree branches', isActualBus: true, isAmendedBus: true },
  { id: 'bus-2', art: 'svg-bread-bus', label: 'Yellow loaf of brioche bread with windows painted on', isActualBus: false, isAmendedBus: false },
  { id: 'bus-3', art: 'photo-boxy-van', label: 'Boxy yellow vintage delivery van', isActualBus: false, isAmendedBus: true },
  { id: 'bus-4', art: 'svg-usb-bus', label: 'Circuit board labeled USB BUS 5V SERIAL', isActualBus: false, isAmendedBus: true },
  { id: 'bus-5', art: 'photo-bus-zoomed', label: 'Zoomed-in view of red transit bus windshield', isActualBus: true, isAmendedBus: true },
  { id: 'bus-6', art: 'svg-submarine-wheels', label: 'Yellow submarine on rubber tires', isActualBus: false, isAmendedBus: false },
  { id: 'bus-7', art: 'svg-toy-bus-grass', label: 'Small yellow toy bus sitting in grass', isActualBus: true, isAmendedBus: true },
  { id: 'bus-8', art: 'photo-street-no-bus', label: 'Wet night crosswalk with taxi and sedan', isActualBus: false, isAmendedBus: false },
  { id: 'bus-9', art: 'photo-espresso-clean', label: 'Espresso cup and croissant on table', isActualBus: false, isAmendedBus: false },
];

const NORMAL_REQUIRED = TILES.filter((t) => t.isActualBus).map((t) => t.id);
const AMENDED_REQUIRED = TILES.filter((t) => t.isAmendedBus).map((t) => t.id);

export const Level02Buses: React.FC<LevelComponentProps> = ({
  shuffleSeed,
  onSuccess,
  onFail,
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [ruleMutated, setRuleMutated] = useState(false);

  const ordered = useMemo(() => {
    if (shuffleSeed === 0) return TILES;
    const copy = [...TILES];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = (shuffleSeed * (i + 3)) % (i + 1);
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
    if (!ruleMutated) {
      const normalCheck = evaluateGridSelection(selected, NORMAL_REQUIRED);
      const amendedCheck = evaluateGridSelection(selected, AMENDED_REQUIRED);

      if (amendedCheck.passed) {
        onSuccess(
          'Whoa—you included the USB Bus AND the emotional-support van on try one?!',
          'bus-first-try',
        );
        return;
      }

      if (normalCheck.passed) {
        setRuleMutated(true);
        sound.glitch();
        onFail(
          'Technically correct, therefore REJECTED. Updated Rule 2B: Include the boxy yellow van (it identifies as a bus) AND the literal USB Bus.',
          false,
        );
        return;
      }

      if (selected.includes('bus-2')) {
        onFail('Sir, that is literally a brioche loaf with crayon windows.');
        return;
      }
      if (selected.includes('bus-6')) {
        onFail('A yellow submarine with wheels is a felony, not public transit.');
        return;
      }
      onFail('You missed a bus! Check behind the tree and down in the grass.');
      return;
    }

    const finalCheck = evaluateGridSelection(selected, AMENDED_REQUIRED);
    if (finalCheck.passed) {
      onSuccess('Bureaucratic compliance achieved. The USB Bus thanks you for your recognition.');
    } else if (selected.includes('bus-2')) {
      onFail('Still NOT bread. Read Amendment 2B carefully.');
    } else {
      onFail(
        'Check Amendment 2B: Select all 3 real/toy buses + the boxy yellow van + the USB Bus.',
      );
    }
  };

  return (
    <div className="space-y-4">
      {ruleMutated && (
        <div className="rounded-md border border-[#B84B4B]/45 bg-[#241919] px-3 py-2 text-xs text-[#D48A8A]">
          <strong className="font-mono-tabular uppercase tracking-wide text-[#EEEEEE]">
            Rule Amendment 2B:{' '}
          </strong>
          Also select the boxy yellow van AND the USB Bus. Do NOT select the bread.
        </div>
      )}

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
              className={`relative aspect-square w-full overflow-hidden rounded-md border-2 transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B84B4B] ${
                isSelected
                  ? 'scale-[0.96] border-[#B84B4B] ring-1 ring-[#B84B4B]/40'
                  : 'border-[#333333] hover:border-[#555555]'
              }`}
            >
              <CaptchaTileArt kind={tile.art} alt={tile.label} />
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
          Selected: <strong className="font-mono-tabular text-[#EEEEEE]">{selected.length}</strong>
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
