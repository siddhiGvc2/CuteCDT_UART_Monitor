import { useState, useRef, useEffect } from "react";
import "./App.css";
import DeviceInfoCards from "./components/DeviceInfoCards";
import useUART from "./hooks/useUART";
import useDeviceInfo from "./hooks/useDeviceInfo";
import useCapturePlay from "./hooks/useCapturePlay";
import InfoCard from "./components/InfoCard";

export default function App() {
  const [msg, setMsg] = useState("");
  const terminalRef = useRef(null);

  const { port, writer, reader, uartData, status, connectSerial, disconnectSerial, sendSerial, setUartData } = useUART();
  const { deviceInfo, setDeviceInfo, parseDeviceInfo } = useDeviceInfo(status);
  const { mode, setMode, isStarted, timer, fileName, setFileName, capturedPackets, setCapturedPackets, handleStart, handleStop } = useCapturePlay();

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [uartData]);

  const handleConnectSerial = async () => {
    await connectSerial(parseDeviceInfo, isStarted, mode, timer, setCapturedPackets);
  };

  const handleDisconnectSerial = async () => {
    await disconnectSerial();
    setDeviceInfo({
      macId: "",
      fwVersion: "",
      serialNumber: "",
      ssid: "",
      ssid1: "",
      ssid2: "",
      ssid3: "",
      hbt_counter: 0,
      hbt_timer: 0,
      wifi_errors: 0,
      tcp_errors: 0,
      mqtt_errors: 0,
      mqtt_status: "FAILED",
      tcp_status: "FAILED",
      wifi_status: "FAILED",
      wifi_failure_duration: "",
      wifi_failed_at: "",
      tc: "",
      pulses: "",
      lastTc: "",
      lastPulses: "",
      tcp_command: "",
      mqtt_command: "",
      tcp_command_time: "",
      mqtt_command_time: "",
      inh: ""
    });
  };

  const handleSendSerial = async () => {
    const success = await sendSerial(msg, setDeviceInfo);
    if (success) setMsg("");
  };

  const handleClearTerminal = () => {
    setUartData("");
    setDeviceInfo({
      macId: "",
      fwVersion: "",
      serialNumber: "",
      ssid: ""
    });
  };

  return (
    <div className="container">
      <div className="card">
        <div style={{width:'100%',display:"flex",justifyContent:"space-around"}}>
        <h1 className="title">UART Monitor- Cute CDT </h1>
          <div className="center">
            <div>
              <label>
                <input type="radio" value="capture" checked={mode === 'capture'} onChange={(e) => setMode(e.target.value)} />
                Capture
              </label>
              <label>
                <input type="radio" value="play" checked={mode === 'play'} onChange={(e) => setMode(e.target.value)} />
                Play
              </label>
            </div>
            <div>
              <button onClick={() => handleStart(writer, setUartData)} className="btn connect" disabled={isStarted}>Start</button>
              <button onClick={() => handleStop(setUartData)} className="btn disconnect" disabled={!isStarted}>Stop</button>
            </div>
            {mode === 'play' && (
              <input type="file" accept=".txt" onChange={(e) => setFileName(e.target.files[0])} />
            )}
            <div>Timer: {timer}</div>
          </div>
          <div>
        {/* Status */}
        <p className={`status ${status === "Connected" ? "connected" : "disconnected"}`}>
          Status: {status}
        </p>


        {/* Connect / Disconnect */}
        {!port ? (
          <div className="center">
            <button onClick={connectSerial} className="btn connect">
              Connect UART
            </button>
          </div>
        ) : (
          <div className="center">
            <button onClick={disconnectSerial} className="btn disconnect">
              Disconnect
            </button>
          </div>
        )}
        </div>
        </div>
        {/* Send */}
        <div className="send-section">
          <input
            type="text"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Enter UART command"
            className="input"
          />
          <button onClick={sendSerial} className="btn send" disabled={!writer || !msg}>
            Send
          </button>
          <button
            onClick={() => {
              setUartData("");
              setDeviceInfo({ macId: "", fwVersion: "", serialNumber: "", ssid: "" });
            }}
            className="btn clear"
            disabled={!uartData}
          >
            Clear Terminal
          </button>
        </div>

        {/* Device Info Cards */}
        
        <div className="info-cards">
          <div className="info-card">
            <strong>ID:</strong> {deviceInfo.macId || "-"} / {deviceInfo.serialNumber || "-"} / {deviceInfo.fwVersion || "-"}
          </div>
           <InfoCard deviceInfo={deviceInfo} />
           <div className="info-card">
             <strong>HBT-S:</strong>  {deviceInfo.hbt_counter} / {deviceInfo.hbt_timer}
           </div>
              <div className="info-card">
             <strong>WIFI Failed @ </strong> {deviceInfo.wifi_failed_at || "-"} <strong>WIFI Restored @ </strong>{deviceInfo.wifi_failure_duration || "-"}
           </div>
            <div className="info-card">
             <strong>TCP-ERRORS:</strong> {deviceInfo.tcp_errors || 0}
           </div>
            <div className="info-card">
             <strong>MQTT-ERRORS:</strong> {deviceInfo.mqtt_errors || 0}
           </div>
           <div className="info-card">
             <strong>TC:</strong> {deviceInfo.tc || ""}
           </div>
           <div className="info-card">
             <strong>Channel Enabled:</strong> {deviceInfo.pulses || ""}
           </div>
            <div className="info-card">
             <strong>INH:</strong> {deviceInfo.inh || ""}
           </div>
            <div className="info-card2">
             <strong>TCP COMMAND:</strong> {deviceInfo.tcp_command || ""}@{deviceInfo.tcp_command_time}
           </div>
           <div className="info-card2">
             <strong>MQTT COMMAND:</strong> {deviceInfo.mqtt_command || ""}@{deviceInfo.mqtt_command_time}
           </div>
           
        </div>

        {/* Terminal */}
        <h2 className="subtitle">Incoming UART Data:</h2>
        <div className="terminal" ref={terminalRef}>
          <pre>{uartData || "No data yet..."}</pre>
        </div>
      </div>
    </div>
  );
}
