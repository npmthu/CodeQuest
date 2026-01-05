import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Users,
  Crown,
  Loader2,
  Check,
  X,
  AlertCircle,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "../../services/api";

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price_monthly: number;
  price_yearly?: number;
  features: Record<string, any>;
  is_active: boolean;
  user_limit?: number;
  created_at: string;
}

interface UserSubscription {
  id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  plan_id: string;
  plan_name?: string;
  status: "active" | "inactive" | "canceled" | "expired" | "past_due";
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

interface ValidationError {
  field: string;
  message: string;
}

export default function SubscriptionManagement() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"plans" | "users">("plans");

  // Modal states
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeletePlanModal, setShowDeletePlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [selectedSubscription, setSelectedSubscription] =
    useState<UserSubscription | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price_monthly: "",
    price_yearly: "",
    is_active: true,
    features: {
      maxNotes: 100,
      aiMindmap: true,
      aiGeneration: true,
    },
  });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchPlans();
    fetchSubscriptions();
  }, []);

  // Refetch subscriptions when status filter changes
  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter]);

  const fetchPlans = async () => {
    try {
      const response = await adminApi.getPlans();
      if (response.success && response.data) {
        setPlans(response.data);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load subscription plans");
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllSubscriptions(
        statusFilter !== "all" ? statusFilter : undefined
      );
      if (response.success && response.data) {
        setSubscriptions(response.data);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  // TC-09-03: Validate plan data
  const validatePlanData = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Name validation
    if (!formData.name.trim()) {
      errors.push({ field: "name", message: "Plan name is required." });
    } else if (
      plans.some(
        (p: SubscriptionPlan) =>
          p.name.toLowerCase() === formData.name.toLowerCase() &&
          p.id !== selectedPlan?.id
      )
    ) {
      errors.push({ field: "name", message: "Plan name already exists." });
    }

    // Slug validation
    if (!formData.slug.trim()) {
      errors.push({ field: "slug", message: "Slug is required." });
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.push({
        field: "slug",
        message: "Slug must be lowercase letters, numbers, and hyphens only.",
      });
    } else if (
      plans.some(
        (p: SubscriptionPlan) =>
          p.slug === formData.slug && p.id !== selectedPlan?.id
      )
    ) {
      errors.push({ field: "slug", message: "Slug already exists." });
    }

    // Price validation
    const priceMonthly = parseFloat(formData.price_monthly);
    if (isNaN(priceMonthly)) {
      errors.push({
        field: "price_monthly",
        message: "Monthly price is required.",
      });
    } else if (priceMonthly < 0) {
      errors.push({
        field: "price_monthly",
        message: "Price must be a positive number.",
      });
    }

    if (formData.price_yearly) {
      const priceYearly = parseFloat(formData.price_yearly);
      if (isNaN(priceYearly) || priceYearly < 0) {
        errors.push({
          field: "price_yearly",
          message: "Yearly price must be a positive number.",
        });
      }
    }

    return errors;
  };

  // TC-09-01: Create new plan
  const handleCreatePlan = async () => {
    const errors = validatePlanData();
    setValidationErrors(errors);

    if (errors.length > 0) {
      toast.error("Please fix validation errors before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const planData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        price_monthly: parseFloat(formData.price_monthly),
        price_yearly: formData.price_yearly
          ? parseFloat(formData.price_yearly)
          : null,
        is_active: formData.is_active,
        features: formData.features,
      };

      const response = await adminApi.createPlan(planData);

      if (response.success) {
        toast.success(`New tier '${formData.name}' created successfully`);
        setShowCreatePlanModal(false);
        resetForm();
        await fetchPlans();
      } else {
        if (response.error?.includes("already exists")) {
          setValidationErrors([
            { field: "slug", message: "Plan name already exists." },
          ]);
        }
        toast.error(response.error || "Failed to create plan");
      }
    } catch (error: any) {
      console.error("Error creating plan:", error);
      toast.error(error.message || "Failed to create subscription plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  // TC-09-02: Cancel user subscription
  const handleCancelSubscription = async () => {
    if (!selectedSubscription) return;

    // TC-09-04: Check if subscription is already expired
    const periodEnd = new Date(selectedSubscription.current_period_end);
    if (periodEnd < new Date() || selectedSubscription.status === "expired") {
      toast.error("Cannot cancel a subscription that is already expired");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await adminApi.cancelUserSubscription(
        selectedSubscription.user_id,
        cancelReason
      );

      if (response.success) {
        toast.success("Subscription cancelled successfully");
        setShowCancelModal(false);
        setCancelReason("");
        setSelectedSubscription(null);
        await fetchSubscriptions();
      } else {
        if (response.error?.includes("already expired")) {
          toast.error("Cannot cancel a subscription that is already expired");
        } else {
          toast.error(response.error || "Failed to cancel subscription");
        }
      }
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      toast.error(error.message || "Failed to cancel subscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePlan = async () => {
    if (!selectedPlan) return;

    const errors = validatePlanData();
    setValidationErrors(errors);

    if (errors.length > 0) {
      toast.error("Please fix validation errors before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price_monthly: parseFloat(formData.price_monthly),
        price_yearly: formData.price_yearly
          ? parseFloat(formData.price_yearly)
          : null,
        is_active: formData.is_active,
        features: formData.features,
      };

      const response = await adminApi.updatePlan(selectedPlan.id, updateData);

      if (response.success) {
        toast.success("Subscription plan updated successfully");
        setShowEditPlanModal(false);
        setSelectedPlan(null);
        resetForm();
        await fetchPlans();
      } else {
        toast.error(response.error || "Failed to update plan");
      }
    } catch (error: any) {
      console.error("Error updating plan:", error);
      toast.error(error.message || "Failed to update subscription plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      price_monthly: "",
      price_yearly: "",
      is_active: true,
      features: {
        maxNotes: 100,
        aiMindmap: true,
        aiGeneration: true,
      },
    });
    setValidationErrors([]);
  };

  const openEditModal = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || "",
      price_monthly: plan.price_monthly.toString(),
      price_yearly: plan.price_yearly?.toString() || "",
      is_active: plan.is_active,
      features: plan.features || {
        maxNotes: 100,
        aiMindmap: true,
        aiGeneration: true,
      },
    });
    setValidationErrors([]);
    setShowEditPlanModal(true);
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;

    setIsSubmitting(true);
    try {
      const response = await adminApi.deletePlan(selectedPlan.id);

      if (response.success) {
        toast.success(`Plan '${selectedPlan.name}' deleted successfully`);
        setShowDeletePlanModal(false);
        setSelectedPlan(null);
        await fetchPlans();
      } else {
        toast.error(response.error || "Failed to delete plan");
      }
    } catch (error: any) {
      console.error("Error deleting plan:", error);
      toast.error(error.message || "Failed to delete subscription plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeletePlanModal = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowDeletePlanModal(true);
  };

  const openCancelModal = (subscription: UserSubscription) => {
    // TC-09-04: Check if subscription is already expired before showing modal
    const periodEnd = new Date(subscription.current_period_end);
    if (periodEnd < new Date() || subscription.status === "expired") {
      toast.error("Cannot cancel a subscription that is already expired");
      return;
    }

    if (subscription.cancel_at_period_end) {
      toast.error("Subscription is already scheduled for cancellation");
      return;
    }

    setSelectedSubscription(subscription);
    setShowCancelModal(true);
  };

  const getFieldError = (field: string) => {
    return validationErrors.find((e: ValidationError) => e.field === field)
      ?.message;
  };

  const getStatusBadge = (subscription: UserSubscription) => {
    const periodEnd = new Date(subscription.current_period_end);
    const isExpired = periodEnd < new Date();

    if (isExpired || subscription.status === "expired") {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
          Expired
        </Badge>
      );
    }
    if (subscription.cancel_at_period_end) {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-700">
          Canceled
        </Badge>
      );
    }
    if (subscription.status === "active") {
      return <Badge className="bg-green-100 text-green-700">Active</Badge>;
    }
    if (subscription.status === "inactive") {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
          Inactive
        </Badge>
      );
    }
    return <Badge variant="secondary">{subscription.status}</Badge>;
  };

  // TC-09-04: Check if cancel button should be disabled
  const isCancelDisabled = (subscription: UserSubscription) => {
    const periodEnd = new Date(subscription.current_period_end);
    const isExpired =
      periodEnd < new Date() || subscription.status === "expired";
    return isExpired || subscription.cancel_at_period_end;
  };

  const filteredSubscriptions = subscriptions.filter(
    (sub: UserSubscription) => {
      const matchesSearch =
        sub.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.user_name?.toLowerCase().includes(searchTerm.toLowerCase());

      if (statusFilter === "all") return matchesSearch;
      if (statusFilter === "active")
        return (
          matchesSearch && sub.status === "active" && !sub.cancel_at_period_end
        );
      if (statusFilter === "inactive")
        return matchesSearch && sub.status === "inactive";
      if (statusFilter === "canceled")
        return matchesSearch && sub.cancel_at_period_end;
      if (statusFilter === "expired") {
        const periodEnd = new Date(sub.current_period_end);
        return (
          matchesSearch && (periodEnd < new Date() || sub.status === "expired")
        );
      }
      return matchesSearch;
    }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Subscription Management
          </h1>
          <p className="text-gray-500">
            Manage subscription tiers and user subscriptions
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("plans")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "plans"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Crown className="w-4 h-4 inline mr-2" />
          Subscription Tiers
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "users"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          User Subscriptions
        </button>
      </div>

      {/* Plans Tab */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                resetForm();
                setShowCreatePlanModal(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Tier
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan: SubscriptionPlan) => (
              <Card
                key={plan.id}
                className={`relative ${!plan.is_active ? "opacity-60" : ""}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <Badge variant={plan.is_active ? "default" : "secondary"}>
                      {plan.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">
                        ${plan.price_monthly}
                      </span>
                      <span className="text-gray-500">/month</span>
                    </div>
                    {plan.price_yearly && (
                      <p className="text-sm text-gray-500">
                        ${plan.price_yearly}/year
                      </p>
                    )}
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium mb-2">Features:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {Object.entries(plan.features || {})
                          .slice(0, 4)
                          .map(([key, value]) => (
                            <li key={key} className="flex items-center gap-2">
                              {typeof value === "boolean" ? (
                                value ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <X className="w-4 h-4 text-red-500" />
                                )
                              ) : (
                                <Check className="w-4 h-4 text-green-500" />
                              )}
                              <span>
                                {key}:{" "}
                                {typeof value === "boolean"
                                  ? value
                                    ? "Yes"
                                    : "No"
                                  : value}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(plan)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeletePlanModal(plan)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Search and Filter */}
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Subscriptions Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Period End</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      No subscriptions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {sub.user_name || "Unknown"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {sub.user_email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{sub.plan_name || "N/A"}</TableCell>
                      <TableCell>{getStatusBadge(sub)}</TableCell>
                      <TableCell>
                        {new Date(sub.current_period_end).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openCancelModal(sub)}
                          disabled={isCancelDisabled(sub)}
                          title={
                            isCancelDisabled(sub)
                              ? "Cannot cancel expired or already canceled subscription"
                              : "Cancel subscription"
                          }
                        >
                          Cancel
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Create Plan Modal - TC-09-01 */}
      <Dialog open={showCreatePlanModal} onOpenChange={setShowCreatePlanModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Tier</DialogTitle>
            <DialogDescription>
              Add a new subscription tier to the platform
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tier Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Premium"
                className={getFieldError("name") ? "border-red-500" : ""}
              />
              {getFieldError("name") && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {getFieldError("name")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slug: e.target.value.toLowerCase(),
                  })
                }
                placeholder="e.g., individual-premium"
                className={getFieldError("slug") ? "border-red-500" : ""}
              />
              {getFieldError("slug") && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {getFieldError("slug")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_monthly">Price (Monthly) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="price_monthly"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price_monthly}
                  onChange={(e) =>
                    setFormData({ ...formData, price_monthly: e.target.value })
                  }
                  placeholder="39.00"
                  className={`pl-10 ${
                    getFieldError("price_monthly") ? "border-red-500" : ""
                  }`}
                />
              </div>
              {getFieldError("price_monthly") && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {getFieldError("price_monthly")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_yearly">Price (Yearly)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="price_yearly"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price_yearly}
                  onChange={(e) =>
                    setFormData({ ...formData, price_yearly: e.target.value })
                  }
                  placeholder="300.00"
                  className={`pl-10 ${
                    getFieldError("price_yearly") ? "border-red-500" : ""
                  }`}
                />
              </div>
              {getFieldError("price_yearly") && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {getFieldError("price_yearly")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Full access to the entire content library..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Status</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {formData.is_active ? "Active" : "Inactive"}
                </span>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreatePlanModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreatePlan} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Modal */}
      <Dialog open={showEditPlanModal} onOpenChange={setShowEditPlanModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Tier</DialogTitle>
            <DialogDescription>
              Update subscription tier details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tier Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={getFieldError("name") ? "border-red-500" : ""}
              />
              {getFieldError("name") && (
                <p className="text-sm text-red-500">{getFieldError("name")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (Monthly) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price_monthly}
                  onChange={(e) =>
                    setFormData({ ...formData, price_monthly: e.target.value })
                  }
                  className={`pl-10 ${
                    getFieldError("price_monthly") ? "border-red-500" : ""
                  }`}
                />
              </div>
              {getFieldError("price_monthly") && (
                <p className="text-sm text-red-500">
                  {getFieldError("price_monthly")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price-yearly">Price (Yearly)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="edit-price-yearly"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price_yearly}
                  onChange={(e) =>
                    setFormData({ ...formData, price_yearly: e.target.value })
                  }
                  placeholder="300.00"
                  className={`pl-10 ${
                    getFieldError("price_yearly") ? "border-red-500" : ""
                  }`}
                />
              </div>
              {getFieldError("price_yearly") && (
                <p className="text-sm text-red-500">
                  {getFieldError("price_yearly")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {formData.is_active ? "Active" : "Inactive"}
                </span>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditPlanModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdatePlan} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Modal - TC-09-02 */}
      <AlertDialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this user's subscription?
              {selectedSubscription && (
                <span className="block mt-2 font-medium">
                  User:{" "}
                  {selectedSubscription.user_name ||
                    selectedSubscription.user_email}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-4">
            <Label htmlFor="cancel-reason">
              Cancellation Reason (optional)
            </Label>
            <Textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              className="mt-2"
              rows={3}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setCancelReason("");
                setSelectedSubscription(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Plan Confirmation Modal */}
      <AlertDialog
        open={showDeletePlanModal}
        onOpenChange={setShowDeletePlanModal}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subscription Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this subscription plan? This
              action cannot be undone.
              {selectedPlan && (
                <span className="block mt-2 font-medium text-red-600">
                  Plan: {selectedPlan.name}
                </span>
              )}
              <span className="block mt-2 text-sm text-gray-600">
                Note: Plans with active subscriptions cannot be deleted.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setSelectedPlan(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlan}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Plan"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
