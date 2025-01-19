import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DicesIcon, HomeIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type GeneratorTabs = "home" | "pdb" | "random";

export const GeneratorTabs = ({
  defaultTab,
}: {
  defaultTab: GeneratorTabs;
}) => {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="">
        <Link href="/">
          <TabsTrigger value="home" className="flex items-center gap-1">
            <HomeIcon className="h-4 w-4" />
            Home
          </TabsTrigger>
        </Link>
        <Link href="/pdb">
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
        </Link>
        <Link href="/random">
          <TabsTrigger value="random" className="flex items-center gap-2">
            <DicesIcon className="h-4 w-4" />
            Random
          </TabsTrigger>
        </Link>
      </TabsList>
    </Tabs>
  );
};
