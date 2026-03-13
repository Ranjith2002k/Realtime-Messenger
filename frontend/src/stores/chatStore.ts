import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { profilesApi, conversationsApi, messagesApi } from "@/services/api";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  status: string;
  last_seen: string | null;
}

export interface ConversationRow {
  id: string;
  type: string;
  name: string | null;
  created_by: string | null;
  created_at: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: string;
  file_name: string | null;
  file_url: string | null;
  created_at: string;
}

export interface ConversationWithMeta {
  id: string;
  type: string;
  name: string;
  participants: Profile[];
  lastMessage?: MessageRow;
  unreadCount: number;
}

interface ChatState {
  profile: Profile | null;
  profiles: Profile[];
  conversations: ConversationWithMeta[];
  activeConversationId: string | null;
  messages: Record<string, MessageRow[]>;
  darkMode: boolean;
  loading: boolean;
  realtimeChannel: RealtimeChannel | null;

  loadProfile: (userId: string) => Promise<void>;
  loadConversations: (userId: string) => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  setActiveConversation: (id: string) => void;
  sendMessage: (content: string, type?: string, fileName?: string, fileUrl?: string) => Promise<void>;
  toggleDarkMode: () => void;
  updateStatus: (status: string) => Promise<void>;
  subscribeRealtime: (userId: string) => void;
  unsubscribeRealtime: () => void;
  startNewConversation: (otherUserId: string) => Promise<string | null>;
  createGroupConversation: (name: string, memberIds: string[]) => Promise<string | null>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  profile: null,
  profiles: [],
  conversations: [],
  activeConversationId: null,
  messages: {},
  darkMode: true,
  loading: false,
  realtimeChannel: null,

  loadProfile: async (userId) => {
    try {
      // Load current user's profile via API
      const data = await profilesApi.get(userId);
      if (data) set({ profile: data as Profile });

      // Load all profiles via API
      const allProfiles = await profilesApi.list();
      if (allProfiles) set({ profiles: allProfiles as Profile[] });
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  },

  loadConversations: async (userId) => {
    set({ loading: true });
    try {
      // Get enriched conversations from API
      const data = await conversationsApi.list();

      const conversationsWithMeta: ConversationWithMeta[] = (data || []).map(
        (conv: any) => ({
          id: conv.id,
          type: conv.type,
          name: conv.name,
          participants: conv.participants || [],
          lastMessage: conv.last_message as MessageRow | undefined,
          unreadCount: conv.unread_count || 0,
        })
      );

      set({ conversations: conversationsWithMeta, loading: false });
    } catch (error) {
      console.error("Failed to load conversations:", error);
      set({ loading: false });
    }
  },

  loadMessages: async (conversationId) => {
    try {
      const data = await messagesApi.list(conversationId);
      if (data) {
        set((state) => ({
          messages: { ...state.messages, [conversationId]: data as MessageRow[] },
        }));
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  },

  setActiveConversation: (id) => {
    set({ activeConversationId: id });
    get().loadMessages(id);
  },

  sendMessage: async (content, type = "text", fileName, fileUrl) => {
    const { activeConversationId, profile } = get();
    if (!activeConversationId || !profile) return;

    try {
      await messagesApi.send(activeConversationId, {
        content,
        type,
        file_name: fileName || null,
        file_url: fileUrl || null,
      });
      // Optimistic update handled by realtime subscription
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  },

  toggleDarkMode: () => {
    const next = !get().darkMode;
    set({ darkMode: next });
    document.documentElement.classList.toggle("dark", next);
  },

  updateStatus: async (status) => {
    const { profile } = get();
    if (!profile) return;
    try {
      await profilesApi.update(profile.id, {
        status,
        last_seen: new Date().toISOString(),
      });
      set({ profile: { ...profile, status } });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  },

  // Keep Supabase Realtime — this is the most efficient approach
  subscribeRealtime: (userId) => {
    const channel = supabase
      .channel("chat-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new as MessageRow;
          set((state) => {
            const convMessages = state.messages[newMsg.conversation_id] || [];
            // Avoid duplicates
            if (convMessages.find((m) => m.id === newMsg.id)) return state;

            const updatedMessages = {
              ...state.messages,
              [newMsg.conversation_id]: [...convMessages, newMsg],
            };

            // Update conversation's last message
            const updatedConversations = state.conversations.map((c) =>
              c.id === newMsg.conversation_id
                ? {
                    ...c,
                    lastMessage: newMsg,
                    unreadCount:
                      state.activeConversationId !== newMsg.conversation_id &&
                      newMsg.sender_id !== userId
                        ? c.unreadCount + 1
                        : c.unreadCount,
                  }
                : c
            );

            return { messages: updatedMessages, conversations: updatedConversations };
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          const updated = payload.new as Profile;
          set((state) => ({
            profiles: state.profiles.map((p) =>
              p.id === updated.id ? updated : p
            ),
            profile: state.profile?.id === updated.id ? updated : state.profile,
          }));
        }
      )
      .subscribe();

    set({ realtimeChannel: channel });
  },

  unsubscribeRealtime: () => {
    const { realtimeChannel } = get();
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      set({ realtimeChannel: null });
    }
  },

  startNewConversation: async (otherUserId) => {
    const { profile } = get();
    if (!profile) return null;

    try {
      const result = await conversationsApi.createDirect(otherUserId);
      // Reload conversations to get full data
      await get().loadConversations(profile.id);
      return result.id;
    } catch (error) {
      console.error("Failed to start conversation:", error);
      return null;
    }
  },

  createGroupConversation: async (name, memberIds) => {
    const { profile } = get();
    if (!profile) return null;

    try {
      const result = await conversationsApi.createGroup(name, memberIds);
      await get().loadConversations(profile.id);
      return result.id;
    } catch (error) {
      console.error("Failed to create group:", error);
      return null;
    }
  },
}));
