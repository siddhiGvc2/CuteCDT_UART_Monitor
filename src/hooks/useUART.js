import { useState, useRef } from 'react';

function useUART() {
  const [port, setPort] = useState(null);
  const [writer, setWriter] = useState(null);
  const [reader, setReader] = useState(null);
  const [uartData, setUartData] = useState("");
  const [status, setStatus] = useState("Disconnected");

  const connectSerial = async (parseDeviceInfo, isStarted, mode, timer, setCapturedPackets) => {
    try {
      const selectedPort = await navigator.serial.requestPort();
      await selectedPort.open({ baudRate: 115200 });
      setPort(selectedPort);
      setStatus("Connected");

      const writer = selectedPort.writable.getWriter();
      setWriter(writer);

      await writer.write(new TextEncoder().encode("*RST#\n"));
      setTimeout(async () => {
        await writer.write(new TextEncoder().encode("*SSID?#\n"));
      }, 5000);

      setTimeout(async () => {
        await writer.write(new TextEncoder().encode("*TC?#\n"));
        setTimeout(async () => {
          await writer.write(new TextEncoder().encode("*PULSES?#\n"));
        }, 2000);
      }, 10000);

      const reader = selectedPort.readable.getReader();
      setReader(reader);

      const decoder = new TextDecoder();
      let packetBuffer = new Uint8Array();
      let uartBuffer = "";

      const readLoop = async () => {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              const uint8Array = new Uint8Array(value);
              const text = decoder.decode(value);

              setUartData((prev) => prev + text);

              uartBuffer += text;

              const regex = /\*[^#]*#/g;
              let match;
              while ((match = regex.exec(uartBuffer)) !== null) {
                const line = match[0].trim();
                parseDeviceInfo(line);
              }

              const lastHash = uartBuffer.lastIndexOf("#");
              if (lastHash >= 0) {
                uartBuffer = uartBuffer.slice(lastHash + 1);
              }

              // Process binary packets: 0xff ... 0xfe
              for (let i = 0; i < uint8Array.length; i++) {
                const byte = uint8Array[i];
                if (byte === 0xff) {
                  packetBuffer = new Uint8Array([byte]);
                } else if (byte === 0xfe && packetBuffer.length > 0) {
                  packetBuffer = new Uint8Array([...packetBuffer, byte]);
                  if (isStarted && mode === 'capture') {
                    const hexData = Array.from(packetBuffer).map(b => b.toString(16).padStart(2, '0')).join(' ');
                    setCapturedPackets(prev => {
                      const newPackets = [...prev, { timestamp: timer, data: hexData }];
                      setUartData(newPackets.map(p => `${p.timestamp} - ${p.data}`).join('\n'));
                      return newPackets;
                    });
                  }
                  packetBuffer = new Uint8Array();
                } else if (packetBuffer.length > 0) {
                  packetBuffer = new Uint8Array([...packetBuffer, byte]);
                }
              }
            }
          }
        } catch (err) {
          console.error("Read loop stopped:", err);
        } finally {
          reader.releaseLock();
        }
      };

      readLoop();
    } catch (err) {
      console.error("Error connecting to UART:", err);
      setStatus("Error");
    }
  };

  const disconnectSerial = async () => {
    try {
      if (reader) {
        await reader.cancel();
        reader.releaseLock();
        setReader(null);
      }
      if (writer) {
        writer.releaseLock();
        setWriter(null);
      }
      if (port) {
        await port.close();
        setPort(null);
      }
      setUartData("");
      setStatus("Disconnected");
      console.log("✅ Disconnected and cleared data");
    } catch (err) {
      console.error("Error disconnecting:", err);
    }
  };

  const sendSerial = async (msg, setDeviceInfo) => {
    if (!writer || !msg) return;
    try {
      await writer.write(new TextEncoder().encode(msg + "\n"));
      if (msg.includes("*RST#")) {
        setDeviceInfo((prev) => ({
          ...prev,
          ssid: "0"
        }));
        setTimeout(async () => {
          await writer.write(new TextEncoder().encode("*SSID?#\n"));
        }, 5000);
      }
      return true;
    } catch (err) {
      console.error("Send error:", err);
      return false;
    }
  };

  return {
    port,
    writer,
    reader,
    uartData,
    status,
    connectSerial,
    disconnectSerial,
    sendSerial,
    setUartData
  };
}

export default useUART;
