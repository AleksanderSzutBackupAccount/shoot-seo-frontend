// Global auth guard.
//  - Unauthenticated users are sent to /login (auth pages stay public).
//  - Authenticated users with no workspace are sent to /workspaces/new.

// Public pages that redirect to the dashboard once authenticated.
const AUTH_PAGES = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
])

// Authenticated pages that must NOT trigger the "no workspace" redirect
// (the user may be there precisely to create/join their first workspace).
const NO_WORKSPACE_CHECK = new Set([
  '/workspaces/new',
  '/verify-email',
])

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth()
  await auth.fetchMe()

  const isAuthed = auth.isAuthenticated.value
  const isInvitation = to.path.startsWith('/invitations/')

  // Public auth pages.
  if (AUTH_PAGES.has(to.path)) {
    return isAuthed ? navigateTo('/dashboard') : undefined
  }

  // Public marketing home: guests see the landing, authed users go to the app.
  if (to.path === '/') {
    return isAuthed ? navigateTo('/dashboard') : undefined
  }

  // Everything else requires authentication.
  if (!isAuthed) {
    const redirect = to.fullPath !== '/' ? `?redirect=${encodeURIComponent(to.fullPath)}` : ''
    return navigateTo(`/login${redirect}`)
  }

  // Invitation pages just need a logged-in user.
  if (isInvitation) return

  // Authenticated but no workspace yet -> onboarding.
  if (!NO_WORKSPACE_CHECK.has(to.path) && auth.workspaces.value.length === 0) {
    return navigateTo('/workspaces/new')
  }

  // Keep a current workspace selected for tenant-scoped calls.
  if (auth.workspaces.value.length > 0) {
    useWorkspace().ensureCurrent()
  }
})
