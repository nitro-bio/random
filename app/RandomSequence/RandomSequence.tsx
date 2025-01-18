"use client";
import { useDeferredValue, useState } from "react";
import { BaseSelector } from "@/components/BaseSelector";
import { SequenceEditor } from "@/components/SequenceEditor";
import { useStickyState } from "@/hooks/useStickyState";
import { cn } from "@/lib/utils";
import { AMINO_ACIDS, NUCLEOTIDES, PUNCTUATION } from "@/lib/constants";
import { type AriadneSelection } from "@nitro-bio/sequence-viewers";
import dynamic from "next/dynamic";
import { LoaderIcon } from "lucide-react";

const SequenceViewer = dynamic(
  async () => {
    const foo = await import("@nitro-bio/sequence-viewers");
    return foo.SequenceViewer;
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-32 items-center justify-around">
        <LoaderIcon className="h-8 w-8 animate-spin" />
      </div>
    ),
  },
);

export const RandomSequence = ({ className }: { className?: string }) => {
  const [sequence, setSequence] = useStickyState({
    defaultValue: "",
    prefix: "nitro",
    key: "random-sequence",
    version: "0",
  });
  const defferedSequence = useDeferredValue(sequence);
  const [selection, setSelection] = useState<AriadneSelection | null>(null);
  // initial map where all amino acids are false and all nucleotides are true
  const [baseMap, setBaseMap] = useStickyState<Record<string, boolean>>({
    defaultValue: Object.fromEntries(
      [
        PUNCTUATION.map((p) => [p, false]),
        AMINO_ACIDS.map((a) => [a, false]),
        NUCLEOTIDES.map((n) => [n, true]),
      ].flat(),
    ),
    prefix: "nitro-random",
    key: "baseMap",
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
    <section className={cn("flex flex-col gap-4", className)}>
      <BaseSelector baseMap={baseMap} setBaseMap={setBaseMap} />

      <div className="grid gap-4 lg:grid-cols-2">
        <SequenceEditor
          initialSequence={defferedSequence}
          pushSequence={setSequence}
          baseMap={baseMap}
        />

        <SequenceViewer
          sequences={[defferedSequence]}
          annotations={[]}
          selection={selection}
          setSelection={setSelection}
          charClassName={charClassName}
          selectionClassName="relative after:bg-blue-400/30 after:absolute after:-left-px after:right-0 after:inset-y-0 after:z-[-1]"
          containerClassName="max-h-[600px] overflow-y-auto h-fit"
        />
      </div>
    </section>
  );
};
