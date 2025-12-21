// context/ModalContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ModalContextType {
  isAnyModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

  const openModal = () => setIsAnyModalOpen(true);
  const closeModal = () => setIsAnyModalOpen(false);

  return (
    <ModalContext.Provider value={{ isAnyModalOpen, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within ModalProvider");
  }
  return context;
}