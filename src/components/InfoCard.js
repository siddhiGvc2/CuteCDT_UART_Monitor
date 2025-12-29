import React from 'react';

function InfoCard({ deviceInfo }) {
  const statusIndex = deviceInfo.ssid;

  return (
    <div className="info-card" style={{ padding: "10px", borderRadius: "5px" }}>
      <strong>SSID:</strong>{" "}
      <span style={{ color: statusIndex === "1" ? "green" : "red" }}>
        {deviceInfo.ssid1 || "-"}
      </span>{" "}
      <span style={{ color: statusIndex === "2" ? "green" : "red" }}>
        {deviceInfo.ssid2 || "-"}
      </span>{" "}
      <span style={{ color: statusIndex === "3" ? "green" : "red" }}>
        {deviceInfo.ssid3 || "-"}
      </span>
    </div>
  );
}

export default InfoCard;
