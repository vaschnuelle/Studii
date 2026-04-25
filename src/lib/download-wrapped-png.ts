import html2canvas from "html2canvas";

/**
 * Renders a DOM node to PNG and triggers a browser download (Phase 2 MVP: html-to-canvas).
 */
export async function downloadWrappedPng(
  elementId: string,
  filename: string = "studii-wrapped.png"
): Promise<void> {
  const el = document.getElementById(elementId);
  if (!el) {
    console.warn(`downloadWrappedPng: missing element #${elementId}`);
    return;
  }

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    logging: false,
  });

  const url = canvas.toDataURL("image/png");
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
}
