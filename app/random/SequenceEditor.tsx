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
import { useDebounce } from "@/hooks/useDebounce";
import { useStickyState } from "@/hooks/useStickyState";
import { AMINO_ACIDS, NUCLEOTIDES, PUNCTUATION } from "@/lib/constants";
import { cn, createQueryString } from "@/lib/utils";
import {
  SequenceViewer,
  type AriadneSelection,
} from "@nitro-bio/sequence-viewers";
import { DicesIcon, FilterIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import { useForm } from "react-hook-form";

export const RandomSequenceSection = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [sequence, setSequence] = useState(
    searchParams.get("initialSequence") ?? "ATGCATGCATGCATGCATGCATGCATGCATGC",
  );
  const debouncedSequence = useDebounce({
    value: sequence,
    delay: 500,
  });
  useEffect(
    function setSequenceInSearchParams() {
      const newParams = createQueryString(
        "initialSequence",
        debouncedSequence,
        searchParams,
      );
      router.push(pathname + "?" + newParams);
    },
    [debouncedSequence],
  );

  const [mode, setMode] = useState<"text" | "fasta">(
    (searchParams.get("mode") as "text" | "fasta") ?? "text",
  );
  useEffect(
    function setModeInSearchParams() {
      const newParams = createQueryString("mode", mode, searchParams);
      router.push(pathname + "?" + newParams);
    },
    [mode],
  );

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
      classNames.push("text-rose-400 underline");
    } else {
      classNames.push("text-zinc-100");
    }
    return cn(...classNames);
  };

  return (
    <section className={cn("flex flex-col gap-4")}>
      <BaseSelector baseMap={baseMap} setBaseMap={setBaseMap} />

      <div className="grid gap-4 lg:grid-cols-2">
        <SequenceEditor
          initialSequence={debouncedSequence}
          pushSequence={setSequence}
          baseMap={baseMap}
          outputMode={mode}
          setOutputMode={setMode}
        />

        <SequenceViewer
          sequences={[debouncedSequence]}
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

export const SequenceEditor = ({
  baseMap,
  initialSequence,
  pushSequence,
  outputMode,
  setOutputMode,
  className,
}: {
  outputMode: "text" | "fasta";
  setOutputMode: (mode: "text" | "fasta") => void;
  baseMap: Record<string, boolean>;
  initialSequence: string;
  pushSequence: (sequence: string) => void;
  className?: string;
}) => {
  const allowedChars = useMemo(
    () => Object.keys(baseMap).filter((key) => baseMap[key]),
    [baseMap],
  );

  const { register, setValue, getValues, watch } = useForm({
    defaultValues: {
      Sequence: initialSequence,
      "Sequence Length": initialSequence.length,
    },
  });
  const setSequence = (value: string) => setValue("Sequence", value);
  const setSequenceLength = (value: number) =>
    setValue("Sequence Length", value);
  const watchedSequence = watch("Sequence");
  const debouncedSequence = useDebounce({
    value: watchedSequence,
    delay: 50,
  });
  useEffect(() => {
    if (debouncedSequence) {
      pushSequence(debouncedSequence.toUpperCase());
    }
  }, [debouncedSequence, pushSequence]);

  const outputModeSelector = (
    <div className="flex-1 space-y-2">
      <Select
        onValueChange={(value) => setOutputMode(value as "text" | "fasta")}
      >
        <SelectTrigger className="" id="numSequences">
          <SelectValue placeholder={outputMode} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="text">Text</SelectItem>
          <SelectItem value="fasta">Fasta</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="sequenceLength">Sequence Length</Label>
        <Input
          className="w-fit min-w-[180px]"
          type="number"
          placeholder="Sequence Length"
          {...register("Sequence Length", {
            min: 0,
            onChange: (e) => {
              const newLen = parseInt(e.target.value);
              const sequence = getValues("Sequence");
              if (sequence.length > newLen) {
                setSequence(sequence.slice(0, newLen));
              } else if (sequence.length < newLen) {
                const delta = newLen - sequence.length;
                const addition = getRandomSequence(
                  delta,
                  allowedChars.join(""),
                );
                setSequence(sequence + addition);
              }
            },
          })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="sequenceInput">Sequence</Label>
        <Textarea
          className="whitespace-pre-line"
          {...register("Sequence", {
            onChange: (e) => {
              const newLen = e.target.value.length;
              setSequenceLength(newLen);
            },
          })}
        />
        <span className="mt-2 grid gap-2 md:grid-cols-2">
          <Button
            onClick={() => {
              const sequence = getValues("Sequence");
              const filtered = sequence
                .split("")
                .filter((char) => allowedChars.includes(char));
              setSequence(filtered.join(""));
              setSequenceLength(filtered.length);
            }}
            variant="outline"
            className="border-rose-600/20 bg-rose-800/10"
          >
            <FilterIcon className="mr-2 h-6 w-6" />
            Filter
          </Button>
          <Button
            onClick={() => {
              const seqLength = getValues("Sequence Length");
              setSequence(getRandomSequence(seqLength, allowedChars.join("")));
            }}
            variant="outline"
          >
            <DicesIcon className="mr-2 h-6 w-6" />
            Randomize
          </Button>
          <div className="col-start-2 flex gap-1">
            {outputModeSelector}
            <CopyButton
              label={"  Copy "}
              buttonClassName="w-fit ml-auto whitespace-pre font-mono justify-end"
              textToCopy={() => {
                track(`copied-random-sequence-${outputMode}`);

                if (outputMode === "text") {
                  return getValues("Sequence");
                } else if (outputMode === "fasta") {
                  // Output current date and time in local format
                  const dateStr = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
                  return `>Random Sequence by http://random.nitro.bio at ${dateStr}\n${getValues("Sequence")}`;
                } else {
                  throw new Error(`Invalid output mode: ${outputMode}`);
                }
              }}
            />
          </div>
        </span>
      </div>
    </section>
  );
};

const getRandomSequence = (length: number, chars: string) => {
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
};
