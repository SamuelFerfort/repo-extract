import React, { useState } from "react";
import { Copy, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CopyIcon = ({ textToCopy }: { textToCopy: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("Repository content copied to clipboard", {
        position: "bottom-right",
        duration: 2000,
        className: "select-none",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link", {
        position: "top-center",
        duration: 3000,
      });
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant="ghost"
      size="icon"
      className="relative w-9 h-9 p-0 text-gray-400 hover:bg-transparent hover:scale-105 hover:text-gray-300"
    >
      <div className="relative w-full h-full">
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
            copied
              ? "transform scale-0 opacity-0"
              : "transform scale-100 opacity-100"
          }`}
        >
          <Copy className="w-4 h-4" />
        </div>
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 text-green-500 ${
            copied
              ? "transform scale-100 opacity-100"
              : "transform scale-0 opacity-0"
          }`}
        >
          <CheckCheck className="w-4 h-4" />
        </div>
      </div>
    </Button>
  );
};

export default CopyIcon;

