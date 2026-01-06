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
} from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "../../services/api";

interface PaymentProof {
  id: string;
  user_id: string;
  plan_id: string;
  billing_cycle: string;
  amount: number;
  proof_image_url: string;
  payment_method?: string;
  transaction_id?: string;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
  user?: {
    email: string;
    display_name: string;
    avatar_url?: string;
  };
  plan?: {
    name: string;
    slug: string;
    price_monthly: number;
    price_yearly: number;
  };
  reviewer?: {
    email: string;
    display_name: string;
  };
}

export default function PaymentVerification() {
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProofs();
  }, [activeTab]);

  const fetchProofs = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getPaymentProofs(
        activeTab === "all" ? undefined : activeTab
      );
      if (response.success && response.data) {
        setProofs(response.data);
      }
    } catch (error) {
      console.error("Error fetching payment proofs:", error);
      toast.error("Failed to load payment proofs");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (proof: PaymentProof) => {
    if (
      !confirm(
        `Approve payment for ${proof.user?.display_name || proof.user?.email}?`
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await adminApi.approvePaymentProof(proof.id);
      if (response.success) {
        toast.success("Payment approved! User subscription upgraded.");
        await fetchProofs();
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
    if (!selectedProof || !rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await adminApi.rejectPaymentProof(
        selectedProof.id,
        rejectReason
      );
      if (response.success) {
        toast.success("Payment proof rejected");
        setShowRejectModal(false);
        setRejectReason("");
        setSelectedProof(null);
        await fetchProofs();
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

  const openRejectModal = (proof: PaymentProof) => {
    setSelectedProof(proof);
    setShowRejectModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const pendingCount = proofs.filter((p) => p.status === "pending").length;
  const approvedCount = proofs.filter((p) => p.status === "approved").length;
  const rejectedCount = proofs.filter((p) => p.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Payment Verification
          </h1>
          <p className="text-gray-500">
            Review and approve payment proofs from users
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                <p className="text-2xl text-gray-900">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved</p>
                <p className="text-2xl text-gray-900">{approvedCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rejected</p>
                <p className="text-2xl text-gray-900">{rejectedCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-white border border-gray-200 p-1 rounded-xl">
          <TabsTrigger value="pending" className="rounded-lg">
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="approved" className="rounded-lg">
            Approved ({approvedCount})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-lg">
            Rejected ({rejectedCount})
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-lg">
            All
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card className="rounded-2xl border-gray-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Info</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : proofs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      No payment proofs found
                    </TableCell>
                  </TableRow>
                ) : (
                  proofs.map((proof) => (
                    <TableRow key={proof.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {proof.user?.avatar_url ? (
                            <img
                              src={proof.user.avatar_url}
                              alt={proof.user.display_name}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {proof.user?.display_name || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {proof.user?.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{proof.plan?.name}</p>
                          <p className="text-xs text-gray-500 capitalize">
                            {proof.billing_cycle}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">
                            {proof.amount.toFixed(2)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {proof.payment_method && (
                            <p className="text-gray-600">
                              Method: {proof.payment_method}
                            </p>
                          )}
                          {proof.transaction_id && (
                            <p className="text-xs text-gray-500">
                              TxID: {proof.transaction_id}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(proof.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(proof.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => {
                              setSelectedProof(proof);
                              setShowImageModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {proof.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="rounded-xl bg-green-600 hover:bg-green-700"
                                onClick={() => handleApprove(proof)}
                                disabled={isSubmitting}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="rounded-xl"
                                onClick={() => openRejectModal(proof)}
                                disabled={isSubmitting}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
          </DialogHeader>
          {selectedProof && (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-xl p-4">
                <img
                  src={selectedProof.proof_image_url}
                  alt="Payment Proof"
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">User:</p>
                  <p className="font-medium">
                    {selectedProof.user?.display_name ||
                      selectedProof.user?.email}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Plan:</p>
                  <p className="font-medium">{selectedProof.plan?.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Amount:</p>
                  <p className="font-medium">
                    ${selectedProof.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Billing Cycle:</p>
                  <p className="font-medium capitalize">
                    {selectedProof.billing_cycle}
                  </p>
                </div>
                {selectedProof.notes && (
                  <div className="col-span-2">
                    <p className="text-gray-600">Notes:</p>
                    <p className="font-medium">{selectedProof.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment Proof</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Rejection</Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a reason..."
                rows={4}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason("");
                setSelectedProof(null);
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
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
