import Cookies from "js-cookie";

export function getLogs(): string {
  const logs = Cookies.get("eventLogs");
  return logs || "";
}

export function addLog(event: string): void {
  const logs = getLogs();
  const timestamp = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  const newLogEntry = `${timestamp} - ${event}`;
  const updatedLogs = logs ? `${logs}\n${newLogEntry}` : newLogEntry;
  Cookies.set("eventLogs", updatedLogs);
}
