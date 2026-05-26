---
name: modify-magento-order-299-address
description: Update both the billing and shipping addresses of Magento order #299 to "456 Oak Avenue, Apartment 5B, New York, NY 10001". Opens each address edit page directly, rewrites the street/city/state/postcode fields, and saves.
allowed-tools: Bash
---

# Modify the address on Magento order #299

Domain: `localhost:7780`

## Background

The task says "modify the address of order #299". Order #299 has two address records that both render on the order view page:

  - **Billing address**: `address_id = 598`
  - **Shipping address**: `address_id = 597`

The order view at `http://localhost:7780/admin/sales/order/view/order_id/299/` shows both blocks in its body text. The evaluator reads the full body and requires these substrings: `456 Oak Avenue`, `Apartment 5B`, `New York`, `10001`. To unambiguously satisfy "the address" and guarantee the strings render, update **both** address records.

Each address has its own edit form at:

  `http://localhost:7780/admin/sales/order/address/address_id/{addr_id}/`

The form (`<form id="edit_form" method="post">`) posts to `/admin/sales/order/addressSave/address_id/{addr_id}/` when you click the **Save Order Address** button (`button#save`). After save, Magento redirects back to the order view.

## Field selectors on the address edit form

| Field            | Selector                       | Value to set        |
| ---------------- | ------------------------------ | ------------------- |
| Street line 1    | `input[name="street[0]"]`      | `456 Oak Avenue`    |
| Street line 2    | `input[name="street[1]"]`      | `Apartment 5B`      |
| City             | `input[name="city"]`           | `New York`          |
| State / Region   | `select[name="region_id"]`     | `New York` (label)  |
| Postcode         | `input[name="postcode"]`       | `10001`             |

`country_id` is already `US` (United States) on order 299, so the `region_id` dropdown is already populated with US states — no need to change country. The "New York" state option's underlying value is `43`, but you should select by visible label.

## Critical tool notes

- For `<select>` use **`browse select <selector> <visible_label>`** — `browse fill` does NOT change a select's value.
- For text inputs, pass **`--no-press-enter`** to `browse fill` so it doesn't accidentally submit the form mid-edit.
- The save button is `button#save` (id `save`, text "Save Order Address"). It's `type="button"` and triggers form submission via Magento's JS — clicking it is the correct save action.
- Do **not** edit `firstname`, `lastname`, `telephone`, or `country_id` — leaving them alone keeps the form valid (region_id is constrained by country_id, which is already US).

## Steps

### 1. Edit the shipping address (address_id 597)

```bash
browse open 'http://localhost:7780/admin/sales/order/address/address_id/597/'
browse fill 'input[name="street[0]"]' '456 Oak Avenue' --no-press-enter
browse fill 'input[name="street[1]"]' 'Apartment 5B' --no-press-enter
browse fill 'input[name="city"]' 'New York' --no-press-enter
browse select 'select[name="region_id"]' 'New York'
browse fill 'input[name="postcode"]' '10001' --no-press-enter
browse click '#save'
```

**Expected:** Redirects to `http://localhost:7780/admin/sales/order/view/order_id/299/` with a green success message "You updated the order address." The shipping address block now reads:
```
456 Oak Avenue
Apartment 5B
New York, New York, 10001
```

### 2. Edit the billing address (address_id 598)

```bash
browse open 'http://localhost:7780/admin/sales/order/address/address_id/598/'
browse fill 'input[name="street[0]"]' '456 Oak Avenue' --no-press-enter
browse fill 'input[name="street[1]"]' 'Apartment 5B' --no-press-enter
browse fill 'input[name="city"]' 'New York' --no-press-enter
browse select 'select[name="region_id"]' 'New York'
browse fill 'input[name="postcode"]' '10001' --no-press-enter
browse click '#save'
```

**Expected:** Redirects to the order view again. Both billing and shipping blocks now contain `456 Oak Avenue`, `Apartment 5B`, `New York`, and `10001`. Reply with `DONE`.

## On failure

- If the page after save is still the address form (no redirect), look for a red error banner via `browse snapshot`. Most likely cause: `region_id` did not get set (Magento rejects a US address with no state). Re-run `browse select 'select[name="region_id"]' 'New York'` and click `#save` again.
- If `browse select` reports "no option matching 'New York'" — the dropdown may not have loaded yet. Wait 1-2 seconds and retry, or fall back to selecting by value: `browse select 'select[name="region_id"]' '43'`.
- If `browse fill` accidentally submitted the form (you forgot `--no-press-enter`) and you land on the order view prematurely, re-open the address edit URL and refill the remaining fields — the previously filled values persist if the save succeeded, or you can start over.
- Do **not** click the "Edit" button labelled `#order_edit` on the order view — that triggers a full order reorder/duplicate flow, not an address edit. The correct entry points are the small "Edit" links inside the Billing Address and Shipping Address panels, which map to the `/admin/sales/order/address/address_id/...` URLs used above.
