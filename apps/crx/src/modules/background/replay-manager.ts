import { getRecording, loadActions } from '@/common/db';
import type { ActionStep, Expectation, ReplayState, SelectorEntry } from '@skill-recorder/types';
import type { BackgroundToContent, StepResultPhase } from '@/common/messages';

const INTER_STEP_DELAY_MS = 350;
const NAVIGATE_FALLBACK_MS = 1500;
const VERIFY_TIMEOUT_MS = 10_000;
const URL_WAIT_TIMEOUT_MS = 10_000;
const MAX_ATTEMPTS = 3; // 0, 1, 2 (3 total attempts per step)
const RETRY_BACKOFF_MS = [0, 500, 1000, 2000]; // index = attempt

export interface ActiveReplay {
  recordingId: string;
  steps: ActionStep[];
  tabId: number;
  /**
   * Every tab in this replay session in logical order (C4). tabIds[0] is the
   * tab opened by `start()`; subsequent entries are tabs opened during replay
   * by an opener already in the list (mirrors how recording tracks tabIds).
   */
  tabIds: number[];
  activeTabIndex: number;
  stepIndex: number;
  currentAttempt: number;
  status: ReplayState['status'];
  failure: ReplayState['failure'];
  port: chrome.runtime.Port | null;
  /** When set, we're waiting for the tab URL to match this. */
  urlWaitTarget: string | null;
  /** Set when an EXECUTE_STEP was dispatched but content hasn't reported yet. */
  pendingExpectation: Expectation | null;
}

export class ReplayManager {
  private active: ActiveReplay | null = null;
  private onChange: () => void = () => {};
  private timer: ReturnType<typeof setTimeout> | null = null;
  private framePortLookup: (tabId: number, frameId: number) => chrome.runtime.Port | undefined =
    () => undefined;

  setOnChange(cb: () => void): void {
    this.onChange = cb;
  }

  /** Inject the (tabId, frameId) → Port resolver so we can route iframe steps. */
  setFramePortLookup(
    fn: (tabId: number, frameId: number) => chrome.runtime.Port | undefined,
  ): void {
    this.framePortLookup = fn;
  }

  state(): ReplayState {
    if (!this.active) {
      return {
        recordingId: null,
        tabId: null,
        totalSteps: 0,
        stepIndex: 0,
        status: 'idle',
        currentStep: null,
        currentAttempt: 0,
        maxAttempts: MAX_ATTEMPTS,
        expectation: null,
        failure: null,
      };
    }
    const a = this.active;
    return {
      recordingId: a.recordingId,
      tabId: a.tabId,
      totalSteps: a.steps.length,
      stepIndex: a.stepIndex,
      status: a.status,
      currentStep: a.steps[a.stepIndex] ?? null,
      currentAttempt: a.currentAttempt,
      maxAttempts: MAX_ATTEMPTS,
      expectation: a.pendingExpectation,
      failure: a.failure,
    };
  }

  isReplayingTab(tabId: number): boolean {
    return !!this.active && this.active.tabIds.includes(tabId);
  }

  /** A new tab was created — if opened by a tab in our session, track it. */
  onTabCreated(tab: chrome.tabs.Tab): void {
    if (!this.active || tab.id === undefined) return;
    const opener = tab.openerTabId;
    if (opener !== undefined && this.active.tabIds.includes(opener)) {
      if (!this.active.tabIds.includes(tab.id)) {
        this.active.tabIds.push(tab.id);
      }
    }
  }

  async start(recordingId: string): Promise<void> {
    if (this.active) await this.stop();

    const meta = await getRecording(recordingId);
    if (!meta) throw new Error('recording not found');

    const steps = await loadActions(recordingId);
    if (!steps.length) throw new Error('this recording has no actions to replay');

    const nonNav = steps.filter((s) => s.type !== 'navigate');
    if (!nonNav.length) {
      throw new Error('this recording captured no user actions (only navigation) — nothing to replay');
    }

    const startUrl = firstNavigateUrl(steps) || meta.url;
    if (!startUrl) throw new Error('recording has no starting URL');

    // Open a blank tab first so no content script races our state setup.
    const tab = await chrome.tabs.create({ url: 'about:blank', active: true });
    if (tab.id === undefined) throw new Error('failed to open replay tab');

    this.active = {
      recordingId,
      steps,
      tabId: tab.id,
      tabIds: [tab.id],
      activeTabIndex: 0,
      stepIndex: stepsHaveLeadingMatchingNav(steps, startUrl) ? 1 : 0,
      currentAttempt: 0,
      status: 'navigating',
      failure: null,
      port: null,
      urlWaitTarget: null,
      pendingExpectation: null,
    };
    this.onChange();

    console.log('[replay] start', {
      recordingId,
      tabId: tab.id,
      totalSteps: steps.length,
      nonNavSteps: nonNav.length,
      startStepIndex: this.active.stepIndex,
      startUrl,
    });

    try {
      await chrome.tabs.update(tab.id, { url: startUrl });
    } catch (err) {
      console.error('[replay] tabs.update failed', err);
      this.active = null;
      this.onChange();
      throw err;
    }
  }

  async stop(): Promise<void> {
    if (!this.active) return;
    const a = this.active;
    this.active = null;
    this.clearTimer();
    if (a.port) {
      try {
        a.port.disconnect();
      } catch {
        /* ignore */
      }
    }
    this.onChange();
  }

  onContentConnect(tabId: number, port: chrome.runtime.Port): boolean {
    if (!this.active || this.active.tabId !== tabId) return false;
    console.log('[replay] content connected', {
      tabId,
      stepIndex: this.active.stepIndex,
      attempt: this.active.currentAttempt,
      urlWaiting: !!this.active.urlWaitTarget,
    });
    this.active.port = port;

    // If we're already waiting for a URL match (the prior step kicked off navigation),
    // do NOT redispatch — the navigation chain may produce multiple intermediate
    // page loads. Each new content_script connect would otherwise replay the same
    // step on the wrong page. Just stay in 'verifying' and wait for onTabUrlChanged.
    if (this.active.urlWaitTarget) {
      this.active.status = 'verifying';
      this.onChange();
      return true;
    }

    this.active.status = 'executing';
    this.onChange();
    this.dispatchAttempt();
    return true;
  }

  onContentDisconnect(tabId: number): void {
    if (!this.active || this.active.tabId !== tabId) return;
    console.log('[replay] content disconnected', { tabId, stepIndex: this.active.stepIndex });
    this.active.port = null;
    if (
      this.active.status !== 'failed' &&
      this.active.status !== 'success' &&
      this.active.status !== 'verifying' // keep verifying state through nav
    ) {
      this.active.status = 'waitingForContent';
      this.onChange();
    }
  }

  onTabRemoved(tabId: number): void {
    if (this.active && this.active.tabId === tabId) {
      this.active.status = 'cancelled';
      this.active = null;
      this.clearTimer();
      this.onChange();
    }
  }

  /** webNavigation listeners in background/index.ts call this for the replay tab's URL changes. */
  onTabUrlChanged(tabId: number, url: string): void {
    if (!this.active || this.active.tabId !== tabId) return;
    if (!this.active.urlWaitTarget) return;
    if (urlsMatch(url, this.active.urlWaitTarget)) {
      console.log('[replay] URL match — advancing', { url });
      this.active.urlWaitTarget = null;
      this.clearTimer();
      this.advanceStep();
    }
  }

  onStepResult(
    tabId: number,
    stepIndex: number,
    attempt: number,
    ok: boolean,
    phase: StepResultPhase,
    reason?: string,
  ): void {
    if (!this.active || this.active.tabId !== tabId) return;
    if (stepIndex !== this.active.stepIndex || attempt !== this.active.currentAttempt) {
      console.log('[replay] stale step result', {
        got: { stepIndex, attempt },
        expected: { stepIndex: this.active.stepIndex, attempt: this.active.currentAttempt },
      });
      return;
    }
    console.log('[replay] step result', { stepIndex, attempt, ok, phase, reason });

    if (!ok) {
      // C4: target="_blank" anchor — open the new tab via chrome.tabs.create
      // (the synthetic click can't open popups), then advance to the next step.
      if (phase === 'execute' && reason && reason.startsWith('requiresNewTab:')) {
        const href = reason.slice('requiresNewTab:'.length);
        void this.openNewTabForReplay(href, this.active.tabId);
        return;
      }
      this.handleFailure(`${phase} failed: ${reason ?? 'unknown'}`);
      return;
    }

    // Content succeeded locally. If we still owe a URL-change verify, start it.
    const exp = this.active.pendingExpectation;
    if (exp && exp.kind === 'urlChange' && exp.targetUrl) {
      this.startUrlWait(exp.targetUrl);
      return;
    }

    this.advanceStep();
  }

  decide(decision: 'retry' | 'skip' | 'stop'): void {
    if (!this.active) return;
    if (this.active.status !== 'failed') return;
    if (decision === 'stop') {
      void this.stop();
      return;
    }
    if (decision === 'skip') {
      this.active.stepIndex += 1;
      this.active.currentAttempt = 0;
    } else if (decision === 'retry') {
      this.active.currentAttempt = 0;
    }
    this.active.failure = null;
    this.active.status = 'executing';
    this.onChange();
    this.dispatchAttempt();
  }

  // ─── private flow ───

  private advanceStep(): void {
    if (!this.active) return;
    this.active.stepIndex += 1;
    this.active.currentAttempt = 0;
    this.active.pendingExpectation = null;
    this.active.urlWaitTarget = null;
    this.scheduleNext(INTER_STEP_DELAY_MS);
  }

  private scheduleNext(delayMs: number): void {
    this.clearTimer();
    if (!this.active) return;
    if (this.active.status !== 'waitingForContent') {
      this.active.status = 'executing';
    }
    this.onChange();
    this.timer = setTimeout(() => {
      this.timer = null;
      if (!this.active) return;
      if (this.active.status === 'waitingForContent') return;
      this.dispatchAttempt();
    }, delayMs);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private handleFailure(reason: string): void {
    if (!this.active) return;
    if (this.active.currentAttempt + 1 >= MAX_ATTEMPTS) {
      console.warn('[replay] step failed permanently', {
        stepIndex: this.active.stepIndex,
        attempt: this.active.currentAttempt,
        reason,
      });
      this.active.status = 'failed';
      this.active.failure = { stepIndex: this.active.stepIndex, reason };
      this.onChange();
      return;
    }
    this.active.currentAttempt += 1;
    this.active.status = 'retrying';
    this.active.urlWaitTarget = null;
    this.onChange();
    const delay = RETRY_BACKOFF_MS[this.active.currentAttempt] ?? 1000;
    console.log('[replay] scheduling retry', {
      stepIndex: this.active.stepIndex,
      attempt: this.active.currentAttempt,
      delay,
      reason,
    });
    this.clearTimer();
    this.timer = setTimeout(() => {
      this.timer = null;
      if (!this.active) return;
      this.active.status = 'executing';
      this.dispatchAttempt();
    }, delay);
  }

  private startUrlWait(targetUrl: string): void {
    if (!this.active) return;
    this.active.urlWaitTarget = targetUrl;
    this.active.status = 'verifying';
    this.onChange();
    console.log('[replay] waiting for URL', { targetUrl });

    this.clearTimer();
    this.timer = setTimeout(() => {
      this.timer = null;
      if (!this.active) return;
      if (this.active.urlWaitTarget) {
        this.active.urlWaitTarget = null;
        this.handleFailure(`URL did not change to ${targetUrl} within ${URL_WAIT_TIMEOUT_MS}ms`);
      }
    }, URL_WAIT_TIMEOUT_MS);
  }

  private dispatchAttempt(): void {
    if (!this.active) return;

    if (this.active.stepIndex >= this.active.steps.length) {
      console.log('[replay] all steps done → success');
      this.active.status = 'success';
      this.clearTimer();
      this.onChange();
      return;
    }

    const step = this.active.steps[this.active.stepIndex];
    const exp = deriveExpectation(this.active.steps, this.active.stepIndex);
    this.active.pendingExpectation = exp;

    console.log('[replay] dispatch', {
      stepIndex: this.active.stepIndex,
      attempt: this.active.currentAttempt,
      stepType: step.type,
      expectation: exp.kind,
      expectationDetail: exp.description ?? exp.targetUrl ?? exp.selectors?.[0]?.value ?? '',
    });

    if (step.type === 'navigate' && step.navigateUrl) {
      this.executeNavigate(step.navigateUrl);
      return;
    }

    // C4: switchTab steps are background-side — focus the target tab and
    // continue to the next step. We don't need content involvement.
    if (step.type === 'switchTab') {
      void this.executeSwitchTab(step.targetTabIndex ?? 0);
      return;
    }

    if (!this.active.port) {
      console.log('[replay] no port; waiting for content');
      this.active.status = 'waitingForContent';
      this.onChange();
      return;
    }

    const msg: BackgroundToContent = {
      type: 'EXECUTE_STEP',
      step,
      stepIndex: this.active.stepIndex,
      attempt: this.active.currentAttempt,
      expectation: exp,
      verifyTimeoutMs: VERIFY_TIMEOUT_MS,
    };
    // C1: route iframe-originated steps to the matching frame port. The
    // recorded frameId from the source tab is meaningless in the replay tab
    // (Chrome assigns fresh ids), so resolve frames by URL at dispatch time.
    let port: chrome.runtime.Port = this.active.port;
    if (step.frameId !== undefined && step.frameId !== 0) {
      const tabId = this.active.tabId;
      void (async () => {
        let framePort: chrome.runtime.Port | undefined;
        try {
          const frames = await chrome.webNavigation.getAllFrames({ tabId });
          const match = (frames ?? []).find((f) => f.url === step.url);
          if (match) framePort = this.framePortLookup(tabId, match.frameId);
        } catch {
          /* ignore */
        }
        const targetPort = framePort ?? this.active?.port;
        if (!targetPort) return;
        try {
          targetPort.postMessage(msg);
        } catch (err) {
          console.warn('[replay] iframe postMessage failed', err);
        }
      })();
      return;
    }
    try {
      port.postMessage(msg);
    } catch (err) {
      console.warn('[replay] postMessage failed', err);
      this.active.port = null;
      this.active.status = 'waitingForContent';
      this.onChange();
    }
  }

  private async openNewTabForReplay(url: string, openerTabId: number): Promise<void> {
    if (!this.active) return;
    try {
      const tab = await chrome.tabs.create({ url, openerTabId, active: false });
      if (tab.id !== undefined) {
        if (!this.active.tabIds.includes(tab.id)) this.active.tabIds.push(tab.id);
      }
    } catch (err) {
      console.warn('[replay] failed to open new tab', err);
      this.handleFailure(`couldn't open new tab: ${(err as Error).message}`);
      return;
    }
    this.advanceStep();
  }

  private async executeSwitchTab(targetIndex: number): Promise<void> {
    if (!this.active) return;
    const deadline = Date.now() + 5000;
    while (Date.now() < deadline) {
      if (targetIndex < this.active.tabIds.length) break;
      // Wait briefly for chrome.tabs.onCreated to register the new tab.
      await new Promise((r) => setTimeout(r, 100));
      if (!this.active) return;
    }
    if (!this.active) return;
    if (targetIndex >= this.active.tabIds.length) {
      this.handleFailure(`switchTab: tab index ${targetIndex} not opened by replay session`);
      return;
    }
    const newTabId = this.active.tabIds[targetIndex];
    this.active.activeTabIndex = targetIndex;
    this.active.tabId = newTabId;
    // Re-resolve port to the new tab's main frame; framePortLookup gives us
    // the live port if it's already connected.
    const mainPort = this.framePortLookup(newTabId, 0);
    this.active.port = mainPort ?? null;
    try {
      await chrome.tabs.update(newTabId, { active: true });
    } catch {
      /* tab may have closed */
    }
    this.advanceStep();
  }

  private executeNavigate(targetUrl: string): void {
    if (!this.active) return;
    const tabId = this.active.tabId;
    this.active.stepIndex += 1;
    this.active.currentAttempt = 0;
    this.active.status = 'navigating';
    this.onChange();

    void (async () => {
      try {
        const tab = await chrome.tabs.get(tabId);
        // SPA hash routes: a prior click step often *already* drove the tab to
        // `targetUrl` via history.pushState. In that case `chrome.tabs.reload`
        // would discard the in-memory SPA state we need for the next click —
        // treat the navigate as a no-op instead.
        if (tab.url === targetUrl) {
          // No-op: stay on the current page, skip the redundant reload.
        } else {
          await chrome.tabs.update(tabId, { url: targetUrl });
        }
      } catch (err) {
        console.error('[replay] navigate failed', err);
        return;
      }
      this.clearTimer();
      this.timer = setTimeout(() => {
        this.timer = null;
        if (!this.active) return;
        if (this.active.status === 'navigating') {
          this.active.status = this.active.port ? 'executing' : 'waitingForContent';
          this.onChange();
          if (this.active.port) this.dispatchAttempt();
        }
      }, NAVIGATE_FALLBACK_MS);
    })();
  }
}

// ─── expectation derivation ───

function deriveExpectation(steps: ActionStep[], index: number): Expectation {
  const cur = steps[index];
  const next = steps[index + 1];

  // If the recorded next step is on a different URL, expect this step to navigate there.
  if (next && next.url && cur && cur.url && !urlsMatch(next.url, cur.url)) {
    return {
      kind: 'urlChange',
      targetUrl: next.url,
      description: `URL → ${next.url}`,
    };
  }

  // Current step is itself a navigate (rare since background owns it, but defensive).
  if (cur.type === 'navigate' && cur.navigateUrl) {
    return { kind: 'urlChange', targetUrl: cur.navigateUrl, description: `URL → ${cur.navigateUrl}` };
  }

  // If next step has selectors, expect its target to become visible.
  // For "same URL but different content" transitions (SPA route, modal mount,
  // async result render), elementVisible already polls the resolver so it
  // naturally subsumes the more abstract `domStable` for our purposes.
  if (next && next.type !== 'navigate' && next.selectors && next.selectors.length) {
    return {
      kind: 'elementVisible',
      selectors: next.selectors as SelectorEntry[],
      fingerprint: next.fingerprint,
      description: `appear: ${next.fingerprint?.text || next.selectors[0]?.value}`,
    };
  }

  // Per-type local checks.
  if (cur.type === 'change') {
    return { kind: 'valueMatch', description: 'input value matches' };
  }
  if (cur.type === 'scroll') {
    return { kind: 'scrollMatch', description: `scroll to (${cur.scrollX},${cur.scrollY})` };
  }

  // Default fallback: wait for the DOM to settle. Replaces the prior fixed
  // 200ms sleep with an event-driven check so we don't pay the latency on
  // already-idle pages and we don't miss late-mounted content on busy ones.
  return { kind: 'domStable', domStableMs: 400, description: 'DOM settles' };
}

// ─── url helpers ───

function firstNavigateUrl(steps: ActionStep[]): string | null {
  const first = steps[0];
  if (first && first.type === 'navigate' && first.navigateUrl) return first.navigateUrl;
  return null;
}

function stepsHaveLeadingMatchingNav(steps: ActionStep[], url: string): boolean {
  const first = steps[0];
  if (!first || first.type !== 'navigate' || !first.navigateUrl) return false;
  return urlsMatch(first.navigateUrl, url);
}

/**
 * Loose URL match for replay verification.
 * - Same origin is required.
 * - Strict: pathname + hash equal.
 * - Fallback: first path segment equal (covers server-side URL canonicalization
 *   like Amazon `/s/ref=foo` → `/s?k=...`, Gmail `#inbox?compose=new` → `#inbox`).
 */
function urlsMatch(a: string, b: string): boolean {
  try {
    const ua = new URL(a);
    const ub = new URL(b);
    if (ua.origin !== ub.origin) return false;
    if (ua.pathname === ub.pathname && ua.hash === ub.hash) return true;
    const segA = firstPathSegment(ua.pathname);
    const segB = firstPathSegment(ub.pathname);
    if (segA && segB && segA === segB) return true;
    return false;
  } catch {
    return a === b;
  }
}

function firstPathSegment(p: string): string {
  return p.split('/').filter(Boolean)[0] ?? '';
}
