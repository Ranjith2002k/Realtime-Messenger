import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "./UserAvatar";
import { useChatStore, type Profile } from "@/stores/chatStore";
import { Check, Search, Users } from "lucide-react";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const { profiles, profile, createGroupConversation, setActiveConversation } = useChatStore();
  const [groupName, setGroupName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  const otherUsers = profiles.filter(
    (p) => p.id !== profile?.id && p.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUser = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedIds.length < 1) return;
    setCreating(true);
    const convId = await createGroupConversation(groupName.trim(), selectedIds);
    setCreating(false);
    if (convId) {
      setActiveConversation(convId);
      onOpenChange(false);
      setGroupName("");
      setSelectedIds([]);
      setSearch("");
    }
  };

  const handleClose = (val: boolean) => {
    onOpenChange(val);
    if (!val) {
      setGroupName("");
      setSelectedIds([]);
      setSearch("");
    }
  };

  const selectedProfiles = profiles.filter((p) => selectedIds.includes(p.id));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3">
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5 text-primary" />
            New Group Chat
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-3">
          <Input
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="bg-muted border-none"
          />
        </div>

        {/* Selected chips */}
        {selectedProfiles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-5 pb-3">
            {selectedProfiles.map((u) => (
              <button
                key={u.id}
                onClick={() => toggleUser(u.id)}
                className="flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/25"
              >
                {u.name}
                <span className="text-primary/60">×</span>
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="px-5 pb-2">
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
        </div>

        {/* User list */}
        <div className="max-h-56 overflow-y-auto scrollbar-thin border-t border-border">
          {otherUsers.length === 0 ? (
            <p className="p-5 text-center text-sm text-muted-foreground">No users found</p>
          ) : (
            otherUsers.map((u) => {
              const selected = selectedIds.includes(u.id);
              return (
                <button
                  key={u.id}
                  onClick={() => toggleUser(u.id)}
                  className={`w-full flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/60 ${
                    selected ? "bg-primary/5" : ""
                  }`}
                >
                  <UserAvatar name={u.name} status={u.status as "online" | "offline" | "away"} size="sm" />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">{u.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{u.status}</p>
                  </div>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors ${
                      selected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <DialogFooter className="p-5 pt-3 border-t border-border">
          <Button
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedIds.length < 1 || creating}
            className="w-full"
          >
            {creating ? "Creating..." : `Create Group (${selectedIds.length} member${selectedIds.length !== 1 ? "s" : ""})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
