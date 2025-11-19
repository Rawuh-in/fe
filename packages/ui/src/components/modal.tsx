'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 backdrop-blur-sm p-4 md:inset-0">
      <div ref={modalRef} className="relative w-full max-w-md max-h-full rounded-[var(--eo-radius-lg)] bg-[var(--eo-bg-elevated)] shadow-[var(--eo-shadow-md)] ring-1 ring-[var(--eo-muted)]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--eo-muted)] rounded-t">
          <h3 className="text-xl font-semibold text-[var(--eo-fg)]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--eo-muted-text)] bg-transparent hover:bg-[var(--eo-muted)] hover:text-[var(--eo-fg)] rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4 md:p-5 space-y-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end p-4 md:p-5 border-t border-[var(--eo-muted)] rounded-b gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
