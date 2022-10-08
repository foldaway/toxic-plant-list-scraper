export type Animal = 'cat' | 'dog' | 'horse';

export type Plant = {
  name: string;
  commonNames: string[];
  scientificName: string;
  family: string | null;
  link: string;
  toxicTo: Animal[];
  imageUrl: string | null;
  toxicPrinciples: string | null;
  clinicalSigns: string | null;
};
