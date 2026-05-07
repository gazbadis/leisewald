import { useEffect, useMemo, useRef, useState } from 'react';

const ANIMALS = [
  { id: 'bird-1', emoji: '🐦', className: 'animal bird bird-1' },
  { id: 'bird-2', emoji: '🕊️', className: 'animal bird bird-2' },
  { id: 'butterfly-1', emoji: '🦋', className: 'animal butterfly butterfly-1' },
  { id: 'butterfly-2', emoji: '🦋', className: 'animal butterfly butterfly-2' },
  { id: 'deer', emoji: '🦌', className: 'animal deer' }
];

function App() {
  const [volume, setVolume] = useState(0);
  const [threshold, setThreshold] = useState(34);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [calmScore, setCalmScore] = useState(0);

  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const dataArrayRef = useRef(null);
  const rafRef = useRef(null);

  const visibleAnimals = useMemo(() => {
    const count = Math.floor((calmScore / 100) * ANIMALS.length);
    return ANIMALS.slice(0, Math.min(ANIMALS.length, count));
  }, [calmScore]);

  const calmState = volume <= threshold ? 'leise' : 'laut';

  useEffect(() => {
    const onFullScreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullScreenChange);
  }, []);

  useEffect(() => {
    if (!isListening || !analyserRef.current || !dataArrayRef.current) return;

    const tick = () => {
      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current;
      analyser.getByteTimeDomainData(dataArray);

      let sumSquares = 0;
      for (let i = 0; i < dataArray.length; i += 1) {
        const normalized = (dataArray[i] - 128) / 128;
        sumSquares += normalized * normalized;
      }

      const rms = Math.sqrt(sumSquares / dataArray.length);
      const dbLike = Math.min(100, Math.max(0, Math.round(rms * 180)));
      setVolume((prev) => prev * 0.7 + dbLike * 0.3);

      rafRef.current = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(rafRef.current);
  }, [isListening]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCalmScore((prev) => {
        if (!isListening) return prev;

        const delta = volume <= threshold ? 4 : -6;
        return Math.max(0, Math.min(100, prev + delta));
      });
    }, 300);

    return () => clearInterval(interval);
  }, [volume, threshold, isListening]);

  const startListening = async () => {
    setError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContextClass();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();

      analyser.fftSize = 1024;
      const dataArray = new Uint8Array(analyser.fftSize);

      source.connect(analyser);

      audioContextRef.current = context;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      setIsListening(true);
    } catch (err) {
      setError('Mikrofonzugriff wurde verweigert oder ist nicht verfügbar.');
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    dataArrayRef.current = null;
    setIsListening(false);
    setVolume(0);
  };

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  };

  return (
    <div className="app">
      <header className="glass panel">
        <h1>🌲 Leisewald</h1>
        <p>Wenn es leise ist, erwacht der Wald zum Leben.</p>

        <div className="controls">
          <button type="button" onClick={isListening ? stopListening : startListening}>
            {isListening ? 'Mikrofon stoppen' : 'Mikrofon starten'}
          </button>

          <button type="button" onClick={toggleFullscreen} className="secondary">
            {isFullscreen ? 'Vollbild verlassen' : 'Vollbildmodus'}
          </button>
        </div>

        <label htmlFor="threshold">Lautstärke-Schwelle: {threshold}</label>
        <input
          id="threshold"
          type="range"
          min="10"
          max="70"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
        />

        <div className="meters">
          <div className="meter-row">
            <span>Aktuelle Lautstärke</span>
            <span>{Math.round(volume)}</span>
          </div>
          <div className="meter-track">
            <div className={`meter-fill ${calmState}`} style={{ width: `${Math.min(volume, 100)}%` }} />
          </div>

          <div className="meter-row">
            <span>Waldruhe</span>
            <span>{calmScore}%</span>
          </div>
          <div className="meter-track">
            <div className="meter-fill calm" style={{ width: `${calmScore}%` }} />
          </div>
        </div>

        <p className={`status ${calmState}`}>{calmState === 'leise' ? '✨ Schön leise!' : '🔊 Zu laut – Tiere verschwinden.'}</p>
        {error ? <p className="error">{error}</p> : null}
      </header>

      <main className="forest">
        <div className="sky-gradient" />
        <div className="sun" />
        <div className="hill hill-back" />
        <div className="hill hill-front" />
        <div className="trees" />

        {visibleAnimals.map((animal) => (
          <div key={animal.id} className={`${animal.className} visible`}>
            {animal.emoji}
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;
