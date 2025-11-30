"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

export function ApproveRejectDialog({
  open,
  onClose,
  onConfirm,
  type,
  name
}: {
  open: boolean;
  type: "approve" | "reject";
  name: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {type === "approve" ? "Approve User" : "Reject User"}
          </AlertDialogTitle>

          <AlertDialogDescription>
            Are you sure you want to {type} <b>{name}</b>?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={type === "approve" ? "bg-green-600" : "bg-red-600"}
          >
            {type === "approve" ? "Approve" : "Reject"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
