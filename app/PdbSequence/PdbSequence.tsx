import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { PDBEditor } from "./PdbEditor";
import { getPDBString, INITIAL_PDB_ID } from "./utils";

export default async function PdbSequence() {
  const queryClient = new QueryClient();
  const prefetches = [
    queryClient.prefetchQuery({
      queryKey: ["pdbString", INITIAL_PDB_ID],
      queryFn: () => getPDBString(INITIAL_PDB_ID),
    }),
  ];
  await Promise.all(prefetches);
  return (
    // Neat! Serialization is now as easy as passing props.
    // HydrationBoundary is a Client Component, so hydration will happen there.
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PDBEditor />
    </HydrationBoundary>
  );
}
