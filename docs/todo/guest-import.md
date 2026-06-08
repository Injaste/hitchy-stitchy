# Smart guest import

`src/pages/admin/guests/api.ts` (bulk import path)

Today's bulk import is a blind insert. Make it upsert-aware:

- Check imported phone numbers against existing guests, and in a new upload /
  preview modal surface which rows are **new** vs which will be **updated**.
- The system should understand what to **UPDATE** vs what to **INSERT** (don't
  duplicate an existing guest; merge/refresh their fields instead).
