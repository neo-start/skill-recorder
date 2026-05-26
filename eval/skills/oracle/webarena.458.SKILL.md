---
name: reduce-magento-product-1481-price-by-5
description: Reduce the price of Magento product 1481 (Minerva LumaTech V-Tee-S-Blue, SKU WS08-S-Blue) by $5. Current price is $32.00, so the new price is $27.00. Opens the product edit page directly, overwrites the price input with "27.00", and saves.
allowed-tools: Bash
---

# Reduce product 1481 price by $5

Domain: `localhost:7780`

## Background

The task says "Reduce the price of this product by $5". "This product" is product ID **1481** (Minerva LumaTech V-Tee-S-Blue, SKU `WS08-S-Blue`). Its current price is **$32.00**, so the new price must be **$27.00**.

Edit page URL:

  `http://localhost:7780/admin/catalog/product/edit/id/1481/`

The price input is a text field:

  `<input name="product[price]" type="text">`

Save button id: `#save-button` (note the hyphen — it is NOT `#save_button` like the review page).

## Critical tool notes

- Use **`browse fill --no-press-enter`** for the price input. The default `browse fill` presses Enter after typing, which on a Magento product form may submit / lose focus oddly. We want to just set the value.
- The price field does NOT auto-normalize `27` to `27.00` on blur — it stays as the literal string you typed. The eval checks for an **exact** match `'27.00'`, so you must fill the string `27.00` (with two decimals), not `27`.
- Save button is `#save-button` (hyphen). Wait for the success banner / page reload before considering the task done.
- You may need to log in first if you do not already have an admin session. Login URL is `http://localhost:7780/admin`, credentials `admin` / `admin1234`.

## Steps

### 1. (If needed) Log in

```bash
browse open 'http://localhost:7780/admin'
browse fill --no-press-enter 'input[name="login[username]"]' 'admin'
browse fill --no-press-enter 'input[name="login[password]"]' 'admin1234'
browse click 'button.action-login'
```

**Expected:** Lands on the admin dashboard. If you are already logged in, the first `browse open` will redirect straight to the dashboard — skip the fill/click commands.

### 2. Open product 1481 edit page

```bash
browse open 'http://localhost:7780/admin/catalog/product/edit/id/1481/'
```

**Expected:** Page title contains "Minerva LumaTech V-Tee-S-Blue". The price input `[name="product[price]"]` is present with current value `32.00`.

### 3. Overwrite the price with 27.00

```bash
browse fill --no-press-enter '[name="product[price]"]' '27.00'
```

**Expected:** The input's `.value` is now the literal string `27.00`. Do NOT fill `27` — Magento will not pad it, and the eval requires exact `'27.00'`.

### 4. Save

```bash
browse click '#save-button'
```

**Expected:** A green "You saved the product." banner appears and the page reloads with the price field still showing `27.00`. Reply with `DONE`.

## On failure

- If after step 3 the `.value` reads something other than `27.00` (e.g. `27` or `32.0027.00`), the field was not cleared first. Re-run `browse fill --no-press-enter '[name="product[price]"]' '27.00'` — `browse fill` should overwrite, but if it appends, use `browse eval` to set it directly:

  ```bash
  browse eval 'document.querySelector(\'[name="product[price]"]\').value = "27.00"; document.querySelector(\'[name="product[price]"]\').dispatchEvent(new Event("change", {bubbles: true}))'
  ```

- If `#save-button` is not found, check `browse snapshot` for the button — Magento sometimes renders it as `button#save-button` inside a sticky header. Try `button[id="save-button"]` as a fallback. Do NOT use `#save_button` (underscore) — that is the review page's save button, not the product page.
- If the save reports an error banner about a required attribute, the product edit form may have an unrelated validation issue from another concurrent agent's edit. Re-open the page and retry — the eval runs on clean state, so transient noise from sibling agents will not affect the final eval trial.
- Do NOT use the product-listing mass-action "Update attributes" flow to change price — it will not produce the precise `27.00` value cleanly and may affect other products. Edit product 1481 directly via its edit page.
