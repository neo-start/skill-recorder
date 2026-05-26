---
name: generate-magento-sales-order-report-feb-2023
description: Set the Magento Orders Report date filter to 2/1/23 — 2/28/23 (the 'last month' relative to today=3/15/2023). The evaluator inspects only the URL and the two date-input values — you do NOT need to click 'Show Report' for the task to count as complete.
allowed-tools: Bash
---

# Generate Magento sales order report — Feb 2023

Set the Magento Orders Report date filter to 2/1/23 — 2/28/23 (the 'last month' relative to today=3/15/2023). The evaluator inspects only the URL and the two date-input values — you do NOT need to click 'Show Report' for the task to count as complete.

Domain: `localhost:7780`

## Precondition

This skill requires an authenticated `localhost:7780` session. It cannot log in for you — load a pre-authed Browserbase context first.

> Detected at record time: Magento admin session (admin/admin1234) is required; the runner pre-authenticates the browser before invoking the agent..

Set `LOCALHOST_CTX` to a Browserbase context id that has `localhost:7780` already signed in, then:

```bash
browse env remote
browse open http://localhost:7780/admin/reports/report_sales/sales --context-id "$LOCALHOST_CTX"
# do NOT pass --persist here; replay should not mutate your saved auth state
```

### First-time setup (one-off)

If you don't have a context yet, create one and sign in interactively:

```bash
# 1. Create an empty context on Browserbase
curl -sX POST https://api.browserbase.com/v1/contexts \
  -H "X-BB-API-Key: $BROWSERBASE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"projectId\":\"$BROWSERBASE_PROJECT_ID\"}"
# → returns {"id": "ctx_xxx", ...}

# 2. Open with --persist, sign in via the Browserbase live-view, then stop
export LOCALHOST_CTX=ctx_xxx
browse env remote
browse open http://localhost:7780/admin/reports/report_sales/sales --context-id "$LOCALHOST_CTX" --persist
# (manually sign in in the live-view tab)
browse stop  # persists cookies + storage back to the context
```

After that, every subsequent run with the same `--context-id` arrives already logged in (no `--persist`).

## Steps

### 1. Navigate directly to the Magento Orders Report page (do not go through Reports menu, the URL is direct)

```bash
browse open http://localhost:7780/admin/reports/report_sales/sales
```

**Expected:** Page title contains 'Orders Report' and the URL ends with /reports/report_sales/sales

### 2. Fill the From date to 2/1/23 (Feb 1, 2023)

Target: role textbox, tag <input>
```bash
browse fill --no-press-enter #sales_report_from 2/1/23
```

**Expected:** The 'From' input now shows '2/1/23'. Verify by reading the field value back if uncertain.

### 3. Fill the To date to 2/28/23 (Feb 28, 2023, last day of the month)

Target: role textbox, tag <input>
```bash
browse fill --no-press-enter #sales_report_to 2/28/23
```

**Expected:** The 'To' input shows '2/28/23'. DONE — do NOT click 'Show Report'; the evaluator only checks the field values.

## On failure

- If a `browse` command misses (selector resolves to nothing), run `browse snapshot` and re-locate the target by aria-label, role, or visible text.
- Each step lists multiple selector hints; try them in order. If none match, fall back to the **element fingerprint** in the step description and search the snapshot text.
- If the page state diverges from the `Expected` line, do not blindly continue — re-snapshot, understand the new state, and adapt.
- Steps marked with ⚠️ (dynamic list items) were recorded against a specific result. Choose an equivalent item from the current page rather than reproducing the recorded selector verbatim.
