import html2canvas from "html2canvas";
import { useRef } from "react";

export async function exportElementAsImage(
  elementClass: string,
  fileName: string = "export.png"
): Promise<void> {
  const element = document.querySelector(`.${elementClass}`);
  if (!element) return;
  const canvas = await html2canvas(element, { scale: 2 });
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = fileName;
  link.click();
}