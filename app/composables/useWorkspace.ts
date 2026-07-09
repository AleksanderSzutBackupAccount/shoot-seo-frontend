import type {
  AcceptInvitationResponse,
  CreateInvitationResponse,
  CreateWorkspaceResponse,
  InvitationPreview,
  InvitationPreviewResponse,
  Member,
  MemberResponse,
  MembersResponse,
  Role,
  WorkspaceMembership,
  WorkspacesResponse,
} from '~~/shared/types/api'

/**
 * Workspace/tenancy state + actions. The "current workspace" lives in the
 * `workspace_id` cookie; the BFF reads it and forwards `X-Workspace-Id` to
 * Laravel for every tenant-scoped call.
 */
export function useWorkspace() {
  const { workspaces, fetchMe } = useAuth()

  const currentId = useCookie<string | null>('workspace_id', {
    sameSite: 'lax',
    path: '/',
    default: () => null,
  })

  const current = computed<WorkspaceMembership | null>(
    () => workspaces.value.find(w => w.id === currentId.value) ?? null,
  )

  const isAdmin = computed(() => current.value?.role === 'admin')

  /** Selects a sane current workspace when none/stale is set. */
  function ensureCurrent() {
    const has = (id: string | null) => !!id && workspaces.value.some(w => w.id === id)
    if (!has(currentId.value)) {
      currentId.value = workspaces.value[0]?.id ?? null
    }
  }

  async function refresh() {
    const res = await $fetch<WorkspacesResponse>('/api/workspaces')
    workspaces.value = res.workspaces ?? []
    ensureCurrent()
    return workspaces.value
  }

  async function create(name: string): Promise<CreateWorkspaceResponse> {
    const res = await $fetch<CreateWorkspaceResponse>('/api/workspaces', {
      method: 'POST',
      body: { name },
    })
    await fetchMe(true) // reload memberships from source of truth
    currentId.value = res.workspace.id
    return res
  }

  function setCurrent(id: string) {
    currentId.value = id
  }

  async function switchTo(id: string) {
    if (id === currentId.value) return
    currentId.value = id
    await navigateTo('/dashboard')
  }

  // ---- Members (tenant-scoped) ----

  async function fetchMembers(workspaceId?: string): Promise<Member[]> {
    const id = workspaceId ?? currentId.value
    if (!id) return []
    const res = await $fetch<MembersResponse>(`/api/workspaces/${id}/members`)
    return res.members ?? []
  }

  async function inviteMember(email: string, role: Role, workspaceId?: string) {
    const id = workspaceId ?? currentId.value
    return await $fetch<CreateInvitationResponse>(`/api/workspaces/${id}/invitations`, {
      method: 'POST',
      body: { email, role },
    })
  }

  async function changeMemberRole(userId: string, role: Role, workspaceId?: string) {
    const id = workspaceId ?? currentId.value
    return await $fetch<MemberResponse>(`/api/workspaces/${id}/members/${userId}`, {
      method: 'PATCH',
      body: { role },
    })
  }

  async function removeMember(userId: string, workspaceId?: string) {
    const id = workspaceId ?? currentId.value
    await $fetch(`/api/workspaces/${id}/members/${userId}`, { method: 'DELETE' })
  }

  // ---- Invitations (accept flow) ----

  async function fetchInvitation(token: string): Promise<InvitationPreview> {
    const res = await $fetch<InvitationPreviewResponse>(`/api/invitations/${token}`)
    return res.invitation
  }

  async function acceptInvitation(token: string): Promise<AcceptInvitationResponse> {
    const res = await $fetch<AcceptInvitationResponse>(`/api/invitations/${token}/accept`, {
      method: 'POST',
    })
    await fetchMe(true)
    currentId.value = res.workspace.id
    return res
  }

  return {
    workspaces,
    currentId,
    current,
    isAdmin,
    ensureCurrent,
    refresh,
    create,
    setCurrent,
    switchTo,
    fetchMembers,
    inviteMember,
    changeMemberRole,
    removeMember,
    fetchInvitation,
    acceptInvitation,
  }
}
