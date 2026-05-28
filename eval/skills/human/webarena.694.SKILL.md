---
name: dashboard-magento-admin
description: Dashboard / Magento Admin
allowed-tools: Bash
---

# Dashboard / Magento Admin

Domain: `localhost:7780`

## Parameters

Ask the user for any of these not already provided:

- `value_1` — Value for value_1 (example: `Energy-Bulk Women Shirt`)

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

### 4. Click "Add product of type"

Target: text "Select", role button, aria-label "Add product of type", tag <button>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: button:Add product of type
# )
browse click <ref-from-snapshot>
```
Selector hints: `text: Select`, `css: #add_new_product > button.primary.add:nth-of-type(2)`, `xpath: /html/body/body[1]/div[3]/main[1]/div[1]/div[2]/div[1]/div[1]/div[1]/button[2]`

**Expected:** "Simple Product" becomes interactable

### 5. Click "Simple Product"

Target: text "Simple Product", tag <span>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #add_new_product-optIdiBlBH5b0ne
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: :Simple Product`, `css: #add_new_product-optIdiBlBH5b0ne`, `xpath: /html/body/body[1]/div[3]/main[1]/div[1]/div[2]/div[1]/div[1]/div[1]/ul[1]/li[1]/span[1]`

**Expected:** URL becomes localhost:7780/admin/catalog/product/new/set/4/type/simple/

### 6. Click textbox

Target: role textbox, tag <input>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #HHSE6NR
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: textbox:Product Name`, `css: #HHSE6NR`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/fieldset[1]/div[3]/div[2]/input[1]`

**Expected:** "#HHSE6NR" becomes interactable

### 7. Press Meta+v

```bash
browse press 'Meta+v'
```

**Expected:** "#HHSE6NR" becomes interactable

### 8. Paste into "input"

```bash
# Paste into the resolved field. Most apps accept a plain fill;
# fall back to OS clipboard + Cmd+V if the page intercepts paste.
browse fill #HHSE6NR 'Energy-Bulk Women Shirt'
```

**Expected:** "#HHSE6NR" becomes interactable

### 9. Fill input

Target: role textbox, tag <input>
```bash
browse fill --no-press-enter #HHSE6NR '{{value_1}}'
```
Selector hints: `aria: textbox:Product Name`, `css: #HHSE6NR`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/fieldset[1]/div[3]/div[2]/input[1]`

**Expected:** "Default Bag Bottom Default Downloadable Gear Sprite Stasis Ball Sprite Yoga Stra" becomes interactable

### 10. Click "Default Bag Bottom Default Downloadable Gear Sprite Stasis Ball Sprite Yoga Stra"

Target: text "Default Bag Bottom Default Downloadable Gear Sprite Stasis Ball Sprite Yoga Stra", tag <div>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #ATTJQ78
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: :Attribute Set`, `css: #ATTJQ78`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/fieldset[1]/div[2]/div[2]/div[1]`

**Expected:** "Default Bag Bottom Default Downloadable Gear Sprite Stasis Ball Sprite Yoga Stra" becomes interactable

### 11. Click "Default Bag Bottom Default Downloadable Gear Sprite Stasis Ball Sprite Yoga Stra"

Target: text "Default Bag Bottom Default Downloadable Gear Sprite Stasis Ball Sprite Yoga Stra", tag <div>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #ATTJQ78
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: :Attribute Set`, `css: #ATTJQ78`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/fieldset[1]/div[2]/div[2]/div[1]`

**Expected:** "#BYN9DWY" becomes interactable

### 12. Click textbox

Target: role textbox, tag <input>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #BYN9DWY
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: textbox:Price`, `css: #BYN9DWY`, `xpath: /html/body/body[1]/div[4]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/fieldset[1]/fieldset[1]/div[1]/div[1]/div[2]/div[1]/input[1]`

**Expected:** "#BYN9DWY" becomes interactable

### 13. Fill input

Target: role textbox, tag <input>
```bash
browse fill --no-press-enter #BYN9DWY 60
```
Selector hints: `aria: textbox:Price`, `css: #BYN9DWY`, `xpath: /html/body/body[1]/div[4]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/fieldset[1]/fieldset[1]/div[1]/div[1]/div[2]/div[1]/input[1]`

**Expected:** "#LKBFOGE" becomes interactable

### 14. Click textbox

Target: role textbox, tag <input>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #LKBFOGE
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: textbox:Quantity`, `css: #LKBFOGE`, `xpath: /html/body/body[1]/div[4]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/fieldset[1]/fieldset[2]/div[1]/div[1]/div[2]/input[1]`

**Expected:** "#LKBFOGE" becomes interactable

### 15. Fill input

Target: role textbox, tag <input>
```bash
browse fill --no-press-enter #LKBFOGE 50
```
Selector hints: `aria: textbox:Quantity`, `css: #LKBFOGE`, `xpath: /html/body/body[1]/div[4]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/fieldset[1]/fieldset[2]/div[1]/div[1]/div[2]/input[1]`

**Expected:** "notice-L1SJ95U" becomes interactable

### 16. Click "notice-L1SJ95U"

Target: text "55 cmXS65 cmS75 cmM6 footL8 footXL10 foot282930313233343638", role combobox, aria-label "notice-L1SJ95U", tag <select>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #L1SJ95U
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: combobox:notice-L1SJ95U`, `css: #L1SJ95U`, `xpath: /html/body/body[1]/div[4]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/fieldset[1]/div[13]/div[2]/select[1]`

**Expected:** "notice-L1SJ95U" becomes interactable

### 17. Fill "notice-L1SJ95U"

```bash
browse select #L1SJ95U 167
```

**Expected:** "notice-L1SJ95U" becomes interactable

### 18. Click "notice-L1SJ95U"

Target: text "55 cmXS65 cmS75 cmM6 footL8 footXL10 foot282930313233343638", role combobox, aria-label "notice-L1SJ95U", tag <select>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #L1SJ95U
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: combobox:notice-L1SJ95U`, `css: #L1SJ95U`, `xpath: /html/body/body[1]/div[4]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/fieldset[1]/div[13]/div[2]/select[1]`

**Expected:** "notice-LMVK0YL" becomes interactable

### 19. Click "notice-LMVK0YL"

Target: text "BlackBlueBrownGrayGreenLavenderMultiOrangePurpleRedWhiteYellow", role combobox, aria-label "notice-LMVK0YL", tag <select>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #LMVK0YL
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: combobox:notice-LMVK0YL`, `css: #LMVK0YL`, `xpath: /html/body/body[1]/div[4]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/fieldset[1]/div[17]/div[2]/select[1]`

**Expected:** "notice-LMVK0YL" becomes interactable

### 20. Fill "notice-LMVK0YL"

```bash
browse select #LMVK0YL 50
```

**Expected:** "notice-LMVK0YL" becomes interactable

### 21. Click "notice-LMVK0YL"

Target: text "BlackBlueBrownGrayGreenLavenderMultiOrangePurpleRedWhiteYellow", role combobox, aria-label "notice-LMVK0YL", tag <select>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #LMVK0YL
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: combobox:notice-LMVK0YL`, `css: #LMVK0YL`, `xpath: /html/body/body[1]/div[4]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/fieldset[1]/div[17]/div[2]/select[1]`

**Expected:** "Select... Default Category Gear Collections Training Men Women Promotions Sale W" becomes interactable

### 22. Click "Select... Default Category Gear Collections Training Men Women Promotions Sale W"

Target: text "Select... Default Category Gear Collections Training Men Women Promotions Sale W", tag <div>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #LOT4K5X
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: :Categories`, `css: #LOT4K5X`, `xpath: /html/body/body[1]/div[4]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/fieldset[1]/fieldset[4]/div[1]/div[1]/div[2]/div[1]`

**Expected:** "Select... Default Category Gear Collections Training Men Women Promotions Sale W" becomes interactable

### 23. Click "Select... Default Category Gear Collections Training Men Women Promotions Sale W"

Target: text "Select... Default Category Gear Collections Training Men Women Promotions Sale W", tag <div>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #LOT4K5X
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: :Categories`, `css: #LOT4K5X`, `xpath: /html/body/body[1]/div[4]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/fieldset[1]/fieldset[4]/div[1]/div[1]/div[2]/div[1]`

**Expected:** "Tops" becomes interactable

### 24. Click "Tops"

Target: text "Tops", tag <label>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: :Tops
# )
browse click <ref-from-snapshot>
```
Selector hints: `text: Tops`, `css: ul._root > li._root._parent > ul > li._parent:nth-of-type(5) > ul > li._parent:nth-of-type(1) > div.action-menu-item._with-checkbox > label`, `xpath: /html/body/body[1]/div[4]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/fieldset[1]/fieldset[4]/div[1]/div[1]/div[2]/div[1]/div[2]/ul[1]/li[1]/ul[1]/li[5]/ul[1]/li[1]/div[1]/label[1]`

**Expected:** "Done" becomes interactable

### 25. Click "Done"

Target: text "Done", role button, tag <button>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: button:Done
# )
browse click <ref-from-snapshot>
```
Selector hints: `text: Done`, `css: #LOT4K5X > div.action-menu._active:nth-of-type(2) > div:nth-of-type(2) > button`, `xpath: /html/body/body[1]/div[4]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/fieldset[1]/fieldset[4]/div[1]/div[1]/div[2]/div[1]/div[2]/div[2]/button[1]`

**Expected:** "Save" becomes interactable

### 26. Click "Save"

Target: text "Save", role button, tag <button>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: button:Save
# )
browse click <ref-from-snapshot>
```
Selector hints: `text: Save`, `css: div:nth-of-type(4) > main > div.page-main-actions:nth-of-type(1) > div:nth-of-type(2) > div.page-actions-inner > div.page-actions-buttons > div.actions-split.save > button.primary:nth-of-type(1)`, `xpath: /html/body/body[1]/div[4]/main[1]/div[1]/div[2]/div[1]/div[1]/div[1]/button[1]`

**Expected:** URL becomes localhost:7780/admin/catalog/product/edit/id/2041/set/9/type/simple/store/…

### 27. Click "Enable Product Attribute Set Top Bag Bottom Default Downloadable Gear Sprite Sta"

Target: text "Enable Product Attribute Set Top Bag Bottom Default Downloadable Gear Sprite Sta", tag <fieldset>
> ⚠️ This appears to click a specific item from a dynamic list (e.g. a search result). The exact element will likely be missing when replayed with different parameters — re-snapshot the page and pick an appropriate item by relevance instead of trusting the recorded selector.

```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #container > div > div.entry-edit:nth-of-type(2) > div:nth-of-type(1) > div._hide > fieldset.admin__fieldset
# )
browse click <ref-from-snapshot>
```
Selector hints: `xpath: /html/body/body[1]/div[3]/main[1]/div[3]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/fieldset[1]`

## On failure

- If a `browse` command misses (selector resolves to nothing), run `browse snapshot` and re-locate the target by aria-label, role, or visible text.
- Each step lists multiple selector hints; try them in order. If none match, fall back to the **element fingerprint** in the step description and search the snapshot text.
- If the page state diverges from the `Expected` line, do not blindly continue — re-snapshot, understand the new state, and adapt.
- Steps marked with ⚠️ (dynamic list items) were recorded against a specific result. Choose an equivalent item from the current page rather than reproducing the recorded selector verbatim.
