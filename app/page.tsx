"use client";
import { BaseSelector } from "@/components/BaseSelector";
import { SequenceEditor } from "@/components/SequenceEditor";
import { cn } from "@/lib/utils";
import { AMINO_ACIDS, NUCLEOTIDES, PUNCTUATION } from "@/utils/constants";
import { useStickyState } from "@/hooks/useStickyState";
import { AriadneSelection, SequenceViewer } from "@nitro-bio/sequence-viewers";
import { useDeferredValue, useState } from "react";

export default function Home() {
  const [sequence, setSequence] = useStickyState({
    defaultValue: "",
    prefix: "nitro-random",
    key: "sequence",
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
      "hover:bg-zinc-800/80 hover:border-[0.25px] hover:border-zinc-400",
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
    <div className="mx-auto h-full w-full max-w-6xl flex-col space-y-4 p-4">
      <section className="flex flex-col items-start gap-1 pb-6 pt-4">
        <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]">
          Sequence Generator
        </h1>
        <p className="max-w-2xl text-lg font-light text-foreground">
          A simple tool to generate random amino acid and nucleotide sequences
        </p>
      </section>
      <BaseSelector baseMap={baseMap} setBaseMap={setBaseMap} />

      <div className="grid gap-4 md:grid-cols-2">
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
    </div>
  );
}
