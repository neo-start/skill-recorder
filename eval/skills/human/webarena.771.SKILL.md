---
name: dashboard-magento-admin
description: Dashboard / Magento Admin
allowed-tools: Bash
---

# Dashboard / Magento Admin

Domain: `localhost:7780`

> **Execution fidelity**: this is a recorded workflow. Execute every step
> in order. If a step approves a row whose text seems ambiguous to you
> (e.g. "OKish"), still approve it — the recording was made on the ground
> truth and your own sentiment judgment must NOT override which rows the
> recording touched. Approve exactly the rows that this recording approves;
> do not add rows and do not skip rows.

## Steps

### 1. Navigate to http://localhost:7780/admin/admin/dashboard/

```bash
browse open http://localhost:7780/admin/admin/dashboard/
```

**Expected:** "Marketing" becomes interactable

### 2. Click "Marketing"

Target: text "Marketing", role link, tag <a>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: link:Marketing
# )
browse click <ref-from-snapshot>
```
Selector hints: `text: Marketing`, `css: #menu-magento-backend-marketing > a`, `xpath: /html/body/body[1]/div[2]/nav[1]/ul[1]/li[5]/a[1]`

**Expected:** "All Reviews" becomes interactable

### 3. Click "All Reviews"

Target: text "All Reviews", role link, tag <a>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: link:All Reviews
# )
browse click <ref-from-snapshot>
```
Selector hints: `text: All Reviews`, `css: ul > li.column:nth-of-type(2) > ul > li.item-marketing-user-content.parent:nth-of-type(2) > div.submenu > ul > li.level-2:nth-of-type(1) > a`, `xpath: /html/body/body[1]/div[2]/nav[1]/ul[1]/li[5]/div[1]/ul[1]/li[2]/ul[1]/li[2]/div[1]/ul[1]/li[1]/a[1]`

**Expected:** URL becomes localhost:7780/admin/review/product/index/

### 4. Click ApprovedPendingNot Approved in the row containing "AnyYesNo undefinedundefinedrequire(["jquery", "mage/calendar"

```bash
# Click select in the row containing "AnyYesNo undefinedundefinedrequire([jquery, mage/calendar":
browse click 'xpath://tr[contains(normalize-space(.), "AnyYesNo undefinedundefinedrequire([jquery, mage/calendar")]//select'
```

**Expected:** "ApprovedPendingNot Approved" becomes interactable

### 5. Fill "ApprovedPendingNot Approved" in the row containing "AnyYesNo undefinedundefinedrequire(["jquery", "mage/calendar"

```bash
# Fill select in the row containing "AnyYesNo undefinedundefinedrequire([jquery, mage/calendar":
browse fill --no-press-enter 'xpath://tr[contains(normalize-space(.), "AnyYesNo undefinedundefinedrequire([jquery, mage/calendar")]//select' 2
```

**Expected:** "ApprovedPendingNot Approved" becomes interactable

### 6. Click ApprovedPendingNot Approved in the row containing "AnyYesNo undefinedundefinedrequire(["jquery", "mage/calendar"

```bash
# Click select in the row containing "AnyYesNo undefinedundefinedrequire([jquery, mage/calendar":
browse click 'xpath://tr[contains(normalize-space(.), "AnyYesNo undefinedundefinedrequire([jquery, mage/calendar")]//select'
```

**Expected:** "Search" becomes interactable

### 7. Click "Search"

Target: text "Search", role button, tag <button>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #id_PWaeSovBsnoSAofeBx7ZoayAZg93DEpF
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: button:Search`, `text: Search`, `css: #id_PWaeSovBsnoSAofeBx7ZoayAZg93DEpF`

**Expected:** URL becomes localhost:7780/admin/review/product/index/filter/Y3JlYXRlZF9hdCU1QmxvY2FsZ…

### 8. Click checkbox in the row containing "352 Apr 24, 2023, 2:53:49 PM Pending Good but not perfect cu"

```bash
# Click input[type="checkbox"] in the row containing "352 Apr 24, 2023, 2:53:49 PM Pending Good but not perfect cu":
browse click 'xpath://tr[contains(normalize-space(.), "352 Apr 24, 2023, 2:53:49 PM Pending Good but not perfect cu")]//input[type="checkbox"]'
```

**Expected:** "#id_183" becomes interactable

### 9. Fill "input" in the row containing "352 Apr 24, 2023, 2:53:49 PM Pending Good but not perfect cu"

```bash
# Fill input[type="checkbox"] in the row containing "352 Apr 24, 2023, 2:53:49 PM Pending Good but not perfect cu":
browse fill --no-press-enter 'xpath://tr[contains(normalize-space(.), "352 Apr 24, 2023, 2:53:49 PM Pending Good but not perfect cu")]//input[type="checkbox"]' on
```

**Expected:** "#id_136" becomes interactable

### 10. Click checkbox in the row containing "349 Apr 24, 2023, 2:44:16 PM Pending OKish seam miller I hav"

```bash
# Click input[type="checkbox"] in the row containing "349 Apr 24, 2023, 2:44:16 PM Pending OKish seam miller I hav":
browse click 'xpath://tr[contains(normalize-space(.), "349 Apr 24, 2023, 2:44:16 PM Pending OKish seam miller I hav")]//input[type="checkbox"]'
```

**Expected:** "#id_136" becomes interactable

### 11. Fill "input" in the row containing "349 Apr 24, 2023, 2:44:16 PM Pending OKish seam miller I hav"

```bash
# Fill input[type="checkbox"] in the row containing "349 Apr 24, 2023, 2:44:16 PM Pending OKish seam miller I hav":
browse fill --no-press-enter 'xpath://tr[contains(normalize-space(.), "349 Apr 24, 2023, 2:44:16 PM Pending OKish seam miller I hav")]//input[type="checkbox"]' on
```

**Expected:** "#reviewGrid_table > tbody > tr.even._clickable:nth" becomes interactable

### 12. Click label in the row containing "347 Apr 24, 2023, 2:42:23 PM Pending Quite good Jane Smith I"

```bash
# Click label in the row containing "347 Apr 24, 2023, 2:42:23 PM Pending Quite good Jane Smith I":
browse click 'xpath://tr[contains(normalize-space(.), "347 Apr 24, 2023, 2:42:23 PM Pending Quite good Jane Smith I")]//label'
```

**Expected:** "#id_856" becomes interactable

### 13. Click checkbox in the row containing "347 Apr 24, 2023, 2:42:23 PM Pending Quite good Jane Smith I"

```bash
# Click input[type="checkbox"] in the row containing "347 Apr 24, 2023, 2:42:23 PM Pending Quite good Jane Smith I":
browse click 'xpath://tr[contains(normalize-space(.), "347 Apr 24, 2023, 2:42:23 PM Pending Quite good Jane Smith I")]//input[type="checkbox"]'
```

**Expected:** "#id_856" becomes interactable

### 14. Fill "input" in the row containing "347 Apr 24, 2023, 2:42:23 PM Pending Quite good Jane Smith I"

```bash
# Fill input[type="checkbox"] in the row containing "347 Apr 24, 2023, 2:42:23 PM Pending Quite good Jane Smith I":
browse fill --no-press-enter 'xpath://tr[contains(normalize-space(.), "347 Apr 24, 2023, 2:42:23 PM Pending Quite good Jane Smith I")]//input[type="checkbox"]' off
```

**Expected:** "#id_856" becomes interactable

### 15. Click checkbox in the row containing "347 Apr 24, 2023, 2:42:23 PM Pending Quite good Jane Smith I"

```bash
# Click input[type="checkbox"] in the row containing "347 Apr 24, 2023, 2:42:23 PM Pending Quite good Jane Smith I":
browse click 'xpath://tr[contains(normalize-space(.), "347 Apr 24, 2023, 2:42:23 PM Pending Quite good Jane Smith I")]//input[type="checkbox"]'
```

**Expected:** "#id_856" becomes interactable

### 16. Fill "input" in the row containing "347 Apr 24, 2023, 2:42:23 PM Pending Quite good Jane Smith I"

```bash
# Fill input[type="checkbox"] in the row containing "347 Apr 24, 2023, 2:42:23 PM Pending Quite good Jane Smith I":
browse fill --no-press-enter 'xpath://tr[contains(normalize-space(.), "347 Apr 24, 2023, 2:42:23 PM Pending Quite good Jane Smith I")]//input[type="checkbox"]' on
```

**Expected:** "Actions Delete Update Status" becomes interactable

### 17. Click "Actions Delete Update Status"

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

### 18. Fill "Actions Delete Update Status"

```bash
browse select #reviewGrid_massaction-select update_status
```

**Expected:** "Actions Delete Update Status" becomes interactable

### 19. Click "Actions Delete Update Status"

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

### 20. Click "Approved Pending Not Approved"

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

### 21. Fill "Approved Pending Not Approved"

```bash
browse select #status 1
```

**Expected:** "Approved Pending Not Approved" becomes interactable

### 22. Click "Approved Pending Not Approved"

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

### 23. Click "Submit"

Target: text "Submit", role button, tag <button>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #id_a5TsGpq9EB9cpCQngyaWD4UcODq8mlbJ
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: button:Submit`, `text: Submit`, `css: #id_a5TsGpq9EB9cpCQngyaWD4UcODq8mlbJ`

## On failure

- If a `browse` command misses (selector resolves to nothing), run `browse snapshot` and re-locate the target by aria-label, role, or visible text.
- Each step lists multiple selector hints; try them in order. If none match, fall back to the **element fingerprint** in the step description and search the snapshot text.
- If the page state diverges from the `Expected` line, do not blindly continue — re-snapshot, understand the new state, and adapt.
- Steps marked with ⚠️ (dynamic list items) were recorded against a specific result. Choose an equivalent item from the current page rather than reproducing the recorded selector verbatim.
