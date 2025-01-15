import { cn } from "@/lib/utils";
import { CheckIcon, CopyIcon } from "lucide-react";
import { ReactNode, useState } from "react";
import { Button } from "./button";

export const CopyButton = ({
  label,
  buttonClassName,
  logoClassName,
  textToCopy,
}: {
  label: ReactNode;
  textToCopy: () => string;
  buttonClassName?: string;
  logoClassName?: string;
}) => {
  const [logo, setLogo] = useState<ReactNode>(
    <CopyIcon className={cn("h-3 w-3", logoClassName)} />,
  );
  const [internalLabel, setInternalLabel] = useState<ReactNode>(label);
  const onClipboardCopy = () => {
    setLogo(<CheckIcon className={cn("h-3 w-3", logoClassName)} />);
    setInternalLabel("Copied!");
    setTimeout(() => {
      setLogo(<CopyIcon className={cn("h-3 w-3", logoClassName)} />);
      setInternalLabel(label);
    }, 1000);
  };
  return (
    <Button
      aria-label="Copy to clipboard"
      className={cn("flex gap-2", buttonClassName)}
      variant="secondary"
      onClick={() => {
        const text = textToCopy();
        navigator.clipboard.writeText(text);
        onClipboardCopy();
      }}
    >
      {logo}
      {internalLabel}
    </Button>
  );
};
