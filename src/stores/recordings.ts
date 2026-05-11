import { makeAutoObservable, runInAction } from 'mobx';
import { deleteRecording, listRecordings } from '@/common/db';
import type { RecordingMeta, ReplayState } from '@/common/types';
import type { BackgroundToSidepanel, RecordingState, SidepanelToBackground } from '@/common/messages';

const EMPTY_REPLAY: ReplayState = {
  recordingId: null,
  tabId: null,
  totalSteps: 0,
  stepIndex: 0,
  status: 'idle',
  currentStep: null,
  currentAttempt: 0,
  maxAttempts: 3,
  expectation: null,
  failure: null,
};

const EMPTY_REC: RecordingState = {
  recordingId: null,
  startTime: null,
  eventCount: 0,
  actionCount: 0,
};

export class RecordingsStore {
  recordings: RecordingMeta[] = [];
  recording: RecordingState = EMPTY_REC;
  replay: ReplayState = EMPTY_REPLAY;
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.subscribe();
    void this.refresh();
    void this.fetchState();
  }

  get isRecording(): boolean {
    return this.recording.recordingId !== null;
  }

  get isReplaying(): boolean {
    return this.replay.status !== 'idle' && this.replay.status !== 'success' &&
      this.replay.status !== 'cancelled';
  }

  async refresh(): Promise<void> {
    this.loading = true;
    try {
      const items = await listRecordings();
      runInAction(() => {
        this.recordings = items;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async startRecording(): Promise<void> {
    await this.send({ type: 'START_RECORDING' });
    await this.fetchState();
  }

  async stopRecording(): Promise<void> {
    await this.send({ type: 'STOP_RECORDING' });
    await this.fetchState();
    await this.refresh();
  }

  async startReplay(id: string): Promise<void> {
    await this.send({ type: 'START_REPLAY', recordingId: id });
    await this.fetchState();
  }

  async stopReplay(): Promise<void> {
    await this.send({ type: 'STOP_REPLAY' });
    await this.fetchState();
  }

  async decideReplay(decision: 'retry' | 'skip' | 'stop'): Promise<void> {
    await this.send({ type: 'REPLAY_DECIDE', decision });
    await this.fetchState();
  }

  async remove(id: string): Promise<void> {
    await deleteRecording(id);
    await this.refresh();
  }

  openPlayer(id: string): void {
    const url = chrome.runtime.getURL(`src/modules/player/index.html?id=${encodeURIComponent(id)}`);
    void chrome.tabs.create({ url });
  }

  private async fetchState(): Promise<void> {
    const reply = (await chrome.runtime.sendMessage({ type: 'GET_STATE' } satisfies SidepanelToBackground)) as
      | BackgroundToSidepanel
      | undefined;
    if (reply && reply.type === 'STATE') this.applyState(reply);
  }

  private applyState(msg: Extract<BackgroundToSidepanel, { type: 'STATE' }>): void {
    runInAction(() => {
      this.recording = msg.recording;
      this.replay = msg.replay;
      this.error = msg.error;
    });
  }

  dismissError(): void {
    this.error = null;
  }

  private async send(msg: SidepanelToBackground): Promise<void> {
    await chrome.runtime.sendMessage(msg);
  }

  private subscribe(): void {
    chrome.runtime.onMessage.addListener((msg: BackgroundToSidepanel) => {
      if (msg.type === 'STATE') this.applyState(msg);
      else if (msg.type === 'RECORDINGS_CHANGED') void this.refresh();
    });
  }
}

export const recordingsStore = new RecordingsStore();
