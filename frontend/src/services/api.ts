import { supabase } from "@/integrations/supabase/client";

const API_BASE = "/api";

/**
 * Get the current Supabase session access token.
 */
async function getAuthToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

/**
 * Make an authenticated API request to the FastAPI backend.
 */
async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (let browser set it with boundary)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}

// ─── Auth ──────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signup: (name: string, email: string, password: string) =>
    apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  logout: () =>
    apiFetch("/auth/logout", { method: "POST" }),
};

// ─── Profiles ──────────────────────────────────────

export const profilesApi = {
  list: () => apiFetch("/profiles"),

  get: (id: string) => apiFetch(`/profiles/${id}`),

  update: (id: string, data: Record<string, any>) =>
    apiFetch(`/profiles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// ─── Conversations ─────────────────────────────────

export const conversationsApi = {
  list: () => apiFetch("/conversations"),

  createDirect: (otherUserId: string) =>
    apiFetch("/conversations", {
      method: "POST",
      body: JSON.stringify({ other_user_id: otherUserId }),
    }),

  createGroup: (name: string, memberIds: string[]) =>
    apiFetch("/conversations/group", {
      method: "POST",
      body: JSON.stringify({ name, member_ids: memberIds }),
    }),
};

// ─── Messages ──────────────────────────────────────

export const messagesApi = {
  list: (conversationId: string) =>
    apiFetch(`/conversations/${conversationId}/messages`),

  send: (
    conversationId: string,
    data: {
      content: string;
      type?: string;
      file_name?: string | null;
      file_url?: string | null;
    }
  ) =>
    apiFetch(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Upload ────────────────────────────────────────

export const uploadApi = {
  upload: async (file: File, conversationId?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (conversationId) {
      formData.append("conversation_id", conversationId);
    }
    return apiFetch<{ file_url: string; file_name: string; file_size: number }>(
      "/upload",
      {
        method: "POST",
        body: formData,
      }
    );
  },
};
