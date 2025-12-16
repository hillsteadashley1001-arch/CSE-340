-- database/reviews.sql
CREATE TABLE IF NOT EXISTS public.review (
  review_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  review_text TEXT NOT NULL,
  review_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  inv_id INTEGER NOT NULL REFERENCES public.inventory(inv_id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES public.account(account_id) ON DELETE CASCADE
);

-- Helpful index for listing reviews quickly by vehicle and date
CREATE INDEX IF NOT EXISTS review_inv_id_date_idx ON public.review (inv_id, review_date DESC);

-- Helpful index for listing reviews by account
CREATE INDEX IF NOT EXISTS review_account_id_idx ON public.review (account_id);
