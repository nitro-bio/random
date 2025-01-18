export const INITIAL_PDB_ID = "1cbs";

export const getPDB = async (pdbId: string) => {
  if (!pdbId) return null;
  const response = await fetch(`https://files.rcsb.org/download/${pdbId}.pdb`);
  if (response.ok) {
    return response.text();
  }
  throw new Error("Failed to fetch PDB file.");
};
