import Cookies from "js-cookie";

export function getPinkData() : string {
  const pinkText = Cookies.get("pinkText");
  return pinkText || "";
}

export function setPinkData(pinkText: string) {
  Cookies.set("pinkText", pinkText);
}
