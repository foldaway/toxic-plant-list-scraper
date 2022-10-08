export const ToxicPlants = {
  cats: 'Cats' as const,
};

export type ToxicPlants = typeof ToxicPlants[keyof typeof ToxicPlants];
