-- Migration: reserve_system_slugs — seed permanent slug reservations (Phase 1).
-- =============================================================================
-- Pre-claims system / route / brand / product slugs so no user can ever grab a
-- path we (a) already serve, or (b) may want to serve later. Losing a top-level
-- route to a user is effectively irreversible once their event is live, so we
-- over-reserve deliberately — every entry is one cheap row; a stolen route is not.
--
-- MECHANISM (no logic change): these are permanent rows (expires_at IS NULL) in
-- slug_reservations. The existing checks already honour them —
--   • is_slug_taken / reserve_slug  → blocks event slugs  (/:slug)
--   • create_invitation             → blocks invitation link_slugs (/:slug/:link)
-- so seeding the data is the entire feature; nothing else needs to change.
--
-- SENTINEL user_id: 00000000-0000-0000-0000-000000000000. user_id is NOT NULL
-- with no FK to auth.users, so an all-zeros UUID is a safe, unmistakable "system"
-- owner. No human authenticates as it, and permanent rows block everyone anyway
-- (the NULL-expiry branch in the checks ignores the owner comparison). Phases 2–3
-- (special words, exact profanities) will reuse this same sentinel.
--
-- GUARDS: DISTINCT (so a duplicate entry can't trip "ON CONFLICT ... twice") and a
-- SLUG_REGEX filter (so an accidental sub-3-char / malformed entry is skipped, not
-- stored as a dead unreachable row). ON CONFLICT forces permanence + idempotency:
-- re-running is safe, and any transient hold on a reserved word is upgraded to
-- permanent.
--
-- NOTE: this does NOT reclaim a slug already owned by an existing event — events
-- keep their slug via events.slug UNIQUE. Any pre-existing event sitting on one of
-- these words must be handled manually (rename); the redundant reservation row is
-- harmless. (Today none of these should be in use, but flagging the boundary.)
-- =============================================================================

INSERT INTO public.slug_reservations (slug, user_id, expires_at)
SELECT DISTINCT s, '00000000-0000-0000-0000-000000000000'::uuid, NULL::timestamptz
FROM unnest(ARRAY[
  -- ── Live routes + auth (exist today in AppRoutes / AdminRoutes) ────────────
  'admin','login','logout','signin','signout','signup','register',
  'sign-in','sign-out','sign-up','log-in','log-out',
  'reset-password','forgot-password','password','auth','oauth','sso','callback',
  'verify','verification','confirm','dashboard','privacy','join',

  -- ── Infra / technical ─────────────────────────────────────────────────────
  'api','app','apps','web','www','cdn','assets','static','public','media',
  'file','files','image','images','img','photo','photos','upload','uploads',
  'download','downloads','robots','sitemap','favicon','manifest','service-worker',
  'health','status','ping','metrics','monitoring','debug','css','font','fonts',
  'graphql','rest','rpc','webhook','webhooks','socket',

  -- ── Brand / company / official ────────────────────────────────────────────
  'hitchy','stitchy','hitchystitchy','hitchy-stitchy','official','team','teams',
  'staff','crew','administrator','superadmin','sysadmin','root','owner',
  'moderator','mod','webmaster','postmaster','support','help','helpdesk',
  'help-center','helpcenter','contact','contact-us','contactus','feedback',
  'report','abuse','security','trust','safety','about','about-us','aboutus',
  'info','company','story','our-story','ourstory','mission','mail','email',
  'inbox','noreply','no-reply','notification','notifications','alerts','press',
  'newsroom','news','blog','stories','brand','brands','logo',

  -- ── Legal / policy ────────────────────────────────────────────────────────
  'legal','terms','terms-of-service','termsofservice','tos','privacy-policy',
  'privacypolicy','policy','policies','cookie','cookies','gdpr','ccpa','dmca',
  'copyright','disclaimer','compliance','license','licenses','licensing',

  -- ── Account / settings ────────────────────────────────────────────────────
  'account','accounts','my-account','myaccount','profile','profiles','settings',
  'preferences','prefs','user','users','member','members','onboarding','welcome',
  'get-started','getstarted','start','setup','intro',

  -- ── Commerce / billing ────────────────────────────────────────────────────
  'pricing','price','prices','plan','plans','billing','payment','payments','pay',
  'checkout','cart','order','orders','subscribe','subscription','subscriptions',
  'upgrade','downgrade','renew','invoice','invoices','receipt','receipts',
  'refund','refunds','wallet','credit','credits','balance','coupon','coupons',
  'promo','promos','promo-code','promocode','discount','discounts','deal','deals',
  'redeem','voucher','vouchers','giftcard','gift-card',

  -- ── Growth / marketing ────────────────────────────────────────────────────
  'referral','referrals','refer','affiliate','affiliates','partner','partners',
  'partnership','partnerships','ambassador','ambassadors','influencer',
  'influencers','creator','creators','career','careers','jobs','hiring',
  'waitlist','early-access','earlyaccess','beta','alpha','launch',

  -- ── Product surfaces (celebration platform — future routes) ───────────────
  'explore','discover','browse','search','find','gallery','galleries','showcase',
  'inspiration','ideas','trending','popular','featured','recommended','new','top',
  'best','templates','template','theme','themes','design','designs','style',
  'styles','collection','collections','vendor','vendors','marketplace','market',
  'shop','store','stores','shopping','registry','registries','wishlist',
  'wishlists','gift','gifts','guestbook','guest-book','event','events','wedding',
  'weddings','party','parties','celebration','celebrations','occasion',
  'occasions','invite','invites','invitation','invitations','rsvp','rsvps',
  'ecard','ecards','e-card','card','cards','planner','planners','planning',
  'checklist','checklists','todo','todos','task','tasks','timeline','timelines',
  'schedule','schedules','agenda','itinerary','budget','budgets','guest','guests',
  'guestlist','guest-list','seating','table','tables','community','forum','forums',
  'group','groups','social','network','mobile','ios','android','appstore',
  'app-store','playstore','google-play','developer','developers','dev','docs',
  'documentation','api-docs','reference','guide','guides','tutorial','tutorials',
  'integration','integrations','sdk','changelog','roadmap','updates','releases',
  'whats-new','whatsnew','version','versions','analytics','insights','report',
  'reports','stats','statistics',

  -- ── Plan-tier / premium labels (current tiers: Starter/Plus/Pro/Advanced) ──
  'starter','plus','pro','advance','advanced','enterprise','business','biz',
  'agency','agencies','professional','premium','vip','elite','gold','silver',
  'bronze','platinum','diamond','standard','basic','essential','essentials',
  'lite','personal','individual','solo','ultimate','unlimited','max','growth',
  'scale','custom','free','freemium','trial','founder','founders','lifetime',
  'deluxe',

  -- ── Generic / placeholder / test ──────────────────────────────────────────
  'test','tests','testing','demo','demos','example','examples','sample','samples',
  'placeholder','untitled','default','temp','tmp','draft','drafts','null',
  'undefined','none','void','foo','bar','baz','lorem','ipsum','asdf','qwerty',
  'abc','xyz','abc123','foobar','dummy','fake','mock','sandbox','staging','prod',
  'production','local','localhost','error','errors','404','500','not-found',
  'notfound','home','index','main','page','pages','site','sites'
]::text[]) AS s
WHERE s ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$'
ON CONFLICT (slug) DO UPDATE
  SET user_id = excluded.user_id, expires_at = NULL;

-- Rollback (removes all system-seeded permanent reservations — Phases 1–3 share
-- the sentinel, so run only if you mean to drop the whole system blocklist):
-- DELETE FROM public.slug_reservations
-- WHERE user_id = '00000000-0000-0000-0000-000000000000' AND expires_at IS NULL;
