import jsPDF from "jspdf";
import { CertificateWithDetails } from "./certificateService";

export interface CertificateData {
  certificate: CertificateWithDetails;
  courseDescription?: string;
  completionDate: string;
}

/**
 * Generate a professional certificate PDF
 * Returns the PDF as a buffer
 */
export async function generateCertificatePDF(
  data: CertificateData
): Promise<Buffer> {
  const { certificate, courseDescription, completionDate } = data;

  // Create PDF in landscape orientation
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Set background color (light blue gradient effect with shapes)
  doc.setFillColor(240, 248, 255); // Alice blue
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Add decorative border
  doc.setDrawColor(25, 103, 210); // Blue border
  doc.setLineWidth(3);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Add inner decorative border
  doc.setLineWidth(1);
  doc.setDrawColor(100, 150, 220);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Add corner decorations (circles)
  doc.setFillColor(25, 103, 210);
  doc.circle(15, 15, 2.5, "F");
  doc.circle(pageWidth - 15, 15, 2.5, "F");
  doc.circle(15, pageHeight - 15, 2.5, "F");
  doc.circle(pageWidth - 15, pageHeight - 15, 2.5, "F");

  // Title
  doc.setFontSize(48);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(25, 103, 210);
  doc.text("CERTIFICATE OF COMPLETION", pageWidth / 2, 35, {
    align: "center",
  });

  // Subtitle
  doc.setFontSize(14);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(80, 80, 80);
  doc.text(
    "This is to certify that the bearer has successfully completed the course",
    pageWidth / 2,
    50,
    { align: "center" }
  );

  // Course title box
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(25, 103, 210);
  const courseTitle = certificate.course_title;
  doc.text(courseTitle, pageWidth / 2, 70, { align: "center" });

  // Learner name
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  const topY = 95;
  doc.text(certificate.user_name, pageWidth / 2, topY, { align: "center" });

  // Decorative line under name
  doc.setDrawColor(25, 103, 210);
  doc.setLineWidth(1.5);
  doc.line(pageWidth / 2 - 60, topY + 8, pageWidth / 2 + 60, topY + 8);

  // Details section
  const detailsY = 115;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);

  // Left column details
  const leftX = 30;
  const rightX = pageWidth / 2 + 10;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(25, 103, 210);
  doc.text("Date of Completion:", leftX, detailsY);
  doc.text("Certificate Number:", leftX, detailsY + 12);

  // Right side values
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(completionDate, leftX + 50, detailsY);
  doc.text(certificate.serial_number, leftX + 50, detailsY + 12);

  // Course description (if provided)
  if (courseDescription) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    const descriptionY = detailsY + 25;
    const wrappedText = doc.splitTextToSize(courseDescription, 180);
    doc.text(wrappedText, pageWidth / 2, descriptionY, { align: "center" });
  }

  // Footer message
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(80, 80, 80);
  doc.text(
    "This certificate recognizes the successful completion of the course material and assessments.",
    pageWidth / 2,
    pageHeight - 30,
    { align: "center" }
  );

  // CodeQuest branding at bottom
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(25, 103, 210);
  doc.text("CodeQuest Learning Platform", pageWidth / 2, pageHeight - 18, {
    align: "center",
  });

  // Convert to buffer
  return Buffer.from(doc.output("arraybuffer"));
}

/**
 * Generate filename for certificate
 */
export function generateCertificateFileName(
  userName: string,
  courseTitle: string,
  serialNumber: string
): string {
  const sanitize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const timestamp = new Date().toISOString().split("T")[0];
  return `certificate-${sanitize(userName)}-${sanitize(
    courseTitle
  )}-${serialNumber}-${timestamp}.pdf`;
}
