import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { DicesIcon } from "lucide-react";
import PdbSequence from "./PdbSequence/PdbSequence";
import { RandomSequence } from "./RandomSequence/RandomSequence";

export default function Home() {
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
      <Tabs defaultValue="pdb">
        <TabsList className="">
          <TabsTrigger value="random" className="flex items-center gap-2">
            <DicesIcon className="h-4 w-4" />
            Random
          </TabsTrigger>
          <TabsTrigger value="pdb" className="flex items-center gap-1">
            <Image
              src="/icons/protein.svg"
              alt="Protein Icon"
              width={24}
              height={24}
              className="invert"
            />
            From PDB
          </TabsTrigger>
        </TabsList>
        <TabsContent value="random">
          <RandomSequence className="w-full" />
        </TabsContent>
        <TabsContent value="pdb" className="pt-4">
          <PdbSequence />
        </TabsContent>
      </Tabs>
    </div>
  );
}
