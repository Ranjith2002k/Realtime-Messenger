import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useChatStore } from "@/stores/chatStore";
import { UserAvatar } from "./UserAvatar";
import { Search } from "lucide-react";
import { useState } from "react";

interface ContactPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (name: string) => void;
}

export function ContactPickerDialog({ open, onOpenChange, onSelect }: ContactPickerDialogProps) {
  const { profiles, profile } = useChatStore();
  const [search, setSearch] = useState("");

  const otherUsers = profiles.filter(
    (p) => p.id !== profile?.id && p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (name: string) => {
    onSelect(name);
    onOpenChange(false);
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm gap-0 p-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3">
          <DialogTitle className="text-foreground">Share Contact</DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto scrollbar-thin border-t border-border">
          {otherUsers.length === 0 ? (
            <p className="p-5 text-center text-sm text-muted-foreground">No contacts found</p>
          ) : (
            otherUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => handleSelect(u.name)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted/60 transition-colors"
              >
                <UserAvatar name={u.name} status={u.status as "online" | "offline" | "away"} size="sm" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">{u.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{u.status}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
