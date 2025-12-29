import React from 'react';
import InfoCard from './InfoCard';

function DeviceInfoCards({ deviceInfo }) {
  return (
    <div className="info-cards">
      <div className="info-card">
        <strong>ID:</strong> {deviceInfo.macId || "-"} / {deviceInfo.serialNumber || "-"} / {deviceInfo.fwVersion || "-"}
      </div>
      <InfoCard deviceInfo={deviceInfo} />
      <div className="info-card">
        <strong>HBT-S:</strong> {deviceInfo.hbt_counter} / {deviceInfo.hbt_timer}
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
  );
}

export default DeviceInfoCards;
