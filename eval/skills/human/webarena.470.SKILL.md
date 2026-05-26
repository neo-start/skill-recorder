---
name: dashboard-magento-admin
description: Dashboard / Magento Admin
allowed-tools: Bash
---

# Dashboard / Magento Admin

Domain: `localhost:7780`

## Parameters

Ask the user for any of these not already provided:

- `search_by` — Value for search_by (example: `000000`)

## Steps

### 1. Navigate to http://localhost:7780/admin/admin/dashboard/

```bash
browse open http://localhost:7780/admin/admin/dashboard/
```

**Expected:** "Sales" becomes interactable

### 2. Click "Sales"

Target: text "Sales", role link, tag <a>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: link:Sales
# )
browse click <ref-from-snapshot>
```
Selector hints: `text: Sales`, `css: #menu-magento-sales-sales > a`, `xpath: /html/body/body[1]/div[2]/nav[1]/ul[1]/li[2]/a[1]`

**Expected:** "Orders" becomes interactable

### 3. Click "Orders"

Target: text "Orders", role link, tag <a>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: link:Orders
# )
browse click <ref-from-snapshot>
```
Selector hints: `text: Orders`, `css: #menu-magento-sales-sales > div.submenu > ul > li.item-sales-operation.parent > div.submenu > ul > li.item-sales-order.level-2:nth-of-type(1) > a`, `xpath: /html/body/body[1]/div[2]/nav[1]/ul[1]/li[2]/div[1]/ul[1]/li[1]/div[1]/ul[1]/li[1]/a[1]`

**Expected:** URL becomes localhost:7780/admin/sales/order/

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
Selector hints: `aria: textbox:Search by keyword`, `css: #fulltext`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[2]/input[1]`

**Expected:** "Search by keyword" becomes interactable

### 5. Fill "Search by keyword"

Target: text "Search by keyword", role textbox, aria-label "Search by keyword", tag <input>
```bash
browse fill #fulltext 000
```
Selector hints: `aria: textbox:Search by keyword`, `css: #fulltext`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[2]/input[1]`

**Expected:** "Search by keyword" becomes interactable

### 6. Fill "Search by keyword"

Target: text "Search by keyword", role textbox, aria-label "Search by keyword", tag <input>
```bash
browse fill #fulltext '{{search_by}}'
```
Selector hints: `aria: textbox:Search by keyword`, `css: #fulltext`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[2]/input[1]`

**Expected:** "Search by keyword" becomes interactable

### 7. Fill "Search by keyword"

Target: text "Search by keyword", role textbox, aria-label "Search by keyword", tag <input>
```bash
browse fill #fulltext '{{search_by}}'
```
Selector hints: `aria: textbox:Search by keyword`, `css: #fulltext`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[2]/input[1]`

**Expected:** "View" becomes interactable

### 8. Click "View"

Target: text "View", role link, tag <a>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: link:View
# )
browse click <ref-from-snapshot>
```
Selector hints: `text: View`, `css: #container > div.admin__data-grid-outer-wrap > div.admin__data-grid-wrap:nth-of-type(4) > table.data-grid.data-grid-draggable > tbody > tr.data-row > td.data-grid-actions-cell:nth-of-type(10) > a.action-menu-item`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[4]/table[1]/tbody[1]/tr[1]/td[10]/a[1]`

**Expected:** URL becomes localhost:7780/admin/sales/order/view/order_id/302/

### 9. Click "Cancel"

Target: text "Cancel", role button, tag <button>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #order-view-cancel-button
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: button:Cancel`, `text: Cancel`, `css: #order-view-cancel-button`

**Expected:** "OK" becomes interactable

### 10. Click "OK"

Target: text "OK", role button, tag <button>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: button:OK
# )
browse click <ref-from-snapshot>
```
Selector hints: `text: OK`, `css: #html-body > div:nth-of-type(7) > aside.modal-popup.confirm:nth-of-type(3) > div.modal-inner-wrap:nth-of-type(2) > footer > button:nth-of-type(2)`, `xpath: /html/body/body[1]/div[7]/aside[3]/div[2]/footer[1]/button[2]`

## On failure

- If a `browse` command misses (selector resolves to nothing), run `browse snapshot` and re-locate the target by aria-label, role, or visible text.
- Each step lists multiple selector hints; try them in order. If none match, fall back to the **element fingerprint** in the step description and search the snapshot text.
- If the page state diverges from the `Expected` line, do not blindly continue — re-snapshot, understand the new state, and adapt.
- Steps marked with ⚠️ (dynamic list items) were recorded against a specific result. Choose an equivalent item from the current page rather than reproducing the recorded selector verbatim.
