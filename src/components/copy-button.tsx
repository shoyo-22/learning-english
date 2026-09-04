"use client";
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
      <button className="copy-button" onClick={copy}>
        {status === "copied" ? <Check size={14} /> : <Copy size={14} />}{" "}
        {status === "copied" ? "Copied!" : label}
      </button>
      <span role="status" className="copy-status">
        {status === "error"
          ? "Copy unavailable. Select and copy the text manually."
          : ""}
      </span>
    </div>
  );
}
