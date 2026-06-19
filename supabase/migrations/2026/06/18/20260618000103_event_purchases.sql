-- Migration: Subscription plans (103) — event_purchases (Stripe ledger)
-- =============================================================================
-- The payment system-of-record. The Stripe webhook (a service-role edge fn)
-- VERIFIES the session (signature + line-item price_id == plans.stripe_price_id
-- + amount + currency) BEFORE granting anything; on success it inserts/promotes
-- a row here to status='paid' AND flips events.plan_key + events.activated_at.
-- The live entitlement lives on the EVENT (plan_key/activated_at); THIS table is
-- the proof, audit, and refund record.
--
--   stripe_checkout_session_id  UNIQUE → webhook idempotency (retries no-op).
--   plan_key                    exactly which plan VERSION was sold — dispute /
--                               grandfather record (stays pinned after 'pro_v2').
--   status                      pending → paid → (refunded | disputed); 'failed'
--                               for a declined attempt. Only 'paid' grants access
--                               (default 'pending' = fail-closed).
--   stripe_price_id / amount    SKU + amount actually charged — the
--                               server-authoritative verification record.
--   refunded_at / amount_refunded  refund + partial-refund / chargeback detail.
--
-- No client RLS policy: only the service role (webhook / admin) touches this —
-- RLS on, zero policies → clients see nothing; service role bypasses RLS.
-- Run AFTER 20260618000101 (FK → plans).
-- =============================================================================

-- Status enum (mirrors event_rsvp_status / event_task_status) — full payment
-- lifecycle so a bad state can't masquerade as paid. Idempotent.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_purchase_status') THEN
    CREATE TYPE public.event_purchase_status
      AS ENUM ('pending', 'paid', 'failed', 'refunded', 'disputed');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.event_purchases (
  id                         uuid        NOT NULL DEFAULT gen_random_uuid(),
  event_id                   uuid        NOT NULL,
  plan_key                   text        NOT NULL,           -- version bought
  stripe_checkout_session_id text        NOT NULL,           -- idempotency key
  stripe_payment_intent_id   text,
  stripe_customer_id         text,                            -- payer identity (audit / anti-hijack)
  stripe_price_id            text,                            -- SKU actually bought (verify == plans.stripe_price_id)
  amount                     numeric(12,2),                   -- amount charged (verified vs plan price)
  amount_refunded            numeric(12,2),                   -- partial-refund / chargeback amount
  currency                   text        NOT NULL DEFAULT 'sgd',
  status   public.event_purchase_status  NOT NULL DEFAULT 'pending',  -- only 'paid' grants entitlement
  purchased_at               timestamptz,                     -- set when status → paid
  refunded_at                timestamptz,                     -- set on refund / dispute
  created_at                 timestamptz NOT NULL DEFAULT now(),
  updated_at                 timestamptz NOT NULL DEFAULT now(),  -- touched on status transitions

  CONSTRAINT event_purchases_pkey        PRIMARY KEY (id),
  CONSTRAINT event_purchases_session_key UNIQUE (stripe_checkout_session_id),
  CONSTRAINT event_purchases_event_id_fk
    FOREIGN KEY (event_id) REFERENCES public.events (id) ON DELETE CASCADE,
  CONSTRAINT event_purchases_plan_key_fk
    FOREIGN KEY (plan_key) REFERENCES public.plans (key)
);

CREATE INDEX IF NOT EXISTS event_purchases_event_id_idx
  ON public.event_purchases (event_id);

-- RLS on, no policies: clients can't touch it; the webhook uses the service
-- role (bypasses RLS).
ALTER TABLE public.event_purchases ENABLE ROW LEVEL SECURITY;

-- Rollback:
--   DROP TABLE public.event_purchases;
--   DROP TYPE public.event_purchase_status;
