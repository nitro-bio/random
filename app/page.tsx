import { GeneratorTabs } from "./GeneratorTabs";

export default function Home() {
  return (
    <>
      <GeneratorTabs defaultTab={"home"} />
      <div className="flex h-80 flex-col items-center justify-center">Home</div>
    </>
  );
}
