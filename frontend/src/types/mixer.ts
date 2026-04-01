export interface MixModeOption {
  value: number;
  label: string;
  description: string;
}

export enum MixMode {
  ADD = 0,
  MULTIPLY = 1,
  RING_MOD = 2,
}

export const MIX_MODES: readonly MixModeOption[] = [
  { value: MixMode.ADD, label: 'Add', description: 'Linear mix' },
  { value: MixMode.MULTIPLY, label: 'Multiply', description: 'Ring modulation with balance' },
  { value: MixMode.RING_MOD, label: 'Ring Mod', description: 'Pure ring modulation' },
] as const;
