---
name: dashboard-magento-admin
description: Dashboard / Magento Admin
allowed-tools: Bash
---

# Dashboard / Magento Admin

Domain: `localhost:7780`

## Parameters

Ask the user for any of these not already provided:

- `search_by` — Value for search_by (example: `000000299`)
- `value_2` — Value for value_2 (example: `8974568499`)

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

### 5. Press Meta+v

```bash
browse press 'Meta+v'
```

**Expected:** "Search by keyword" becomes interactable

### 6. Paste into "Search by keyword"

```bash
# Paste into the resolved field. Most apps accept a plain fill;
# fall back to OS clipboard + Cmd+V if the page intercepts paste.
browse fill #fulltext 000000299
```

**Expected:** "Search by keyword" becomes interactable

### 7. Fill "Search by keyword"

Target: text "Search by keyword", role textbox, aria-label "Search by keyword", tag <input>
```bash
browse fill #fulltext '{{search_by}}'
```
Selector hints: `aria: textbox:Search by keyword`, `css: #fulltext`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/div[1]/div[2]/input[1]`

**Expected:** "Search by keyword" becomes interactable

### 8. Press Enter

```bash
browse press Enter
```

**Expected:** "View" becomes interactable

### 9. Click "View"

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

**Expected:** URL becomes localhost:7780/admin/sales/order/view/order_id/299/

### 10. Click "Ship"

Target: text "Ship", role button, tag <button>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #order_ship
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: button:Ship`, `text: Ship`, `css: #order_ship`

**Expected:** URL becomes localhost:7780/admin/admin/order_shipment/new/order_id/299/

### 11. Click "Add Tracking Number"

Target: text "Add Tracking Number", role button, tag <button>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #id_77Yh2skM7w19BJex7K8rUtZjtz62KMYy
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: button:Add Tracking Number`, `text: Add Tracking Number`, `css: #id_77Yh2skM7w19BJex7K8rUtZjtz62KMYy`

**Expected:** "Custom Value DHL Federal Express United Parcel Service United States Postal Serv" becomes interactable

### 12. Click "Custom Value DHL Federal Express United Parcel Service United States Postal Serv"

Target: text "Custom Value DHL Federal Express United Parcel Service United States Postal Serv", role combobox, tag <select>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #trackingC1
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #trackingC1`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/form[1]/div[2]/div[2]/div[2]/div[3]/div[1]/table[1]/tbody[1]/tr[1]/td[1]/select[1]`

**Expected:** "Custom Value DHL Federal Express United Parcel Service United States Postal Serv" becomes interactable

### 13. Fill "Custom Value DHL Federal Express United Parcel Service United States Postal Serv"

Target: text "Custom Value DHL Federal Express United Parcel Service United States Postal Serv", role combobox, tag <select>
```bash
browse fill #trackingC1 fedex
```
Selector hints: `css: #trackingC1`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/form[1]/div[2]/div[2]/div[2]/div[3]/div[1]/table[1]/tbody[1]/tr[1]/td[1]/select[1]`

**Expected:** "Custom Value DHL Federal Express United Parcel Service United States Postal Serv" becomes interactable

### 14. Click "Custom Value DHL Federal Express United Parcel Service United States Postal Serv"

Target: text "Custom Value DHL Federal Express United Parcel Service United States Postal Serv", role combobox, tag <select>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #trackingC1
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #trackingC1`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/form[1]/div[2]/div[2]/div[2]/div[3]/div[1]/table[1]/tbody[1]/tr[1]/td[1]/select[1]`

**Expected:** "#trackingN1" becomes interactable

### 15. Click textbox

Target: role textbox, tag <input>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #trackingN1
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #trackingN1`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/form[1]/div[2]/div[2]/div[2]/div[3]/div[1]/table[1]/tbody[1]/tr[1]/td[3]/input[1]`

**Expected:** "#trackingN1" becomes interactable

### 16. Press Meta+v

```bash
browse press 'Meta+v'
```

**Expected:** "#trackingN1" becomes interactable

### 17. Paste into "input"

```bash
# Paste into the resolved field. Most apps accept a plain fill;
# fall back to OS clipboard + Cmd+V if the page intercepts paste.
browse fill #trackingN1 8974568499
```

**Expected:** "#trackingN1" becomes interactable

### 18. Fill input

Target: role textbox, tag <input>
```bash
browse fill #trackingN1 '{{value_2}}'
```
Selector hints: `css: #trackingN1`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/form[1]/div[2]/div[2]/div[2]/div[3]/div[1]/table[1]/tbody[1]/tr[1]/td[3]/input[1]`

**Expected:** "Submit Shipment" becomes interactable

### 19. Click "Submit Shipment"

Target: text "Submit Shipment", role button, tag <button>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #id_7NTOMDay2Rk0gdt5QVmNtxkHnQf1gFwk
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: button:Submit Shipment`, `text: Submit Shipment`, `css: #id_7NTOMDay2Rk0gdt5QVmNtxkHnQf1gFwk`

## On failure

- If a `browse` command misses (selector resolves to nothing), run `browse snapshot` and re-locate the target by aria-label, role, or visible text.
- Each step lists multiple selector hints; try them in order. If none match, fall back to the **element fingerprint** in the step description and search the snapshot text.
- If the page state diverges from the `Expected` line, do not blindly continue — re-snapshot, understand the new state, and adapt.
- Steps marked with ⚠️ (dynamic list items) were recorded against a specific result. Choose an equivalent item from the current page rather than reproducing the recorded selector verbatim.
