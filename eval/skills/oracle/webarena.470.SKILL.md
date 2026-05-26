---
name: cancel-magento-order-302
description: Cancel Magento sales order 302 from the admin so its order_status becomes "Canceled". Opens the order view page, clicks the Cancel action button, and accepts the Magento confirmation modal.
allowed-tools: Bash
---

# Cancel Magento order 302

Domain: `localhost:7780`

## Background

The order view page for order 302 lives at:

  `http://localhost:7780/admin/sales/order/view/order_id/302/`

Initial `#order_status` reads `Pending`. After a successful cancel, the page reloads and `#order_status` reads `Canceled`.

The Cancel action button in the top action bar is:

```
<button id="order-view-cancel-button"
        title="Cancel"
        type="button"
        class="action-default scalable cancel"
        data-url="http://localhost:7780/admin/sales/order/cancel/order_id/302/">
  <span>Cancel</span>
</button>
```

Clicking it does **not** fire a native `window.confirm` — it opens a Magento Knockout/jQuery modal with class `modal-popup confirm _show` and the message "Are you sure you want to cancel this order?". The footer contains two buttons:

- `.action-secondary.action-dismiss` (text: `Cancel`) → dismisses the modal (does nothing)
- `.action-primary.action-accept` (text: `OK`) → confirms and navigates to the `data-url` above, which performs the cancellation and redirects back to the order view page

So this is a two-click flow: click the action-bar Cancel button, then click OK in the modal.

## Critical tool notes

- The confirmation is a **custom Magento modal**, NOT a native `confirm()` — Playwright's dialog handler will not see it and there is no `window.confirm` to stub. You must click the modal's OK button.
- The modal takes ~300-500 ms to render after the action-bar button is clicked. Wait briefly before clicking OK.
- There are several other `.action-primary` buttons elsewhere on the page (in hidden modals like the Edit Order popup). Scope the OK click to the visible confirm modal with `aside.confirm._show .action-primary.action-accept`.
- After clicking OK the page navigates to `/admin/sales/order/view/order_id/302/` and reloads with `#order_status` = `Canceled`. Wait for the reload to settle before declaring DONE.
- Both `#order-view-cancel-button` and the action-bar Cancel button text say "Cancel". Do not use a generic text selector — use the id `#order-view-cancel-button`.

## Steps

### 1. Open order 302's view page

```bash
browse open 'http://localhost:7780/admin/sales/order/view/order_id/302/'
```

**Expected:** Page loads. `document.querySelector('#order_status').outerText` reads `Pending`. The action bar shows Back, Login as Customer, Edit, Cancel, Send Email, Hold, Invoice, Ship, Reorder.

### 2. Click the Cancel action-bar button

```bash
browse click '#order-view-cancel-button'
```

**Expected:** A confirmation modal appears (`aside.modal-popup.confirm._show`) with the text "Are you sure you want to cancel this order?" and an OK / Cancel footer.

### 3. Confirm by clicking OK in the modal

```bash
browse click 'aside.confirm._show .action-primary.action-accept'
```

**Expected:** The browser POSTs/navigates to `/admin/sales/order/cancel/order_id/302/`, then redirects back to `/admin/sales/order/view/order_id/302/`. A success message ("You canceled the order.") appears at the top of the page. `document.querySelector('#order_status').outerText` now reads `Canceled`.

### 4. Verify

```bash
browse eval "document.querySelector('#order_status').outerText"
```

**Expected:** `Canceled` (exact match, capital C, single l). If so, reply `DONE`.

## On failure

- If after step 3 `#order_status` still reads `Pending`, the modal OK click probably missed. Re-snapshot (`browse snapshot`) and check whether `aside.confirm._show` is still in the DOM; if so, click `aside.confirm._show .action-primary.action-accept` again.
- If the modal never appears after step 2, the Cancel button may not yet be wired up — the page's Knockout/RequireJS bootstrap can take a moment. Wait 1-2 seconds and retry the click.
- If `browse click 'aside.confirm._show .action-primary.action-accept'` reports "element not found", try the fallback `browse eval "document.querySelector('aside.confirm._show .action-primary.action-accept').click()"`.
- If `#order_status` reads `Closed` or some other non-`Canceled` value, the order was not in a cancelable state (e.g. already invoiced/shipped). The eval expects `Canceled` so this is a hard failure; report and stop.
- Do NOT navigate directly to `/admin/sales/order/cancel/order_id/302/` — that endpoint requires the form key / referer from the action-bar click flow and may render an error or behave inconsistently. Always go through the button + modal.
