---
name: send-a-winning-upwork-proposal
description: Submit a tailored Upwork proposal that stands out from templated competitors by mining the job description for specifics, using the client's own language, and following a tight cover-letter formula. Use when applying to any Upwork job listing.
allowed-tools: Bash
---

# Send a winning Upwork proposal

Source: video — [How to Send Winning Upwork Proposals (Step-By-Step)](https://www.youtube.com/watch?v=cv5jmkICqBg) by Upwork Academy 

> Distilled by AI from a public video transcript. Not human-verified.

Submit a tailored Upwork proposal that stands out from templated competitors by mining the job description for specifics, using the client's own language, and following a tight cover-letter formula. Use when applying to any Upwork job listing.

Domain: `upwork.com`

## Parameters

Ask the user for any of these not already provided:

- `job_url` — URL of the Upwork job listing you want to apply to. (example: `https://www.upwork.com/jobs/~01abc123def456`)
- `freelancer_specialty` — The role/specialty you want to present yourself as in the proposal — should mirror the client's verbiage from the listing. (example: `cover illustration`)
- `portfolio_focus` — Which of your specialized profiles / portfolios is the best match for this job. (example: `Illustration`)

## Steps

### 1. Open the target job listing.

```bash
browse open '{{job_url}}'
```

### 2. Read the description like a detective, not a skimmer.

Before clicking Apply, mine the listing for concrete details you can echo back. Most freelancers send templates with zero specifics — matching the client's actual words is the single biggest differentiator.

**Checklist:**

- Note the exact deliverables (quantity, scope, format specs like KDP for books).
- Note style preferences AND explicit dislikes (e.g. 'no anime', 'no AI art').
- Note any hidden compliance test (e.g. 'put your favorite X in the proposal so I know you read this') — experienced clients use these to filter out template-spammers.
- Note the client's mission/setting/characters so you can mirror their language.
- Note their stated duration and budget — you will match these, not negotiate them.
- Try to find the client's first name in the reviews section for personalized greeting.

### 3. Click the Apply Now button (top right of the listing).

```bash
browse snapshot
browse click <ref-from-snapshot>
```

### 4. Pick the right profile to present.

Choose a specialized profile if you have one that matches this exact niche — it makes you look like a focused specialist rather than a jack-of-all-trades. Otherwise the general profile is fine and does not hurt your odds.

**Checklist:**

- Select the specialized profile whose verbiage best matches the listing's deliverable.
- If no specialized profile fits, select the general profile without hesitation.
- Remember the client only sees the profile you picked — they cannot see your others.

### 5. Configure project type, budget, and duration to maximize open rate.

These dropdowns are not where you negotiate. The goal is to remove every reason for the client not to open your proposal.

**Checklist:**

- Choose 'By project' instead of milestones — faster to send and milestones should be negotiated after a real conversation.
- Leave the budget exactly as the client posted it; do not propose higher or lower before talking.
- Set duration to whatever range the client indicated in the listing (e.g. 1–3 months).

### 6. Write the cover letter following the formula.

```bash
browse snapshot
browse fill <selector-of-target> 'Hi {{client_first_name_or_'\''there'\''}},

I'\''m a professional {{freelancer_specialty}} who specializes in [echo their exact verbiage]. I noticed you need [restate their specific deliverables in their words].

A couple of questions: [ask 1–2 specific questions about format/specs/references — even if partially answered, it opens conversation].

Let'\''s chat about a fixed-rate contract that works for both of us.

[Address their explicit dislikes / constraints, e.g. '\''I don'\''t do anime or cartoon styles — I work in semi-realistic artwork.'\'']

I'\''ve done similar projects for [relevant client type]. Take a look at my portfolio, and feel free to message me with any questions — I'\''m available throughout the project and won'\''t disappear on you.

[Hidden-instruction answer, e.g. '\''My favorite ice cream is chocolate chip.'\'']'
```

### 7. Pressure-test the cover letter before submitting.

Keep it short and sweet — a few tight paragraphs beats a wall of text. Every line should either mirror their language, build trust, or move them toward replying.

**Checklist:**

- Includes at least one phrase lifted directly from the job description.
- Answers any hidden 'put X in your proposal' instruction verbatim.
- Addresses their explicit dislikes/constraints (AI, anime, ghosting fears, etc.).
- Ends with a clear call to action (view portfolio + message me).
- Asks 1–2 genuine questions to break the ice — never zero.
- Does NOT pitch a different budget or scope than what they posted.
- No template-y filler; under ~6 short paragraphs.

### 8. Answer screening questions and attach the right assets.

Don't dump everything you have — curate ruthlessly for this one client.

**Checklist:**

- Answer every default screening question with a one-line response — don't skip them even if they feel artificial.
- Attach a portfolio link relevant to THIS job only; do not flood them with every portfolio you own.
- Attach testimonials/reviews most relevant to this niche first; only include 5-star or near-5-star reviews.
- Only upload files if you need to demonstrate a specific style or match an attachment they posted — otherwise skip.

### 9. Decide on Boost (default: don't).

Boosting bids extra connects to surface your proposal earlier, but the narrator advises against it — better front-end job-filtering makes it unnecessary.

**Checklist:**

- Set Boost to 0 connects by default.
- Only consider boosting if you have independently validated it works for your niche.

### 10. Acknowledge the terms checkbox and submit the proposal.

```bash
browse snapshot
browse click <ref-from-snapshot>
```

### 11. After submitting — resist tweaking.

You can edit a sent proposal until the client first views it, then it's locked. Fix only genuine errors, then walk away.

**Checklist:**

- Scan once for typos or wrong-job references and fix immediately if found.
- Do not re-open the proposal to second-guess wording — ship and move on.
- Track which jobs you've applied to so you can follow up via Upwork messenger if the client replies.

## On failure

- If a `browse` command misses (selector resolves to nothing), run `browse snapshot` and re-locate the target by aria-label, role, or visible text.
- Each step lists multiple selector hints; try them in order. If none match, fall back to the **element fingerprint** in the step description and search the snapshot text.
- If the page state diverges from the `Expected` line, do not blindly continue — re-snapshot, understand the new state, and adapt.
- Steps marked with ⚠️ (dynamic list items) were recorded against a specific result. Choose an equivalent item from the current page rather than reproducing the recorded selector verbatim.
- For steps without a concrete UI action, treat the checklist as criteria to apply against the current page — not as commands to execute.
