import { createAuthClient } from "better-auth/react"

const getAuthBaseURL = () => {
    // Always use same-origin to ensure OAuth cookies work correctly.
    // Both dev (Vite proxy) and prod (Vercel rewrite) proxy /api/* to the backend.
    return window.location.origin + "/api/auth"
}

export const authClient = createAuthClient({
    baseURL: getAuthBaseURL()
})
