---
name: dashboard-save-order-address
description: Dashboard / Save Order Address
allowed-tools: Bash
---

# Dashboard / Save Order Address

Domain: `localhost:7780`

## Parameters

Ask the user for any of these not already provided:

- `value_1` — Value for value_1 (example: `456 Oak Avenue`)
- `value_2` — Value for value_2 (example: `1000`)
- `value_3` — Value for value_3 (example: `10001`)
- `value_4` — Value for value_4 (example: `456 Oak Avenue`)
- `value_5` — Value for value_5 (example: `10001`)

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

### 4. Click "View"

Target: text "View", role link, tag <a>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: link:View
# )
browse click <ref-from-snapshot>
```
Selector hints: `text: View`, `css: #container > div.admin__data-grid-outer-wrap > div.admin__data-grid-wrap:nth-of-type(4) > table.data-grid.data-grid-draggable > tbody > tr.data-row:nth-of-type(1) > td.data-grid-actions-cell:nth-of-type(10) > a.action-menu-item`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[4]/table[1]/tbody[1]/tr[1]/td[10]/a[1]`

**Expected:** URL becomes localhost:7780/admin/sales/order/view/order_id/299/

### 5. Click "Edit"

Target: text "Edit", role link, tag <a>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: link:Edit
# )
browse click <ref-from-snapshot>
```
Selector hints: `text: Edit`, `css: #sales_order_view_tabs_order_info_content > section.admin__page-section:nth-of-type(2) > div.admin__page-section-content:nth-of-type(2) > div.admin__page-section-item.order-billing-address:nth-of-type(1) > div.admin__page-section-item-title > div.actions > a`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[1]/div[1]/section[2]/div[2]/div[1]/div[1]/div[1]/a[1]`

**Expected:** URL becomes localhost:7780/admin/sales/order/address/address_id/598/

### 6. Click textbox

Target: role textbox, tag <input>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #street0
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #street0`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[9]/div[1]/div[1]/input[1]`

**Expected:** "#street0" becomes interactable

### 7. Press Meta+v

```bash
browse press 'Meta+v'
```

**Expected:** "#street0" becomes interactable

### 8. Paste into "input"

```bash
# Paste into the resolved field. Most apps accept a plain fill;
# fall back to OS clipboard + Cmd+V if the page intercepts paste.
browse fill #street0 '456 Oak Avenue'
```

**Expected:** "#street0" becomes interactable

### 9. Fill input

Target: role textbox, tag <input>
```bash
browse fill #street0 '{{value_1}}'
```
Selector hints: `css: #street0`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[9]/div[1]/div[1]/input[1]`

**Expected:** "#street1" becomes interactable

### 10. Click textbox

Target: role textbox, tag <input>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #street1
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #street1`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[9]/div[1]/div[2]/input[1]`

**Expected:** "#street1" becomes interactable

### 11. Press Meta+v

```bash
browse press 'Meta+v'
```

**Expected:** "#street1" becomes interactable

### 12. Paste into "input"

```bash
# Paste into the resolved field. Most apps accept a plain fill;
# fall back to OS clipboard + Cmd+V if the page intercepts paste.
browse fill #street1 'Apartment 5B'
```

**Expected:** "#street1" becomes interactable

### 13. Fill input

Target: role textbox, tag <input>
```bash
browse fill #street1 'Apartment 5B'
```
Selector hints: `css: #street1`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[9]/div[1]/div[2]/input[1]`

**Expected:** "Please selectAlabamaAlaskaAmerican SamoaArizonaArkansasArmed Forces AfricaArmed " becomes interactable

### 14. Click "Please selectAlabamaAlaskaAmerican SamoaArizonaArkansasArmed Forces AfricaArmed "

Target: text "Please selectAlabamaAlaskaAmerican SamoaArizonaArkansasArmed Forces AfricaArmed ", role combobox, tag <select>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #region_id
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #region_id`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[11]/div[1]/select[1]`

**Expected:** "Please selectAlabamaAlaskaAmerican SamoaArizonaArkansasArmed Forces AfricaArmed " becomes interactable

### 15. Fill "Please selectAlabamaAlaskaAmerican SamoaArizonaArkansasArmed Forces AfricaArmed "

Target: text "Please selectAlabamaAlaskaAmerican SamoaArizonaArkansasArmed Forces AfricaArmed ", role combobox, tag <select>
```bash
browse fill #region_id 43
```
Selector hints: `css: #region_id`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[11]/div[1]/select[1]`

**Expected:** "Please selectAlabamaAlaskaAmerican SamoaArizonaArkansasArmed Forces AfricaArmed " becomes interactable

### 16. Click "Please selectAlabamaAlaskaAmerican SamoaArizonaArkansasArmed Forces AfricaArmed "

Target: text "Please selectAlabamaAlaskaAmerican SamoaArizonaArkansasArmed Forces AfricaArmed ", role combobox, tag <select>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #region_id
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #region_id`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[11]/div[1]/select[1]`

**Expected:** "#city" becomes interactable

### 17. Click textbox

Target: role textbox, tag <input>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #city
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: textbox:City`, `css: #city`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[12]/div[1]/input[1]`

**Expected:** "City" becomes interactable

### 18. Click "City"

Target: text "City", tag <div>
> ⚠️ This appears to click a specific item from a dynamic list (e.g. a search result). The exact element will likely be missing when replayed with different parameters — re-snapshot the page and pick an appropriate item by relevance instead of trusting the recorded selector.

```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #edit_form > div.admin__field.field:nth-of-type(12)
# )
browse click <ref-from-snapshot>
```
Selector hints: `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[12]`

**Expected:** "#city" becomes interactable

### 19. Fill input

Target: role textbox, tag <input>
```bash
browse fill #city New
```
Selector hints: `aria: textbox:City`, `css: #city`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[12]/div[1]/input[1]`

**Expected:** "#city" becomes interactable

### 20. Fill input

Target: role textbox, tag <input>
```bash
browse fill #city New
```
Selector hints: `aria: textbox:City`, `css: #city`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[12]/div[1]/input[1]`

**Expected:** "#city" becomes interactable

### 21. Fill input

Target: role textbox, tag <input>
```bash
browse fill #city 'New '
```
Selector hints: `aria: textbox:City`, `css: #city`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[12]/div[1]/input[1]`

**Expected:** "#city" becomes interactable

### 22. Fill input

Target: role textbox, tag <input>
```bash
browse fill #city 'New Yo'
```
Selector hints: `aria: textbox:City`, `css: #city`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[12]/div[1]/input[1]`

**Expected:** "#city" becomes interactable

### 23. Fill input

Target: role textbox, tag <input>
```bash
browse fill #city 'New York'
```
Selector hints: `aria: textbox:City`, `css: #city`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[12]/div[1]/input[1]`

**Expected:** "Zip/Postal Code" becomes interactable

### 24. Click "Zip/Postal Code"

Target: text "Zip/Postal Code", tag <div>
> ⚠️ This appears to click a specific item from a dynamic list (e.g. a search result). The exact element will likely be missing when replayed with different parameters — re-snapshot the page and pick an appropriate item by relevance instead of trusting the recorded selector.

```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #edit_form > div.admin__field.field:nth-of-type(13)
# )
browse click <ref-from-snapshot>
```
Selector hints: `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[13]`

**Expected:** "#postcode" becomes interactable

### 25. Fill input

Target: role textbox, tag <input>
```bash
browse fill #postcode 100
```
Selector hints: `aria: textbox:Zip/Postal Code`, `css: #postcode`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[13]/div[1]/input[1]`

**Expected:** "#postcode" becomes interactable

### 26. Fill input

Target: role textbox, tag <input>
```bash
browse fill #postcode '{{value_2}}'
```
Selector hints: `aria: textbox:Zip/Postal Code`, `css: #postcode`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[13]/div[1]/input[1]`

**Expected:** "#postcode" becomes interactable

### 27. Fill input

Target: role textbox, tag <input>
```bash
browse fill #postcode '{{value_3}}'
```
Selector hints: `aria: textbox:Zip/Postal Code`, `css: #postcode`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[13]/div[1]/input[1]`

**Expected:** "Save Order Address" becomes interactable

### 28. Click "Save Order Address"

Target: text "Save Order Address", role button, tag <button>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #save
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: button:Save Order Address`, `text: Save Order Address`, `css: #save`

**Expected:** URL becomes localhost:7780/admin/sales/order/view/order_id/299/

### 29. Click "Edit"

Target: text "Edit", role link, tag <a>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: link:Edit
# )
browse click <ref-from-snapshot>
```
Selector hints: `text: Edit`, `css: #sales_order_view_tabs_order_info_content > section.admin__page-section:nth-of-type(2) > div.admin__page-section-content:nth-of-type(2) > div.admin__page-section-item.order-shipping-address:nth-of-type(2) > div.admin__page-section-item-title > div.actions > a`, `xpath: /html/body/body[1]/div[3]/main[1]/div[3]/div[1]/div[1]/div[1]/div[1]/section[2]/div[2]/div[2]/div[1]/div[1]/a[1]`

**Expected:** URL becomes localhost:7780/admin/sales/order/address/address_id/597/

### 30. Click textbox

Target: role textbox, tag <input>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #street0
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #street0`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[9]/div[1]/div[1]/input[1]`

**Expected:** "#street0" becomes interactable

### 31. Click textbox

Target: role textbox, tag <input>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #street0
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #street0`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[9]/div[1]/div[1]/input[1]`

**Expected:** "#street0" becomes interactable

### 32. Click textbox

Target: role textbox, tag <input>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #street0
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #street0`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[9]/div[1]/div[1]/input[1]`

**Expected:** "#street0" becomes interactable

### 33. Press Meta+v

```bash
browse press 'Meta+v'
```

**Expected:** "#street0" becomes interactable

### 34. Paste into "input"

```bash
# Paste into the resolved field. Most apps accept a plain fill;
# fall back to OS clipboard + Cmd+V if the page intercepts paste.
browse fill #street0 '456 Oak Avenue'
```

**Expected:** "#street0" becomes interactable

### 35. Fill input

Target: role textbox, tag <input>
```bash
browse fill #street0 '{{value_4}}'
```
Selector hints: `css: #street0`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[9]/div[1]/div[1]/input[1]`

**Expected:** "#street1" becomes interactable

### 36. Click textbox

Target: role textbox, tag <input>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #street1
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #street1`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[9]/div[1]/div[2]/input[1]`

**Expected:** "#street1" becomes interactable

### 37. Press Meta+v

```bash
browse press 'Meta+v'
```

**Expected:** "#street1" becomes interactable

### 38. Paste into "input"

```bash
# Paste into the resolved field. Most apps accept a plain fill;
# fall back to OS clipboard + Cmd+V if the page intercepts paste.
browse fill #street1 'Apartment 5B'
```

**Expected:** "#street1" becomes interactable

### 39. Fill input

Target: role textbox, tag <input>
```bash
browse fill #street1 'Apartment 5B'
```
Selector hints: `css: #street1`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[9]/div[1]/div[2]/input[1]`

**Expected:** "Name Prefix First Name Middle Name/Initial Last Name Name Suffix Company Street " becomes interactable

### 40. Click "Name Prefix First Name Middle Name/Initial Last Name Name Suffix Company Street "

Target: text "Name Prefix First Name Middle Name/Initial Last Name Name Suffix Company Street ", tag <form>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #edit_form
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #edit_form`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]`

**Expected:** "Please selectAlabamaAlaskaAmerican SamoaArizonaArkansasArmed Forces AfricaArmed " becomes interactable

### 41. Click "Please selectAlabamaAlaskaAmerican SamoaArizonaArkansasArmed Forces AfricaArmed "

Target: text "Please selectAlabamaAlaskaAmerican SamoaArizonaArkansasArmed Forces AfricaArmed ", role combobox, tag <select>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #region_id
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #region_id`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[11]/div[1]/select[1]`

**Expected:** "Please selectAlabamaAlaskaAmerican SamoaArizonaArkansasArmed Forces AfricaArmed " becomes interactable

### 42. Fill "Please selectAlabamaAlaskaAmerican SamoaArizonaArkansasArmed Forces AfricaArmed "

Target: text "Please selectAlabamaAlaskaAmerican SamoaArizonaArkansasArmed Forces AfricaArmed ", role combobox, tag <select>
```bash
browse fill #region_id 43
```
Selector hints: `css: #region_id`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[11]/div[1]/select[1]`

**Expected:** "Please selectAlabamaAlaskaAmerican SamoaArizonaArkansasArmed Forces AfricaArmed " becomes interactable

### 43. Click "Please selectAlabamaAlaskaAmerican SamoaArizonaArkansasArmed Forces AfricaArmed "

Target: text "Please selectAlabamaAlaskaAmerican SamoaArizonaArkansasArmed Forces AfricaArmed ", role combobox, tag <select>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #region_id
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #region_id`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[11]/div[1]/select[1]`

**Expected:** "City" becomes interactable

### 44. Click "City"

Target: text "City", tag <div>
> ⚠️ This appears to click a specific item from a dynamic list (e.g. a search result). The exact element will likely be missing when replayed with different parameters — re-snapshot the page and pick an appropriate item by relevance instead of trusting the recorded selector.

```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #edit_form > div.admin__field.field:nth-of-type(12)
# )
browse click <ref-from-snapshot>
```
Selector hints: `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[12]`

**Expected:** "#city" becomes interactable

### 45. Fill input

Target: role textbox, tag <input>
```bash
browse fill #city ''
```
Selector hints: `aria: textbox:City`, `css: #city`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[12]/div[1]/input[1]`

**Expected:** "#city" becomes interactable

### 46. Fill input

Target: role textbox, tag <input>
```bash
browse fill #city N
```
Selector hints: `aria: textbox:City`, `css: #city`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[12]/div[1]/input[1]`

**Expected:** "#city" becomes interactable

### 47. Fill input

Target: role textbox, tag <input>
```bash
browse fill #city New
```
Selector hints: `aria: textbox:City`, `css: #city`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[12]/div[1]/input[1]`

**Expected:** "#city" becomes interactable

### 48. Fill input

Target: role textbox, tag <input>
```bash
browse fill #city 'New '
```
Selector hints: `aria: textbox:City`, `css: #city`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[12]/div[1]/input[1]`

**Expected:** "#city" becomes interactable

### 49. Fill input

Target: role textbox, tag <input>
```bash
browse fill #city 'New Y'
```
Selector hints: `aria: textbox:City`, `css: #city`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[12]/div[1]/input[1]`

**Expected:** "#city" becomes interactable

### 50. Fill input

Target: role textbox, tag <input>
```bash
browse fill #city 'New York'
```
Selector hints: `aria: textbox:City`, `css: #city`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[12]/div[1]/input[1]`

**Expected:** "#postcode" becomes interactable

### 51. Click textbox

Target: role textbox, tag <input>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #postcode
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: textbox:Zip/Postal Code`, `css: #postcode`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[13]/div[1]/input[1]`

**Expected:** "#postcode" becomes interactable

### 52. Click textbox

Target: role textbox, tag <input>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #postcode
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: textbox:Zip/Postal Code`, `css: #postcode`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[13]/div[1]/input[1]`

**Expected:** "#postcode" becomes interactable

### 53. Fill input

Target: role textbox, tag <input>
```bash
browse fill #postcode 100
```
Selector hints: `aria: textbox:Zip/Postal Code`, `css: #postcode`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[13]/div[1]/input[1]`

**Expected:** "#postcode" becomes interactable

### 54. Fill input

Target: role textbox, tag <input>
```bash
browse fill #postcode '{{value_5}}'
```
Selector hints: `aria: textbox:Zip/Postal Code`, `css: #postcode`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/div[13]/div[1]/input[1]`

**Expected:** "Name Prefix First Name Middle Name/Initial Last Name Name Suffix Company Street " becomes interactable

### 55. Click "Name Prefix First Name Middle Name/Initial Last Name Name Suffix Company Street "

Target: text "Name Prefix First Name Middle Name/Initial Last Name Name Suffix Company Street ", tag <form>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #edit_form
# )
browse click <ref-from-snapshot>
```
Selector hints: `css: #edit_form`, `xpath: /html/body/body[1]/div[3]/main[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]`

**Expected:** "Save Order Address" becomes interactable

### 56. Click "Save Order Address"

Target: text "Save Order Address", role button, tag <button>
```bash
# Locate the element in the page.
browse snapshot
# Click using the ref from the snapshot output (look for the element matching:
#   selector: #save
# )
browse click <ref-from-snapshot>
```
Selector hints: `aria: button:Save Order Address`, `text: Save Order Address`, `css: #save`

## On failure

- If a `browse` command misses (selector resolves to nothing), run `browse snapshot` and re-locate the target by aria-label, role, or visible text.
- Each step lists multiple selector hints; try them in order. If none match, fall back to the **element fingerprint** in the step description and search the snapshot text.
- If the page state diverges from the `Expected` line, do not blindly continue — re-snapshot, understand the new state, and adapt.
- Steps marked with ⚠️ (dynamic list items) were recorded against a specific result. Choose an equivalent item from the current page rather than reproducing the recorded selector verbatim.
