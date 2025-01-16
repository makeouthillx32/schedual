import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function generatePDF(selectedTemplate: string) {
  const element = document.querySelector(".grid"); // Select punch card grid
  if (!element || !(element instanceof HTMLElement)) {
    console.error("Punch card grid not found or not a valid HTML element.");
    return;
  }

  const canvas = await html2canvas(element, {
    scale: 3, // Higher scale for better resolution
    backgroundColor: null, // Preserve transparency
  });

  const imgData = canvas.toDataURL("image/png");

  // Create a PDF with Letter Size (8.5" x 11")
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [816, 1056], // Letter size in pixels
  });

  pdf.addImage(imgData, "PNG", 20, 20, 776, 1016); // Adjust margins
  pdf.save(`PunchCards-${selectedTemplate}.pdf`);
}