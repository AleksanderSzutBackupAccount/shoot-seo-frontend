<script setup lang="ts">
import type {
  AutonomousBrief,
  AutonomousFrequency,
  AutonomousPlan,
  AutonomousProposal,
  AutonomousSite,
} from '~~/shared/types/api'

const { t, locale } = useI18n()
useHead({ title: () => t('autonomous.pageTitle') })

const { current } = useWorkspace()
const toast = useToast()
const {
  fetchSites, createSite, crawlSite, fetchPlans, createPlan, updatePlan, fetchProposals,
} = useAutonomous()

const sitesQuery = useAsyncData('autonomous-sites', fetchSites, {
  watch: [() => current.value?.id], default: () => [] as AutonomousSite[],
})
const plansQuery = useAsyncData('autonomous-plans', fetchPlans, {
  watch: [() => current.value?.id], default: () => [] as AutonomousPlan[],
})
const proposalsQuery = useAsyncData('autonomous-proposals', fetchProposals, {
  watch: [() => current.value?.id], default: () => [] as AutonomousProposal[],
})
await Promise.all([sitesQuery, plansQuery, proposalsQuery])

const sites = sitesQuery.data
const plans = plansQuery.data
const proposals = proposalsQuery.data

const gated = ref(false)
const briefs = reactive<Record<string, AutonomousBrief | null>>({})
const busy = reactive<Record<string, boolean>>({})

/** A write blocked by the plan surfaces as HTTP 403 — flip the upgrade notice. */
function handleWrite(e: unknown): void {
  const status = (e as { statusCode?: number, status?: number, response?: { status?: number } })
  if (status?.statusCode === 403 || status?.status === 403 || status?.response?.status === 403) {
    gated.value = true
    toast.add({ title: t('autonomous.gate.toastTitle'), description: t('autonomous.gate.toastDescription'), color: 'warning' })
  } else {
    toast.add({ title: t('autonomous.genericError'), color: 'error' })
  }
}

const newUrl = ref('')
async function addSite(): Promise<void> {
  if (!newUrl.value) return
  try {
    await createSite(newUrl.value)
    newUrl.value = ''
    await sitesQuery.refresh()
  } catch (e) {
    handleWrite(e)
  }
}

async function crawl(site: AutonomousSite): Promise<void> {
  busy[site.id] = true
  try {
    briefs[site.id] = await crawlSite(site.id)
    await sitesQuery.refresh()
  } catch (e) {
    handleWrite(e)
  } finally {
    busy[site.id] = false
  }
}

const readySites = computed(() => sites.value?.filter(s => s.status === 'ready') ?? [])
const planSiteId = ref('')
const planFrequency = ref<AutonomousFrequency>('daily')
// Default AI content tone — a real default value sent to the backend, not UI chrome; left untranslated.
const planTone = ref('profesjonalny')
const frequencyOptions = computed(() => [
  { label: t('autonomous.frequency.daily'), value: 'daily' },
  { label: t('autonomous.frequency.weekly'), value: 'weekly' },
])

async function submitPlan(): Promise<void> {
  if (!planSiteId.value) return
  try {
    await createPlan({ site_id: planSiteId.value, frequency: planFrequency.value, tone: planTone.value || undefined })
    planSiteId.value = ''
    await plansQuery.refresh()
  } catch (e) {
    handleWrite(e)
  }
}

async function togglePlan(plan: AutonomousPlan): Promise<void> {
  try {
    await updatePlan(plan.id, plan.status === 'active' ? 'paused' : 'active')
    await plansQuery.refresh()
  } catch (e) {
    handleWrite(e)
  }
}

const siteStatusMeta = computed<Record<AutonomousSite['status'], { label: string, color: 'neutral' | 'warning' | 'success' | 'error' }>>(() => ({
  pending: { label: t('autonomous.status.pending'), color: 'neutral' },
  crawling: { label: t('autonomous.status.crawling'), color: 'warning' },
  ready: { label: t('autonomous.status.ready'), color: 'success' },
  failed: { label: t('autonomous.status.failed'), color: 'error' },
}))

function plDateTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(locale.value, { dateStyle: 'short', timeStyle: 'short' })
}
</script>

<template>
  <div>
    <AppPageHeader
      :eyebrow="$t('nav.autonomous')"
      :title="$t('autonomous.title')"
      :description="$t('autonomous.description')"
    />

    <UAlert
      v-if="gated"
      class="mb-6"
      color="warning"
      variant="subtle"
      icon="i-lucide-lock"
      :title="$t('autonomous.gate.alertTitle')"
      :description="$t('autonomous.gate.alertDescription')"
    >
      <template #actions>
        <UButton to="/settings/billing" color="neutral" size="sm">{{ $t('autonomous.gate.cta') }}</UButton>
      </template>
    </UAlert>

    <div class="space-y-6">
      <!-- Sites -->
      <section class="u-card p-6">
        <h2 class="card-title mb-4">{{ $t('autonomous.sitesTitle') }}</h2>
        <form class="mb-5 flex flex-wrap items-center gap-3" @submit.prevent="addSite">
          <UInput v-model="newUrl" type="url" :placeholder="$t('autonomous.siteUrlPlaceholder')" class="min-w-64 flex-1" />
          <UButton type="submit" icon="i-lucide-plus" color="neutral">{{ $t('autonomous.addSite') }}</UButton>
        </form>

        <AppEmptyState
          v-if="(sites?.length ?? 0) === 0"
          icon="i-lucide-globe"
          :title="$t('autonomous.sitesEmptyTitle')"
          :description="$t('autonomous.sitesEmptyDescription')"
        />

        <div v-else class="space-y-3">
          <div v-for="site in sites" :key="site.id" class="rounded-xl p-4" style="border: 1px solid var(--hairline)">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate font-medium" style="color: var(--ink)">{{ site.url }}</p>
                <p class="text-xs" style="color: var(--muted-soft)">{{ $t('autonomous.lastCrawl', { date: plDateTime(site.last_crawled_at) }) }}</p>
              </div>
              <div class="flex items-center gap-3">
                <UBadge :color="siteStatusMeta[site.status].color" variant="subtle">{{ siteStatusMeta[site.status].label }}</UBadge>
                <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-radar" :loading="busy[site.id]" @click="crawl(site)">
                  {{ $t('autonomous.crawl') }}
                </UButton>
              </div>
            </div>
            <div v-if="briefs[site.id]" class="mt-4 border-t pt-4" style="border-color: var(--hairline-soft)">
              <AppAutonomousBrief :brief="briefs[site.id]!" />
            </div>
          </div>
        </div>
      </section>

      <!-- Plans -->
      <section class="u-card p-6">
        <h2 class="card-title mb-4">{{ $t('autonomous.plansTitle') }}</h2>
        <form class="mb-5 flex flex-wrap items-end gap-3" @submit.prevent="submitPlan">
          <div class="min-w-56 flex-1">
            <label class="eyebrow mb-1 block">{{ $t('autonomous.siteReadyLabel') }}</label>
            <USelect
              v-model="planSiteId"
              :items="readySites.map(s => ({ label: s.url, value: s.id }))"
              :placeholder="$t('autonomous.selectSitePlaceholder')"
            />
          </div>
          <div>
            <label class="eyebrow mb-1 block">{{ $t('autonomous.frequencyLabel') }}</label>
            <USelect v-model="planFrequency" :items="frequencyOptions" />
          </div>
          <div class="min-w-40">
            <label class="eyebrow mb-1 block">{{ $t('autonomous.toneLabel') }}</label>
            <UInput v-model="planTone" placeholder="profesjonalny" />
          </div>
          <UButton type="submit" icon="i-lucide-calendar-plus" color="neutral" :disabled="!planSiteId">{{ $t('autonomous.createPlan') }}</UButton>
        </form>

        <AppEmptyState
          v-if="(plans?.length ?? 0) === 0"
          icon="i-lucide-calendar-clock"
          :title="$t('autonomous.plansEmptyTitle')"
          :description="$t('autonomous.plansEmptyDescription')"
        />

        <table v-else class="w-full text-sm">
          <thead>
            <tr class="text-left" style="color: var(--muted)">
              <th class="py-2">{{ $t('posts.colStatus') }}</th>
              <th class="py-2">{{ $t('autonomous.frequencyLabel') }}</th>
              <th class="py-2">{{ $t('autonomous.nextRun') }}</th>
              <th class="py-2 text-right">{{ $t('autonomous.runCount') }}</th>
              <th class="py-2 text-right">{{ $t('autonomous.action') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="plan in plans" :key="plan.id" style="border-top: 1px solid var(--hairline-soft)">
              <td class="py-3">
                <UBadge :color="plan.status === 'active' ? 'success' : 'neutral'" variant="subtle">
                  {{ plan.status === 'active' ? $t('autonomous.planStatus.active') : $t('autonomous.planStatus.paused') }}
                </UBadge>
              </td>
              <td class="py-3">{{ plan.frequency === 'daily' ? $t('autonomous.frequencyCell.daily') : $t('autonomous.frequencyCell.weekly') }}</td>
              <td class="py-3 tabular-nums">{{ plDateTime(plan.next_run_at) }}</td>
              <td class="py-3 text-right tabular-nums">{{ plan.run_count }}</td>
              <td class="py-3 text-right">
                <UButton size="xs" color="neutral" variant="ghost" @click="togglePlan(plan)">
                  {{ plan.status === 'active' ? $t('autonomous.pause') : $t('autonomous.resume') }}
                </UButton>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Proposals -->
      <section class="u-card p-6">
        <h2 class="card-title mb-4">{{ $t('autonomous.proposalsTitle') }}</h2>
        <AppEmptyState
          v-if="(proposals?.length ?? 0) === 0"
          icon="i-lucide-file-pen"
          :title="$t('autonomous.proposalsEmptyTitle')"
          :description="$t('autonomous.proposalsEmptyDescription')"
        />
        <ul v-else class="space-y-2">
          <li
            v-for="proposal in proposals"
            :key="proposal.post_id"
            class="flex items-center justify-between rounded-xl p-4"
            style="border: 1px solid var(--hairline)"
          >
            <div class="min-w-0">
              <p class="truncate font-medium" style="color: var(--ink)">{{ proposal.topic }}</p>
              <p class="text-xs" style="color: var(--muted-soft)">{{ plDateTime(proposal.created_at) }}</p>
            </div>
            <UButton :to="`/posts/${proposal.post_id}`" size="sm" color="neutral" variant="outline" icon="i-lucide-pencil">
              {{ $t('autonomous.openDraft') }}
            </UButton>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
