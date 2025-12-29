import { useState, useRef } from 'react';

function useCapturePlay() {
  const [mode, setMode] = useState('capture');
  const [isStarted, setIsStarted] = useState(false);
  const [timer, setTimer] = useState('00:00:00');
  const [fileName, setFileName] = useState('');
  const [capturedPackets, setCapturedPackets] = useState([]);
  const timerRef = useRef(null);

  const handleStart = (writer, setUartData) => {
    if (mode === 'capture') {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
      setFileName(`CDACCute.${dateStr}.${timeStr}.txt`);
      setCapturedPackets([]);
      setTimer('00:00:00');
      setIsStarted(true);
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        setTimer(`${hrs}:${mins}:${secs}`);
      }, 1000);
    } else if (mode === 'play') {
      if (fileName) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target.result;
          const packets = content.split('\n').filter(line => line.trim()).map(line => {
            const [timestamp, data] = line.split(' - ');
            return { timestamp, data };
          });
          setCapturedPackets(packets);
          setTimer('00:00:00');
          setIsStarted(true);
          let seconds = 0;
          timerRef.current = setInterval(() => {
            seconds++;
            const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
            const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            setTimer(`${hrs}:${mins}:${secs}`);
          }, 1000);

          packets.forEach((packet, index) => {
            const [hrs, mins, secs] = packet.timestamp.split(':').map(Number);
            const packetTime = hrs * 3600 + mins * 60 + secs;
            setTimeout(async () => {
              if (writer && isStarted) {
                const bytes = packet.data.split(' ').map(h => parseInt(h, 16));
                await writer.write(new Uint8Array(bytes));
                setUartData(prev => prev + `${packet.timestamp} - ${packet.data}\n`);
              }
            }, packetTime * 1000);
          });
        };
        reader.readAsText(fileName);
      }
    }
  };

  const handleStop = (setUartData) => {
    if (mode === 'capture' && capturedPackets.length > 0) {
      const content = capturedPackets.map(p => `${p.timestamp} - ${p.data}`).join('\n');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      setUartData(content);
    }
    setIsStarted(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return {
    mode,
    setMode,
    isStarted,
    timer,
    fileName,
    setFileName,
    capturedPackets,
    setCapturedPackets,
    handleStart,
    handleStop
  };
}

export default useCapturePlay;
