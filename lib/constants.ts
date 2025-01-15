export const NUCLEOTIDES = ["A", "T", "G", "C"] as const;
export type Nucleotide = (typeof NUCLEOTIDES)[number];
export const AMINO_ACIDS = [
  "A",
  "R",
  "N",
  "D",
  "C",
  "Q",
  "E",
  "G",
  "H",
  "I",
  "L",
  "K",
  "M",
  "F",
  "P",
  "S",
  "T",
  "W",
  "Y",
  "V",
] as const;
export type AminoAcid = (typeof AMINO_ACIDS)[number];
export const PUNCTUATION = ["-", "*", " ", ".", "_"] as const;
export type Punctuation = (typeof PUNCTUATION)[number];
