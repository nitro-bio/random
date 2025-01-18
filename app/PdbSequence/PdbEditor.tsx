"use client";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { getPDB, INITIAL_PDB_ID } from "./utils";
import { useDebounce } from "@/hooks/useDebounce";
const MoleculeViewer = dynamic(
  async () => {
    const m = await import("@nitro-bio/molstar-easy");
    return m.MoleculeViewer;
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-32 items-center justify-around">
        <Loader2Icon className="h-4 w-4 animate-spin" />
      </div>
    ),
  },
);

export const PDBEditor = () => {
  const [pdbId, setPdbId] = useState(INITIAL_PDB_ID);
  const debouncedPdbId = useDebounce({ value: pdbId, delay: 200 });
  const {
    data: pdbString,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["pdbString", debouncedPdbId],
    queryFn: () => getPDB(debouncedPdbId),
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  if (isFetching) {
    return (
      <div className="mx-auto flex min-h-32 items-center justify-around">
        <Loader2Icon className="h-4 w-4 animate-spin" />
      </div>
    );
  }
  return (
    <div>
      <MoleculeViewer moleculePayloads={[{ pdbString: pdbString }]} />
    </div>
  );
};
