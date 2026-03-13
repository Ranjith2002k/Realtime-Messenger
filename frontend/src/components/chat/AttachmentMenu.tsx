import { useState, useRef } from "react";
import { FileText, Image, Video, Contact, X } from "lucide-react";

interface AttachmentMenuProps {
  open: boolean;
  onClose: () => void;
  onFileSelect: (file: File, type: "document" | "photo" | "video") => void;
  onContactsClick: () => void;
}

export function AttachmentMenu({ open, onClose, onFileSelect, onContactsClick }: AttachmentMenuProps) {
  const docRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, type: "document" | "photo" | "video") => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file, type);
      onClose();
    }
  };

  const items = [
    { icon: FileText, label: "Document", color: "text-indigo-500", onClick: () => docRef.current?.click() },
    { icon: Image, label: "Photo", color: "text-emerald-500", onClick: () => photoRef.current?.click() },
    { icon: Video, label: "Video", color: "text-rose-500", onClick: () => videoRef.current?.click() },
    { icon: Contact, label: "Contact", color: "text-amber-500", onClick: () => { onContactsClick(); onClose(); } },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute bottom-full left-12 mb-2 z-50 rounded-xl bg-popover border border-border shadow-lg p-2 min-w-[160px] animate-fade-in-up">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <item.icon className={`h-4 w-4 ${item.color}`} />
            {item.label}
          </button>
        ))}
      </div>

      <input ref={docRef} type="file" className="hidden" onChange={(e) => handleFile(e, "document")} />
      <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e, "photo")} />
      <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFile(e, "video")} />
    </>
  );
}
