"use client";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { AriadneSelection } from "@nitro-bio/sequence-viewers";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownFromLineIcon, RotateCcwIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import MoleculeSection from "./MoleculeSection";
import SequenceSection from "./SequenceSection";
import { getPDBString, INITIAL_PDB_ID, pdbToSequence } from "./utils";

type FormValues = {
  pdbId: string;
  sequence: string;
  maskChar: string;
  maskStart: number | null;
  maskEnd: number | null;
  maskApply: boolean;
};

export const PDBEditor = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const defaultValues = {
    pdbId: searchParams.get("pdbId") ?? INITIAL_PDB_ID,
    sequence: searchParams.get("sequence") ?? "",
    maskChar: searchParams.get("maskChar") ?? "-",
    maskStart: z.coerce
      .number()
      .nullable()
      .parse(searchParams.get("maskStart")),
    maskEnd: z.coerce.number().nullable().parse(searchParams.get("maskEnd")),
    maskApply: z.coerce.boolean().parse(searchParams.get("maskApply") ?? false),
  };
  const { register, setValue, watch } = useForm<FormValues>({
    defaultValues,
  });
  const pdbId = watch("pdbId");
  const [selection, setSelection] = useState<AriadneSelection | null>(null);

  const sequence = watch("sequence").toUpperCase();
  const setSequence = (value: string) =>
    setValue("sequence", value.toUpperCase());
  const [sequenceFromPdb, setSequenceFromPdb] = useState<string | null>(null);

  const maskApply = watch("maskApply");
  const maskChar = watch("maskChar");
  const setMaskApply = (value: boolean) => setValue("maskApply", value);
  const maskStart = watch("maskStart");
  const maskEnd = watch("maskEnd");
  const mask: [number, number] | null =
    maskStart == null || maskEnd == null ? null : [maskStart, maskEnd];

  const setMask = (value: [number, number] | null) => {
    if (!value) {
      setValue("maskStart", null);
      setValue("maskEnd", null);
      return;
    }
    let newStart = value[0];
    let newEnd = value[1];
    if (newStart > newEnd) {
      [newStart, newEnd] = [newEnd, newStart];
    }
    setValue("maskStart", value[0]);
    setValue("maskEnd", value[1]);
  };

  useEffect(
    function setSearchParams() {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("pdbId", pdbId);
      newParams.set("sequence", sequence);
      newParams.set("maskChar", maskChar);
      newParams.set("maskStart", maskStart?.toString() ?? "");
      newParams.set("maskEnd", maskEnd?.toString() ?? "");
      newParams.set("maskApply", maskApply.toString());
      router.push(pathname + "?" + newParams);
    },
    [pdbId, sequence, maskApply, maskChar, maskStart, maskEnd],
  );

  return (
    <div className="grid w-full grid-cols-3 gap-4">
      <PDBSection
        InputChildren={
          <div className="flex flex-col gap-2">
            <Label htmlFor="pdbId">PDB Id</Label>
            <Input
              className="w-fit min-w-[180px] uppercase"
              type="text"
              placeholder="Enter PDB Id"
              {...register("pdbId")}
            />
          </div>
        }
        pdbId={pdbId}
        selection={selection}
        setSequence={(seq) => {
          setSequenceFromPdb(seq);
          setSequence(seq);
        }}
        mask={maskApply ? mask : null}
      />
      {sequenceFromPdb && (
        <>
          <Separator className="col-span-3 my-8" />
          <SequenceEditSection
            InputChildren={
              <Textarea
                className="whitespace-pre-line font-mono uppercase tracking-widest"
                rows={8}
                {...register("sequence", {})}
              />
            }
            sequenceFromPdb={sequenceFromPdb}
            sequence={sequence}
            setSequence={setSequence}
            selection={selection}
            setSelection={(value) => {
              setSelection(value);
            }}
          />
          <Separator className="col-span-3 my-8" />
          <MaskEditSection
            InputChildren={
              <div className="flex flex-wrap gap-4">
                <Label
                  htmlFor="maskStart"
                  className="flex w-fit min-w-24 flex-col gap-2"
                >
                  Start
                  <Input
                    type="number"
                    placeholder="Start"
                    {...register("maskStart")}
                    min={0}
                    max={sequence.length}
                  />
                </Label>
                <Label
                  htmlFor="maskStart"
                  className="flex w-fit flex-col gap-2"
                >
                  End
                  <Input
                    type="number"
                    placeholder="End"
                    className="min-w-24"
                    {...register("maskEnd")}
                    min={maskStart ?? 0}
                    max={sequence.length}
                  />
                </Label>
                <Label
                  htmlFor="maskStart"
                  className="flex flex-1 flex-col gap-2"
                >
                  Mask
                  <Input
                    type="text"
                    placeholder="Char"
                    {...register("maskChar")}
                  />
                </Label>
              </div>
            }
            sequence={sequence}
            mask={mask}
            setMask={setMask}
            maskApply={maskApply}
            setMaskApply={setMaskApply}
            maskChar={maskChar}
          />
        </>
      )}
    </div>
  );
};

const PDBSection = ({
  InputChildren,
  mask,
  pdbId,
  selection,
  setSequence,
}: {
  InputChildren: React.ReactNode;
  mask: [number, number] | null;
  pdbId: string;
  selection: AriadneSelection | null;
  setSequence: (value: string) => void;
}) => {
  const debouncedPdbId = useDebounce({ value: pdbId, delay: 200 });
  const {
    data: pdbString,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["pdbString", debouncedPdbId],
    queryFn: () => getPDBString(debouncedPdbId),
  });
  const sequenceFromPdb = pdbString && pdbToSequence(pdbString);
  useEffect(
    function updateSequenceFromPdbString() {
      if (!sequenceFromPdb) return;
      setSequence(sequenceFromPdb);
    },
    [sequenceFromPdb],
  );

  return (
    <>
      {InputChildren}
      <div className="col-span-2 rounded-md border py-8">
        <MoleculeSection
          pdbString={pdbString}
          selection={selection}
          isFetching={isFetching}
          error={error as Error}
          mask={mask}
        />
      </div>
    </>
  );
};

const SequenceEditSection = ({
  sequenceFromPdb,
  sequence,
  setSequence,
  selection,
  setSelection,
  InputChildren,
}: {
  sequenceFromPdb: string;
  sequence: string;
  setSequence: (value: string) => void;
  selection: AriadneSelection | null;
  setSelection: (value: AriadneSelection | null) => void;
  InputChildren: React.ReactNode;
}) => {
  const showReset = sequenceFromPdb && sequence !== sequenceFromPdb;
  return (
    <>
      <div className="flex flex-col gap-1">
        <Label htmlFor="sequenceInput" className="flex items-baseline">
          <h4>Sequence</h4>
          <span
            className={cn(
              "ml-auto flex items-center gap-2",
              "text-xs",
              showReset ? "opacity-100" : "opacity-0",
              "text-rose-400",
              "transition-all duration-200",
            )}
          >
            {"revert to pdb sequence"}
            <Button
              variant="outline"
              onClick={() => {
                if (sequenceFromPdb) {
                  setSequence(sequenceFromPdb);
                }
              }}
              className="h-fit py-1"
              disabled={!sequenceFromPdb}
            >
              {sequence.length === 0 ? (
                <ArrowDownFromLineIcon className="h-3 w-3" />
              ) : (
                <RotateCcwIcon className="h-3 w-3" />
              )}
            </Button>
          </span>
        </Label>{" "}
        {InputChildren}
        <CopyButton
          label={"Copy Sequence"}
          textToCopy={() => {
            return sequence;
          }}
          buttonClassName=""
        />
      </div>

      <div className="col-span-2 row-span-2 -mt-4">
        <CopyButton
          label={"Copy Sequence"}
          textToCopy={() => {
            return sequence;
          }}
          buttonClassName="ml-auto"
        />
        <SequenceSection
          sequence={sequence.toUpperCase()}
          selection={selection}
          setSelection={setSelection}
          storageKey={"from-pdb"}
        />
      </div>
    </>
  );
};

const MaskEditSection = ({
  maskChar,
  maskApply,
  setMaskApply,
  mask,
  setMask,
  sequence,
  InputChildren,
}: {
  maskChar: string;
  maskApply: boolean;
  setMaskApply: (value: boolean) => void;
  mask: [number, number] | null;
  setMask: (value: [number, number] | null) => void;
  sequence: string;
  InputChildren: React.ReactNode;
}) => {
  const maskSequence = (
    sequence: string,
    mask: [number, number] | null,
    maskChar: string,
  ) => {
    if (!mask) return sequence;
    let [start, end] = mask;
    if (start > end) {
      // handle selection over seam
      const maskToEnd = sequence.slice(start).replace(/\S/g, maskChar);
      const startToMask = sequence.slice(0, end + 1).replace(/\S/g, maskChar);
      const remainder = sequence.slice(end, start);
      return startToMask + remainder + maskToEnd;
    }
    [start, end] = [Math.max(0, start), Math.min(end, sequence.length)];
    console.log(start, end);
    return (
      sequence.slice(0, start) +
      maskChar.repeat(end + 1 - start) +
      sequence.slice(end + 1)
    );
  };
  const maskedSequence = maskSequence(sequence, mask, maskChar);
  const selection = mask && {
    start: mask[0],
    end: mask[1],
    direction: "forward" as const,
  };
  const setSelectionAndMask = (value: AriadneSelection | null) => {
    if (value) {
      setMask([value.start, value.end]);
    }
  };
  return (
    <>
      <div className="flex flex-col gap-4">
        {InputChildren}
        <span className="flex justify-end gap-2">
          <CopyButton
            label={"Copy Sequence"}
            textToCopy={() => {
              return maskApply ? maskedSequence : sequence;
            }}
            buttonClassName="w-full"
          />{" "}
          <Button
            variant="outline"
            onClick={() => setMaskApply(!maskApply)}
            disabled={!selection}
            className="border-rose-600/20 bg-rose-800/10"
          >
            {maskApply ? "Clear" : "Mask"}
          </Button>
        </span>
      </div>
      <div className="col-span-2 row-span-2 -mt-6">
        <CopyButton
          label={"Copy Sequence"}
          textToCopy={() => {
            return maskApply ? maskedSequence : sequence;
          }}
          buttonClassName="ml-auto"
        />
        <SequenceSection
          sequence={maskApply ? maskedSequence : sequence}
          selection={selection ?? null}
          selectionClassName="relative after:bg-rose-900/60 after:absolute after:-left-px after:right-0 after:inset-y-0 after:z-[-1] text-zinc-100"
          setSelection={setSelectionAndMask}
          storageKey={"mask"}
        />
      </div>
    </>
  );
};
