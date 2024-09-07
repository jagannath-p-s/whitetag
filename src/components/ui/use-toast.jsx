import { useState, useCallback } from "react";
import { Toast, ToastTitle, ToastDescription, ToastClose, ToastViewport } from "./toast";

const useToast = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const showToast = useCallback(({ title, description }) => {
    setTitle(title);
    setDescription(description);
    setOpen(true);
  }, []);

  return {
    ToastComponent: (
      <>
        <Toast open={open} onOpenChange={setOpen}>
          <ToastTitle>{title}</ToastTitle>
          <ToastDescription>{description}</ToastDescription>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </>
    ),
    showToast,
  };
};

export { useToast };
