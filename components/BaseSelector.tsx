import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AMINO_ACIDS,
  AminoAcid,
  Nucleotide,
  NUCLEOTIDES,
  Punctuation,
  PUNCTUATION,
} from "@/lib/constants";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";

export const BaseSelector = ({
  baseMap,
  setBaseMap,
  className,
}: {
  baseMap: Record<string, boolean>;
  setBaseMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  className?: string;
}) => {
  const allowedBases = Object.keys(baseMap).filter((base) => baseMap[base]);
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger
          className={cn("flex max-w-full justify-start gap-2", className)}
        >
          <Label className="w-full flex-1 text-start">Allowed Bases</Label>
          <span className="flex-1 truncate text-zinc-400">
            {allowedBases.join(", ")}
          </span>
        </AccordionTrigger>
        <AccordionContent className="grid grid-cols-1 gap-x-2 gap-y-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-x-2 pb-2">
              <Checkbox
                id={`all-amino-acids`}
                checked={AMINO_ACIDS.some((base) => baseMap[base])}
                onCheckedChange={(checked) =>
                  setBaseMap((prev) =>
                    Object.fromEntries(
                      Object.keys(prev).map((key) => [
                        key,
                        AMINO_ACIDS.includes(key as AminoAcid)
                          ? checked === true
                          : prev[key],
                      ]),
                    ),
                  )
                }
              />
              <h4 className="font-semibold text-white">Amino Acids</h4>
            </Label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {AMINO_ACIDS.map((base) => (
                <Label
                  key={`amino-acid-${base}`}
                  htmlFor={`amino-acid-${base}`}
                  className="flex gap-x-2"
                >
                  <Checkbox
                    id={`amino-acid-${base}`}
                    checked={baseMap[base]}
                    onCheckedChange={(checked) =>
                      setBaseMap((prev) => ({
                        ...prev,
                        [base]: checked === true,
                      }))
                    }
                  />
                  {base}
                </Label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-x-2 pb-2">
              <Checkbox
                id={`all-nucleotides`}
                checked={NUCLEOTIDES.some((base) => baseMap[base])}
                onCheckedChange={(checked) =>
                  setBaseMap((prev) =>
                    Object.fromEntries(
                      Object.keys(prev).map((key) => [
                        key,
                        NUCLEOTIDES.includes(key as Nucleotide)
                          ? checked === true
                          : prev[key],
                      ]),
                    ),
                  )
                }
              />
              <h4 className="font-semibold text-white">Nucleotides</h4>
            </Label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {NUCLEOTIDES.map((base) => (
                <Label
                  key={`nucleotide-${base}`}
                  htmlFor={`nucleotide-${base}`}
                  className="flex gap-x-2"
                >
                  <Checkbox
                    id={`nucleotide-${base}`}
                    checked={baseMap[base]}
                    onCheckedChange={(checked) =>
                      setBaseMap((prev) => ({
                        ...prev,
                        [base]: checked === true,
                      }))
                    }
                  />
                  {base}
                </Label>
              ))}
            </div>
          </div>{" "}
          <div className="space-y-2">
            <Label className="flex items-center gap-x-2 pb-2">
              <Checkbox
                id={`all-punctutation`}
                checked={PUNCTUATION.some((base) => baseMap[base])}
                onCheckedChange={(checked) =>
                  setBaseMap((prev) =>
                    Object.fromEntries(
                      Object.keys(prev).map((key) => [
                        key,
                        PUNCTUATION.includes(key as Punctuation)
                          ? checked === true
                          : prev[key],
                      ]),
                    ),
                  )
                }
              />
              <h4 className="font-semibold text-white">Punctuation</h4>
            </Label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {PUNCTUATION.map((base) => (
                <Label
                  key={`nucleotide-${base}`}
                  htmlFor={`nucleotide-${base}`}
                  className="flex gap-x-2"
                >
                  <Checkbox
                    id={`nucleotide-${base}`}
                    checked={baseMap[base]}
                    onCheckedChange={(checked) =>
                      setBaseMap((prev) => ({
                        ...prev,
                        [base]: checked === true,
                      }))
                    }
                  />
                  {base === " " ? "Space" : base}
                </Label>
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
