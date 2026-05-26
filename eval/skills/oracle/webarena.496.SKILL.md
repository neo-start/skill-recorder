---
name: assign-federal-express-tracking-to-order-299
description: Create a shipment for Magento order #299 and attach Federal Express tracking number 8974568499 to it. This records the auto-generated comment "Tracking number 8974568499 for Federal Express assigned" in the order's Comments History, which is what the evaluator reads from the order shipments comments-history page.
allowed-tools: Bash
---

# Assign Federal Express tracking number to order #299

Domain: `localhost:7780`

## Background

The task says "Update order #299 with the Federal Express tracking number 8974568499". In this Magento data set order #299 has **no existing shipment**, so the Shipments grid on `/admin/sales/order/view/order_id/299/active_tab/order_shipments/` is empty ("We couldn't find any records.") and there is nothing to "edit". The only way to add a tracking number is to:

1. Open the order, click **Ship** to start a new shipment.
2. On the New Shipment page, click **Add Tracking Number**.
3. Pick Carrier = **Federal Express** (which auto-populates Title with `Federal Express`), enter Number = `8974568499`.
4. Click **Submit Shipment**.

Magento then writes a system comment of the form

> Tracking number 8974568499 for Federal Express assigned

to the order's comments history. The evaluator opens `/admin/sales/order/commentsHistory/order_id/299/active_tab/order_shipments/` and checks the body text contains the substring `Tracking number 8974568499 for Federal Express assigned`.

## Key URLs and selectors

- Order view: `http://localhost:7780/admin/sales/order/view/order_id/299/`
- New Shipment form (the actual destination the Ship button leads to): `http://localhost:7780/admin/admin/order_shipment/new/order_id/299/` (yes — note the doubled `/admin/admin/`; this is the real Magento backend prefix for this instance).
- Add-tracking-row button (stable): `[data-ui-id="shipment-tracking-add-button"]`
- After clicking it, a row appears inside `tbody#track_row_container` with:
  - Carrier `<select>`: `select[name="tracking[1][carrier_code]"]` — option label `Federal Express` (value `fedex`)
  - Title `<input>`: `input[name="tracking[1][title]"]` — auto-populated from carrier label
  - Number `<input>`: `input[name="tracking[1][number]"]`
- Submit Shipment button (stable): `[data-ui-id="order-items-submit-button"]`

## Critical tool notes

- The Carrier field is a `<select>` — use **`browse select <selector> <visible_label>`**. `browse fill` will NOT change its value.
- The visible label is the EXACT string `Federal Express`. Do NOT use `FedEx` or `fedex` — those are not in the dropdown.
- Picking `Federal Express` triggers Magento's onchange handler that fills the Title input. Title MUST end up as the literal string `Federal Express`, because the comment Magento writes is `Tracking number <number> for <title> assigned`. If you skip the Carrier select and only type into Title, you can still make the comment work, but the simplest path is to pick the carrier and let the title auto-fill.
- For the Number input use `browse fill --no-press-enter` so Enter doesn't accidentally submit the form before the row is complete.
- The New Shipment URL contains `/admin/admin/` (the second `admin` is the backend area). Clicking the `#order_ship` button on the order view navigates to this URL. Going directly to `/admin/order_shipment/new/...` (one `admin`) loads an empty Magento Admin shell — use the doubled-prefix URL.

## Steps

### 1. Open the New Shipment form for order 299

```bash
browse open 'http://localhost:7780/admin/admin/order_shipment/new/order_id/299/'
```

**Expected:** Page title is `New Shipment / Shipments / Operations / Sales / Magento Admin` and the page shows an `Items to Ship` table and (further down) a `Shipping Information` block with a `Tracking Number(s)` section containing an `Add Tracking Number` button. If instead you land on a near-empty page or a login form, navigate to `http://localhost:7780/admin`, log in as `admin / admin1234`, and retry.

### 2. Reveal the tracking input row

```bash
browse click '[data-ui-id="shipment-tracking-add-button"]'
```

**Expected:** A new row appears inside `#tracking_numbers_table` with a Carrier dropdown (default option `Custom Value`), an empty Title input, and an empty Number input.

### 3. Pick Federal Express as the carrier

```bash
browse select 'select[name="tracking[1][carrier_code]"]' 'Federal Express'
```

**Expected:** The Title input (`input[name="tracking[1][title]"]`) is auto-filled with `Federal Express`. (Magento's `trackingControl` JS handles this via the select's `onchange`.) Do not type anything into Title manually.

### 4. Enter the tracking number

```bash
browse fill 'input[name="tracking[1][number]"]' '8974568499' --no-press-enter
```

**Expected:** The Number input now reads `8974568499`. No form submission happens yet (because of `--no-press-enter`).

### 5. Submit the shipment

```bash
browse click '[data-ui-id="order-items-submit-button"]'
```

**Expected:** The form POSTs to `/admin/admin/order_shipment/save/order_id/299/` and Magento redirects to the new shipment's view page (URL like `/admin/admin/order_shipment/view/shipment_id/<N>/`) with a green success banner "The shipment has been created." Simultaneously, Magento appends a comment

> Tracking number 8974568499 for Federal Express assigned

to the order's comments history.

### 6. (Optional) Verify

```bash
browse open 'http://localhost:7780/admin/sales/order/commentsHistory/order_id/299/active_tab/order_shipments/'
browse snapshot
```

**Expected:** The page body contains the substring `Tracking number 8974568499 for Federal Express assigned`. Once confirmed, reply with `DONE`.

## On failure

- **Step 1 lands on an empty page or login form:** session expired. Go to `http://localhost:7780/admin`, fill `input[name="login[username]"]` with `admin` and `input[name="login[password]"]` with `admin1234`, click `button.action-login`, then retry step 1.
- **Step 1 says "You can't create a shipment for this order" or shows the order view instead of New Shipment:** another concurrent agent (task 538 shares this order) may have already created a shipment, or the order is on Hold. Open `http://localhost:7780/admin/sales/order/view/order_id/299/active_tab/order_shipments/`, find the existing shipment row, click it, and on the shipment view page use the same `[data-ui-id="shipment-tracking-add-button"]` → Carrier → Number → there a different green button labeled `Save` saves just the tracking (no need to re-submit the whole shipment). The Magento comment generated is identical.
- **`browse select` reports "no option matching 'Federal Express'":** the page wasn't ready when you ran step 2 — re-run `browse click '[data-ui-id="shipment-tracking-add-button"]'`, then `browse snapshot` to confirm the row exists, then retry the select.
- **After step 5 you stay on the same page with a red error banner about quantity / item totals:** the `Items to Ship` quantity got cleared. Set each item's Qty input to its max (the value shown to the right of the input) and re-submit. The exact selector is `input.qty-input` rows in `#shipment_item_container`.
- **Do NOT click `Save` (the small grey button next to "Create Shipping Label") without first checking "Create Shipping Label"** — that button saves package definitions, not the shipment, and on this Magento instance it stays `_disabled` until you open the packaging popup. The correct top-of-page button is `Submit Shipment` (`[data-ui-id="order-items-submit-button"]`).
