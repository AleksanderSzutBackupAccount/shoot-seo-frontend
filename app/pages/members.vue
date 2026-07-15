<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Member, Role } from '~~/shared/types/api'

useHead({ title: 'Członkowie — Shoot SEO' })

const { user } = useAuth()
const { current, isAdmin, fetchMembers, changeMemberRole, removeMember } = useWorkspace()
const toast = useToast()

const { data: members, status, refresh } = await useAsyncData(
  'members',
  () => fetchMembers(),
  { watch: [() => current.value?.id], default: () => [] as Member[] },
)

const roleOptions: { label: string, value: Role }[] = [
  { label: 'Użytkownik', value: 'user' },
  { label: 'Administrator', value: 'admin' },
]

function roleLabel(role: Role): string {
  return roleOptions.find(o => o.value === role)?.label ?? role
}

const columns: TableColumn<Member>[] = [
  { accessorKey: 'name', header: 'Imię i nazwisko' },
  { accessorKey: 'email', header: 'E-mail' },
  { accessorKey: 'role', header: 'Rola' },
  { id: 'actions', header: '' },
]

const inviteOpen = ref(false)
const removeTarget = ref<Member | null>(null)
const removing = ref(false)
const busyUserId = ref<string | null>(null)

function isSelf(member: Member) {
  return member.user_id === user.value?.id
}

async function onRoleChange(member: Member, role: Role) {
  if (role === member.role) return
  busyUserId.value = member.user_id
  try {
    await changeMemberRole(member.user_id, role)
    toast.add({ title: 'Zmieniono rolę', color: 'success' })
    await refresh()
  }
  catch (err) {
    toast.add({ title: parseApiError(err).message, color: 'error' })
  }
  finally {
    busyUserId.value = null
  }
}

async function confirmRemove() {
  if (!removeTarget.value) return
  removing.value = true
  try {
    await removeMember(removeTarget.value.user_id)
    toast.add({ title: 'Usunięto członka', color: 'success' })
    removeTarget.value = null
    await refresh()
  }
  catch (err) {
    toast.add({ title: parseApiError(err).message, color: 'error' })
  }
  finally {
    removing.value = false
  }
}
</script>

<template>
  <div>
    <AppPageHeader
      eyebrow="Zespół"
      title="Członkowie"
      :description="`Osoby z dostępem do workspace „${current?.name ?? '—'}” i ich role.`"
    >
      <template #actions>
        <UButton v-if="isAdmin" color="neutral" icon="i-lucide-user-plus" size="lg" @click="inviteOpen = true">
          Zaproś
        </UButton>
      </template>
    </AppPageHeader>

    <div class="u-card overflow-hidden">
      <UTable
        :data="members ?? []"
        :columns="columns"
        :loading="status === 'pending'"
        :ui="{
          th: 'px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-left',
          td: 'px-5 py-4 text-sm align-middle',
          tr: 'transition-colors hover:bg-[var(--surface-strong)]',
          empty: 'py-10 text-center text-sm',
        }"
      >
        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar :alt="row.original.name" size="sm" icon="i-lucide-user" />
            <span style="color: var(--ink); font-weight: 500">{{ row.original.name }}</span>
          </div>
        </template>

        <template #email-cell="{ row }">
          <span style="color: var(--muted)">{{ row.original.email }}</span>
        </template>

        <template #role-cell="{ row }">
          <USelect
            v-if="isAdmin && !isSelf(row.original)"
            :model-value="row.original.role"
            :items="roleOptions"
            :loading="busyUserId === row.original.user_id"
            size="sm"
            class="w-40"
            @update:model-value="(value: Role) => onRoleChange(row.original, value)"
          />
          <span v-else class="badge-pill">{{ roleLabel(row.original.role) }}</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end">
            <UButton
              v-if="isAdmin && !isSelf(row.original)"
              icon="i-lucide-trash-2"
              color="neutral"
              variant="ghost"
              size="sm"
              aria-label="Usuń członka"
              @click="removeTarget = row.original"
            />
            <span v-else-if="isSelf(row.original)" class="text-xs" style="color: var(--muted-soft)">To Ty</span>
          </div>
        </template>
      </UTable>
    </div>

    <InviteMemberModal v-model:open="inviteOpen" @invited="refresh" />

    <UModal
      :open="removeTarget !== null"
      title="Usunąć członka?"
      :description="`Czy na pewno chcesz usunąć ${removeTarget?.name} z workspace?`"
      @update:open="(value: boolean) => { if (!value) removeTarget = null }"
    >
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="ghost" @click="removeTarget = null">Anuluj</UButton>
          <UButton color="error" :loading="removing" @click="confirmRemove">Usuń</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
