"use client";

import { useState, useEffect } from 'react';
import styles from './styles.module.css';

// Piano notes mapping
const whiteKeys = [
  { note: 'C', key: 'a', frequency: 261.63 },
  { note: 'D', key: 's', frequency: 293.66 },
  { note: 'E', key: 'd', frequency: 329.63 },
  { note: 'F', key: 'f', frequency: 349.23 },
  { note: 'G', key: 'g', frequency: 392.00 },
  { note: 'A', key: 'h', frequency: 440.00 },
  { note: 'B', key: 'j', frequency: 493.88 },
  { note: 'C2', key: 'k', frequency: 523.25 },
];

const blackKeys = [
  { note: 'C#', key: 'w', frequency: 277.18, position: 1 },
  { note: 'D#', key: 'e', frequency: 311.13, position: 2 },
  { note: 'F#', key: 't', frequency: 369.99, position: 4 },
  { note: 'G#', key: 'y', frequency: 415.30, position: 5 },
  { note: 'A#', key: 'u', frequency: 466.16, position: 6 },
];

export default function SynthwavePiano() {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [waveformData, setWaveformData] = useState<Uint8Array>(new Uint8Array(128));
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Initialize Web Audio API
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyserNode = context.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.connect(context.destination);
    
    setAudioContext(context);
    setAnalyser(analyserNode);

    return () => {
      context?.close();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const allKeys = [...whiteKeys, ...blackKeys];
      const keyData = allKeys.find(k => k.key === key);
      
      if (keyData && !activeKeys.has(key)) {
        setActiveKeys(prev => new Set(prev).add(key));
        playNote(keyData.frequency);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeKeys, audioContext]);

  useEffect(() => {
    let animationId: number;
    
    const updateWaveform = () => {
      if (analyser) {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(dataArray);
        setWaveformData(dataArray);
      }
      animationId = requestAnimationFrame(updateWaveform);
    };

    if (analyser) {
      updateWaveform();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [analyser]);

  const playNote = (frequency: number) => {
    if (!audioContext || !analyser) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(analyser);

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'triangle'; // TE-appropriate waveform

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.8);
  };

  const handleKeyPress = (keyData: any) => {
    playNote(keyData.frequency);
    setActiveKeys(prev => new Set(prev).add(keyData.key));
    setTimeout(() => {
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(keyData.key);
        return newSet;
      });
    }, 200);
  };

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.dark : ''}`}>
      {/* Mode Toggle */}
      <div className={styles.modeToggle}>
        <div className={styles.toggleContainer}>
          <span className={`${styles.toggleLabel} ${!isDarkMode ? styles.activeLabel : ''}`}>LIGHT</span>
          <button 
            className={`${styles.toggle} ${isDarkMode ? styles.toggleDark : ''}`}
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            <div className={styles.toggleSlider}></div>
          </button>
          <span className={`${styles.toggleLabel} ${isDarkMode ? styles.activeLabel : ''}`}>DARK</span>
        </div>
      </div>
      
      <div className={`${styles.device} ${isDarkMode ? styles.deviceDark : ''}`}>
        {/* Top Panel */}
        <div className={styles.topPanel}>
          <div className={styles.connectionPorts}>
            <div className={styles.portGroup}>
              <span className={styles.portLabel}>OUTPUT</span>
              <div className={styles.port}></div>
            </div>
            <div className={styles.portGroup}>
              <span className={styles.portLabel}>INPUT</span>
              <div className={`${styles.port} ${styles.active}`}></div>
            </div>
            <div className={styles.portGroup}>
              <span className={styles.portLabel}>SYNC</span>
              <div className={styles.port}></div>
            </div>
            <div className={styles.portGroup}>
              <span className={styles.portLabel}>USB</span>
              <div className={styles.port}></div>
            </div>
          </div>
          <div className={styles.speakerGrille}></div>
        </div>

        {/* Main Device Body */}
        <div className={styles.deviceBody}>
          {/* Header Section */}
          <div className={styles.deviceHeader}>
            <div className={styles.branding}>
              <h1 className={styles.modelName}>T.E. PIANO</h1>
              <p className={styles.deviceType}>DIGITAL PIANO COMPOSER</p>
            </div>
          </div>

          {/* Display Section */}
          <div className={styles.displaySection}>
            <div className={styles.display}>
              <div className={styles.waveformContainer}>
                <svg className={styles.waveform} viewBox="0 0 128 64">
                  <path
                    d={`M 0 32 ${Array.from(waveformData, (value, index) => {
                      const x = (index / waveformData.length) * 128;
                      const y = ((value - 128) / 128) * 16 + 32;
                      return `L ${x} ${y}`;
                    }).join(' ')}`}
                    stroke="#00ff88"
                    strokeWidth="1"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="waveGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#00ff88" stopOpacity="0.8"/>
                      <stop offset="100%" stopColor="#00ff88" stopOpacity="0.2"/>
                    </linearGradient>
                  </defs>
                  <path
                    d={`M 0 32 ${Array.from(waveformData, (value, index) => {
                      const x = (index / waveformData.length) * 128;
                      const y = ((value - 128) / 128) * 16 + 32;
                      return `L ${x} ${y}`;
                    }).join(' ')} L 128 32 Z`}
                    fill="url(#waveGlow)"
                  />
                </svg>
              </div>
              <div className={styles.statusIcons}>
                <span className={styles.playIcon}>▶</span>
                <span className={styles.recordIcon}>●</span>
              </div>
            </div>
          </div>

          {/* Control Section */}
          <div className={styles.controlSection}>
            <div className={styles.volumeKnob}>
              <div className={styles.knob}></div>
              <span className={styles.knobLabel}>VOLUME</span>
            </div>

            <div className={styles.buttonGrid}>
              <button className={styles.modeButton}>SOUND</button>
              <button className={styles.modeButton}>MAIN</button>
              <button className={styles.modeButton}>TEMPO</button>
            </div>

            <div className={styles.tempoKnob}>
              <div className={`${styles.knob} ${styles.orangeKnob}`}></div>
              <span className={styles.knobLabel}>TEMPO</span>
            </div>
          </div>

          {/* Piano Keys Section */}
          <div className={styles.pianoSection}>
            <div className={styles.keyGrid}>
              {whiteKeys.map((keyData, index) => (
                <button
                  key={keyData.note}
                  className={`${styles.pianoKey} ${activeKeys.has(keyData.key) ? styles.active : ''}`}
                  onMouseDown={() => handleKeyPress(keyData)}
                  data-note={keyData.note}
                >
                  <span className={styles.keyNote}>{keyData.note}</span>
                  <span className={styles.keyBinding}>{keyData.key.toUpperCase()}</span>
                </button>
              ))}
            </div>
            
            <div className={styles.sharpKeyGrid}>
              {blackKeys.map((keyData) => (
                <button
                  key={keyData.note}
                  className={`${styles.sharpKey} ${activeKeys.has(keyData.key) ? styles.active : ''}`}
                  onMouseDown={() => handleKeyPress(keyData)}
                  data-note={keyData.note}
                >
                  <span className={styles.keyNote}>{keyData.note}</span>
                  <span className={styles.keyBinding}>{keyData.key.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Controls */}
          <div className={styles.bottomControls}>
            <button className={styles.utilityButton}>SHIFT</button>
            <div className={styles.transportButtons}>
              <button className={styles.transportButton}>⏹</button>
              <button className={styles.transportButton}>⏸</button>
              <button className={`${styles.transportButton} ${styles.recordButton}`}>●</button>
              <button className={styles.transportButton}>▶</button>
            </div>
            <div className={styles.rightControls}>
              <button className={styles.utilityButton}>FX</button>
              <button className={styles.utilityButton}>ERASE</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 