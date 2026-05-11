import { observer } from 'mobx-react';
import styled from 'styled-components';
import { skillsStore } from '@/stores/skills';
import { colors } from '../styles';
import { SkillCard } from './SkillCard';

const Wrap = styled.div`
  padding: 12px 16px 24px;
`;

const Empty = styled.div`
  padding: 32px 16px;
  text-align: center;
  color: ${colors.textMuted};
  font-size: 13px;
`;

export const SkillList = observer(() => {
  if (!skillsStore.skills.length) {
    return (
      <Empty>
        No skills yet.
        <br />
        Save a recording as a skill to get started.
      </Empty>
    );
  }
  return (
    <Wrap>
      {skillsStore.skills.map((s) => (
        <SkillCard key={s.id} skill={s} onDelete={(id) => void skillsStore.remove(id)} />
      ))}
    </Wrap>
  );
});
