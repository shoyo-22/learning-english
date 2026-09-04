"use client";
import { useEffect } from "react";
import { initSession, track } from "@/lib/client";
export function Activity() {
  useEffect(() => {
    void initSession();
    try {
      if (!sessionStorage.getItem("english-lab-visit")) {
        sessionStorage.setItem("english-lab-visit", "pending");
        void track("visit").then((saved) => {
          try {
            if (saved) sessionStorage.setItem("english-lab-visit", "1");
            else sessionStorage.removeItem("english-lab-visit");
          } catch {
            /* Storage may be disabled. */
          }
        });
      }
    } catch {
      /* Cookies still associate results when sessionStorage is unavailable. */
    }
  }, []);
  return null;
}
