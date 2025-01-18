"use client";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { AriadneSelection } from "@nitro-bio/sequence-viewers";
import { Loader2Icon, XIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { memo, useMemo } from "react";
const MoleculeViewer = dynamic(
  async () => {
    const m = await import("@nitro-bio/molstar-easy");
    return m.MoleculeViewer;
  },
  {
    ssr: false,
    loading: () => (
      <div className={cn("flex h-80 items-center justify-center")}>
        <Loader2Icon className="h-4 w-4 animate-spin" />
      </div>
    ),
  },
);
const MoleculeSection = memo(
  ({
    pdbString,
    error,
    isFetching,
    selection,
    className,
  }: {
    pdbString?: string | null;
    error?: Error;
    isFetching?: boolean;
    selection: AriadneSelection | null;
    className?: string;
  }) => {
    const debouncedSelection = useDebounce<AriadneSelection | null>({
      value: selection,
      delay: 500,
    });

    const selectionHighlights = useMemo(() => {
      if (!debouncedSelection) return [];
      const { start, end } = debouncedSelection;
      // TODO: handle selection over seam
      return [
        {
          start,
          end,
          label: {
            text: "⠀", // hides label
            hexColor: "#0ea5e9", // sky-500
          },
        },
      ];
    }, [debouncedSelection]);

    const moleculePayloads = useMemo(() => {
      return [
        {
          pdbString: pdbString ?? "",
          highlights: selectionHighlights,
          structureHexColor: "#f4f4f5", // zinc-100
        },
      ];
    }, [pdbString, selectionHighlights]);

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <div
        className={cn(
          className,
          "flex h-80 items-center justify-center text-red-400",
        )}
      >
        {children}
      </div>
    );
    if (error) {
      return (
        <Wrapper>
          <XIcon className="h-4 w-4 text-red-400" />
          <span className="ml-2">Failed to fetch PDB</span>
        </Wrapper>
      );
    }
    if (isFetching) {
      return (
        <Wrapper>
          <Loader2Icon className="h-4 w-4 animate-spin" />
        </Wrapper>
      );
    }
    if (!pdbString) {
      return (
        <Wrapper>
          <span>No PDB found</span>
        </Wrapper>
      );
    }
    return (
      <Wrapper>
        <MoleculeViewer
          moleculePayloads={moleculePayloads}
          // bg-zinc-900
          backgroundHexColor="#18181b"
          className="h-80"
        />
      </Wrapper>
    );
  },
);
MoleculeSection.displayName = "MoleculeSection";
export default MoleculeSection;
