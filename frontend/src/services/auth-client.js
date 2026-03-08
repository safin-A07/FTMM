import { createAuthClient } from "better-auth/react"

const getAuthBaseURL = () => {
    // Production: use backend URL from environment
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace('/api', '') + "/api/auth"
    }
    // Development: use relative path (works with proxy)
    return window.location.origin + "/api/auth"
}

export const authClient = createAuthClient({
    baseURL: getAuthBaseURL()
})
