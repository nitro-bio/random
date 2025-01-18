import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { PDBEditor } from "./PdbEditor";
import { getPDB, INITIAL_PDB_ID } from "./utils";

export default async function PdbSequence() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["pdbString", INITIAL_PDB_ID],
    queryFn: () => getPDB(INITIAL_PDB_ID),
  });
  return (
    // Neat! Serialization is now as easy as passing props.
    // HydrationBoundary is a Client Component, so hydration will happen there.
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PDBEditor />
    </HydrationBoundary>
  );
}
