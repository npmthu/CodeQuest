import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Upload,
  Calendar,
  Clock,
  DollarSign,
  User,
  BookOpen,
  Loader2,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

interface InterviewSession {
  id: string;
  instructor_id: string;
  title: string;
  description: string;
  topic: string;
  difficulty_level: string;
  session_date: string;
  duration_minutes: number;
  price: number;
  max_slots: number;
  slots_available: number;
  session_link?: string;
  requirements?: string;
  status: string;
  instructor?: {
    display_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface BookingFormData {
  notes: string;
  payment_method: "credit_card" | "bank_transfer";
}

export default function BookInterview() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState<BookingFormData>({
    notes: "",
    payment_method: "bank_transfer",
  });

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  useEffect(() => {
    console.log("💬 Payment Modal State:", showPaymentModal);
  }, [showPaymentModal]);

  const fetchSession = async () => {
    try {
      setLoading(true);

      // Get token from Supabase
      const { supabase } = await import("../../lib/supabaseClient");
      const {
        data: { session: authSession },
      } = await supabase.auth.getSession();
      const token = authSession?.access_token;

      console.log("🔑 Using token for API call:", {
        hasToken: !!token,
        tokenLength: token?.length,
        sessionId,
      });

      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE || "http://localhost:3000/api"
        }/mock-interviews/sessions/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("📦 Session Data Received:", data);
      if (data.success) {
        console.log("✅ Session loaded:", data.data);
        console.log("👤 Instructor data:", data.data?.instructor);
        setSession(data.data);
      } else {
        console.error("❌ Failed to load session:", data.error);
        toast.error(data.error || "Failed to load session");
      }
    } catch (error) {
      console.error("Error fetching session:", error);
      toast.error("Failed to load interview session");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBookNow = () => {
    console.log("🎯 Book Now clicked");

    if (!user) {
      console.log("❌ User not logged in");
      toast.error("Please login to book an interview");
      navigate("/login");
      return;
    }

    if (!session) {
      console.log("❌ Session not found");
      return;
    }

    if (session.slots_available <= 0) {
      console.log("❌ No slots available");
      toast.error("No slots available for this session");
      return;
    }

    // Check if session is at least 3 hours away
    const sessionDate = new Date(session.session_date);
    const now = new Date();
    const hoursDiff =
      (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    console.log(`⏰ Hours until session: ${hoursDiff.toFixed(2)}`);

    if (hoursDiff < 3) {
      console.log("❌ Session too soon (less than 3 hours)");
      toast.error("Cannot book sessions with less than 3 hours notice");
      return;
    }

    console.log("✅ Opening payment modal...");
    setShowPaymentModal(true);
  };

  const handleSubmitBooking = async () => {
    if (!session || !user) return;

    // Validate payment method
    if (formData.payment_method === "bank_transfer" && !selectedImage) {
      toast.error("Please upload payment proof for bank transfer");
      return;
    }

    setBooking(true);
    try {
      // Get token from Supabase
      const { supabase } = await import("../../lib/supabaseClient");
      const {
        data: { session: authSession },
      } = await supabase.auth.getSession();
      const token = authSession?.access_token;

      if (!token) {
        toast.error("Authentication required. Please login again.");
        navigate("/login");
        return;
      }

      let paymentProofUrl = "";

      // Upload payment proof if bank transfer
      if (formData.payment_method === "bank_transfer" && selectedImage) {
        toast.info("Uploading payment proof...");

        try {
          // Upload directly to Supabase Storage
          const { supabase } = await import("../../lib/supabaseClient");
          const fileExt = selectedImage.name.split(".").pop();
          const fileName = `interview-payment-${
            user.id
          }-${Date.now()}.${fileExt}`;
          const filePath = `interview-payments/${fileName}`;

          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("payment-proofs")
              .upload(filePath, selectedImage, {
                cacheControl: "3600",
                upsert: false,
              });

          if (uploadError) {
            console.error("❌ Upload error:", uploadError);
            throw new Error(
              uploadError.message || "Failed to upload payment proof"
            );
          }

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from("payment-proofs").getPublicUrl(filePath);

          paymentProofUrl = publicUrl;
          console.log("✅ Uploaded payment proof:", paymentProofUrl);
        } catch (uploadError: any) {
          console.error("❌ Upload failed:", uploadError);
          throw new Error(
            uploadError.message || "Failed to upload payment proof"
          );
        }
      }

      // Create booking
      toast.info("Creating booking...");
      const bookingResponse = await fetch(
        `${
          import.meta.env.VITE_API_BASE || "http://localhost:3000/api"
        }/mock-interviews/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            session_id: session.id,
            notes: formData.notes || undefined,
            payment_method: formData.payment_method,
            payment_proof_url: paymentProofUrl || undefined,
          }),
        }
      );

      console.log("📥 Booking Response Status:", bookingResponse.status);
      const responseText = await bookingResponse.text();
      console.log("📥 Booking Response Text:", responseText);

      let bookingData;
      try {
        bookingData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ Failed to parse response as JSON:", responseText);
        throw new Error(
          "Server returned invalid response. Please check backend logs."
        );
      }

      if (!bookingData.success) {
        throw new Error(bookingData.error || "Failed to create booking");
      }

      toast.success(
        formData.payment_method === "bank_transfer"
          ? "Booking created! Waiting for payment verification."
          : "Booking created successfully!"
      );

      setShowPaymentModal(false);

      // Navigate to bookings page
      setTimeout(() => {
        navigate("/my-interviews");
      }, 1500);
    } catch (error: any) {
      console.error("Error creating booking:", error);
      toast.error(error.message || "Failed to create booking");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Session Not Found</h3>
              <p className="text-gray-600 mb-4">
                The interview session you're looking for doesn't exist.
              </p>
              <Button onClick={() => navigate("/mock-interviews")}>
                Browse Sessions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sessionDate = new Date(session.session_date);
  const formattedDate = sessionDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = sessionDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/mock-interviews")}
          className="mb-6"
        >
          ← Back to Sessions
        </Button>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Session Details */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{session.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {session.description}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      session.difficulty_level === "beginner"
                        ? "default"
                        : session.difficulty_level === "intermediate"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {session.difficulty_level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-5 h-5" />
                  <span>
                    <strong>Instructor:</strong>{" "}
                    {session.instructor?.display_name || "Expert Instructor"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <BookOpen className="w-5 h-5" />
                  <span>
                    <strong>Topic:</strong> {session.topic}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-5 h-5" />
                  <span>
                    <strong>Date:</strong> {formattedDate}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-5 h-5" />
                  <span>
                    <strong>Time:</strong> {formattedTime} (
                    {session.duration_minutes} minutes)
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="w-5 h-5" />
                  <span>
                    <strong>Price:</strong> ${session.price.toFixed(2)}
                  </span>
                </div>

                {session.requirements && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">Requirements:</h4>
                    <p className="text-gray-600">{session.requirements}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Card */}
          <div className="md:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Book This Session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    ${session.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {session.duration_minutes} minute session
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Slots Available:</span>
                  <span className="font-semibold">
                    {session.slots_available} / {session.max_slots}
                  </span>
                </div>

                <Button
                  onClick={handleBookNow}
                  disabled={session.slots_available <= 0}
                  className="w-full"
                  size="lg"
                >
                  {session.slots_available <= 0 ? "Fully Booked" : "Book Now"}
                </Button>

                {session.slots_available > 0 &&
                  session.slots_available <= 3 && (
                    <p className="text-xs text-orange-600 text-center">
                      ⚠️ Only {session.slots_available} slot
                      {session.slots_available > 1 ? "s" : ""} left!
                    </p>
                  )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Complete Your Booking</DialogTitle>
            <DialogDescription>
              Choose your payment method and confirm your booking
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-4 overflow-y-auto flex-1">
            {/* Left Column - Payment Details */}
            <div className="space-y-6">
              {/* Payment Method Selection */}
              <div>
                <Label>Payment Method</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value: "credit_card" | "bank_transfer") =>
                    setFormData({ ...formData, payment_method: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Bank Transfer (Manual Verification)
                      </div>
                    </SelectItem>
                    <SelectItem value="credit_card">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Credit Card (Stripe - Test Mode)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bank Transfer Instructions */}
              {formData.payment_method === "bank_transfer" && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Bank Transfer Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <strong>Bank:</strong> CodeQuest Bank
                    </div>
                    <div>
                      <strong>Account Number:</strong> 1234567890
                    </div>
                    <div>
                      <strong>Account Name:</strong> CodeQuest Platform
                    </div>
                    <div>
                      <strong>Amount:</strong> ${session?.price.toFixed(2)}
                    </div>
                    <div className="pt-2 text-orange-600">
                      ⚠️ Please include your email in the transfer description
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Upload Payment Proof (Bank Transfer) */}
              {formData.payment_method === "bank_transfer" && (
                <div>
                  <Label>Upload Payment Proof *</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview}
                          alt="Payment proof"
                          className="max-h-64 mx-auto rounded"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview("");
                          }}
                        >
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="payment-proof-upload"
                        />
                        <label
                          htmlFor="payment-proof-upload"
                          className="cursor-pointer"
                        >
                          <Button type="button" variant="outline" asChild>
                            <span>Select Image</span>
                          </Button>
                        </label>
                        <p className="text-sm text-gray-500 mt-2">
                          PNG, JPG up to 5MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Credit Card Info (Test Mode) */}
              {formData.payment_method === "credit_card" && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <strong>Test Mode:</strong> This is a demo. No real
                        charges will be made. Use test card: 4242 4242 4242 4242
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requirements or questions for the instructor..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>

            {/* Right Column - Booking Summary */}
            <div className="md:border-l md:pl-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Session:</span>
                    <span className="font-semibold">{session?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-semibold">{formattedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-semibold">{formattedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-semibold">
                      {session?.duration_minutes} minutes
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">
                      ${session?.price.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-white mt-auto flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
              disabled={booking}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitBooking} disabled={booking}>
              {booking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Booking
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
