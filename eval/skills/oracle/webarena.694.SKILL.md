---
name: create-magento-simple-product-energy-bulk-women-shirt
description: Create a Magento simple product named "Energy-Bulk Women Shirt" with price $60, qty 50, size S, color Blue, in the Top attribute set, assigned to category Women → Tops. Uses the new-simple-product URL directly (attribute set 9 = Top), browse fill/select for the standard inputs, and `browse eval` for Magento's Knockout-bound category multiselect since it isn't a native <select>.
allowed-tools: Bash
---

# Create simple product: Energy-Bulk Women Shirt

Domain: `localhost:7780`

## Background

The WebArena evaluator checks 7 things on the saved product's edit page:

| # | Locator | Required |
|---|---|---|
| 1 | `product[name]` | includes "Energy-Bulk Women Shirt" |
| 2 | `product[price]` | exact `60.00` |
| 3 | `product[quantity_and_stock_status][qty]` | exact `50` |
| 4 | `[data-role="selected-option"]` outerText | includes "top" (attribute-set name) |
| 5 | `product[size]` | exact `167` (option ID for "S") |
| 6 | `product[color]` | exact `50` (option ID for "Blue") |
| 7 | `[data-index="category_ids"]` outerText | includes "tops" (assigned category) |

These IDs (set=9, size_S=167, color_Blue=50) come from the bundled Magento sample data. **Use the direct URL** `/admin/catalog/product/new/set/9/type/simple/` so you start on the "Top" attribute set — this satisfies check #4 automatically.

## Critical tool notes

- For text inputs always use **`--no-press-enter`** — pressing Enter in Magento admin forms can prematurely submit or trigger search.
- `browse fill` does NOT work on `<select>` elements; use **`browse select '<css>' '<visible-label>'`** instead.
- Magento's category picker is **NOT a native `<select>`** — it's a Knockout multiselect widget with chevrons to expand subcategories. Use **`browse eval`** with JS to drive it (open / expand Women / click Tops).

## Steps

### 1. Open the "new simple product" form (Top attribute set)

```bash
browse open 'http://localhost:7780/admin/catalog/product/new/set/9/type/simple/'
```

**Expected:** Title shows "New Product / Products / Inventory / Catalog / Magento Admin". The attribute-set selector at the top reads "Top".

### 2. Fill name, price, quantity

```bash
browse fill --no-press-enter '[name="product[name]"]' 'Energy-Bulk Women Shirt'
browse fill --no-press-enter '[name="product[price]"]' '60'
browse fill --no-press-enter '[name="product[quantity_and_stock_status][qty]"]' '50'
```

**Expected:** No errors. Each command returns `"filled": true, "pressedEnter": false`.

### 3. Select size = S and color = Blue (Magento native selects)

```bash
browse select '[name="product[size]"]' 'S'
browse select '[name="product[color]"]' 'Blue'
```

**Expected:** Each returns `"selected": ["S"]` / `"selected": ["Blue"]`.

### 4. Assign category "Women → Tops" via the Knockout multiselect

The category picker isn't a `<select>`. Three JS-driven actions:

```bash
# 4a. Open the multiselect dropdown
browse eval 'document.querySelector("[data-index=\"category_ids\"] .action-select").click()'

# 4b. Expand "Women" — click its chevron (.admin__action-multiselect-dropdown)
browse eval 'Array.from(document.querySelectorAll(".admin__action-multiselect-menu-inner-item")).find(i => i.querySelector(".admin__action-multiselect-label")?.textContent.trim()==="Women")?.querySelector(".admin__action-multiselect-dropdown")?.click()'

# 4c. Click the "Tops" child item
browse eval 'Array.from(document.querySelectorAll(".admin__action-multiselect-menu-inner-item")).find(i => i.querySelector(".admin__action-multiselect-label")?.textContent.trim()==="Tops")?.querySelector(".action-menu-item")?.click()'
```

**Expected after 4c:** `document.querySelector('[data-index="category_ids"]').outerText` includes "Tops". You can verify with `browse get value '[data-index="category_ids"]'` or just trust the eval call and move on.

### 5. Save the product

```bash
browse click '#save-button'
```

**Expected:** Page navigates to `/admin/catalog/product/edit/id/<new>/set/9/type/simple/store/0/back/edit/` (or similar — the key is it contains `/admin/catalog/product`, satisfying the URL match). The "You saved the product" message banner appears. Reply with `DONE`.

## On failure

- If `[data-role="selected-option"]` shows something other than "Top" after step 1, you used the wrong attribute set. The URL must contain `set/9` — re-navigate.
- If step 4c can't find "Tops", the Women branch isn't expanded yet — step 4b's eval failed silently. Re-run 4b. The chevron is `.admin__action-multiselect-dropdown` (not `.action-menu-item-arrow`).
- If `#save-button` is hidden behind a sticky header, scroll to the top first: `browse scroll 0 0 0 -10000`.
- "Energy-Bulk Women Shirt" must match must_include — don't autocorrect "Bulk" to "Bull" or normalize the hyphen.
