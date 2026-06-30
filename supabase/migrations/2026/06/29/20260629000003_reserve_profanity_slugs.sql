-- Migration: reserve_profanity_slugs — Phase 3: profanity / slur exact reservations.
-- =============================================================================
-- Append-only follow-up to 20260629000001 (see docs/architecture/reserved-slugs.md).
-- Blocks offensive *whole-slug* grabs (e.g. /<slur>) across English + local
-- (Malay, Hokkien/Singlish, Tamil, Hindi/Urdu) — the SG/Asia audience. Curated
-- hardcore (mild/animal insults included) to protect brand reputation.
--
-- SCOPE LIMIT (by design): exact-match only — this stops the BARE word as a slug.
-- Embedded / leet / spelling-variant forms (john-f4ck-wedding) are Phase 4's
-- substring filter (a maintained library wired into reserve_slug), NOT this table.
--
-- Same mechanism/sentinel/guards as Phase 1 — pure additive data, no logic change.
-- The SLUG_REGEX filter auto-drops sub-3-char entries (cb/mc/bc/lj), which can't
-- be slugs anyway, so they're omitted here.
-- =============================================================================

INSERT INTO public.slug_reservations (slug, user_id, expires_at)
SELECT DISTINCT s, '00000000-0000-0000-0000-000000000000'::uuid, NULL::timestamptz
FROM unnest(ARRAY[
  -- ── English — profanity ───────────────────────────────────────────────────
  'fuck','fucker','fucking','fuckface','fuckwit','fuckhead','motherfucker',
  'shit','shite','bullshit','shithead','dipshit','bitch','bitches','cunt',
  'asshole','arsehole','arse','ass','dumbass','jackass','dick','dickhead',
  'cock','cocksucker','prick','pussy','bastard','bollocks','bollock','wanker',
  'twat','slut','whore','slag','tart','skank','hoe','hoes','thot','piss','crap',
  'damn','douche','douchebag','bugger','knob','knobhead','tosser','bellend',
  'nonce','slapper','willy','dong','schlong','nutsack','ballsack','spunk',

  -- ── English — sexual / explicit ───────────────────────────────────────────
  'sex','sexy','porn','porno','pornography','xxx','nude','nudes','naked','boobs',
  'boob','tits','titty','titties','penis','vagina','dildo','vibrator','anal',
  'anus','butthole','cum','jizz','semen','blowjob','handjob','rimjob',
  'deepthroat','milf','gilf','hentai','fetish','bdsm','orgy','orgasm',
  'masturbate','masturbation','wank','jerkoff','jerk-off','horny','nsfw',
  'escort','hooker','prostitute','gangbang','creampie','bukkake','fap','smut',
  'camgirl','onlyfans',

  -- ── English — slurs (hate) ────────────────────────────────────────────────
  'nigger','nigga','niggers','niggas','niglet','faggot','fag','faggy','dyke',
  'tranny','retard','retarded','spastic','spaz','sped','gimp','spic','wetback',
  'beaner','chink','chinky','chinaman','ching-chong','gook','slant','slant-eye',
  'slanteye','zipperhead','jap','nip','kike','heeb','sandnigger','sand-nigger',
  'raghead','towelhead','camel-jockey','dune-coon','paki','pakis','coon','darkie',
  'spook','jungle-bunny','porch-monkey','cotton-picker','wog','golliwog','wop',
  'dago','guido','polack','kraut','limey','cripple','mongoloid','midget','homo',
  'queer','poof','poofter','pansy','nancy','batty','carpet-muncher','carpetmuncher',
  'fudge-packer','fudgepacker','shemale','ladyboy','halfbreed','half-breed',
  'redskin','injun','coolie','uncle-tom','oreo','sambo','jigaboo',

  -- ── Malay ─────────────────────────────────────────────────────────────────
  'puki','pukimak','pukima','pundek','pundeh','kimak','lancau','lancok','butuh',
  'pantat','pepek','konek','jubur','tetek','kemaluan','babi','anjing','bangsat',
  'keparat','sial','celaka','bodoh','bangang','tolol','gila','sundal','jalang',
  'lahabau','lahanat','mampus','jahanam','setan','cibai',

  -- ── Hokkien / Singlish (romanized) ────────────────────────────────────────
  'cheebye','chee-bye','knn','knnbccb','knnccb','lanjiao','kanina','kaninabu',
  'sohai','so-hai','hamsup','hamsap','kukujiao','kanasai','siao','siaola',
  'limpeh','pariah',

  -- ── Tamil (romanized) ─────────────────────────────────────────────────────
  'punda','pundai','thevidiya','thevdiya','ommala','oombu','sunni','koodhi',
  'otha','myir','badava','naaye','loosu','kirukku','pundamavane',

  -- ── Hindi / Urdu (romanized) ──────────────────────────────────────────────
  'chutiya','chutia','bhenchod','behenchod','bhosdike','bhosdi','madarchod',
  'madarchood','gandu','gaand','lund','lauda','lawda','randi','raand','harami',
  'haramzada','chodu','chod','jhaat','tatti','suar','kamina','kaminey','saala',
  'saali','ullu','gadha','bakchod','bakwas','chomu','jhantu','kutta','kutti'
]::text[]) AS s
WHERE s ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$'
ON CONFLICT (slug) DO UPDATE
  SET user_id = excluded.user_id, expires_at = NULL;

-- Rollback: covered by Phase 1's sentinel-scoped DELETE (removes ALL system
-- reservations). Mirror the array above for surgical removal.
