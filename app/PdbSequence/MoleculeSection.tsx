"use client";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { AriadneSelection } from "@nitro-bio/sequence-viewers";
import { Loader2Icon, XIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { memo, useMemo } from "react";
import { pdbToSequence } from "./utils";
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
    mask,
    className,
  }: {
    pdbString?: string | null;
    error?: Error;
    isFetching?: boolean;
    selection: AriadneSelection | null;
    className?: string;
    mask: [number, number] | null;
  }) => {
    const debouncedSelection = useDebounce<AriadneSelection | null>({
      value: selection,
      delay: 500,
    });
    const debouncedMask = useDebounce<[number, number] | null>({
      value: mask,
      delay: 500,
    });

    const memoizedMoleculeViewer = useMemo(() => {
      const sequenceLength = pdbToSequence(pdbString ?? "").length;

      const selectionHighlights = debouncedSelection
        ? createHighlights({
            start: debouncedSelection.start,
            end: debouncedSelection.end,
            sequenceLength,
            label: {
              text: "⠀", // hides label
              hexColor: "#0ea5e9", // sky-500
            },
          })
        : [];

      const indexToColor = (() => {
        const maskHighlights = debouncedMask
          ? createHighlights({
              start: debouncedMask[0],
              end: debouncedMask[1],
              sequenceLength,
              label: {
                text: "⠀", // hides label
                hexColor: "#3f3f46", // zinc-700
              },
            })
          : [];
        const res = new Map(
          Array.from({ length: sequenceLength }, (_, i) => i).map((i) => [
            // if index in any of the highlights, return the color
            i,
            maskHighlights.some(
              (highlight) => i >= highlight.start && i < highlight.end,
            )
              ? "#500724" // zinc-700 if in mask
              : "#f4f4f5", // zinc-100 if not in mask
          ]),
        );
        return res;
      })();

      const moleculePayloads = [
        {
          pdbString: pdbString ?? "",
          highlights: selectionHighlights,
          indexToColor,
          structureHexColor: "#f4f4f5", // zinc-100
        },
      ];
      return (
        <MoleculeViewer
          moleculePayloads={moleculePayloads}
          // bg-zinc-900
          backgroundHexColor="#18181b"
          className="h-80"
        />
      );
    }, [debouncedSelection, pdbString, debouncedMask]);

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <div
        className={cn(
          className,
          "flex h-80 items-center justify-center text-rose-400",
        )}
      >
        {children}
      </div>
    );
    if (error) {
      return (
        <Wrapper>
          <XIcon className="h-4 w-4 text-rose-400" />
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
    return <Wrapper>{memoizedMoleculeViewer}</Wrapper>;
  },
);
MoleculeSection.displayName = "MoleculeSection";
export default MoleculeSection;

const createHighlights = ({
  start,
  end,
  sequenceLength,
  label,
}: {
  start: number;
  end: number;
  sequenceLength: number;
  label: {
    text: string;
    hexColor: string;
  };
}) => {
  const highlights = [];
  if (start > end) {
    highlights.push({
      start: 0,
      end,
      label,
    });
    highlights.push({
      start,
      end: sequenceLength,
      label,
    });
  } else {
    highlights.push({
      start,
      end,
      label,
    });
  }
  return highlights;
};
