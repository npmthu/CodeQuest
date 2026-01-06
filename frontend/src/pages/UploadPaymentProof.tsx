import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
} from "../components/ui/dialog";
import {
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Image as ImageIcon,
  DollarSign,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import {
  subscriptionService,
  SubscriptionPlan,
} from "../services/subscription.service";

interface PaymentProof {
  id: string;
  plan_id: string;
  billing_cycle: string;
  amount: number;
  proof_image_url: string;
  payment_method?: string;
  transaction_id?: string;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  created_at: string;
  plan?: {
    name: string;
  };
}

export default function UploadPaymentProof() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPlanFromNav = location.state?.selectedPlan;

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);

  const [formData, setFormData] = useState({
    plan_id: selectedPlanFromNav?.id || "",
    billing_cycle: "monthly" as "monthly" | "yearly",
    payment_method: "",
    transaction_id: "",
    notes: "",
  });

  useEffect(() => {
    fetchPlans();
    fetchPaymentProofs();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await subscriptionService.getPlans();
      setPlans(data.filter((p) => p.is_active));
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load subscription plans");
    }
  };

  const fetchPaymentProofs = async () => {
    try {
      const data = await subscriptionService.getUserPaymentProofs();
      setPaymentProofs(data);
    } catch (error) {
      console.error("Error fetching payment proofs:", error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.plan_id) {
      toast.error("Please select a subscription plan");
      return;
    }

    if (!selectedImage) {
      toast.error("Please upload payment proof image");
      return;
    }

    // Check for pending proofs
    const hasPending = paymentProofs.some((p) => p.status === "pending");
    if (hasPending) {
      toast.error(
        "You already have a pending payment proof. Please wait for admin review."
      );
      return;
    }

    setUploading(true);
    try {
      // Upload image first
      toast.info("Uploading image...");
      const imageUrl = await subscriptionService.uploadImage(selectedImage);

      // Get selected plan
      const selectedPlan = plans.find((p) => p.id === formData.plan_id);
      if (!selectedPlan) {
        throw new Error("Invalid plan selected");
      }

      const amount =
        formData.billing_cycle === "yearly"
          ? selectedPlan.price_yearly || 0
          : selectedPlan.price_monthly || 0;

      // Submit payment proof
      toast.info("Submitting payment proof...");
      await subscriptionService.uploadPaymentProof({
        plan_id: formData.plan_id,
        billing_cycle: formData.billing_cycle,
        amount,
        proof_image_url: imageUrl,
        payment_method: formData.payment_method || undefined,
        transaction_id: formData.transaction_id || undefined,
        notes: formData.notes || undefined,
      });

      toast.success(
        "Payment proof submitted successfully! Please wait for admin verification."
      );

      // Reset form
      setFormData({
        plan_id: "",
        billing_cycle: "monthly",
        payment_method: "",
        transaction_id: "",
        notes: "",
      });
      setSelectedImage(null);
      setImagePreview("");

      // Refresh proofs
      await fetchPaymentProofs();
    } catch (error: any) {
      console.error("Error submitting payment proof:", error);
      toast.error(error.message || "Failed to submit payment proof");
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const selectedPlan = plans.find((p) => p.id === formData.plan_id);
  const amount = selectedPlan
    ? formData.billing_cycle === "yearly"
      ? selectedPlan.price_yearly
      : selectedPlan.price_monthly
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Upgrade Subscription
            </h1>
            <p className="text-gray-600">
              Upload payment proof for subscription upgrade
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Form */}
          <Card className="rounded-2xl border-gray-200">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Fill in the details and upload your payment proof
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Plan Selection */}
                <div className="space-y-2">
                  <Label htmlFor="plan">Subscription Plan *</Label>
                  <Select
                    value={formData.plan_id}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, plan_id: value })
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - ${plan.price_monthly}/mo
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Billing Cycle */}
                <div className="space-y-2">
                  <Label htmlFor="billing">Billing Cycle *</Label>
                  <Select
                    value={formData.billing_cycle}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, billing_cycle: value })
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Display */}
                {selectedPlan && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Total Amount:</span>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                        <span className="text-2xl font-bold text-blue-600">
                          {amount?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method (Optional)</Label>
                  <Input
                    id="method"
                    value={formData.payment_method}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment_method: e.target.value,
                      })
                    }
                    placeholder="e.g., Bank Transfer, PayPal, etc."
                    className="rounded-xl"
                  />
                </div>

                {/* Transaction ID */}
                <div className="space-y-2">
                  <Label htmlFor="txid">Transaction ID (Optional)</Label>
                  <Input
                    id="txid"
                    value={formData.transaction_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transaction_id: e.target.value,
                      })
                    }
                    placeholder="Transaction or reference number"
                    className="rounded-xl"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Any additional information..."
                    rows={3}
                    className="rounded-xl"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="proof">Payment Proof Image *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      id="proof"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="proof"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-48 rounded-lg"
                        />
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            Click to upload payment proof
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 5MB
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={uploading || !formData.plan_id || !selectedImage}
                  className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Submit Payment Proof
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card className="rounded-2xl border-gray-200">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                Your previous payment proof submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentProofs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No payment proofs yet</p>
                  </div>
                ) : (
                  paymentProofs.map((proof) => (
                    <Card
                      key={proof.id}
                      className="rounded-xl border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        setSelectedProof(proof);
                        setShowImageModal(true);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900">
                              {proof.plan?.name || "Unknown Plan"}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">
                              {proof.billing_cycle}
                            </p>
                          </div>
                          {getStatusBadge(proof.status)}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <DollarSign className="w-4 h-4" />
                            <span>${proof.amount.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(proof.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {proof.status === "rejected" &&
                          proof.rejection_reason && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-xs text-red-700">
                                <strong>Reason:</strong>{" "}
                                {proof.rejection_reason}
                              </p>
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment Proof Details</DialogTitle>
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
                  <p className="text-gray-600">Plan:</p>
                  <p className="font-medium">{selectedProof.plan?.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status:</p>
                  {getStatusBadge(selectedProof.status)}
                </div>
                <div>
                  <p className="text-gray-600">Amount:</p>
                  <p className="font-medium">
                    ${selectedProof.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Billing:</p>
                  <p className="font-medium capitalize">
                    {selectedProof.billing_cycle}
                  </p>
                </div>
                {selectedProof.payment_method && (
                  <div>
                    <p className="text-gray-600">Method:</p>
                    <p className="font-medium">
                      {selectedProof.payment_method}
                    </p>
                  </div>
                )}
                {selectedProof.transaction_id && (
                  <div>
                    <p className="text-gray-600">Transaction ID:</p>
                    <p className="font-medium text-xs">
                      {selectedProof.transaction_id}
                    </p>
                  </div>
                )}
                {selectedProof.notes && (
                  <div className="col-span-2">
                    <p className="text-gray-600">Notes:</p>
                    <p className="font-medium">{selectedProof.notes}</p>
                  </div>
                )}
                {selectedProof.rejection_reason && (
                  <div className="col-span-2">
                    <p className="text-gray-600">Rejection Reason:</p>
                    <p className="font-medium text-red-600">
                      {selectedProof.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
