import { useState } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { recordingsStore } from '@/stores/recordings';
import { skillsStore } from '@/stores/skills';
import { RecordButton } from './components/RecordButton';
import { RecordingList } from './components/RecordingList';
import { ReplayProgress } from './components/ReplayProgress';
import { SkillList } from './components/SkillList';
import { colors } from './styles';

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Header = styled.header`
  padding: 16px;
  border-bottom: 1px solid ${colors.border};
  background: ${colors.surface};
`;

const Title = styled.h1`
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
`;

const ErrorBanner = styled.div`
  margin-top: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid ${colors.accent};
  color: ${colors.accent};
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
`;

const ErrorClose = styled.button`
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0 4px;
`;

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  padding: 0 16px;
  background: ${colors.surface};
  border-bottom: 1px solid ${colors.border};
`;

const Tab = styled.button<{ $active: boolean }>`
  background: transparent;
  border: none;
  font-size: 13px;
  font-weight: 500;
  padding: 10px 12px;
  cursor: pointer;
  color: ${(p) => (p.$active ? colors.text : colors.textMuted)};
  border-bottom: 2px solid ${(p) => (p.$active ? colors.accent : 'transparent')};
  margin-bottom: -1px;
  transition: color 0.15s, border-color 0.15s;

  &:hover {
    color: ${colors.text};
  }
`;

const Count = styled.span`
  margin-left: 6px;
  font-size: 11px;
  opacity: 0.6;
`;

const Body = styled.div`
  flex: 1;
  overflow: auto;
`;

type TabKey = 'recordings' | 'skills';

export const App = observer(() => {
  const [tab, setTab] = useState<TabKey>('recordings');

  return (
    <Layout>
      <Header>
        <Title>Skill Recorder</Title>
        <RecordButton store={recordingsStore} />
        {recordingsStore.error && (
          <ErrorBanner>
            <span>{recordingsStore.error}</span>
            <ErrorClose onClick={() => recordingsStore.dismissError()}>×</ErrorClose>
          </ErrorBanner>
        )}
        <ReplayProgress store={recordingsStore} />
      </Header>
      <Tabs>
        <Tab $active={tab === 'recordings'} onClick={() => setTab('recordings')}>
          Recordings
          <Count>{recordingsStore.recordings.length}</Count>
        </Tab>
        <Tab $active={tab === 'skills'} onClick={() => setTab('skills')}>
          Skills
          <Count>{skillsStore.skills.length}</Count>
        </Tab>
      </Tabs>
      <Body>
        {tab === 'recordings' ? <RecordingList store={recordingsStore} /> : <SkillList />}
      </Body>
    </Layout>
  );
});
