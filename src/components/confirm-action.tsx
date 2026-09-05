"use client";
import { useRef, type ReactNode } from "react";
import { useLocale } from "@/lib/i18n/provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./kit/alert-dialog";
export function ConfirmAction({
  children,
  title,
  description,
  onConfirm,
  focusAfterConfirm,
}: {
  children: ReactNode;
  title: string;
  description: string;
  onConfirm: () => void;
  focusAfterConfirm?: () => void;
}) {
  const { tr } = useLocale();
  const confirmed = useRef(false);
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent
        onCloseAutoFocus={(event) => {
          if (confirmed.current && focusAfterConfirm) {
            event.preventDefault();
            focusAfterConfirm();
          }
          confirmed.current = false;
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{tr(title)}</AlertDialogTitle>
          <AlertDialogDescription>{tr(description)}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="button secondary">
            {tr("Keep working")}
          </AlertDialogCancel>
          <AlertDialogAction
            className="button"
            onClick={() => {
              confirmed.current = true;
              onConfirm();
            }}
          >
            {tr("Confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
