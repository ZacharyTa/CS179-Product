import Cookies from "js-cookie";

export function getBufferData() {
  const bufferText = Cookies.get("bufferText");
  return bufferText || "";
}

export function setBufferData(bufferText: string) {
  Cookies.set("bufferText", bufferText);
}
