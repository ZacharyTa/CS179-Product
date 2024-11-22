import Cookies from "js-cookie"

export function getManifestData() {
    const manifestText = Cookies.get("manifestText");
    return manifestText || "";
}

export function setManifestData(manifestText: string) {
    Cookies.set("manifestText", manifestText);
}