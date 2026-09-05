"use client";
import { Button } from "./kit/button";
import { useLocale } from "@/lib/i18n/provider";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { track } from "@/lib/client";
export function CopyButton({
  text,
  label = "Copy prompt",
  eventId,
}: {
  text: string;
  label?: string;
  eventId?: string;
}) {
  const { tr } = useLocale();

  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
      if (eventId) void track("prompt_copied", eventId);
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
  }
  return (
    <div>
      <Button variant="ghost" className="copy-button" onClick={copy}>
        {status === "copied" ? <Check size={14} /> : <Copy size={14} />}{" "}
        {tr(status === "copied" ? "Copied!" : label)}
      </Button>
      <span role="status" className="copy-status">
        {tr(
          status === "error"
            ? "Copy unavailable. Select and copy the text manually."
            : "",
        )}
      </span>
    </div>
  );
}
