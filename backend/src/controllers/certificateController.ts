import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
  getCertificateById,
  getUserCourseCertificate,
  createCertificate,
  getUserCertificates,
} from "../services/certificateService";
import {
  generateCertificatePDF,
  generateCertificateFileName,
} from "../services/pdfService";
import { supabaseAdmin } from "../config/database";

/**
 * Get a certificate by ID
 * GET /api/certificates/:id
 */
export async function getCertificateHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const certificate = await getCertificateById(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: "Certificate not found",
      });
    }

    // Transform to frontend-friendly format
    return res.json({
      success: true,
      data: {
        id: certificate.id,
        userId: certificate.user_id,
        courseId: certificate.course_id,
        serialNumber: certificate.serial_number,
        certificateUrl: certificate.certificate_url,
        issuedAt: certificate.issued_at,
        userName: certificate.user_name,
        courseTitle: certificate.course_title,
      },
    });
  } catch (error: any) {
    console.error("Error fetching certificate:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch certificate",
    });
  }
}

/**
 * Get user's certificate for a specific course
 * GET /api/certificates/course/:courseId
 */
export async function getCourseCertificateHandler(
  req: AuthRequest,
  res: Response
) {
  try {
    const user = req.user;
    const { courseId } = req.params;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const certificate = await getUserCourseCertificate(user.id, courseId);

    if (!certificate) {
      return res.json({
        success: true,
        data: null,
      });
    }

    return res.json({
      success: true,
      data: {
        id: certificate.id,
        userId: certificate.user_id,
        courseId: certificate.course_id,
        serialNumber: certificate.serial_number,
        certificateUrl: certificate.certificate_url,
        issuedAt: certificate.issued_at,
        userName: certificate.user_name,
        courseTitle: certificate.course_title,
      },
    });
  } catch (error: any) {
    console.error("Error fetching course certificate:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch certificate",
    });
  }
}

/**
 * Claim (create) a certificate for a completed course
 * POST /api/certificates/claim
 */
export async function claimCertificateHandler(req: AuthRequest, res: Response) {
  try {
    const user = req.user;
    const { courseId } = req.body;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        error: "Course ID is required",
      });
    }

    const certificate = await createCertificate(user.id, courseId);

    return res.status(201).json({
      success: true,
      data: {
        id: certificate.id,
        userId: certificate.user_id,
        courseId: certificate.course_id,
        serialNumber: certificate.serial_number,
        certificateUrl: certificate.certificate_url,
        issuedAt: certificate.issued_at,
        userName: certificate.user_name,
        courseTitle: certificate.course_title,
      },
    });
  } catch (error: any) {
    console.error("Error claiming certificate:", error);

    // Handle specific errors
    if (error.message.includes("not completed")) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    if (error.message.includes("already exists")) {
      return res.status(409).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to claim certificate",
    });
  }
}

/**
 * Get all certificates for the authenticated user
 * GET /api/certificates
 */
export async function getMyCertificatesHandler(
  req: AuthRequest,
  res: Response
) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const certificates = await getUserCertificates(user.id);

    return res.json({
      success: true,
      data: certificates.map((cert) => ({
        id: cert.id,
        userId: cert.user_id,
        courseId: cert.course_id,
        serialNumber: cert.serial_number,
        certificateUrl: cert.certificate_url,
        issuedAt: cert.issued_at,
        userName: cert.user_name,
        courseTitle: cert.course_title,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching certificates:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch certificates",
    });
  }
}

/**
 * Download certificate as PDF
 * GET /api/certificates/:id/download
 */
export async function downloadCertificatePDFHandler(
  req: AuthRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    const certificate = await getCertificateById(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: "Certificate not found",
      });
    }

    // Get course details for description
    const { data: course } = await supabaseAdmin
      .from("courses")
      .select("description")
      .eq("id", certificate.course_id)
      .single();

    // Generate PDF
    const pdfBuffer = await generateCertificatePDF({
      certificate,
      courseDescription: course?.description,
      completionDate: new Date(certificate.issued_at).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      ),
    });

    // Generate filename
    const filename = generateCertificateFileName(
      certificate.user_name,
      certificate.course_title,
      certificate.serial_number
    );

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    // Send PDF buffer
    return res.send(pdfBuffer);
  } catch (error: any) {
    console.error("Error downloading certificate PDF:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to download certificate",
    });
  }
}
