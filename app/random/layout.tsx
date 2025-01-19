import { GeneratorTabs } from "../GeneratorTabs";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GeneratorTabs defaultTab={"random"} />
      <div className="py-8">{children}</div>
    </>
  );
}
