import type {
  LoginResponse,
  MeResponse,
  User,
  WorkspaceMembership,
} from '~~/shared/types/api'

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface LoginPayload {
  email: string
  password: string
}

/**
 * Auth state + actions. All calls go through the Nuxt BFF (`/api/auth/*`),
 * which owns the httpOnly Sanctum token cookie — the browser never sees it.
 */
export function useAuth() {
  const user = useState<User | null>('auth:user', () => null)
  const workspaces = useState<WorkspaceMembership[]>('auth:workspaces', () => [])
  const meFetched = useState<boolean>('auth:meFetched', () => false)

  // Forwards cookies during SSR; behaves as `$fetch` on the client.
  const request = useRequestFetch()

  const isAuthenticated = computed(() => user.value !== null)
  const isEmailVerified = computed(() => !!user.value?.email_verified_at)

  async function register(payload: RegisterPayload) {
    const res = await $fetch<{ user: User }>('/api/auth/register', {
      method: 'POST',
      body: payload,
    })
    user.value = res.user
    workspaces.value = []
    meFetched.value = true
    return res
  }

  async function login(payload: LoginPayload) {
    const res = await $fetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: payload,
    })
    user.value = res.user
    workspaces.value = res.workspaces ?? []
    meFetched.value = true
    return res
  }

  async function logout() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    }
    finally {
      user.value = null
      workspaces.value = []
      meFetched.value = true
      await navigateTo('/login')
    }
  }

  /** Loads the current user/workspaces. Silently no-ops when unauthenticated. */
  async function fetchMe(force = false): Promise<MeResponse | null> {
    if (meFetched.value && !force) {
      return user.value ? { user: user.value, workspaces: workspaces.value } : null
    }
    try {
      const res = await request<MeResponse>('/api/auth/me')
      user.value = res.user
      workspaces.value = res.workspaces ?? []
      return res
    }
    catch {
      user.value = null
      workspaces.value = []
      return null
    }
    finally {
      meFetched.value = true
    }
  }

  async function verifyEmail(id: string, hash: string) {
    const res = await $fetch<{ user: User }>('/api/auth/email/verify', {
      method: 'POST',
      body: { id, hash },
    })
    if (res?.user) user.value = res.user
    return res
  }

  async function resendVerification() {
    return await $fetch('/api/auth/email/resend', { method: 'POST' })
  }

  async function forgotPassword(email: string) {
    return await $fetch('/api/auth/password/forgot', {
      method: 'POST',
      body: { email },
    })
  }

  async function resetPassword(payload: {
    token: string
    email: string
    password: string
    password_confirmation: string
  }) {
    return await $fetch('/api/auth/password/reset', {
      method: 'POST',
      body: payload,
    })
  }

  return {
    user,
    workspaces,
    isAuthenticated,
    isEmailVerified,
    register,
    login,
    logout,
    fetchMe,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
  }
}
