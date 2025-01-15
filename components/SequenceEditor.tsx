"use client";
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
          <CopyButton
            label={"Copy"}
            textToCopy={() => {
              return getValues("Sequence");
            }}
            buttonClassName="col-span-2"
          />
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
