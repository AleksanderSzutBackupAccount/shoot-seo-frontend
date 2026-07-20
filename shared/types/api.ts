// DTO shapes shared by the Nuxt app and the BFF (server/api).
// Source of truth: docs/api-contract-m0.md

export type Role = 'admin' | 'user'

export interface User {
  id: string
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
}

export interface Workspace {
  id: string
  name: string
  slug: string
  created_at: string
}

/** A workspace the current user belongs to, with their role in it. */
export interface WorkspaceMembership {
  id: string // workspace id
  name: string
  slug: string
  role: Role
}

export interface Member {
  user_id: string
  name: string
  email: string
  role: Role
  joined_at: string
}

export interface Invitation {
  id: string
  email: string
  role: Role
  expires_at: string
  accepted_at: string | null
}

/** Public invitation preview returned by GET /invitations/{token}. */
export interface InvitationPreview {
  email: string
  role: Role
  workspace: {
    id: string
    name: string
  }
}

// ---- Endpoint response envelopes ----

export interface AuthTokenResponse {
  user: User
  token: string
}

export interface LoginResponse {
  user: User
  token: string
  workspaces: WorkspaceMembership[]
}

export interface MeResponse {
  user: User
  workspaces: WorkspaceMembership[]
}

export interface WorkspacesResponse {
  workspaces: WorkspaceMembership[]
}

export interface CreateWorkspaceResponse {
  workspace: Workspace
  role: Role
}

export interface MembersResponse {
  members: Member[]
}

export interface CreateInvitationResponse {
  invitation: Invitation
}

export interface MemberResponse {
  member: Member
}

export interface InvitationPreviewResponse {
  invitation: InvitationPreview
}

export interface AcceptInvitationResponse {
  workspace: Workspace
  role: Role
}

/** Laravel validation error body (422). */
export interface ValidationErrorBody {
  message: string
  errors: Record<string, string[]>
}

// ============================================================================
// M1 — Content + Planer
// Source of truth: docs/api-contract-m1.md
// ============================================================================

export type PostStatus = 'draft' | 'scheduled' | 'published'

export interface Seo {
  meta_title: string | null
  meta_description: string | null
  og_image_url: string | null
  canonical_url: string | null
}

export interface Post {
  id: string
  workspace_id: string
  title: string
  slug: string
  excerpt: string | null
  content: string // HTML from the WYSIWYG editor
  main_image_url: string | null
  status: PostStatus
  scheduled_at: string | null
  published_at: string | null
  seo: Seo | null
  /** Content language code (e.g. `pl`, `en`) — see `config('ai.languages')` on the backend. */
  language?: string
  created_at: string
  updated_at: string
}

/** Lighter shape returned by the list/calendar endpoints (no full content). */
export interface PostSummary {
  id: string
  title: string
  slug: string
  status: PostStatus
  scheduled_at: string | null
  published_at: string | null
  main_image_url: string | null
  /** Content language code (e.g. `pl`, `en`) — see `config('ai.languages')` on the backend. */
  language?: string
  updated_at: string
}

export interface CalendarEntry {
  id: string
  title: string
  slug: string
  status: PostStatus
  date: string // scheduled_at || published_at
}

export interface Media {
  id: string
  url: string
  mime: string
  size: number
  created_at: string
}

export interface Channel {
  id: string
  type: 'headless' | 'facebook' | 'linkedin'
  name: string
  status: string
  /** Human-readable account name from the connected provider (M3). */
  external_account_name?: string | null
}

export interface Publication {
  id: string
  post_id: string
  channel_id: string
  status: 'pending' | 'success' | 'failed' | 'revoked'
  published_at: string | null
  created_at: string
  /** Delivery attempt count (M3). */
  attempts?: number
  /** Link to the published item on the external platform (M3). */
  external_url?: string | null
  /** Last delivery error message, if any (M3). */
  error?: string | null
}

// ---- Post request payloads ----

export interface CreatePostPayload {
  title: string
  content?: string
  excerpt?: string | null
  main_image_url?: string | null
  slug?: string
  seo?: Seo | null
  /** Content language code (e.g. `pl`, `en`) — see `config('ai.languages')` on the backend. */
  language?: string
}

/** All fields optional — PATCH sends only what changed. */
export type UpdatePostPayload = Partial<CreatePostPayload>

// ---- M1 response envelopes ----

export interface PostsResponse {
  posts: PostSummary[]
}

export interface PostResponse {
  post: Post
}

export interface CalendarResponse {
  posts: CalendarEntry[]
}

export interface MediaResponse {
  media: Media[]
}

export interface MediaUploadResponse {
  media: Media
}

export interface ChannelsResponse {
  channels: Channel[]
}

export interface PublicationsResponse {
  publications: Publication[]
}

// ============================================================================
// M2 — Delivery: Headless API keys + Webhooks
// Source of truth: docs/api-contract-m2.md
// ============================================================================

export interface ApiKey {
  id: string
  name: string
  prefix: string // visible prefix (e.g. "sk_live_ab12")
  scopes: string[]
  last_used_at: string | null
  created_at: string
}

/** Dashboard-configurable webhook events. */
export type WebhookEvent = 'post.published' | 'post.unpublished'

export interface Webhook {
  id: string
  url: string
  events: string[]
  active: boolean
  created_at: string
}

export interface WebhookDelivery {
  id: string
  event: string
  response_status: number | null
  attempts: number
  delivered_at: string | null
  created_at: string
}

/** Shape returned to the client site by the public v1 API (no internal fields). */
export interface PublicPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string // HTML
  main_image_url: string | null
  seo: Seo | null
  published_at: string | null
}

// ---- M2 request payloads ----

export interface CreateApiKeyPayload {
  name: string
  scopes?: string[]
}

export interface CreateWebhookPayload {
  url: string
  events: string[]
}

// ---- M2 response envelopes ----

export interface ApiKeysResponse {
  keys: ApiKey[]
}

/** `plaintext` (full key) is returned ONLY once, at creation. */
export interface CreateApiKeyResponse {
  key: ApiKey
  plaintext: string
}

export interface WebhooksResponse {
  webhooks: Webhook[]
}

/** `secret` (HMAC signing secret) is returned ONLY once, at creation. */
export interface CreateWebhookResponse {
  webhook: Webhook
  secret: string
}

export interface WebhookDeliveriesResponse {
  deliveries: WebhookDelivery[]
}

// ============================================================================
// M3 — Social publishing
// Source of truth: docs/api-contract-m3.md
// ============================================================================

/** Returned by POST /channels/complete and POST /channels/{id}/refresh. */
export interface ChannelResponse {
  channel: Channel
}

/** Returned by POST /channels/connect — redirect the user here to authorize. */
export interface ConnectResponse {
  authorization_url: string
}

/** Returned by GET/PUT /settings/public-host. */
export interface PublicHostResponse {
  public_base_url: string | null
}

// ============================================================================
// M4 — AI content engine
// Source of truth: docs/api-contract-m4.md
// ============================================================================

export interface AiUsageTokens {
  tokens_in: number
  tokens_out: number
  cost_estimate: number
}

export interface AiResult {
  text: string
  usage: AiUsageTokens
}

export interface AiAnalysis {
  analysis: {
    readability: { score: number }
    seo: { issues: string[] }
    gaps: string[]
  }
  usage: AiUsageTokens
}

export interface AiUsage {
  period: string
  tokens_used: number
  tokens_limit: number
  remaining: number
  words_est: number
}

// ============================================================================
// M5 — Billing (plans, subscriptions, entitlements)
// Source of truth: docs/api-contract-m5.md
// ============================================================================

/** Flat dotted entitlement keys, as returned by the API. */
export interface PlanEntitlements {
  'ai.token_limit': number
  'autonomous.enabled': boolean
}

export interface Plan {
  code: string
  name: string
  price_cents: number
  currency: string
  purchasable: boolean
  entitlements: PlanEntitlements
}

export interface CurrentPlan {
  code: string
  name: string
  price_cents: number
  currency: string
  status: string
  current_period_end: string | null
  entitlements: PlanEntitlements
  is_trialing: boolean
  trial_ends_at: string | null
  trial_days_left: number | null
  is_trial_eligible: boolean
}

export interface PlansResponse {
  plans: Plan[]
}

/** Returned by POST /billing/checkout and POST /billing/portal — redirect the user here. */
export interface BillingUrl {
  url: string
}

// ============================================================================
// M6 — Analytics (views / uniques / engagement)
// Source of truth: docs/api-contract-m6.md
// ============================================================================

/** Inclusive `from`/`to` window as `YYYY-MM-DD`. Omit both → backend defaults to last 28 days. */
export interface AnalyticsDateRange {
  from: string
  to: string
}

/** One day of the daily time series. */
export interface AnalyticsSeriesPoint {
  date: string // YYYY-MM-DD
  views: number
  uniques: number
  avg_engagement_ms: number
}

/** Aggregate totals + daily series. Same shape for the workspace overview and a single post. */
export interface AnalyticsOverview {
  views: number
  uniques: number
  avg_engagement_ms: number
  series: AnalyticsSeriesPoint[]
}

/** A row of the "top posts" table (ordered by views desc). */
export interface AnalyticsPostRow {
  post_id: string
  slug: string
  title: string
  views: number
  uniques: number
  avg_engagement_ms: number
}

// ---- M6 response envelopes (`{ data: ... }`) ----

export interface AnalyticsOverviewResponse {
  data: AnalyticsOverview
}

export interface AnalyticsPostsResponse {
  data: AnalyticsPostRow[]
}

// ============================================================================
// M7 — Autonomous content (sites, briefs, plans, proposals)
// Source of truth: docs/api-contract-m7.md
// ============================================================================

export type AutonomousSiteStatus = 'pending' | 'crawling' | 'ready' | 'failed'
export type AutonomousPlanStatus = 'active' | 'paused'
export type AutonomousFrequency = 'daily' | 'weekly'

/** A crawled site the autonomous engine can generate content for. */
export interface AutonomousSite {
  id: string
  url: string
  status: AutonomousSiteStatus
  last_crawled_at: string | null
}

/** Editorial brief distilled from a crawl (also returned by the brief endpoint). */
export interface AutonomousBrief {
  summary: string
  keywords: string[]
  tone: string
}

/** A recurring content plan bound to a ready site. */
export interface AutonomousPlan {
  id: string
  site_id: string
  status: AutonomousPlanStatus
  topic_source: string
  tone: string
  frequency: AutonomousFrequency
  next_run_at: string | null
  run_count: number
}

/** A generated draft proposal — links to the post editor at `/posts/{post_id}`. */
export interface AutonomousProposal {
  post_id: string
  topic: string
  status: string
  created_at: string
}

// ---- M7 request payloads ----

export interface CreateAutonomousPlanPayload {
  site_id: string
  frequency: AutonomousFrequency
  tone?: string
  topic_source?: string
}

// ---- M7 response envelopes ----

export interface AutonomousSitesResponse {
  data: AutonomousSite[]
}

/** `null` until the site has been crawled. */
export interface AutonomousBriefResponse {
  data: AutonomousBrief | null
}

export interface AutonomousPlansResponse {
  data: AutonomousPlan[]
}

export interface AutonomousProposalsResponse {
  data: AutonomousProposal[]
}

/** POST create endpoints (site / plan) return only the new id (201). */
export interface AutonomousCreatedResponse {
  id: string
}

/** PATCH /plans/{id} echoes the new status. */
export interface AutonomousPlanStatusResponse {
  status: AutonomousPlanStatus
}
