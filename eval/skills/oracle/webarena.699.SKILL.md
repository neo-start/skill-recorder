---
name: create-magento-spring-sale-percent-cart-price-rule
description: Create a Magento Cart Price Rule named "Spring Sale" that applies 20% off to all Main Website / General customer group orders. Uses Save and Continue Edit so the agent ends on the rule's edit page (the WebArena evaluator checks form values from that page, not the post-save listing).
allowed-tools: Bash
---

# Create Cart Price Rule "Spring Sale" — 20% off

Domain: `localhost:7780`

## Background

The WebArena evaluator checks 5 things, all on the **rule's edit page** (`url: 'last'`):

| Locator | Required |
|---|---|
| `[name='name'].value` | includes "spring sale" (case-insensitive) |
| `[name='website_ids'].selectedIndex` | exact `0` (Main Website) |
| `[name='customer_group_ids'].selectedIndex` | exact `1` (General — 2nd option, after "NOT LOGGED IN") |
| `[name='simple_action'].value` | exact `by_percent` |
| `[name='discount_amount'].value` | exact `20` |

Two non-obvious gotchas:

1. **Use Save and Continue Edit** (`#save_and_continue`), not Save (`#save`). Save redirects back to the rule listing, where these form fields don't exist — the evaluator fails the program_html lookups. Save and Continue keeps you on the edit page.
2. The Actions section (containing `simple_action` and `discount_amount`) starts **collapsed**. You have to expand it before browse can interact with the inputs.

## Critical tool notes

- `[name="website_ids"]` and `[name="customer_group_ids"]` are `<select multiple>`. `browse select <css> <label>` works fine on these — it replaces the selection, so passing a single label leaves only that option selected (giving the right `selectedIndex`).
- For text inputs, use `--no-press-enter` — pressing Enter mid-form will submit early.

## Steps

### 1. Open the new-rule form

```bash
browse open 'http://localhost:7780/admin/sales_rule/promo_quote/new/'
```

**Expected:** Title shows "New Cart Price Rule / Promotions / Marketing".

### 2. Fill the Rule Information section

```bash
browse fill --no-press-enter '[name="name"]' 'Spring Sale'
browse select '[name="website_ids"]' 'Main Website'
browse select '[name="customer_group_ids"]' 'General'
```

After this:
- `name.value === "Spring Sale"`
- `website_ids.selectedIndex === 0` (only one option; selecting it makes index 0)
- `customer_group_ids.selectedIndex === 1` (General is the 2nd option after "NOT LOGGED IN")

### 3. Expand the collapsed Actions section

```bash
browse eval 'document.querySelector("[data-index=\"actions\"] .admin__collapsible-title").click()'
```

**Expected:** the section unfolds and `[name="simple_action"]` becomes visible in the DOM.

### 4. Fill the Actions section

```bash
browse select '[name="simple_action"]' 'Percent of product price discount'
browse fill --no-press-enter '[name="discount_amount"]' '20'
```

After this:
- `simple_action.value === "by_percent"`
- `discount_amount.value === "20"`

### 5. Save and Continue Edit (stay on edit page)

```bash
browse click '#save_and_continue'
```

**Expected:** URL changes to `/admin/sales_rule/promo_quote/edit/id/<new>/` — you stay on the edit page so the evaluator can read form values. A "You saved the rule" banner appears. Reply with `DONE`.

## On failure

- If `#save_and_continue` errors out with a validation message about Conditions or anything else, the Conditions section is mandatory in some Magento configs — leave it default (empty = "applies to everything"), Magento should accept that.
- If after Save & Continue the customer_group selectedIndex is 0 instead of 1, you accidentally selected "NOT LOGGED IN" too. Re-do step 2 — `browse select` replaces selection only when you pass exactly one value.
- Do NOT use `#save` (the dropdown-default save) — it redirects to the rule listing and the evaluator can't read form fields there.
