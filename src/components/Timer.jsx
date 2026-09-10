import { useState, useEffect } from 'react';

export default function Timer({ durationMinutes = 120 }) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    setTimeLeft(durationMinutes * 60);
    setIsActive(false);
    setIsFinished(false);
  }, [durationMinutes]);

  useEffect(() => {
    let interval = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsFinished(true);
      alert('⏰ ¡Tiempo terminado!');
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBgColor = () => {
    const totalSeconds = durationMinutes * 60;
    const percentage = (timeLeft / totalSeconds) * 100;
    if (percentage > 50) return '#16a34a';
    if (percentage > 20) return '#ca8a04';
    return '#dc2626';
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(durationMinutes * 60);
    setIsFinished(false);
  };

  const containerStyle = {
    position: 'fixed',
    top: 16,
    right: 16,
    background: getBgColor(),
    color: 'white',
    padding: '12px 20px',
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    zIndex: 1000,
    fontFamily: 'system-ui, sans-serif',
    textAlign: 'center',
    minWidth: 140,
  };

  const labelStyle = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.9,
    marginBottom: 4,
  };

  const timeStyle = {
    fontSize: 28,
    fontWeight: 800,
    fontFamily: 'monospace',
    letterSpacing: 2,
    margin: '4px 0',
  };

  const buttonStyle = {
    fontSize: 11,
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: 'white',
    padding: '4px 10px',
    borderRadius: 6,
    cursor: 'pointer',
    marginRight: 4,
    transition: 'background 0.2s',
  };

  return (
    <div style={containerStyle}>
      <div style={labelStyle}>
        {isFinished ? '¡Tiempo terminado!' : 'Tiempo restante'}
      </div>
      <div style={timeStyle}>
        {formatTime(timeLeft)}
      </div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
        <button 
          onClick={() => setIsActive(!isActive)}
          style={buttonStyle}
        >
          {isActive ? ' Pausar' : '▶ Iniciar'}
        </button>
        <button 
          onClick={handleReset}
          style={buttonStyle}
        >
          🔄 Reiniciar
        </button>
      </div>
    </div>
  );
}
