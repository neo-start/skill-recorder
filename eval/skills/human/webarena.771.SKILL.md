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

**Expected:** URL becomes localhost:7780/admin/review/product/index/

### 2. Navigate to http://localhost:7780/admin/review/product/index/

```bash
browse open http://localhost:7780/admin/review/product/index/
```

**Expected:** "ApprovedPendingNot Approved" becomes interactable

### 3. Click "ApprovedPendingNot Approved"

Target: text "ApprovedPendingNot Approved", role combobox, tag <select>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #reviewGrid_filter_status
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #reviewGrid_filter_status`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/table[1]/thead[1]/tr[2]/td[4]/select[1]`

**Expected:** "ApprovedPendingNot Approved" becomes interactable

### 4. Fill "ApprovedPendingNot Approved"

Target: text "ApprovedPendingNot Approved", role combobox, tag <select>
```bash
browse fill #reviewGrid_filter_status 2
```
Selector hints: `css: #reviewGrid_filter_status`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/table[1]/thead[1]/tr[2]/td[4]/select[1]`

**Expected:** "ApprovedPendingNot Approved" becomes interactable

### 5. Click "ApprovedPendingNot Approved"

Target: text "ApprovedPendingNot Approved", role combobox, tag <select>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #reviewGrid_filter_status
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #reviewGrid_filter_status`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/table[1]/thead[1]/tr[2]/td[4]/select[1]`

**Expected:** "#id_771" becomes interactable

### 6. Click checkbox

Target: role checkbox, tag <input>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #id_771
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #id_771`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/table[1]/tbody[1]/tr[2]/td[1]/label[1]/input[1]`

**Expected:** "#id_771" becomes interactable

### 7. Fill input

Target: role checkbox, tag <input>
```bash
browse fill #id_771 on
```
Selector hints: `css: #id_771`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/table[1]/tbody[1]/tr[2]/td[1]/label[1]/input[1]`

**Expected:** "#id_328" becomes interactable

### 8. Click checkbox

Target: role checkbox, tag <input>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #id_328
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #id_328`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/table[1]/tbody[1]/tr[4]/td[1]/label[1]/input[1]`

**Expected:** "#id_328" becomes interactable

### 9. Fill input

Target: role checkbox, tag <input>
```bash
browse fill #id_328 on
```
Selector hints: `css: #id_328`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/table[1]/tbody[1]/tr[4]/td[1]/label[1]/input[1]`

**Expected:** "#id_573" becomes interactable

### 10. Click checkbox

Target: role checkbox, tag <input>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #id_573
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #id_573`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/table[1]/tbody[1]/tr[5]/td[1]/label[1]/input[1]`

**Expected:** "#id_573" becomes interactable

### 11. Fill input

Target: role checkbox, tag <input>
```bash
browse fill #id_573 on
```
Selector hints: `css: #id_573`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[2]/table[1]/tbody[1]/tr[5]/td[1]/label[1]/input[1]`

**Expected:** "Actions Delete Update Status" becomes interactable

### 12. Click "Actions Delete Update Status"

Target: text "Actions Delete Update Status", role combobox, tag <select>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #reviewGrid_massaction-select
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #reviewGrid_massaction-select`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[1]/div[2]/div[1]/form[1]/div[1]/select[1]`

**Expected:** "Actions Delete Update Status" becomes interactable

### 13. Fill "Actions Delete Update Status"

Target: text "Actions Delete Update Status", role combobox, tag <select>
```bash
browse fill #reviewGrid_massaction-select update_status
```
Selector hints: `css: #reviewGrid_massaction-select`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[1]/div[2]/div[1]/form[1]/div[1]/select[1]`

**Expected:** "Actions Delete Update Status" becomes interactable

### 14. Click "Actions Delete Update Status"

Target: text "Actions Delete Update Status", role combobox, tag <select>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #reviewGrid_massaction-select
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #reviewGrid_massaction-select`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[1]/div[2]/div[1]/form[1]/div[1]/select[1]`

**Expected:** "Approved Pending Not Approved" becomes interactable

### 15. Click "Approved Pending Not Approved"

Target: text "Approved Pending Not Approved", role combobox, tag <select>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #status
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: combobox:Status`, `css: #status`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[1]/div[2]/div[1]/form[1]/div[1]/span[2]/div[1]/span[1]/select[1]`

**Expected:** "Approved Pending Not Approved" becomes interactable

### 16. Fill "Approved Pending Not Approved"

Target: text "Approved Pending Not Approved", role combobox, tag <select>
```bash
browse fill #status 1
```
Selector hints: `aria: combobox:Status`, `css: #status`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[1]/div[2]/div[1]/form[1]/div[1]/span[2]/div[1]/span[1]/select[1]`

**Expected:** "Approved Pending Not Approved" becomes interactable

### 17. Click "Approved Pending Not Approved"

Target: text "Approved Pending Not Approved", role combobox, tag <select>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #status
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: combobox:Status`, `css: #status`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[1]/div[2]/div[1]/form[1]/div[1]/span[2]/div[1]/span[1]/select[1]`

**Expected:** "Submit" becomes interactable

### 18. Click "Submit"

Target: text "Submit", role button, tag <button>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #id_E3OOlsz0mFeUSwxwTkzEfQ5GhONYXZXk
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: button:Submit`, `text: Submit`, `css: #id_E3OOlsz0mFeUSwxwTkzEfQ5GhONYXZXk`

## On failure

- If a `browse` command misses (selector resolves to nothing), run `browse snapshot` and re-locate the target by aria-label, role, or visible text.
- Each step lists multiple selector hints; try them in order. If none match, fall back to the **element fingerprint** in the step description and search the snapshot text.
- If the page state diverges from the `Expected` line, do not blindly continue — re-snapshot, understand the new state, and adapt.
- Steps marked with ⚠️ (dynamic list items) were recorded against a specific result. Choose an equivalent item from the current page rather than reproducing the recorded selector verbatim.
