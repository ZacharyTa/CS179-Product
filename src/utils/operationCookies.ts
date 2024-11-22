import Cookies from "js-cookie";
import { OutputLoadOperation } from "@/lib/types";

export function getOperations(): OutputLoadOperation[] {
  const operationsJson = Cookies.get("operations");
  return operationsJson ? JSON.parse(operationsJson) : [];
}

export function setOperations(operations: OutputLoadOperation[]): void {
  Cookies.set("operations", JSON.stringify(operations));
}

export function getCurrentOperationIndex(): number {
  const index = Cookies.get("currentOperationIndex");
  return index ? parseInt(index, 10) : 0;
}

export function setCurrentOperationIndex(index: number): void {
  Cookies.set("currentOperationIndex", index.toString());
}
