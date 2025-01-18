"use client";
import { Separator } from "@/components/ui/separator";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/useDebounce";
import { useStickyState } from "@/hooks/useStickyState";
import { cn } from "@/lib/utils";
import { AriadneSelection } from "@nitro-bio/sequence-viewers";
import { useQuery } from "@tanstack/react-query";
import { RotateCcwIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getPDBString, INITIAL_PDB_ID, pdbToSequence } from "./utils";
import MoleculeSection from "./MoleculeSection";
import SequenceSection from "./SequenceSection";

export const PDBEditor = () => {
  const [initialPdbId, setInitialPdbId] = useStickyState({
    defaultValue: INITIAL_PDB_ID,
    prefix: "nitro-pdb",
    key: "pdbId",
    version: "0",
  });
  const { register, setValue, watch } = useForm({
    defaultValues: {
      pdbId: initialPdbId,
      sequence: "",
    },
  });
  const pdbId = watch("pdbId");
  useEffect(
    function _setInitialPdbId() {
      setInitialPdbId(pdbId);
    },
    [pdbId],
  );
  const sequence = watch("sequence");
  const setSequence = (value: string) =>
    setValue("sequence", value.toUpperCase());
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
  const showReset = sequenceFromPdb && sequence !== sequenceFromPdb;

  const [selection, setSelection] = useState<AriadneSelection | null>(null);

  return (
    <div className="grid w-full grid-cols-3 gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="pdbId">PDB Id</Label>
        <Input
          className="w-fit min-w-[180px] uppercase"
          type="text"
          placeholder="Enter PDB Id"
          {...register("pdbId")}
        />
      </div>
      <div className="col-span-2 -mt-16 overflow-hidden rounded-md border">
        <MoleculeSection
          pdbString={pdbString}
          selection={selection}
          isFetching={isFetching}
          error={error as Error}
        />
      </div>
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
            className="whitespace-pre-line uppercase"
            {...register("sequence", {})}
          />
        </div>
        <SequenceSection
          sequence={sequence.toUpperCase()}
          selection={selection}
          setSelection={setSelection}
          className="col-span-2"
        />
      </>
    </div>
  );
};
