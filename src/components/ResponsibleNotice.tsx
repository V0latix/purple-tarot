import { Leaf } from "lucide-react";

export function ResponsibleNotice() {
  return (
    <div className="responsible-notice">
      <Leaf aria-hidden="true" size={14} strokeWidth={1.8} />
      <p>
        Les pénalités peuvent être remplacées par des alternatives sans
        alcool. Jouez de manière responsable.
      </p>
    </div>
  );
}
