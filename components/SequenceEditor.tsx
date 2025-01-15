"use client";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { DicesIcon, FilterIcon } from "lucide-react";
import { useEffect, useMemo } from "react";

import { useForm } from "react-hook-form";
import { useStickyState } from "@/hooks/useStickyState";

export const SequenceEditor = ({
  baseMap,
  initialSequence,
  pushSequence,
  className,
}: {
  baseMap: Record<string, boolean>;
  initialSequence: string;
  pushSequence: (sequence: string) => void;
  className?: string;
}) => {
  const [outputMode, setOutputMode] = useStickyState<"text" | "fasta">({
    defaultValue: "text",
    prefix: "nitro-random",
    key: "outputMode",
    version: "0",
  });
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
  console.log("here", debouncedSequence, watchedSequence);
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
      <div className="space-y-2">
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
            className="border-red-600/20 bg-red-800/10"
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
