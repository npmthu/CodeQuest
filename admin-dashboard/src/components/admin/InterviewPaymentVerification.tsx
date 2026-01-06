import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Loader2,
  DollarSign,
  Calendar,
  User,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "../../services/api";

interface InterviewBooking {
  id: string;
  session_id: string;
  learner_id: string;
  booking_status: string;
  payment_status: "pending" | "paid" | "refunded" | "failed";
  payment_amount: number;
  payment_method?: string;
  payment_proof_url?: string;
  booked_at: string;
  confirmed_at?: string;
  notes?: string;
  learner?: {
    email: string;
    display_name: string;
    avatar_url?: string;
  };
  session?: {
    title: string;
    topic: string;
    session_date: string;
    duration_minutes: number;
    instructor_id: string;
  };
  payment_verified_at?: string;
  payment_verified_by?: string;
  rejection_reason?: string;
}

export default function InterviewPaymentVerification() {
  const [bookings, setBookings] = useState<InterviewBooking[]>([]);
  const [allBookings, setAllBookings] = useState<InterviewBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedBooking, setSelectedBooking] =
    useState<InterviewBooking | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      // Fetch all bookings for revenue calculation
      const allResponse = await adminApi.getInterviewBookings();
      if (allResponse.success && allResponse.data) {
        setAllBookings(allResponse.data);
      }

      // Fetch filtered bookings for current tab
      const response = await adminApi.getInterviewBookings(
        activeTab === "all" ? undefined : activeTab
      );
      if (response.success && response.data) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error("Error fetching interview bookings:", error);
      toast.error("Failed to load interview bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (booking: InterviewBooking) => {
    if (!confirm(`Approve payment for booking ${booking.id}?`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await adminApi.approveInterviewPayment(booking.id);
      if (response.success) {
        toast.success("Payment approved successfully!");
        await fetchBookings();
      } else {
        toast.error(response.error || "Failed to approve payment");
      }
    } catch (error: any) {
      console.error("Error approving payment:", error);
      toast.error(error.message || "Failed to approve payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedBooking) return;

    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await adminApi.rejectInterviewPayment(
        selectedBooking.id,
        rejectReason
      );
      if (response.success) {
        toast.success("Payment rejected");
        setShowRejectModal(false);
        setRejectReason("");
        setSelectedBooking(null);
        await fetchBookings();
      } else {
        toast.error(response.error || "Failed to reject payment");
      }
    } catch (error: any) {
      console.error("Error rejecting payment:", error);
      toast.error(error.message || "Failed to reject payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRejectModal = (booking: InterviewBooking) => {
    setSelectedBooking(booking);
    setShowRejectModal(true);
  };

  const openImageModal = (booking: InterviewBooking) => {
    setSelectedBooking(booking);
    setShowImageModal(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      pending: "secondary",
      paid: "default",
      refunded: "outline",
      failed: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getBookingStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      pending: "secondary",
      confirmed: "default",
      cancelled: "destructive",
      completed: "outline",
      no_show: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const pendingCount = bookings.filter(
    (b) => b.payment_status === "pending"
  ).length;
  const paidCount = bookings.filter((b) => b.payment_status === "paid").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Interview Payment Verification</h1>
        <p className="text-gray-600 mt-2">
          Review and approve payment proofs for mock interview bookings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Verified
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Bookings
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {allBookings
                .filter((b) => b.payment_status === "paid")
                .reduce((sum, b) => sum + (b.payment_amount || 0), 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending {pendingCount > 0 && `(${pendingCount})`}
          </TabsTrigger>
          <TabsTrigger value="paid">Verified</TabsTrigger>
          <TabsTrigger value="failed">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : bookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No bookings found</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Learner</TableHead>
                      <TableHead>Session</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Booking Status</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium">
                                {booking.learner?.display_name || "N/A"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {booking.learner?.email || "N/A"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {booking.session?.title || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {booking.session?.topic || "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {booking.session?.session_date
                              ? new Date(
                                  booking.session.session_date
                                ).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-medium">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            {booking.payment_amount?.toFixed(2) || "0.00"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {booking.payment_method || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getBookingStatusBadge(booking.booking_status)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(booking.payment_status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {booking.payment_proof_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openImageModal(booking)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            )}
                            {booking.payment_status === "pending" && (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleApprove(booking)}
                                  disabled={isSubmitting}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => openRejectModal(booking)}
                                  disabled={isSubmitting}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <div>
                  <strong>Learner:</strong>{" "}
                  {selectedBooking.learner?.display_name || "N/A"}
                </div>
                <div>
                  <strong>Session:</strong>{" "}
                  {selectedBooking.session?.title || "N/A"}
                </div>
                <div>
                  <strong>Amount:</strong> $
                  {selectedBooking.payment_amount?.toFixed(2) || "0.00"}
                </div>
                <div>
                  <strong>Payment Method:</strong>{" "}
                  {selectedBooking.payment_method || "N/A"}
                </div>
                {selectedBooking.notes && (
                  <div>
                    <strong>Notes:</strong> {selectedBooking.notes}
                  </div>
                )}
              </div>
              {selectedBooking.payment_proof_url && (
                <div className="border rounded-lg p-2">
                  <img
                    src={selectedBooking.payment_proof_url}
                    alt="Payment proof"
                    className="w-full h-auto rounded"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Rejection Reason *</Label>
              <Textarea
                id="reject-reason"
                placeholder="Explain why this payment is being rejected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
            {selectedBooking && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                <p>
                  <strong>Learner:</strong>{" "}
                  {selectedBooking.learner?.display_name}
                </p>
                <p>
                  <strong>Amount:</strong> $
                  {selectedBooking.payment_amount?.toFixed(2)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason("");
                setSelectedBooking(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isSubmitting || !rejectReason.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
