---
name: dashboard-magento-admin
description: Dashboard / Magento Admin
allowed-tools: Bash
---

# Dashboard / Magento Admin

Domain: `localhost:7780`

## Steps

### 1. Navigate to http://localhost:7780/admin/admin/dashboard/

```bash
browse open http://localhost:7780/admin/admin/dashboard/
```

**Expected:** "Catalog" becomes interactable

### 2. Click "Catalog"

Target: text "Catalog", role link, tag <a>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: link:Catalog
# )
browse click <ref-from-snapshot>
```
Selector hints: `text: Catalog`, `css: #menu-magento-catalog-catalog > a`, `xpath: /html/body/body[1]/div[2]/nav[1]/ul[1]/li[3]/a[1]`

**Expected:** "Products" becomes interactable

### 3. Click "Products"

Target: text "Products", role link, tag <a>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: link:Products
# )
browse click <ref-from-snapshot>
```
Selector hints: `text: Products`, `css: #menu-magento-catalog-catalog > div.submenu > ul > li.parent.level-1 > div.submenu > ul > li.item-catalog-products.level-2:nth-of-type(1) > a`, `xpath: /html/body/body[1]/div[2]/nav[1]/ul[1]/li[3]/div[1]/ul[1]/li[1]/div[1]/ul[1]/li[1]/a[1]`

**Expected:** URL becomes localhost:7780/admin/catalog/product/

### 4. Click "Search by keyword"

Target: text "Search by keyword", role textbox, aria-label "Search by keyword", tag <input>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #fulltext
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: textbox:Search by keyword`, `css: #fulltext`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[5]/input[1]`

**Expected:** "Search by keyword" becomes interactable

### 5. Fill "Search by keyword"

Target: text "Search by keyword", role textbox, aria-label "Search by keyword", tag <input>
```bash
browse fill #fulltext T
```
Selector hints: `aria: textbox:Search by keyword`, `css: #fulltext`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[5]/input[1]`

**Expected:** "Search by keyword" becomes interactable

### 6. Fill "Search by keyword"

Target: text "Search by keyword", role textbox, aria-label "Search by keyword", tag <input>
```bash
browse fill #fulltext Te
```
Selector hints: `aria: textbox:Search by keyword`, `css: #fulltext`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[5]/input[1]`

**Expected:** "Search by keyword" becomes interactable

### 7. Fill "Search by keyword"

Target: text "Search by keyword", role textbox, aria-label "Search by keyword", tag <input>
```bash
browse fill #fulltext Teton
```
Selector hints: `aria: textbox:Search by keyword`, `css: #fulltext`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[5]/input[1]`

**Expected:** "Teton Pullover Hoodie" becomes interactable

### 8. Click "Teton Pullover Hoodie"

Target: text "Teton Pullover Hoodie", tag <div>
> ⚠️ This appears to click a specific item from a dynamic list (e.g. a search result). The exact element will likely be missing when replayed with different parameters — re-snapshot the page and pick an appropriate item by relevance instead of trusting the recorded selector.

```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #container > div.admin__data-grid-outer-wrap > div.admin__data-grid-wrap:nth-of-type(4) > table.data-grid.data-grid-draggable > tbody > tr.data-row:nth-of-type(1) > td:nth-of-type(4) > div.data-grid-cell-content.white-space-preserved
# )
browse click <ref-from-snapshot>
```
Selector hints: `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[4]/table[1]/tbody[1]/tr[1]/td[4]/div[1]`

**Expected:** URL becomes localhost:7780/admin/catalog/product/edit/id/78/

### 9. Click label

Target: tag <label>
> ⚠️ This appears to click a specific item from a dynamic list (e.g. a search result). The exact element will likely be missing when replayed with different parameters — re-snapshot the page and pick an appropriate item by relevance instead of trusting the recorded selector.

```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: div.entry-edit:nth-of-type(2) > div:nth-of-type(1) > div._hide > fieldset.admin__fieldset > div.admin__field:nth-of-type(1) > div.admin__field-control:nth-of-type(2) > div.admin__actions-switch > label.admin__actions-switch-label
# )
browse click <ref-from-snapshot>
```
Selector hints: `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/fieldset[1]/div[1]/div[2]/div[1]/label[1]`

**Expected:** "#TSJDDR1" becomes interactable

### 10. Click checkbox

Target: role checkbox, tag <input>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #TSJDDR1
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: checkbox:Enable Product`, `css: #TSJDDR1`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/fieldset[1]/div[1]/div[2]/div[1]/input[1]`

**Expected:** "#TSJDDR1" becomes interactable

### 11. Fill input

Target: role checkbox, tag <input>
```bash
browse fill #TSJDDR1 off
```
Selector hints: `aria: checkbox:Enable Product`, `css: #TSJDDR1`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/fieldset[1]/div[1]/div[2]/div[1]/input[1]`

**Expected:** "Save" becomes interactable

### 12. Click "Save"

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
