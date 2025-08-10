import { create } from "zustand"

interface AuthState {
  isAuthenticated: boolean
  isLoggingOut: boolean
  // The login function is now async as it communicates with the server
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  setLoggingOut: (value: boolean) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoggingOut: false,

  // This function now securely checks credentials against the server
  login: async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          set({ isAuthenticated: true, isLoggingOut: false })
          return true
        }
      }
      return false
    } catch (error) {
      console.error("Login request failed:", error)
      return false
    }
  },

  setLoggingOut: (value: boolean) => {
    set({ isLoggingOut: value })
  },

  logout: () => {
    // Set logging out state
    set({ isLoggingOut: true })

    // Clean up any auth-related storage
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("admin-session")
      } catch (error) {
        console.warn("Failed to clear localStorage:", error)
      }
    }

    // Reset auth state
    set({ isAuthenticated: false, isLoggingOut: false })
  },
}))
