function getTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}`;
  return timeString;
}

function transformMessage(msg) {
  const prefix = "*CHENA:";
  const core = msg.slice(prefix.length, -1);
  const parts = core.split(':');
  let result = [parts[0]];
  for (let i = 1; i < parts.length; i++) {
    if (parts[i] === '1') {
      result.push((i + 1).toString());
    }
  }
  return `${result.join(':')}`;
}

export { getTime, transformMessage };
