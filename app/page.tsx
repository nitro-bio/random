import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { DicesIcon } from "lucide-react";
import PdbSequence from "./PdbSequence/PdbSequence";
import { RandomSequence } from "./RandomSequence/RandomSequence";

export default function Home() {
  return (
    <div>
      <Tabs defaultValue="pdb">
        <TabsList className="">
          {" "}
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
          <TabsTrigger value="random" className="flex items-center gap-2">
            <DicesIcon className="h-4 w-4" />
            Random
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pdb" className="pt-4">
          <PdbSequence />
        </TabsContent>
        <TabsContent value="random">
          <RandomSequence className="w-full" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
