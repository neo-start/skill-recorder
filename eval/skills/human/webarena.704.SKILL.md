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

**Expected:** "Reports" becomes interactable

### 2. Click "Reports"

Target: text "Reports", role link, tag <a>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: link:Reports
# )
browse click <ref-from-snapshot>
```
Selector hints: `text: Reports`, `css: #menu-magento-reports-report > a`, `xpath: /html/body/body[1]/div[2]/nav[1]/ul[1]/li[7]/a[1]`

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
Selector hints: `text: Orders`, `css: ul > li.column:nth-of-type(2) > ul > li.item-report-salesroot.parent > div.submenu > ul > li.item-report-salesroot-sales.level-2:nth-of-type(1) > a`, `xpath: /html/body/body[1]/div[2]/nav[1]/ul[1]/li[7]/div[1]/ul[1]/li[2]/ul[1]/li[1]/div[1]/ul[1]/li[1]/a[1]`

**Expected:** URL becomes localhost:7780/admin/reports/report_sales/sales/

### 4. Click "undefined"

Target: text "undefined", role button, tag <button>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: button:undefined
# )
browse click <ref-from-snapshot>
```
Selector hints: `text: undefined`, `css: #sales_report_base_fieldset > div.admin__field.field:nth-of-type(4) > div.admin__field-control.control > button.ui-datepicker-trigger`, `xpath: /html/body/body[1]/div[3]/main[1]/div[3]/div[1]/div[1]/div[1]/div[1]/form[1]/fieldset[1]/div[4]/div[1]/button[1]`

**Expected:** "Select year" becomes interactable

### 5. Click "Select year"

Target: text "19261927192819291930193119321933193419351936193719381939194019411942194319441945", role combobox, aria-label "Select year", tag <select>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: combobox:Select year
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #ui-datepicker-div > div.ui-datepicker-header.ui-widget-header:nth-of-type(1) > div.ui-datepicker-title > select.ui-datepicker-year:nth-of-type(2)`, `xpath: /html/body/body[1]/div[5]/div[1]/div[1]/select[2]`

**Expected:** "Select year" becomes interactable

### 6. Fill "Select year"

Target: text "19261927192819291930193119321933193419351936193719381939194019411942194319441945", role combobox, aria-label "Select year", tag <select>
```bash
browse fill '#ui-datepicker-div > div.ui-datepicker-header.ui-widget-header:nth-of-type(1) > div.ui-datepicker-title > select.ui-datepicker-year:nth-of-type(2)' 2023
```
Selector hints: `css: #ui-datepicker-div > div.ui-datepicker-header.ui-widget-header:nth-of-type(1) > div.ui-datepicker-title > select.ui-datepicker-year:nth-of-type(2)`, `xpath: /html/body/body[1]/div[5]/div[1]/div[1]/select[2]`

**Expected:** "Select month" becomes interactable

### 7. Click "Select month"

Target: text "JanFebMarAprMayJunJulAugSepOctNovDec", role combobox, aria-label "Select month", tag <select>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: combobox:Select month
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #ui-datepicker-div > div.ui-datepicker-header.ui-widget-header:nth-of-type(1) > div.ui-datepicker-title > select.ui-datepicker-month:nth-of-type(1)`, `xpath: /html/body/body[1]/div[5]/div[1]/div[1]/select[1]`

**Expected:** "Select month" becomes interactable

### 8. Fill "Select month"

Target: text "JanFebMarAprMayJunJulAugSepOctNovDec", role combobox, aria-label "Select month", tag <select>
```bash
browse fill '#ui-datepicker-div > div.ui-datepicker-header.ui-widget-header:nth-of-type(1) > div.ui-datepicker-title > select.ui-datepicker-month:nth-of-type(1)' 1
```
Selector hints: `css: #ui-datepicker-div > div.ui-datepicker-header.ui-widget-header:nth-of-type(1) > div.ui-datepicker-title > select.ui-datepicker-month:nth-of-type(1)`, `xpath: /html/body/body[1]/div[5]/div[1]/div[1]/select[1]`

**Expected:** "1" becomes interactable

### 9. Click "1"

Target: text "1", role link, tag <a>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: link:1
# )
browse click <ref-from-snapshot>
```
Selector hints: `text: 1`, `css: #ui-datepicker-div > table.ui-datepicker-calendar > tbody > tr:nth-of-type(1) > td:nth-of-type(4) > a.ui-state-default.ui-state-hover`, `xpath: /html/body/body[1]/div[5]/table[1]/tbody[1]/tr[1]/td[4]/a[1]`

**Expected:** "undefined" becomes interactable

### 10. Click "undefined"

Target: text "undefined", role button, tag <button>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: button:undefined
# )
browse click <ref-from-snapshot>
```
Selector hints: `text: undefined`, `css: #sales_report_base_fieldset > div.admin__field.field:nth-of-type(5) > div.admin__field-control.control > button.ui-datepicker-trigger`, `xpath: /html/body/body[1]/div[3]/main[1]/div[3]/div[1]/div[1]/div[1]/div[1]/form[1]/fieldset[1]/div[5]/div[1]/button[1]`

**Expected:** "Select year" becomes interactable

### 11. Click "Select year"

Target: text "19261927192819291930193119321933193419351936193719381939194019411942194319441945", role combobox, aria-label "Select year", tag <select>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: combobox:Select year
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #ui-datepicker-div > div.ui-datepicker-header.ui-widget-header:nth-of-type(1) > div.ui-datepicker-title > select.ui-datepicker-year:nth-of-type(2)`, `xpath: /html/body/body[1]/div[5]/div[1]/div[1]/select[2]`

**Expected:** "Select year" becomes interactable

### 12. Fill "Select year"

Target: text "19261927192819291930193119321933193419351936193719381939194019411942194319441945", role combobox, aria-label "Select year", tag <select>
```bash
browse fill '#ui-datepicker-div > div.ui-datepicker-header.ui-widget-header:nth-of-type(1) > div.ui-datepicker-title > select.ui-datepicker-year:nth-of-type(2)' 2023
```
Selector hints: `css: #ui-datepicker-div > div.ui-datepicker-header.ui-widget-header:nth-of-type(1) > div.ui-datepicker-title > select.ui-datepicker-year:nth-of-type(2)`, `xpath: /html/body/body[1]/div[5]/div[1]/div[1]/select[2]`

**Expected:** "Select month" becomes interactable

### 13. Click "Select month"

Target: text "JanFebMarAprMayJunJulAugSepOctNovDec", role combobox, aria-label "Select month", tag <select>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: combobox:Select month
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #ui-datepicker-div > div.ui-datepicker-header.ui-widget-header:nth-of-type(1) > div.ui-datepicker-title > select.ui-datepicker-month:nth-of-type(1)`, `xpath: /html/body/body[1]/div[5]/div[1]/div[1]/select[1]`

**Expected:** "Select month" becomes interactable

### 14. Fill "Select month"

Target: text "JanFebMarAprMayJunJulAugSepOctNovDec", role combobox, aria-label "Select month", tag <select>
```bash
browse fill '#ui-datepicker-div > div.ui-datepicker-header.ui-widget-header:nth-of-type(1) > div.ui-datepicker-title > select.ui-datepicker-month:nth-of-type(1)' 1
```
Selector hints: `css: #ui-datepicker-div > div.ui-datepicker-header.ui-widget-header:nth-of-type(1) > div.ui-datepicker-title > select.ui-datepicker-month:nth-of-type(1)`, `xpath: /html/body/body[1]/div[5]/div[1]/div[1]/select[1]`

**Expected:** "28" becomes interactable

### 15. Click "28"

Target: text "28", role link, tag <a>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: link:28
# )
browse click <ref-from-snapshot>
```
Selector hints: `text: 28`, `css: #ui-datepicker-div > table.ui-datepicker-calendar > tbody > tr:nth-of-type(5) > td:nth-of-type(3) > a.ui-state-default.ui-state-hover`, `xpath: /html/body/body[1]/div[5]/table[1]/tbody[1]/tr[5]/td[3]/a[1]`

**Expected:** "Show Report" becomes interactable

### 16. Click "Show Report"

Target: text "Show Report", role button, tag <button>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #filter_form_submit
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: button:Show Report`, `text: Show Report`, `css: #filter_form_submit`

## On failure

- If a `browse` command misses (selector resolves to nothing), run `browse snapshot` and re-locate the target by aria-label, role, or visible text.
- Each step lists multiple selector hints; try them in order. If none match, fall back to the **element fingerprint** in the step description and search the snapshot text.
- If the page state diverges from the `Expected` line, do not blindly continue — re-snapshot, understand the new state, and adapt.
- Steps marked with ⚠️ (dynamic list items) were recorded against a specific result. Choose an equivalent item from the current page rather than reproducing the recorded selector verbatim.
