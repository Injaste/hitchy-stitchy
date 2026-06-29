-- Migration: reserve_vanity_slugs — Phase 2: vanity / squat-bait words.
-- =============================================================================
-- Append-only follow-up to 20260629000001 (see docs/architecture/reserved-slugs.md).
-- Anti-squatting: bare desirable single words are the resaleable inventory a
-- hoarder would grab. Real couples use name/date slugs (john-and-mary), almost
-- never a bare premium word, so reserving these costs legit users ~nothing while
-- removing the squatter's stock — and keeps the valuable namespace under our
-- control (a reserved slug is just a row; release or hand-assign it later).
--
-- Status/endorsement words come first (imply WE vouched for the event), then the
-- vanity themes. Aesthetic *style* descriptors a couple might use (classic /
-- vintage / modern) are left open — low resale value, real usage.
--
-- Same mechanism/sentinel/guards as Phase 1 — pure additive data, no logic change.
-- Already-reserved Phase 1 words (premium/vip/elite/gold/platinum/diamond/deluxe/
-- best/top/featured/celebration/story…) are intentionally omitted.
-- =============================================================================

INSERT INTO public.slug_reservations (slug, user_id, expires_at)
SELECT DISTINCT s, '00000000-0000-0000-0000-000000000000'::uuid, NULL::timestamptz
FROM unnest(ARRAY[
  -- ── Status / endorsement (implies platform vouching) ──────────────────────
  'unique','special','exclusive','verified','certified','trusted','original',
  'genuine','authentic','preview','guaranteed','approved','endorsed','sponsored',
  'promoted',

  -- ── Love & romance ────────────────────────────────────────────────────────
  'love','loved','lover','lovers','beloved','forever','together','eternal',
  'eternity','infinity','infinite','soulmate','soulmates','romance','romantic',
  'kiss','kisses','heart','hearts','sweetheart','darling','devotion','devoted',
  'cherish','cherished','adore','adored','amour','valentine','valentines',
  'affection','passion','embrace','entwined','twosome',

  -- ── Joy & celebration ─────────────────────────────────────────────────────
  'joy','joyful','joyous','bliss','blissful','happy','happiness','cheer','cheers',
  'merry','festive','festivity','fiesta','gala','fest','jubilee','congrats',
  'congratulations','blessed','blessing','blessings','delight','delightful',
  'rejoice','revelry','ovation','applause','toast','hooray','hurrah',

  -- ── Magic & dream ─────────────────────────────────────────────────────────
  'dream','dreams','dreamy','magic','magical','wonder','wonders','wonderful',
  'fairytale','fairy-tale','enchanted','enchanting','enchantment','charm',
  'charmed','charming','sparkle','sparkles','shine','shimmer','glow','glitter',
  'starlight','moonlight','sunshine','twilight','aurora','dazzle','fantasy',
  'whimsy','marvel','miracle',

  -- ── Luxury & premium ──────────────────────────────────────────────────────
  'luxe','luxury','luxurious','opulent','opulence','grand','grandeur','regal',
  'royal','majestic','majesty','prestige','prestigious','posh','classy','chic',
  'glam','glamour','glamorous','elegant','elegance','lavish','exquisite','divine',
  'gilded','golden','pearl','crystal','jewel','jewels','gem','gems','treasure',
  'riches','lush','plush','finest','refined','sophisticated','couture','bespoke',
  'signature','premiere','prime','supreme','paramount','pinnacle','apex','zenith',

  -- ── Aspirational & timeless ───────────────────────────────────────────────
  'destiny','fate','kismet','serendipity','meant-to-be','happily',
  'happily-ever-after','happilyeverafter','everafter','ever-after','unforgettable',
  'timeless','perfect','perfection','ideal','flawless','sublime','radiant',
  'brilliant','stellar','iconic','legendary','epic','magnificent','splendid',
  'glorious','wondrous','breathtaking','stunning','beautiful','beauty','gorgeous',
  'lovely','adorable',

  -- ── Moments & milestones (event-y) ────────────────────────────────────────
  'moment','moments','memory','memories','milestone','milestones','journey',
  'chapter','beginning','beginnings','union','vow','vows','ido','i-do','knot',
  'tietheknot','tie-the-knot','betrothed','engaged','married','marriage','wedded',
  'newlyweds','honeymoon','bride','groom','bridal','couple','couples','mrs',
  'mrandmrs','mr-and-mrs',

  -- ── Short / brandable ─────────────────────────────────────────────────────
  'one','only','theone','the-one','mine','yours','ours','two','duo','pair','twin',
  'twins','match','matched','perfectmatch','perfect-match','fated'
]::text[]) AS s
WHERE s ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$'
ON CONFLICT (slug) DO UPDATE
  SET user_id = excluded.user_id, expires_at = NULL;

-- Rollback: Phase 1's sentinel-scoped DELETE removes ALL system reservations.
-- This batch has no separate teardown — drop by slug-list if you need surgical
-- removal (mirror the array above).
