import { useEffect, useRef, useState } from 'react';
import IntroScene3D from './components/IntroScene3D.jsx';
import RetroDesktop from './components/RetroDesktop.jsx';

const BOOT_TIME = 2600;
const AUDIO_FADE_OUT_MS = 2000;
const INTRO_BGM_SRC = '/bgm/intro-bgm-20m-64k.mp3';
const STARTUP_SFX_SRC = '/sfx/windows-xp-startup.mp3';
const SHUTDOWN_SFX_SRC = '/sfx/windows-xp-shutdown.mp3';

function BootOverlay({ active }) {
  return (
    <div className={`boot-overlay ${active ? 'is-active' : ''}`} aria-hidden={!active}>
      <div className="boot-panel">
        <div className="boot-title">PLEASE WAIT</div>
        <div className="boot-meter">
          <span />
        </div>
        <div className="boot-copy">PERSONAL SYSTEM LOADING</div>
      </div>
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState('intro');
  const [audioReady, setAudioReady] = useState(false);
  const [audioManuallyPaused, setAudioManuallyPaused] = useState(false);
  const introAudioRef = useRef(null);
  const startupSfxRef = useRef(null);
  const shutdownSfxRef = useRef(null);
  const audioFadeFrameRef = useRef(null);

  const clearAudioFade = () => {
    if (audioFadeFrameRef.current !== null) {
      window.cancelAnimationFrame(audioFadeFrameRef.current);
      audioFadeFrameRef.current = null;
    }
  };

  const playIntroAudio = async (reset = false) => {
    const audio = introAudioRef.current;
    if (!audio || phase !== 'intro') return false;

    try {
      if (reset) {
        audio.currentTime = 0;
      }
      await audio.play();
      setAudioReady(true);
      return true;
    } catch {
      setAudioReady(false);
      return false;
    }
  };

  const pauseIntroAudio = (reset = false) => {
    const audio = introAudioRef.current;
    if (!audio) return;

    clearAudioFade();
    audio.pause();
    if (reset) {
      audio.currentTime = 0;
    }
    audio.volume = 1;
    setAudioReady(false);
  };

  const fadeOutIntroAudio = (duration = AUDIO_FADE_OUT_MS) => {
    const audio = introAudioRef.current;
    if (!audio) return;

    clearAudioFade();

    if (audio.paused) {
      audio.volume = 1;
      setAudioReady(false);
      return;
    }

    const startVolume = audio.volume;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      audio.volume = startVolume * (1 - progress);

      if (progress < 1) {
        audioFadeFrameRef.current = window.requestAnimationFrame(step);
        return;
      }

      audio.pause();
      audio.currentTime = 0;
      audio.volume = 1;
      audioFadeFrameRef.current = null;
      setAudioReady(false);
    };

    audioFadeFrameRef.current = window.requestAnimationFrame(step);
  };

  useEffect(() => {
    if (phase !== 'booting') return undefined;

    const timer = window.setTimeout(() => {
      setPhase('desktop');
    }, BOOT_TIME);

    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    const audio = introAudioRef.current;
    if (!audio) return undefined;

    if (phase === 'intro') {
      clearAudioFade();
      audio.volume = 1;
      if (!audioManuallyPaused) {
        void playIntroAudio();
      }
      return undefined;
    }

    if (phase === 'booting') {
      fadeOutIntroAudio();
      return () => clearAudioFade();
    }

    pauseIntroAudio(true);
    return undefined;
  }, [phase, audioManuallyPaused]);

  useEffect(() => {
    if (phase !== 'intro' || audioReady || audioManuallyPaused) return undefined;

    const unlockAudio = () => {
      void playIntroAudio();
    };

    window.addEventListener('pointerdown', unlockAudio, true);
    window.addEventListener('keydown', unlockAudio, true);

    return () => {
      window.removeEventListener('pointerdown', unlockAudio, true);
      window.removeEventListener('keydown', unlockAudio, true);
    };
  }, [phase, audioReady, audioManuallyPaused]);

  const toggleIntroAudio = async () => {
    if (audioReady) {
      setAudioManuallyPaused(true);
      pauseIntroAudio();
      return;
    }

    setAudioManuallyPaused(false);
    await playIntroAudio(introAudioRef.current?.currentTime === 0);
  };

  const playStartupSfx = () => {
    const sfx = startupSfxRef.current;
    // Skip the chime if the visitor has muted audio.
    if (!sfx || audioManuallyPaused) return;

    sfx.currentTime = 0;
    sfx.volume = 1;
    void sfx.play().catch(() => {});
  };

  const enterDesktop = () => {
    if (phase === 'intro') {
      // Fire within the click gesture so the boot chime isn't blocked by autoplay policy.
      playStartupSfx();
      setPhase('booting');
    }
  };

  const exitDesktop = () => {
    const sfx = shutdownSfxRef.current;

    // Muted or no clip available: shut down immediately.
    if (!sfx || audioManuallyPaused) {
      setPhase('intro');
      return;
    }

    sfx.currentTime = 0;
    sfx.volume = 1;
    void sfx.play().catch(() => {});

    // Let the chime play out before returning to the boot screen (capped at 5s).
    const clipMs = Number.isFinite(sfx.duration) && sfx.duration > 0 ? sfx.duration * 1000 : 2500;
    window.setTimeout(() => setPhase('intro'), Math.min(clipMs, 5000));
  };

  return (
    <main className={`app-shell app-shell--${phase}`}>
      <audio ref={introAudioRef} src={INTRO_BGM_SRC} loop preload="auto" />
      <audio ref={startupSfxRef} src={STARTUP_SFX_SRC} preload="auto" />
      <audio ref={shutdownSfxRef} src={SHUTDOWN_SFX_SRC} preload="auto" />

      <section className="intro-layer" aria-hidden={phase === 'desktop'}>
        <IntroScene3D phase={phase} onScreenClick={enterDesktop} />
        <div className="intro-status">
          <span className="status-dot" />
          <span className="status-label">{phase === 'intro' ? '点击屏幕开机' : '系统启动中'}</span>
        </div>

        {phase === 'intro' && (
          <button className="audio-hint" type="button" onClick={toggleIntroAudio}>
            {audioReady ? '点击关闭音乐' : '点击开启音乐'}
          </button>
        )}
      </section>

      <BootOverlay active={phase === 'booting'} />

      {phase === 'desktop' && <RetroDesktop onExit={exitDesktop} />}
    </main>
  );
}