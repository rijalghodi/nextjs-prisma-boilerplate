import { readFileSync } from "fs";

function normalize(text: string) {
  return text.replace(/\r/g, "").trim();
}

export function readTSV(path: string): string[][] {
  const text = normalize(readFileSync(path, "utf8"));
  return text
    .split("\n")
    .map(line => line.split("\t").map(cell => cell.trim()));
}

export function readCSV(path: string): string[][] {
  const text = normalize(readFileSync(path, "utf8"));
  return text
    .split("\n")
    .map(line => line.split(",").map(cell => cell.trim()));
}