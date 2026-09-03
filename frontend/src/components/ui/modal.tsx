import * as React from "react";
import { X } from "lucide-react";
import { cn } from "./utils";

// Coquille de modale partagée (sans Radix) pour unifier toutes les fenêtres
// « faites main » de l'app : même overlay, mêmes tailles, mêmes marges, même
// gestion du débordement (en-tête/pied fixes, corps qui scrolle), Escape +
// clic-hors + verrouillage du scroll de fond.
//
// Structure : <Modal open onClose title description footer size>…contenu…</Modal>

export type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-6xl",
  full: "max-w-[95vw]",
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  size?: ModalSize;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** Fermer en cliquant sur le fond (défaut: true). */
  closeOnOverlay?: boolean;
  /** Afficher la croix de fermeture (défaut: true). */
  showClose?: boolean;
  /** Classes du panneau. */
  className?: string;
  /** Classes du corps scrollable (ex. enlever le padding: "p-0"). */
  bodyClassName?: string;
  /** Empêche l'en-tête de s'afficher même si un titre est fourni. */
  hideHeader?: boolean;
}

export function Modal({
  open,
  onClose,
  size = "lg",
  title,
  description,
  icon,
  footer,
  children,
  closeOnOverlay = true,
  showClose = true,
  className,
  bodyClassName,
  hideHeader = false,
}: ModalProps) {
  // Escape pour fermer + verrouillage du scroll de fond tant que la modale est ouverte.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const hasHeader = !hideHeader && (title || description || showClose);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnOverlay ? onClose : undefined}
      />

      {/* Panneau */}
      <div
        className={cn(
          "relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl border border-border bg-white shadow-xl",
          SIZE_CLASS[size],
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {hasHeader && (
          <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
            <div className="flex min-w-0 items-start gap-3">
              {icon && (
                <span className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  {icon}
                </span>
              )}
              <div className="min-w-0">
                {title && (
                  <h2 className="truncate text-base font-semibold text-foreground">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
            </div>
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Corps scrollable */}
        <div className={cn("flex-1 overflow-y-auto px-6 py-5", bodyClassName)}>
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
