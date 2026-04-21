import html2canvas from "html2canvas";

/**
 * Captures a DOM element by its ID or class and triggers a download.
 */
export async function exportAsImage(elementId: string, fileName: string = "STRATCOM-Briefing.png") {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID ${elementId} not found.`);
    return;
  }

  try {
    // Create canvas with high scale for better quality
    const canvas = await html2canvas(element, {
      backgroundColor: "#0b0f1a", // Match site background
      scale: 2,
      logging: false,
      useCORS: true, // Allow loading flags from external CDN
      onclone: (clonedDoc) => {
        // Ensure the cloned element is visible for capture
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.padding = "40px";
          clonedElement.style.borderRadius = "0px";
        }
      }
    });

    // Convert to image and download
    const image = canvas.toDataURL("image/png", 1.0);
    const link = document.createElement("a");
    link.download = fileName;
    link.href = image;
    link.click();
  } catch (error) {
    console.error("Export failed:", error);
  }
}