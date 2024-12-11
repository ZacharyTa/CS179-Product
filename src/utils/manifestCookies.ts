import Cookies from "js-cookie";

export function getManifestData() {
  const manifestText = Cookies.get("manifestText");
  return manifestText || "";
}

export function getManifestFileName() {
  const manifestFileName = Cookies.get("manifestFileName");
  return manifestFileName || "";
}

export function setManifestData(manifestText: string) {
  Cookies.set("manifestText", manifestText);
}
