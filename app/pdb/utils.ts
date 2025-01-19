export const INITIAL_PDB_ID = "1cbs";

export const getPDBString = async (pdbId: string) => {
  if (!pdbId) return null;
  const response = await fetch(`https://files.rcsb.org/download/${pdbId}.pdb`);
  if (response.ok) {
    return response.text();
  }
  throw new Error("Failed to fetch PDB file.");
};

export const pdbToSequence = (pdbContent: string): string => {
  const aminoAcids: { [key: string]: string } = {
    ALA: "A",
    ARG: "R",
    ASN: "N",
    ASP: "D",
    CYS: "C",
    GLN: "Q",
    GLU: "E",
    GLY: "G",
    HIS: "H",
    ILE: "I",
    LEU: "L",
    LYS: "K",
    MET: "M",
    PHE: "F",
    PRO: "P",
    SER: "S",
    THR: "T",
    TRP: "W",
    TYR: "Y",
    VAL: "V",
  };

  const lines = pdbContent.split("\n");
  let sequence = "";
  let prevResNum = "";

  for (const line of lines) {
    if (line.startsWith("ATOM") && line.substring(12, 16).trim() === "CA") {
      const resName = line.substring(17, 20).trim();
      const resNum = line.substring(22, 26).trim();

      if (resNum !== prevResNum) {
        sequence += aminoAcids[resName] || "X";
        prevResNum = resNum;
      }
    }
  }

  return sequence;
};
