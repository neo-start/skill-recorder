---
name: find-an-amazon-fba-product-opportunity-with-helium-10
description: Use Helium 10's Blackbox, X-Ray, Cerebro, and Magnet tools to filter Amazon's catalog, go down keyword rabbit holes, and surface a niche-down product opportunity for a new Amazon FBA seller. Use when starting product research or building a shortlist of viable FBA products.
allowed-tools: Bash
---

# Find an Amazon FBA product opportunity with Helium 10

Source: video — [2025 - Helium 10 Product Research For Beginners (Complete Amazon FBA Tutorial)](https://www.youtube.com/watch?v=63hsD7k3Q2U) by Camron James

> Distilled by AI from a public video transcript. Not human-verified.

Use Helium 10's Blackbox, X-Ray, Cerebro, and Magnet tools to filter Amazon's catalog, go down keyword rabbit holes, and surface a niche-down product opportunity for a new Amazon FBA seller. Use when starting product research or building a shortlist of viable FBA products.

Domain: `helium10.com`

## Parameters

Ask the user for any of these not already provided:

- `starting_niche` — Optional niche, hobby, or category the user is personally interested in or knowledgeable about. Used to seed keyword searches in Magnet and to filter Blackbox results. Leave empty for open-ended exploration. (example: `marble baking accessories`)
- `first_order_budget` — Approximate budget the user has available for their first inventory order. Drives how aggressive the parent-level revenue ceiling should be in Blackbox filters. (example: `$3,000`)

## Steps

### 1. Install Helium 10 Chrome extension before any product research

The Chrome extension powers X-Ray on Amazon product pages and is required for the workflow. Sign in once installed so it inherits the Helium 10 account.

**Checklist:**

- Use Google Chrome — the entire workflow assumes it
- Install the Helium 10 Chrome extension and sign in
- Confirm the extension icon appears in the toolbar and X-Ray loads on any Amazon search results page

### 2. Open Blackbox Products to filter Amazon's catalog into a manageable bucket

```bash
browse open https://members.helium10.com/black-box/products
```

### 3. Apply category and numeric filters in Blackbox Products that bias toward beginner-friendly niches

These filters do not find winners — they shrink millions of ASINs into a bucket where winners are more likely. Mix and match; loosen or tighten ranges between passes.

**Checklist:**

- Prefer categories: Home & Kitchen, Kitchen & Dining, Industrial & Scientific, Sports & Outdoors, Tools & Home Improvement, Pet Supplies, Office Products, Patio Lawn & Garden, Arts Crafts & Sewing
- Avoid for a first product: Baby (CPC + restrictions), Beauty (big brands), Grocery, Clothing/Shoes/Jewelry (returns + variations blow up first order), Electronics (defect rates), Books, CDs, Movies, Software, Collectibles, Cell Phone accessories
- Price band roughly $15–$50 so FBA fees don't eat margin and first-order cost stays in budget
- Minimum review count around 450 to confirm real demand
- Parent-level revenue roughly $5K–$17K — high enough to be viable, low enough that an experienced incumbent isn't already dominating
- Confirm marketplace is set to the country you actually intend to sell in (US vs UK etc.)
- Leave BSR, brand/seller filters, and sales-change filters alone on first pass

### 4. Switch to Blackbox Keywords to surface niche-down search phrases instead of individual ASINs

```bash
browse open https://members.helium10.com/black-box/keywords
```

### 5. Filter Blackbox Keywords for long-tail, niche-down phrases that hint at unmet need

Long-tail phrases reveal what shoppers wish existed but can't easily find. The longer and more specific the phrase, the more likely there's an angle.

**Checklist:**

- Search volume roughly 500–5,000 (higher volume = more competition)
- Monthly revenue roughly $4K–$18K
- Minimum word count of 3, then re-run with word count of 4 for even narrower opportunities
- Same beginner-friendly category list as Blackbox Products
- Skip generic commodity terms (e.g. "plastic bags") — those become price wars with no room for differentiation or branding
- Bookmark or open in new tabs any keyword that hints at a specific use case, audience, or modifier ("for X", "with Y", "women's Z")

### 6. On each candidate Amazon listing, run X-Ray and read the real market — not sponsored noise

X-Ray turns a search results page into a sortable table of sales, revenue, reviews, and BSR. The first organic (non-sponsored, non-AC) result is the true competitor to beat.

**Checklist:**

- Open X-Ray on the Amazon search results page for the candidate keyword
- Apply the filter to hide sponsored products so rankings reflect organic performance
- Identify the top 3 organic sellers by revenue — these define the real ceiling and floor of the niche
- Walk away if a Big Brand (Nike, Under Armour, Sharpie, etc.) already dominates the top organic slot
- Be skeptical when a keyword's reported search volume can't plausibly support the revenue shown — it means the listing is ranking on a different, bigger keyword and you haven't found the real market yet
- Note review-rating ceiling: incumbents averaging under ~4.3 stars signal room to improve

### 7. Run Cerebro reverse-ASIN lookup on the top sellers to find the true primary keyword and full competitor set

Cerebro reveals every keyword an ASIN ranks for organically. Run it on the top 3 sellers together — that surfaces the highest-volume, highest-relevancy keyword in the niche.

**Checklist:**

- Select the top 3 organic sellers (highest revenue) from X-Ray and click Run Cerebro
- Filter to organic positions 1–15 (or 1–25) and apply
- Sort the keyword list by search volume — the top result is usually the niche's anchor keyword
- Pick the keyword that maximizes both volume AND relevancy to your specific product (a high-volume but generic term is the wrong anchor)
- Click that anchor keyword to view it on Amazon — this is the real competitive landscape
- Check the keyword's seasonality chart: healthy products are stable year-round with a Q4 lift; avoid keywords that are near-zero outside one season unless you have a seasonal strategy

### 8. Open Magnet to expand a promising keyword into adjacent niche-down opportunities

```bash
browse open https://members.helium10.com/magnet
```

### 9. Use Magnet to mine related long-tail keywords and rank them by opportunity

Magnet returns related keywords for a seed term. Use it to either drill deeper into a chosen niche or to find unexpected adjacent niches.

**Checklist:**

- Enter the anchor keyword and click Get Keywords
- Set search volume range ~500–4,000 and minimum word count 4
- To stay inside a specific niche, use the Phrase Containing filter with the niche word; remove that filter to discover adjacent niches
- Sort by Magnet IQ Score — Helium 10's ratio of search volume to competition (higher = thinner field for the volume)
- Skip results that are clearly brand names (Tiger Paw, Bare Complex, etc.) — you can't build there
- For each interesting keyword, repeat the X-Ray → Cerebro loop from steps s6–s7

### 10. Decide whether a candidate is worth shortlisting or to keep going down the rabbit hole

Most candidates die on inspection — that's normal. Build a shortlist of 10–30 candidates per session and expect to discard most. The goal is reps, not a winner on day one.

**Checklist:**

- Green-light signals: clear way to differentiate (better photos, bundle, color, variation, material, packaging), incumbents under ~4.3 stars, a niche-down keyword you could realistically rank #1 on, stable year-round demand with a Q4 lift, you understand the customer (it's a hobby/use case you know)
- Red-flag signals: $5 commodity competitors, dozens of variations already saturated, Big Brand at top organic slot, listing has 1,000+ reviews and is well-photographed, no obvious angle for improvement, pure trend product likely to crash
- If you'd struggle to explain in one sentence why your version beats the top organic seller, walk away
- Commit to the practice cadence: a couple of hours a day, 4–5 days a week — pattern recognition compounds over weeks, not hours
- Treat this as a funnel: keep a running list of 10–30 candidates and loop back through s5–s9 until one survives full scrutiny

## On failure

- If a `browse` command misses (selector resolves to nothing), run `browse snapshot` and re-locate the target by aria-label, role, or visible text.
- Each step lists multiple selector hints; try them in order. If none match, fall back to the **element fingerprint** in the step description and search the snapshot text.
- If the page state diverges from the `Expected` line, do not blindly continue — re-snapshot, understand the new state, and adapt.
- Steps marked with ⚠️ (dynamic list items) were recorded against a specific result. Choose an equivalent item from the current page rather than reproducing the recorded selector verbatim.
- For steps without a concrete UI action, treat the checklist as criteria to apply against the current page — not as commands to execute.
