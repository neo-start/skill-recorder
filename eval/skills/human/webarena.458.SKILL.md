---
name: minerva-lumatech-v-tee-s-blue-products-inventory-catalog-magento
description: Minerva LumaTech™ V-Tee-S-Blue / Products / Inventory / Catalog / Magento Admin
allowed-tools: Bash
---

# Minerva LumaTech™ V-Tee-S-Blue / Products / Inventory / Catalog / Magento Admin

Domain: `localhost:7780`

## Parameters

Ask the user for any of these not already provided:

- `id_id` — URL parameter for id_id (example: `1481`)

## Steps

### 1. Navigate to http://localhost:7780/admin/catalog/product/edit/id/1481/

```bash
browse open 'http://localhost:7780/admin/catalog/product/edit/id/{{id_id}}/'
```

**Expected:** "#ESND3F0" becomes interactable

### 2. Click textbox

Target: role textbox, tag <input>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #ESND3F0
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: textbox:Price`, `css: #ESND3F0`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/fieldset[1]/fieldset[1]/div[1]/div[1]/div[2]/div[1]/input[1]`

**Expected:** "#ESND3F0" becomes interactable

### 3. Click textbox

Target: role textbox, tag <input>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #ESND3F0
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: textbox:Price`, `css: #ESND3F0`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/fieldset[1]/fieldset[1]/div[1]/div[1]/div[2]/div[1]/input[1]`

**Expected:** "#ESND3F0" becomes interactable

### 4. Fill input

Target: role textbox, tag <input>
```bash
browse fill --no-press-enter #ESND3F0 2
```
Selector hints: `aria: textbox:Price`, `css: #ESND3F0`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/fieldset[1]/fieldset[1]/div[1]/div[1]/div[2]/div[1]/input[1]`

**Expected:** "#ESND3F0" becomes interactable

### 5. Fill input

Target: role textbox, tag <input>
```bash
browse fill --no-press-enter #ESND3F0 27
```
Selector hints: `aria: textbox:Price`, `css: #ESND3F0`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/fieldset[1]/fieldset[1]/div[1]/div[1]/div[2]/div[1]/input[1]`

**Expected:** "Save" becomes interactable

### 6. Click "Save"

Target: text "Save", role button, tag <button>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: button:Save
# )
browse click <ref-from-snapshot>
```
Selector hints: `text: Save`, `css: div:nth-of-type(3) > main > div.page-main-actions:nth-of-type(1) > div:nth-of-type(3) > div.page-actions-inner > div.page-actions-buttons > div.actions-split.save > button.primary:nth-of-type(1)`, `xpath: /html/body/body[1]/div[3]/main[1]/div[1]/div[3]/div[1]/div[1]/div[1]/button[1]`

## On failure

- If a `browse` command misses (selector resolves to nothing), run `browse snapshot` and re-locate the target by aria-label, role, or visible text.
- Each step lists multiple selector hints; try them in order. If none match, fall back to the **element fingerprint** in the step description and search the snapshot text.
- If the page state diverges from the `Expected` line, do not blindly continue — re-snapshot, understand the new state, and adapt.
- Steps marked with ⚠️ (dynamic list items) were recorded against a specific result. Choose an equivalent item from the current page rather than reproducing the recorded selector verbatim.
