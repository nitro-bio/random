"use client";
import { BaseSelector } from "@/components/BaseSelector";
import { Button } from "@/components/ui/button";
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
import { CopyIcon, DicesIcon } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
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
        <SelectTrigger className="w-[180px]" id="numSequences">
          <SelectValue placeholder="Number of sequences" />
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
      <BaseSelector baseMap={baseMap} setBaseMap={setBaseMap} />

      {sequenceNumberSelector}

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
          selectionClassName="relative after:bg-zinc-400/20 after:absolute after:-left-px after:right-0 after:inset-y-0 after:z-[-1]"
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
  const allowedChars = Object.keys(baseMap).filter((key) => baseMap[key]);
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
            setSequence(newSequence.join(""));
          }
        }
      }
    },
    [allowedChars, sequence],
  );

  const [seqLength, setSeqLength] = useState(sequence.length);
  useEffect(
    function pruneSequenceOnLengthChange() {
      if (sequence.length > maxLength) {
        setSequence(sequence.slice(0, maxLength));
      }
      if (seqLength > maxLength) {
        setSeqLength(maxLength);
      }
    },
    [maxLength, seqLength, sequence],
  );

  const randomizeSequence = () => {
    const chars = sequence.split("");
    shuffle(chars);
    setSequence(chars.join(""));
  };

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
    [seqLength],
  );

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="space-y-2">
        <Label htmlFor="sequenceLength">Sequence Length</Label>
        <Input
          id="sequenceLength"
          type="number"
          className="w-fit min-w-[180px]"
          value={sequence.length}
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
        <Button onClick={randomizeSequence} variant="secondary">
          <DicesIcon className="mr-2 h-6 w-6" />
          Randomize
        </Button>
        <Button onClick={() => navigator.clipboard.writeText(sequence)}>
          <CopyIcon className="mr-2 h-6 w-6" />
          Copy
        </Button>
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
    return "dark:text-brand-300 text-brand-600";
  } else if (sequenceIdx === 1) {
    return "dark:text-indigo-300 text-indigo-600";
  } else {
    return "dark:text-amber-300 text-amber-600";
  }
};
function shuffle(chars: string[]) {
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
}
