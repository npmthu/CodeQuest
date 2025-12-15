import { useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  ArrowLeft,
  Download,
  Share2,
  Award,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useCertificate } from "../hooks/useApi";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function CertificatePage() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const navigate = useNavigate();
  const certificateRef = useRef<HTMLDivElement>(null);

  const {
    data: certificate,
    isLoading,
    error,
  } = useCertificate(certificateId || "");

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`certificate-${certificate?.serialNumber || "download"}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `I just earned my ${certificate?.courseTitle} certificate from CodeQuest! 🎉`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My CodeQuest Certificate",
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        alert("Link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <Card className="p-8 text-center max-w-md">
          <Award className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Certificate Not Found</h2>
          <p className="text-gray-600 mb-6">
            The certificate you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button onClick={() => navigate("/courses")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 py-8 px-4">
      {/* Action Bar */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="hover:bg-white/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleShare}
            className="bg-white hover:bg-gray-50"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            onClick={handleDownloadPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Certificate Display */}
      <div className="max-w-5xl mx-auto">
        <div
          ref={certificateRef}
          className="bg-white rounded-lg shadow-2xl overflow-hidden"
        >
          {/* Certificate Border Frame */}
          <div className="p-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500">
            <div className="p-2 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 rounded">
              <div className="bg-white rounded">
                {/* Certificate Content */}
                <div className="p-12 md:p-16 text-center relative">
                  {/* Corner Decorations */}
                  <div className="absolute top-4 left-4 w-20 h-20 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                  <div className="absolute top-4 right-4 w-20 h-20 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                  <div className="absolute bottom-4 left-4 w-20 h-20 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                  <div className="absolute bottom-4 right-4 w-20 h-20 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

                  {/* Logo/Icon */}
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg">
                      <Award className="w-10 h-10 text-white" />
                    </div>
                  </div>

                  {/* Header */}
                  <div className="mb-8">
                    <h1
                      className="text-4xl md:text-5xl font-bold text-gray-800 mb-2"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      Certificate of Completion
                    </h1>
                    <div className="w-40 h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 mx-auto rounded" />
                  </div>

                  {/* Subtitle */}
                  <p className="text-lg text-gray-600 mb-4">
                    This is to certify that
                  </p>

                  {/* User Name */}
                  <h2
                    className="text-4xl md:text-5xl font-bold text-blue-700 mb-4"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {certificate.userName}
                  </h2>

                  {/* Completion Text */}
                  <p className="text-lg text-gray-600 mb-4">
                    has successfully completed the course
                  </p>

                  {/* Course Title */}
                  <h3
                    className="text-2xl md:text-3xl font-semibold text-gray-800 mb-8"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    "{certificate.courseTitle}"
                  </h3>

                  {/* Verification Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full mb-8">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-medium">
                      Verified Certificate
                    </span>
                  </div>

                  {/* Footer Info */}
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-gray-600 mt-8 pt-8 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Issue Date</p>
                      <p className="font-semibold text-gray-800">
                        {formatDate(certificate.issuedAt)}
                      </p>
                    </div>
                    <div className="hidden md:block w-px h-12 bg-gray-300" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Certificate ID
                      </p>
                      <p className="font-mono font-semibold text-gray-800">
                        {certificate.serialNumber}
                      </p>
                    </div>
                  </div>

                  {/* CodeQuest Branding */}
                  <div className="mt-8 pt-6">
                    <p className="text-lg font-bold text-gray-800">CodeQuest</p>
                    <p className="text-sm text-gray-500">
                      Learn. Code. Conquer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <Card className="mt-6 p-6 bg-white">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">About this Certificate</h4>
              <p className="text-sm text-gray-600">
                This certificate verifies that you have successfully completed
                all lessons and requirements for the "{certificate.courseTitle}"
                course on CodeQuest. This certificate can be shared with
                employers and on professional networks to showcase your skills.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
