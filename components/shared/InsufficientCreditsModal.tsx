"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const InsufficientCreditsModal = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleProceed = () => {
    setIsOpen(false);
    router.push("/credits");
  };

  const handleCancel = () => {
    setIsOpen(false);
    router.push("/profile");
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="insufficient-credits-modal">
        <AlertDialogHeader>
          <div className="modal-header">
            <p className="modal-title">Insufficient Credits</p>
            <AlertDialogCancel className="close-button" onClick={handleCancel}>
              <Image
                src="/assets/icons/close.svg"
                alt="Close modal"
                width={24}
                height={24}
                className="close-icon"
              />
            </AlertDialogCancel>
          </div>

          <Image
            src="/assets/images/stacked-coins.png"
            alt="Credit coins"
            width={462}
            height={122}
            className="coins-image"
          />

          <AlertDialogTitle className="modal-main-title">
            Oops.... Looks like you've run out of free credits!
          </AlertDialogTitle>

          <AlertDialogDescription className="modal-description">
            No worries, though - you can keep enjoying our services by grabbing
            more credits.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="modal-footer">
          <AlertDialogAction className="proceed-button" onClick={handleProceed}>
            Yes, Proceed
          </AlertDialogAction>
          <AlertDialogCancel className="cancel-button" onClick={handleCancel}>
            No, Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};