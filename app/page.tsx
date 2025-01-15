"use client";
import { BaseSelector } from "@/components/BaseSelector";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AMINO_ACIDS, NUCLEOTIDES, PUNCTUATION } from "@/utils/constants";
import { AriadneSelection, SequenceViewer } from "@nitro-bio/sequence-viewers";
import { DicesIcon } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
const MAX_SEQUENCE_LENGTH = 1000;

export default function Home() {
  const [sequences, setSequences] = useState(["ATGC".repeat(20), "", "", ""]);
  const defferedSequences = useDeferredValue(sequences);
  const [selection, setSelection] = useState<AriadneSelection | null>(null);
  const [numSequences, setNumSequences] = useState(1);
  // initial map where all amino acids are false and all nucleotides are true
  const [baseMap, setBaseMap] = useState<Record<string, boolean>>(
    Object.fromEntries(
      [
        AMINO_ACIDS.map((a) => [a, false]),
        NUCLEOTIDES.map((n) => [n, true]),
        PUNCTUATION.map((p) => [p, false]),
      ].flat(),
    ),
  );

  const sequenceNumberSelector = (
    <div className="space-y-2">
      <Select onValueChange={(value) => setNumSequences(parseInt(value))}>
        <SelectTrigger className="w-fit" id="numSequences">
          <SelectValue placeholder="Number of sequences" className="" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">One Sequence</SelectItem>
          <SelectItem value="2">Two Sequences</SelectItem>
          <SelectItem value="3">Three Sequences</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

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
      {sequenceNumberSelector}
      <BaseSelector baseMap={baseMap} setBaseMap={setBaseMap} />

      <div className="grid gap-4 md:grid-cols-3">
        <SequenceEditor
          sequence={defferedSequences[0]}
          setSequence={(seq) => setSequences([seq, sequences[1], sequences[2]])}
          maxLength={MAX_SEQUENCE_LENGTH}
          baseMap={baseMap}
        />
        {numSequences > 1 && (
          <SequenceEditor
            sequence={defferedSequences[1]}
            maxLength={sequences[0].length}
            setSequence={(seq) =>
              setSequences([sequences[0], seq, sequences[2]])
            }
            baseMap={baseMap}
          />
        )}
        {numSequences > 2 && (
          <SequenceEditor
            sequence={defferedSequences[2]}
            maxLength={sequences[0].length}
            setSequence={(seq) =>
              setSequences([sequences[0], sequences[1], seq])
            }
            baseMap={baseMap}
          />
        )}
      </div>
      <section className="">
        <SequenceViewer
          sequences={defferedSequences.slice(0, numSequences)}
          annotations={[]}
          selection={selection}
          setSelection={setSelection}
          charClassName={charClassName}
          selectionClassName="relative after:bg-blue-400/30 after:absolute after:-left-px after:right-0 after:inset-y-0 after:z-[-1]"
          containerClassName="max-h-[600px] overflow-y-auto col-span-2 row-span-2"
        />
      </section>
    </div>
  );
}

const SequenceEditor = ({
  baseMap,
  sequence,
  setSequence,
  maxLength,
  className,
}: {
  baseMap: Record<string, boolean>;
  sequence: string;
  setSequence: (sequence: string) => void;
  maxLength: number;
  className?: string;
}) => {
  const allowedChars = useMemo(
    () => Object.keys(baseMap).filter((key) => baseMap[key]),
    [baseMap],
  );
  useEffect(
    function validateSequence() {
      if (sequence.length > 0) {
        const valid = sequence
          .split("")
          .every((char) => allowedChars.includes(char.toUpperCase()));
        if (!valid) {
          const newSequence = sequence
            .split("")
            .filter((char) => allowedChars.includes(char.toUpperCase()));
          if (
            newSequence.length > 0 &&
            newSequence.length !== sequence.length
          ) {
            console.log(newSequence.join(""));
            setSequence(newSequence.join(""));
          }
        }
      }
    },
    [allowedChars, sequence],
  );

  const [seqLength, setSeqLength] = useState(sequence.length);
  const defferedSeqLength = useDeferredValue(seqLength);
  useEffect(
    function pruneSequenceOnLengthChange() {
      if (sequence.length > maxLength) {
        setSequence(sequence.slice(0, maxLength));
      }
      if (defferedSeqLength > maxLength) {
        setSeqLength(maxLength);
      }
    },
    [maxLength, defferedSeqLength, sequence],
  );

  useEffect(
    function createSequence() {
      if (seqLength < sequence.length) {
        setSequence(sequence.slice(0, seqLength));
        return;
      } else {
        const addition = getRandomSequence(
          seqLength - sequence.length,
          allowedChars.join(""),
        );
        const newSequence = [sequence, addition].join("");
        setSequence(newSequence);
      }
    },
    [defferedSeqLength],
  );

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="space-y-2">
        <Label htmlFor="sequenceLength">Sequence Length</Label>
        <Input
          id="sequenceLength"
          type="number"
          className="w-fit min-w-[180px]"
          value={seqLength}
          max={maxLength}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            setSeqLength(value > maxLength ? maxLength : value);
          }}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sequenceInput">Sequence</Label>
        <Textarea
          id="sequenceInput"
          placeholder="Sequence"
          value={sequence}
          onChange={(e) => setSequence(e.target.value.toUpperCase())}
        />
      </div>
      <span className="grid gap-2 md:grid-cols-2">
        <Button
          onClick={() =>
            setSequence(getRandomSequence(seqLength, allowedChars.join("")))
          }
          variant="outline"
        >
          <DicesIcon className="mr-2 h-6 w-6" />
          Randomize
        </Button>
        <CopyButton label={"Copy"} textToCopy={() => sequence} />
      </span>
    </div>
  );
};
const getRandomSequence = (length: number, chars: string) => {
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
};

const charClassName = ({ sequenceIdx }: { sequenceIdx: number }) => {
  if (sequenceIdx === 0) {
    return "dark:text-zinc-100 text-zinc-900";
  } else if (sequenceIdx === 1) {
    return "dark:text-emerald-200 text-emerald-600";
  } else {
    return "dark:text-fuchsia-200 text-fuchsia-600";
  }
};
