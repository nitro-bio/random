"use client";

import { BaseSelector } from "@/components/BaseSelector";
import { useStickyState } from "@/hooks/useStickyState";
import { AMINO_ACIDS, NUCLEOTIDES, PUNCTUATION } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { AriadneSelection, SequenceViewer } from "@nitro-bio/sequence-viewers";
import { memo } from "react";
export const SequenceSection = memo(
  ({
    sequence,
    selection,
    selectionClassName,
    setSelection,
    storageKey,
    className,
  }: {
    storageKey: string;
    sequence?: string;
    selection: AriadneSelection | null;
    setSelection: (selection: AriadneSelection | null) => void;
    selectionClassName?: string;
    className?: string;
  }) => {
    // initial map where all amino acids are true, rest are false
    const [baseMap, setBaseMap] = useStickyState<Record<string, boolean>>({
      defaultValue: Object.fromEntries(
        [
          PUNCTUATION.map((p) => [p, false]),
          NUCLEOTIDES.map((n) => [n, false]),
          AMINO_ACIDS.map((a) => [a, true]),
        ].flat(),
      ),
      prefix: "nitro-pdb-basemap",
      key: storageKey,
      version: "0",
    });
    const allowedBases = Object.keys(baseMap).filter((key) => baseMap[key]);

    const charClassName = ({ base }: { base: { base: string } }) => {
      const classNames = [
        "hover:bg-zinc-800/80 hover:outline hover:outline-[0.25px] hover:outline-zinc-400",
        "hover:scale-[200%]",
      ];
      if (!allowedBases.includes(base.base)) {
        classNames.push("text-red-400 underline");
      } else {
        classNames.push("text-zinc-100");
      }
      return cn(...classNames);
    };

    return (
      <div className={cn(className)}>
        <BaseSelector
          baseMap={baseMap}
          setBaseMap={setBaseMap}
          className="-mb-2"
        />
        <SequenceViewer
          sequences={[sequence ?? ""]}
          annotations={[]}
          selection={selection}
          setSelection={setSelection}
          charClassName={charClassName}
          selectionClassName={
            selectionClassName
              ? selectionClassName
              : "relative after:bg-sky-500/60 after:absolute after:-left-px after:right-0 after:inset-y-0 after:z-[-1] text-sky-100"
          }
          containerClassName="max-h-[600px] overflow-y-auto h-fit pr-6"
        />
      </div>
    );
  },
);
SequenceSection.displayName = "SequenceSection";
export default SequenceSection;
