import Cookies from "js-cookie";

export function getSignedInWorker(): string {
  const signedInWorker = Cookies.get("signedInWorker");
  return signedInWorker || "";
}

export function setSignedInWorker(signedInWorker: string) : void {
  Cookies.set("signedInWorker", signedInWorker);
}