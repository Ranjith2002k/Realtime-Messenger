import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: false,
  user: null,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;

    // Set up auth listener FIRST
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        isAuthenticated: !!session?.user,
        user: session?.user ?? null,
      });
    });

    // Then get current session
    const { data: { session } } = await supabase.auth.getSession();
    set({
      isAuthenticated: !!session?.user,
      user: session?.user ?? null,
      initialized: true,
    });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    set({ isLoading: false });
    return error?.message ?? null;
  },

  signup: async (name, email, password) => {
    set({ isLoading: true });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin,
      },
    });
    set({ isLoading: false });
    return error?.message ?? null;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, user: null });
  },
}));
