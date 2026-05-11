import { makeAutoObservable, runInAction } from 'mobx';
import { deleteSkill, listSkills, putSkill } from '@/common/db';
import type { Skill } from '@/common/types';

export class SkillsStore {
  skills: Skill[] = [];
  loading = false;

  constructor() {
    makeAutoObservable(this);
    void this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading = true;
    try {
      const all = await listSkills();
      runInAction(() => {
        this.skills = all;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async save(skill: Skill): Promise<void> {
    await putSkill(skill);
    await this.refresh();
  }

  async remove(id: string): Promise<void> {
    await deleteSkill(id);
    await this.refresh();
  }
}

export const skillsStore = new SkillsStore();
