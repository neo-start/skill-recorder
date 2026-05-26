---
name: disable-teton-pullover-hoodie
description: Disable the "Teton Pullover Hoodie" product in Magento admin (product ID 78) because of quality issues. Opens the product edit page, flips the "Enable Product" toggle from Yes to No so `product[status]` becomes "2" (Disabled), and saves.
allowed-tools: Bash
---

# Disable Teton Pullover Hoodie (product 78)

Domain: `localhost:7780`

## Background

The intent says "Disable Teton pullover hoodie from the site, they are facing some quality issues." In this Magento data set that product is **product ID 78**, edit URL:

  `http://localhost:7780/admin/catalog/product/edit/id/78/`

The "Enable Product" control on this page is **not** a `<select>`. It is a Magento 2 admin switch — a hidden `<input type="checkbox" name="product[status]">` with a `<label>` styled as a sliding toggle right next to it. The Knockout `simpleChecked` binding controls the form value:

  - checkbox **checked** → `product[status].value === '1'` (Enabled)
  - checkbox **unchecked** → `product[status].value === '2'` (Disabled)

So to disable the product we need the checkbox to end up **unchecked**, which makes the submitted/serialized value `'2'`. The evaluator checks exactly that:

```js
document.querySelector('[name="product[status]"]').value  // must be '2'
```

The product loads with the toggle on (Enabled). One click on the adjacent `<label>` flips it to Disabled. Then save with `#save-button` (hyphen — this page uses `save-button`, not `save_button`).

## Critical tool notes

- The status field is a **Magento checkbox toggle**, NOT a `<select>`. Do NOT use `browse select`. Do NOT use `browse fill` (it doesn't work on checkboxes). Click the adjacent `<label>` instead:
  `browse click 'input[name="product[status]"] + label'`
- The checkbox `id` is regenerated on every page load (a random Knockout uid like `AQV0I5U`), so do NOT target it by id. Use the stable `input[name="product[status]"] + label` sibling selector.
- The product-edit save button id is **`#save-button`** (hyphen). Other Magento pages use `#save_button` (underscore) — don't confuse them.
- After save, Magento redirects back to the same edit URL and shows a green "You saved the product." message. The toggle should now read "No" and the underlying value is `'2'`.

## Steps

### 1. Log into the admin

```bash
browse open 'http://localhost:7780/admin'
browse fill --no-press-enter 'input[name="login[username]"]' 'admin'
browse fill --no-press-enter 'input[name="login[password]"]' 'admin1234'
browse click 'button.action-login'
```

**Expected:** Lands on `/admin/admin/dashboard/`.

### 2. Open the Teton Pullover Hoodie edit page

```bash
browse open 'http://localhost:7780/admin/catalog/product/edit/id/78/'
```

**Expected:** Title contains "Teton Pullover Hoodie". The "Enable Product" toggle in the top-right of the form shows "Yes" (checkbox checked, value `1`).

### 3. Flip the Enable Product toggle to Disabled

```bash
browse click 'input[name="product[status]"] + label'
```

**Expected:** The toggle visually slides to "No". Behind the scenes, `document.querySelector('[name="product[status]"]').value` is now `'2'`.

If you want to verify before saving:

```bash
browse eval 'document.querySelector("[name=\"product[status]\"]").value'
# should print: 2
```

### 4. Save the product

```bash
browse click '#save-button'
```

**Expected:** Page reloads to the same edit URL with a success banner "You saved the product." The toggle remains on "No". Reply with `DONE`.

## On failure

- If `browse click 'input[name="product[status]"] + label'` reports the selector wasn't found, the product form may still be hydrating. Wait ~2 seconds and retry, or run `browse snapshot` to confirm the toggle is rendered.
- If after clicking the toggle the value is still `'1'`, you may have clicked while the input was disabled/hidden during Knockout init. Re-run the click after a short wait. As a fallback, use `browse eval` to set it directly via the Knockout binding:

  ```bash
  browse eval '(() => { const el = document.querySelector("[name=\"product[status]\"]"); el.click(); return el.value; })()'
  ```

  The bare `.click()` on the hidden checkbox also triggers the `simpleChecked` binding and updates the value to `'2'`.
- If save returns to the product listing instead of the edit page, that's still fine — it means the save succeeded; verification will pass.
- Do NOT click "Save & New" or "Save & Duplicate" from the save-button dropdown — only the primary `#save-button` (plain "Save"). The others can navigate away or create unwanted products.
- Do NOT try to use the storefront-side bulk product grid action "Disable" — the intent is a single-product change and the eval only checks product 78.
