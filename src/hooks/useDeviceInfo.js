import { useState, useEffect } from 'react';
import { getTime, transformMessage } from '../utils/helpers';

function useDeviceInfo(status) {
  const [deviceInfo, setDeviceInfo] = useState({
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
    lastTc: "",
    lastPulses: "",
    tc: "",
    pulses: "",
    tcp_command: "",
    mqtt_command: "",
    tcp_command_time: "",
    mqtt_command_time: "",
    inh: "",
  });

  useEffect(() => {
    let intervalId;
    if (status === "Connected") {
      intervalId = setInterval(() => {
        setDeviceInfo((prev) => ({
          ...prev,
          hbt_timer: (prev.hbt_timer || 0) + 1,
        }));
      }, 1000);
    } else {
      setDeviceInfo((prev) => ({
        ...prev,
        hbt_timer: 0,
      }));
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [status]);

  const parseDeviceInfo = (data) => {
    console.log(data);
    const info = {
      macId: "",
      fwVersion: "",
      serialNumber: "",
      ssid: "",
      ssid1: "",
      ssid2: "",
      ssid3: "",
      tc: "",
      pulses: "",
      lastTc: "",
      lastPulses: "",
      tcp_command: "",
      mqtt_command: "",
      tcp_command_time: "",
      mqtt_command_time: "",
      inh: ""
    };

    if (data.startsWith("*MAC:")) {
      console.log(data);
      const macLine = data.replace("*MAC:", "").trim();
      const parts = macLine.split(":");
      if (parts.length >= 7) {
        info.macId = parts.slice(0, 6).join(":");
        info.serialNumber = parts[6].replace(/#$/, "");
      }
    } else if (data.startsWith("*FW:")) {
      let fwLine = data.replace("*FW:", "").trim();
      if (fwLine.startsWith("*")) fwLine = fwLine.substring(1);
      info.fwVersion = fwLine.split(" ")[0];
    } else if (data.startsWith("*SSID")) {
      console.log(data);
      const ssidParts = data.replace("*SSID,", "").split(",");
      const ssids = ssidParts.slice(2).filter(Boolean);
      info.ssid1 = ssids[1];
      info.ssid2 = ssids[2];
      info.ssid3 = ssids[3].replace(/#$/, "");
    } else if (data.startsWith("*HBT-")) {
      console.log(data);
      setDeviceInfo((prev) => ({
        ...prev,
        hbt_counter: (prev.hbt_counter || 0) + 1,
        hbt_timer: 0,
      }));
    } else if (data.startsWith("*TCP-NOTOK#")) {
      setDeviceInfo((prev) => {
        const lastStatus = prev.tcp_status;
        const tcp_errors = lastStatus === "SUCCESS" ? (prev.tcp_errors || 0) + 1 : prev.tcp_errors || 0;
        return {
          ...prev,
          tcp_errors,
          tcp_status: "FAILED",
        };
      });
    } else if (data.startsWith("*TCP-OK#")) {
      setDeviceInfo((prev) => ({
        ...prev,
        tcp_status: "SUCCESS"
      }));
    } else if (data.startsWith("*WiFi:")) {
      const now = Date.now();
      setDeviceInfo((prev) => {
        const failedAt = prev.wifi_failed_at || now;
        const timeDiffSeconds = Math.floor((now - failedAt) / 1000);
        console.log("Time difference since failure:", timeDiffSeconds, "seconds");
        return {
          ...prev,
          ssid: data.replace("*WiFi:", "").replace("#", "").trim(),
          wifi_status: "SUCCESS",
          wifi_failure_duration: getTime(),
        };
      });
    } else if (data.startsWith("*MQTT,")) {
      const match = data.match(/\*MQTT,(\d+)(?: (.+))?#/);
      const status = match && match[2] ? match[2].trim() : "SUCCESS";
      setDeviceInfo((prev) => {
        const lastStatus = prev.mqtt_status;
        const mqtt_errors = status === "FAILED" && lastStatus === "SUCCESS" ? (prev.mqtt_errors || 0) + 1 : prev.mqtt_errors || 0;
        return {
          ...prev,
          mqtt_errors,
          mqtt_status: status,
        };
      });
    } else if (data.startsWith("*SEARCHING WIFI")) {
      setDeviceInfo((prev) => {
        const lastStatus = prev.wifi_status;
        const wifi_errors = lastStatus === "SUCCESS" ? (prev.wifi_errors || 0) + 1 : prev.wifi_errors || 0;
        console.log("WIFI LAST STATUS:", lastStatus);
        console.log("WIFI Status: FAILED");
        return {
          ...prev,
          wifi_errors,
          wifi_status: "FAILED",
          ssid: "0",
          wifi_failed_at: lastStatus === "SUCCESS" ? getTime() : prev.wifi_failed_at,
          wifi_failure_duration: "-"
        };
      });
    } else if (data.startsWith("*TCP-")) {
      info.tcp_command = data;
      info.tcp_command_time = getTime();
    } else if (data.startsWith("*MQTT-")) {
      info.mqtt_command = data;
      info.mqtt_command_time = getTime();
    } else if (data.startsWith("*TC")) {
      setDeviceInfo((prev) => ({
        ...prev,
        lastTc: prev.tc
      }));
      info.tc = data;
    } else if (data.startsWith("*CHENA")) {
      setDeviceInfo((prev) => ({
        ...prev,
        lastPulses: prev.pulses
      }));
      info.pulses = transformMessage(data);
    } else if (data.startsWith("*INH,")) {
      info.inh = data.split(",")[1].replace(/#$/, "");
    }

    setDeviceInfo((prev) => ({
      macId: info.macId || prev.macId,
      serialNumber: info.serialNumber || prev.serialNumber,
      fwVersion: info.fwVersion || prev.fwVersion,
      ssid: info.ssid || prev.ssid,
      ssid1: info.ssid1 || prev.ssid1,
      ssid2: info.ssid2 || prev.ssid2,
      ssid3: info.ssid3 || prev.ssid3,
      hbt_counter: info.hbt_counter || prev.hbt_counter,
      hbt_timer: info.hbt_timer || prev.hbt_timer,
      wifi_errors: info.wifi_errors || prev.wifi_errors,
      tcp_errors: info.tcp_errors || prev.tcp_errors,
      mqtt_errors: info.mqtt_errors || prev.mqtt_errors,
      mqtt_status: info.mqtt_status || prev.mqtt_status,
      tcp_status: info.tcp_status || prev.tcp_status,
      wifi_status: info.wifi_status || prev.wifi_status,
      wifi_failure_duration: info.wifi_failure_duration || prev.wifi_failure_duration,
      wifi_failed_at: info.wifi_failed_at || prev.wifi_failed_at,
      tc: info.tc || prev.tc,
      pulses: info.pulses || prev.pulses,
      lastTc: info.lastTc || prev.lastTc,
      lastPulses: info.lastPulses || prev.lastPulses,
      tcp_command: info.tcp_command || prev.tcp_command,
      mqtt_command: info.mqtt_command || prev.mqtt_command,
      tcp_command_time: info.tcp_command_time || prev.tcp_command_time,
      mqtt_command_time: info.mqtt_command_time || prev.mqtt_command_time,
      inh: info.inh || prev.inh,
    }));
  };

  return { deviceInfo, setDeviceInfo, parseDeviceInfo };
}

export default useDeviceInfo;
