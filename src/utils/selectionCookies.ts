import Cookies from "js-cookie";

export function getSelection(): string {
  const selection = Cookies.get("selection");
  return selection || "";
}

export function setSelection(selection: string) : void {
  Cookies.set("selection", selection);
}