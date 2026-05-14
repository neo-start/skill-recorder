import { useState } from 'react';
import styled from 'styled-components';
import type { Skill } from '@skill-recorder/types';
import { renderSkillAsMarkdown } from '@skill-recorder/render';
import { autoSaveSkillMarkdown } from '@/common/skill-export';
import { colors } from '../styles';

const Card = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
`;

const Title = styled.span`
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`;

const Domain = styled.span`
  font-size: 11px;
  color: ${colors.textMuted};
  font-variant-numeric: tabular-nums;
`;

const Description = styled.div`
  font-size: 12px;
  color: ${colors.textMuted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: ${colors.textMuted};
`;

const Params = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const Param = styled.span`
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(59, 130, 246, 0.08);
  color: #1e40af;
  font-family: ui-monospace, monospace;
`;

const Actions = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 4px;
`;

const Btn = styled.button<{ $variant?: 'primary' | 'danger' }>`
  flex: 1;
  border: 1px solid ${colors.border};
  background: ${colors.surface};
  border-radius: 6px;
  font-size: 12px;
  padding: 6px 8px;
  transition: background-color 0.15s, border-color 0.15s;

  ${(p) =>
    p.$variant === 'primary' &&
    `
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
    &:hover { background: #2563eb; }
  `}
  ${(p) =>
    p.$variant === 'danger' &&
    `
    color: ${colors.accent};
    &:hover { background: rgba(220, 38, 38, 0.06); border-color: ${colors.accent}; }
  `}
`;

interface Props {
  skill: Skill;
  onDelete: (id: string) => void;
}

export function SkillCard({ skill, onDelete }: Props) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const md = renderSkillAsMarkdown(skill);
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('clipboard write failed', err);
    }
  };

  const onDownload = async () => {
    try {
      await autoSaveSkillMarkdown(skill);
    } catch (err) {
      console.error('download failed', err);
    }
  };

  return (
    <Card>
      <Top>
        <Title>{skill.title}</Title>
        <Domain>{skill.domain || '—'}</Domain>
      </Top>
      {skill.description && <Description>{skill.description}</Description>}
      <Meta>
        <span>
          {skill.steps.length} steps · {skill.parameters.length} params
        </span>
        <span>{fmtAgo(skill.createdAt)}</span>
      </Meta>
      {skill.parameters.length > 0 && (
        <Params>
          {skill.parameters.map((p) => (
            <Param key={p.name}>${'{'}
              {p.name}
              {'}'}
            </Param>
          ))}
        </Params>
      )}
      <Actions>
        <Btn $variant="primary" onClick={onCopy}>
          {copied ? '✓ Copied' : 'Copy SKILL.md'}
        </Btn>
        <Btn onClick={onDownload}>Download</Btn>
        <Btn $variant="danger" onClick={() => onDelete(skill.id)}>
          Delete
        </Btn>
      </Actions>
    </Card>
  );
}

function fmtAgo(t: number): string {
  const diff = Date.now() - t;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(t).toLocaleDateString();
}

