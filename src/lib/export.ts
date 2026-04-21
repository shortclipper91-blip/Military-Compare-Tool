import html2canvas from "html2canvas";

export async function exportElementAsImage(
  elementId: string,
  fileName: string = "STRATCOM_Briefing.png"
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error("Export target not found");
    return;
  }

  try {
    // We use a high scale for "retina" quality images
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#0b0f1a", // Matches theme background
      logging: false,
      useCORS: true, // Needed for external flags
    });

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png", 1.0);
    link.download = fileName;
    link.click();
  } catch (err) {
    console.error("Failed to export image:", err);
  }
}