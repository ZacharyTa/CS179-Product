import Cookies from "js-cookie";

export function removeAllCookies(): void {
  Cookies.remove("manifestText");
  Cookies.remove("operations");
  Cookies.remove("currentOperationIndex");
  Cookies.remove("manifestFileName");
  Cookies.remove("bufferText");
  Cookies.remove("selection");
}