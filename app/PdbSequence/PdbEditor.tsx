"use client";
import { Separator } from "@/components/ui/separator";

import { useQuery } from "@tanstack/react-query";
import { Loader2Icon, RotateCcwIcon, XIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { getPDBString, INITIAL_PDB_ID, pdbToSequence } from "./utils";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { AriadneSelection, SequenceViewer } from "@nitro-bio/sequence-viewers";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useStickyState } from "@/hooks/useStickyState";
import { AMINO_ACIDS, NUCLEOTIDES, PUNCTUATION } from "@/lib/constants";
import { BaseSelector } from "@/components/BaseSelector";
import { Button } from "@/components/ui/button";
const MoleculeViewer = dynamic(
  async () => {
    const m = await import("@nitro-bio/molstar-easy");
    return m.MoleculeViewer;
  },
  {
    ssr: false,
    loading: () => (
      <div className={cn("flex min-h-80 items-center justify-center")}>
        <Loader2Icon className="h-4 w-4 animate-spin" />
      </div>
    ),
  },
);

export const PDBEditor = () => {
  const { register, setValue, getValues, watch } = useForm({
    defaultValues: {
      pdbId: INITIAL_PDB_ID,
      sequence: "",
    },
  });
  const pdbId = watch("pdbId");
  const sequence = watch("sequence");
  const setSequence = (value: string) => setValue("sequence", value);
  const debouncedPdbId = useDebounce({ value: pdbId, delay: 200 });
  const {
    data: pdbString,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["pdbString", debouncedPdbId],
    queryFn: () => getPDBString(debouncedPdbId),
  });
  useEffect(
    function updateSequenceFromPdbString() {
      if (!pdbString) return;
      const sequence = pdbToSequence(pdbString);
      setSequence(sequence);
    },
    [pdbString],
  );
  const [selection, setSelection] = useState<AriadneSelection | null>(null);
  const showReset = pdbString && sequence !== pdbToSequence(pdbString);
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="pdbId">PDB Id</Label>
        <Input
          className="w-fit min-w-[180px]"
          type="text"
          placeholder="Enter PDB Id"
          {...register("pdbId")}
        />
      </div>
      <MoleculeViewerViaPdbId
        pdbString={pdbString}
        selection={selection}
        isFetching={isFetching}
        error={error as Error}
        className="col-span-2 -mt-16 overflow-hidden rounded-md border"
      />
      <Separator className="col-span-3 my-8" />
      <>
        <div className="flex flex-col">
          <Label
            htmlFor="sequenceInput"
            className="flex items-baseline justify-between gap-2"
          >
            Sequence
            <span
              className={cn(
                "flex items-center gap-1 text-xs text-red-400",
                showReset ? "opacity-100" : "opacity-0",
                "transition-opacity duration-200",
              )}
            >
              revert to pdb sequence
              <Button
                variant="outline"
                onClick={() => {
                  if (pdbString) {
                    setSequence(pdbToSequence(pdbString));
                  }
                }}
                disabled={!pdbString}
              >
                <RotateCcwIcon className="h-3 w-3" />
              </Button>
            </span>
          </Label>
          <Textarea
            className="whitespace-pre-line"
            {...register("sequence", {})}
          />
        </div>
        <SequenceViewerViaPdbId
          sequence={sequence}
          selection={selection}
          setSelection={setSelection}
          className="col-span-2"
        />
      </>
    </div>
  );
};

export const SequenceViewerViaPdbId = ({
  sequence,
  selection,
  setSelection,
  className,
}: {
  sequence?: string;
  selection: AriadneSelection | null;
  setSelection: (selection: AriadneSelection | null) => void;
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
    prefix: "nitro-pdb",
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
    <div className={cn(className)}>
      <BaseSelector
        baseMap={baseMap}
        setBaseMap={setBaseMap}
        className="-mb-2 -mt-2"
      />
      <SequenceViewer
        sequences={[sequence ?? ""]}
        annotations={[]}
        selection={selection}
        setSelection={setSelection}
        charClassName={charClassName}
        selectionClassName="relative after:bg-blue-400/30 after:absolute after:-left-px after:right-0 after:inset-y-0 after:z-[-1]"
        containerClassName="max-h-[600px] overflow-y-auto h-fit"
      />
    </div>
  );
};

export const MoleculeViewerViaPdbId = ({
  pdbString,
  error,
  isFetching,
  selection,
  className,
}: {
  pdbString?: string | null;
  error?: Error;
  isFetching?: boolean;
  selection: AriadneSelection | null;
  className?: string;
}) => {
  const debouncedSelection = useDebounce<AriadneSelection | null>({
    value: selection,
    delay: 500,
  });

  const selectionHighlights = useMemo(() => {
    if (!debouncedSelection) return [];
    const { start, end } = debouncedSelection;
    // TODO: handle selection over seam
    return [
      {
        start,
        end,
        label: {
          text: "⠀", // hides label
          hexColor: "#93c5fd", // blue-300
        },
      },
    ];
  }, [debouncedSelection]);

  const moleculePayloads = useMemo(() => {
    return [
      {
        pdbString: pdbString ?? "",
        highlights: selectionHighlights,
      },
    ];
  }, [pdbString, selectionHighlights]);

  if (error) {
    return (
      <div
        className={cn(
          className,
          "flex min-h-80 items-center justify-center text-red-400",
        )}
      >
        <XIcon className="h-4 w-4 text-red-400" />
        <span className="ml-2">Failed to fetch PDB</span>
      </div>
    );
  }
  if (isFetching) {
    return (
      <div
        className={cn(className, "flex min-h-80 items-center justify-center")}
      >
        <Loader2Icon className="h-4 w-4 animate-spin" />
      </div>
    );
  }
  if (!pdbString) {
    return (
      <div
        className={cn(className, "flex min-h-80 items-center justify-center")}
      >
        <span>No PDB found</span>
      </div>
    );
  }
  return (
    <div className={cn(className, "min-h-80")}>
      <MoleculeViewer
        moleculePayloads={moleculePayloads}
        // bg-zinc-900
        backgroundHexColor="#18181b"
      />
    </div>
  );
};
