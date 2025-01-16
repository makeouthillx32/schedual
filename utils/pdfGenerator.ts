import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function generatePDF(selectedTemplate: string) {
  const element = document.querySelector(".grid"); // Target punch card grid
  if (!element) {
    console.error("Punch card grid not found.");
    return;
  }

  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  // Create a PDF with letter size (8.5" x 11")
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: [8.5, 11],
  });

  pdf.addImage(imgData, "PNG", 0.5, 0.5, 7.5, 10);
  pdf.save(`PunchCards-${selectedTemplate}.pdf`);
} 