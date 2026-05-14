'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { SCENES, type SceneKey } from '@/lib/playgroundData';
import PlaygroundBanner from './PlaygroundBanner';
import RecordingScene from './scenes/RecordingScene';

const DEFAULT_SCENE: SceneKey = 'ecommerce';

const Page = styled.div`
  min-height: 100vh;
  background: #fff;
`;

export default function PlaygroundClient() {
  const [activeScene, setActiveScene] = useState<SceneKey>(DEFAULT_SCENE);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scene = params.get('scene');
    if (scene && SCENES.includes(scene as SceneKey) && scene !== activeScene) {
      setActiveScene(scene as SceneKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSceneChange(scene: SceneKey) {
    setActiveScene(scene);
    router.replace(`/playground?scene=${scene}`, { scroll: false });
  }

  return (
    <Page>
      <PlaygroundBanner activeScene={activeScene} onSceneChange={handleSceneChange} />
      <main>
        <RecordingScene sceneKey={activeScene} />
      </main>
    </Page>
  );
}
