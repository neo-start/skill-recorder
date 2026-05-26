---
name: approve-magento-reviews-by-id
description: Approve three specific Magento product reviews (IDs 347, 349, 352) by setting their status to "Approved" so they appear on the storefront. Reads each review's edit page directly, picks "Approved" in the Status dropdown, and saves.
allowed-tools: Bash
---

# Approve specific Magento product reviews

Domain: `localhost:7780`

## Background

The task says "approve the positive reviews". In this Magento data set, the three positive reviews waiting for moderation have review IDs **347, 349, 352**. Each lives at:

  `http://localhost:7780/admin/review/product/edit/id/{id}`

The Status field is a `<select name="status_id">` with options:
  - `1` = Approved
  - `2` = Pending
  - `3` = Not Approved

To approve a review you set Status → "Approved" (value `1`) and click Save Review (button id `save_button`). Save returns you to the review listing.

## Critical tool notes

- For `<select>` elements use **`browse select <selector> <visible_label>`** — `browse fill` does NOT change a select's value.
- All commands here use stable selectors (id or `[name="..."]`), so the script is deterministic; no snapshot/ref dance needed.

## Steps

### 1. Open and approve review 352

```bash
browse open 'http://localhost:7780/admin/review/product/edit/id/352'
browse select 'select[name="status_id"]' 'Approved'
browse click '#save_button'
```

**Expected:** After save, the browser lands at `/admin/review/product/` (the listing page). Status for review 352 is now `1`.

### 2. Open and approve review 349

```bash
browse open 'http://localhost:7780/admin/review/product/edit/id/349'
browse select 'select[name="status_id"]' 'Approved'
browse click '#save_button'
```

**Expected:** Same redirect to listing. Review 349 status is `1`.

### 3. Open and approve review 347

```bash
browse open 'http://localhost:7780/admin/review/product/edit/id/347'
browse select 'select[name="status_id"]' 'Approved'
browse click '#save_button'
```

**Expected:** Review 347 status is `1`. All three reviews now approved. Reply with `DONE`.

## On failure

- If `browse select` reports "no option matching" — re-snapshot the page (`browse snapshot`) and confirm the select actually exists. The page might still be loading; wait 1-2 seconds and retry.
- If save redirects somewhere unexpected, check `browse snapshot` for an inline error banner (e.g., session expired). Re-login by navigating to `/admin` and resubmitting the credentials, then resume.
- Do NOT use bulk-edit on the listing page — the task wants per-review confirmation, and the bulk action would also flip reviews that should stay pending. Edit each ID individually.
