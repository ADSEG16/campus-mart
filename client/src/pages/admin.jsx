import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  Flag,
  Info,
  LayoutDashboard,
  Megaphone,
  Menu,
  Search,
  ShieldBan,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  TrendingDown,
  Users,
  X,
  XCircle,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import { getApiBaseUrl, getStoredAuthToken } from "../api/http";
import {
  approveUserVerificationByAdmin,
  applyComplaintPenaltyByAdmin,
  getAdminNotifications,
  getCancellationsTrendAnalytics,
  getFlaggedUsers,
  getFlaggedUsersTrendAnalytics,
  getOrdersByStatusAnalytics,
  getReportedReviews,
  getRecentModerationActivity,
  getVerificationQueue,
  rejectUserVerificationByAdmin,
  removeListingByAdmin,
  resolveReviewReport,
  suspendUserByAdmin,
  getAllUsers,
} from "../api/admin";
import { fetchProducts } from "../api/products";
import { useToast } from "../context";

const sidebarItems = [
  { id: "overview", label: "Overview", description: "Health snapshot", icon: LayoutDashboard },
  { id: "notifications", label: "Alerts", description: "Priority notifications", icon: Bell },
  { id: "all-users", label: "All Users", description: "User management", icon: Users },
  { id: "verification", label: "Verification Queue", description: "Approve or reject", icon: ShieldCheck },
  { id: "users", label: "User Moderation", description: "Flagged users", icon: Users },
  { id: "reviews", label: "Review Reports", description: "Abuse moderation", icon: AlertTriangle },
  { id: "listings", label: "Listing Moderation", description: "Review items", icon: ShoppingBag },
  { id: "orders", label: "Orders & Trends", description: "Operational signals", icon: BarChart3 },
  { id: "activity", label: "Activity Log", description: "Recent moderation", icon: Activity },
  { id: "policy", label: "Policy Notes", description: "Recommended tasks", icon: FileText },
];

const policyFunctions = [
  "Review pending verification requests before students can access private campus features.",
  "Suspend or penalize users who repeatedly violate marketplace rules or receive complaints.",
  "Remove listings that are fraudulent, unsafe, or outside campus policy.",
  "Watch order status trends to spot cancellation spikes or support bottlenecks.",
  "Audit moderation actions so admins can trace what happened and when.",
  "Export operational data for reporting or escalation.",
];

const formatLabel = (value) => String(value || "").replace(/_/g, " ");

const formatDateTime = (value) => {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "pending") return "bg-amber-100 text-amber-800";
  if (normalized === "meetup_scheduled") return "bg-blue-100 text-blue-800";
  if (normalized === "delivered") return "bg-green-100 text-green-800";
  if (normalized === "cancelled") return "bg-red-100 text-red-800";
  return "bg-slate-100 text-slate-700";
};

const getCurrentUserSnapshot = () => {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || "{}");
  } catch {
    return {};
  }
};

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [actionLoadingKey, setActionLoadingKey] = useState("");
  const [verificationSearch, setVerificationSearch] = useState("");
  const [verificationRejectReason, setVerificationRejectReason] = useState("Missing or unclear student ID");
  const [moderationUserId, setModerationUserId] = useState("");
  const [suspensionReason, setSuspensionReason] = useState("Policy violation");
  const [complaintReason, setComplaintReason] = useState("Verified complaint from campus community");
  const [listingIdInput, setListingIdInput] = useState("");
  const [listingReason, setListingReason] = useState("Policy violation");
  const [listingSearch, setListingSearch] = useState("");
  const [listingsPage, setListingsPage] = useState(1);
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [flaggedUsers, setFlaggedUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [cancellationsTrend, setCancellationsTrend] = useState([]);
  const [flaggedTrend, setFlaggedTrend] = useState([]);
  const [activity, setActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reportedReviews, setReportedReviews] = useState([]);
  const [reportResolutionNote, setReportResolutionNote] = useState("Handled according to community policy");
  const [allUsers, setAllUsers] = useState([]);
  const [userCounts, setUserCounts] = useState({ total: 0, byRole: {}, byStatus: {} });
  const { showToast } = useToast();

  const currentUser = useMemo(() => getCurrentUserSnapshot(), []);
  const adminInitials = (currentUser?.fullName || "Admin")
    .split(" ")
    .slice(0, 2)
    .map((part) => part?.[0] || "")
    .join("")
    .toUpperCase() || "AD";

  const loadData = async ({ silent = false } = {}) => {
    const token = getStoredAuthToken();
    if (!token) {
      setErrorMessage("Please login again to access admin features.");
      setIsLoading(false);
      return;
    }

    if (!silent) {
      setIsLoading(true);
    }

    try {
      setErrorMessage("");
      const results = await Promise.allSettled([
        getVerificationQueue({ token }),
        getFlaggedUsers({ token }),
        getAdminNotifications({ token }),
        getReportedReviews({ token, status: "pending" }),
        fetchProducts(),
        getOrdersByStatusAnalytics({ token }),
        getCancellationsTrendAnalytics({ token, days: 7 }),
        getFlaggedUsersTrendAnalytics({ token, days: 7 }),
        getRecentModerationActivity({ token }),
        getAllUsers({ token }),
      ]);

      const failures = [];

      const [
        verificationResult,
        flaggedResult,
        notificationsResult,
        reportedReviewsResult,
        listingsResult,
        ordersResult,
        cancellationsResult,
        flaggedTrendResult,
        activityResult,
        allUsersResult,
      ] = results;

      if (verificationResult.status === "fulfilled") {
        setVerificationQueue(verificationResult.value);
      } else {
        failures.push("verification queue");
      }

      if (flaggedResult.status === "fulfilled") {
        setFlaggedUsers(flaggedResult.value);
      } else {
        failures.push("flagged users");
      }

      if (notificationsResult.status === "fulfilled") {
        setNotifications(notificationsResult.value);
      } else {
        failures.push("admin alerts");
      }

      if (reportedReviewsResult.status === "fulfilled") {
        setReportedReviews(reportedReviewsResult.value);
      } else {
        failures.push("review reports");
      }

      if (listingsResult.status === "fulfilled") {
        setListings(listingsResult.value);
      } else {
        failures.push("listings");
      }

      if (ordersResult.status === "fulfilled") {
        setOrdersByStatus(ordersResult.value);
      } else {
        failures.push("order analytics");
      }

      if (cancellationsResult.status === "fulfilled") {
        setCancellationsTrend(cancellationsResult.value);
      } else {
        failures.push("cancellation trend");
      }

      if (flaggedTrendResult.status === "fulfilled") {
        setFlaggedTrend(flaggedTrendResult.value);
      } else {
        failures.push("flagged-user trend");
      }

      if (activityResult.status === "fulfilled") {
        setActivity(activityResult.value);
      } else {
        failures.push("activity log");
      }

      if (allUsersResult.status === "fulfilled") {
        const response = allUsersResult.value;
        setAllUsers(response.data || response);
        if (response.extras?.userCounts) {
          setUserCounts(response.extras.userCounts);
        }
      } else {
        failures.push("all users");
      }

      if (failures.length > 0) {
        setErrorMessage(`Some admin widgets could not load: ${failures.join(", ")}.`);
      }
    } catch (error) {
      setErrorMessage(error.message || "Failed to load admin data");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const runAction = async ({ key, successMessage, errorMessage: fallbackMessage, handler }) => {
    setActionLoadingKey(key);
    try {
      await handler();
      showToast(successMessage, "success");
      await loadData({ silent: true });
    } catch (error) {
      showToast(error.message || fallbackMessage, "error");
    } finally {
      setActionLoadingKey("");
    }
  };

  const handleApproveVerification = async (userId) => {
    await runAction({
      key: `verify:${userId}`,
      successMessage: "Verification approved.",
      errorMessage: "Failed to approve verification.",
      handler: async () => approveUserVerificationByAdmin({ token: getStoredAuthToken(), userId }),
    });
  };

  const handleRejectVerification = async (userId) => {
    await runAction({
      key: `reject:${userId}`,
      successMessage: "Verification rejected.",
      errorMessage: "Failed to reject verification.",
      handler: async () => rejectUserVerificationByAdmin({
        token: getStoredAuthToken(),
        userId,
        reason: verificationRejectReason.trim(),
      }),
    });
  };

  const handleSuspend = async () => {
    const userId = moderationUserId.trim();
    if (!userId) {
      showToast("Enter a user ID to suspend.", "error");
      return;
    }

    await runAction({
      key: `suspend:${userId}`,
      successMessage: "User suspended.",
      errorMessage: "Failed to suspend user.",
      handler: async () => suspendUserByAdmin({
        token: getStoredAuthToken(),
        userId,
        reason: suspensionReason.trim(),
      }),
    });
  };

  const handleComplaintPenalty = async () => {
    const userId = moderationUserId.trim();
    if (!userId) {
      showToast("Enter a user ID for the complaint penalty.", "error");
      return;
    }

    await runAction({
      key: `complaint:${userId}`,
      successMessage: "Complaint penalty applied.",
      errorMessage: "Failed to apply complaint penalty.",
      handler: async () => applyComplaintPenaltyByAdmin({
        token: getStoredAuthToken(),
        userId,
        reason: complaintReason.trim(),
      }),
    });
  };

  const handleRemoveListing = async () => {
    const listingId = listingIdInput.trim();
    if (!listingId) {
      showToast("Enter a listing ID to remove.", "error");
      return;
    }

    await runAction({
      key: `listing:${listingId}`,
      successMessage: "Listing removed.",
      errorMessage: "Failed to remove listing.",
      handler: async () => removeListingByAdmin({
        token: getStoredAuthToken(),
        listingId,
        reason: listingReason.trim(),
      }),
    });
  };

  const handleResolveReviewReport = async (reviewId, action) => {
    await runAction({
      key: `review:${reviewId}:${action}`,
      successMessage: `Review report ${action}.`,
      errorMessage: "Failed to resolve review report.",
      handler: async () => resolveReviewReport({
        token: getStoredAuthToken(),
        reviewId,
        action,
        adminNote: reportResolutionNote.trim(),
      }),
    });
  };

  const handleExportCsv = async (reportKey) => {
    try {
      const token = getStoredAuthToken();
      if (!token) {
        showToast("Please login again.", "error");
        return;
      }

      const exportMap = {
        orders: {
          path: "/admin/analytics/orders-by-status/export.csv",
          filename: "orders-by-status.csv",
        },
        flaggedUsers: {
          path: "/admin/analytics/flagged-users/export.csv",
          filename: "flagged-users.csv",
        },
        reviewReports: {
          path: "/admin/analytics/review-reports/export.csv",
          filename: "review-reports.csv",
        },
        activity: {
          path: "/admin/analytics/moderation-activity/export.csv",
          filename: "moderation-activity.csv",
        },
      };

      const selected = exportMap[reportKey] || exportMap.orders;

      const response = await fetch(`${getApiBaseUrl()}${selected.path}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to export CSV");
      }

      const csv = await response.text();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = selected.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      showToast(`${selected.filename} downloaded.`, "success");
    } catch (error) {
      showToast(error.message || "Failed to export CSV.", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const filteredVerificationQueue = verificationQueue.filter((user) => {
    const search = verificationSearch.trim().toLowerCase();
    if (!search) return true;
    return [user?.fullName, user?.email, user?.department, user?._id]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(search));
  });

  const LISTINGS_PAGE_SIZE = 8;
  const normalizedListingSearch = listingSearch.trim().toLowerCase();
  const filteredListings = listings.filter((listing) => {
    if (!normalizedListingSearch) return true;
    return [listing?.title, listing?.category, listing?.id]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedListingSearch));
  });

  const totalListingPages = Math.max(
    Math.ceil(filteredListings.length / LISTINGS_PAGE_SIZE),
    1
  );
  const safeListingsPage = Math.min(Math.max(listingsPage, 1), totalListingPages);
  const pagedListings = filteredListings.slice(
    (safeListingsPage - 1) * LISTINGS_PAGE_SIZE,
    safeListingsPage * LISTINGS_PAGE_SIZE
  );

  useEffect(() => {
    setListingsPage(1);
  }, [normalizedListingSearch]);

  useEffect(() => {
    if (listingsPage > totalListingPages) {
      setListingsPage(totalListingPages);
    }
  }, [listingsPage, totalListingPages]);

  const totalOrders = ordersByStatus.reduce((sum, row) => sum + Number(row.count || 0), 0);
  const pendingOrders = ordersByStatus.find((row) => String(row.status).toLowerCase() === "pending")?.count || 0;
  const cancelledOrders = ordersByStatus.find((row) => String(row.status).toLowerCase() === "cancelled")?.count || 0;
  const maxTrendCount = Math.max(
    ...cancellationsTrend.map((row) => Number(row.count || 0)),
    ...flaggedTrend.map((row) => Number(row.count || 0)),
    1
  );

  const renderSidebar = () => (
    <nav className="space-y-2 px-4 pb-4">
      {sidebarItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setActiveTab(item.id);
              setMobileMenuOpen(false);
            }}
            className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors bg-white ${
              isActive
                ? "border-blue-300 text-blue-700 shadow-sm"
                : "border-slate-200 text-slate-700 hover:border-blue-200 hover:bg-blue-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`rounded-xl p-2 ${isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold">{item.label}</p>
                <p className={`text-xs ${isActive ? "text-blue-600" : "text-slate-500"}`}>{item.description}</p>
              </div>
            </div>
          </button>
        );
      })}

      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-left text-rose-700 transition-colors hover:bg-rose-100"
      >
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-rose-100 p-2 text-rose-700">
            <LogOut className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold">Logout</p>
            <p className="text-xs text-rose-600">Exit admin workspace</p>
          </div>
        </div>
      </button>
    </nav>
  );

  const renderTopCards = () => {
    const cards = [
      { label: "Verification queue", value: verificationQueue.length, hint: "Students awaiting access", icon: ShieldCheck, tone: "from-cyan-500 to-blue-500" },
      { label: "Flagged users", value: flaggedUsers.length, hint: "Needs moderation", icon: Flag, tone: "from-amber-500 to-orange-500" },
      { label: "Listings", value: listings.length, hint: "Marketplace inventory", icon: ShoppingBag, tone: "from-emerald-500 to-teal-500" },
      { label: "Orders", value: totalOrders, hint: `${pendingOrders} pending, ${cancelledOrders} cancelled`, icon: BarChart3, tone: "from-violet-500 to-fuchsia-500" },
      { 
        label: "Total Users", 
        value: userCounts.total, 
        hint: Object.entries(userCounts.byRole || {}).map(([role, count]) => `${count} ${role}`).join(", ") || "No users",
        icon: Users,
        tone: "from-indigo-500 to-purple-500"
      },
    ];

    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className={`h-1 bg-linear-to-r ${card.tone}`} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{card.label}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
                    <p className="mt-1 text-sm text-slate-500">{card.hint}</p>
                  </div>
                  <span className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {renderTopCards()}

      {notifications.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-cyan-600" />
            <h2 className="text-lg font-semibold text-slate-900">Priority alerts</h2>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {notifications.slice(0, 6).map((note) => (
              <button
                key={note.id}
                type="button"
                onClick={() => setActiveTab(note.targetTab || "notifications")}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left hover:bg-slate-100"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">{note.severity || "info"}</p>
                <p className="mt-1 font-semibold text-slate-900">{note.title}</p>
                <p className="mt-1 text-sm text-slate-600">{note.message}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* <section className="xl:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-600">Why this admin exists</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Operational controls for CampusMart</h2>
            </div>
            <Info className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            The admin console is for marketplace trust, safety, and moderation. It should let a verified admin quickly
            review student verification, moderate flagged users, remove unsafe listings, and watch order health.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {/* {policyFunctions.map((point) => (
              <div key={point} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="mt-0.5 rounded-full bg-cyan-100 p-1.5 text-cyan-700">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <p className="text-sm leading-6 text-slate-700">{point}</p>
              </div>
            ))} *
          </div>
        </section> */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Megaphone className="h-5 w-5 text-cyan-600" />
            <h3 className="text-lg font-semibold text-slate-900">Admin shortcuts</h3>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <button type="button" onClick={() => setActiveTab("verification")} className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-left hover:bg-slate-100">
              Review verification queue <ChevronRight className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setActiveTab("users")} className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-left hover:bg-slate-100">
              Moderate flagged users <ChevronRight className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setActiveTab("listings")} className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-left hover:bg-slate-100">
              Remove bad listings <ChevronRight className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setActiveTab("activity")} className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-left hover:bg-slate-100">
              Inspect moderation log <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-cyan-600" />
        <h2 className="text-xl font-semibold text-slate-900">Admin notifications</h2>
      </div>
      <p className="mt-2 text-sm text-slate-500">Actionable alerts generated from verification, reports, and trust risk signals.</p>

      <div className="mt-4 space-y-3">
        {notifications.map((note) => (
          <button
            type="button"
            key={note.id}
            onClick={() => setActiveTab(note.targetTab || "overview")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left hover:bg-slate-100"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-slate-900">{note.title}</p>
              <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
                {note.severity || "info"}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{note.message}</p>
          </button>
        ))}
        {notifications.length === 0 && <p className="text-sm text-slate-500">No notifications right now.</p>}
      </div>
    </section>
  );

  const renderReviewReports = () => (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <h2 className="text-xl font-semibold text-slate-900">Abusive review reports</h2>
        </div>
        <p className="mt-2 text-sm text-slate-500">Review and resolve abuse reports submitted by users.</p>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700">Resolution note</label>
          <input
            value={reportResolutionNote}
            onChange={(event) => setReportResolutionNote(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500"
          />
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {reportedReviews.map((review) => (
          <section key={review._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">Pending report</p>
                <p className="mt-1 font-semibold text-slate-900">Rating: {review.rating}/5</p>
                <p className="text-sm text-slate-500">Review ID: {review._id}</p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                {review?.report?.status || "pending"}
              </span>
            </div>

            <p className="mt-3 text-sm text-slate-700">{review.comment || "No comment provided."}</p>

            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-800">Reason:</span> {review?.report?.reason || "Not provided"}</p>
              <p className="mt-1"><span className="font-semibold text-slate-800">Reported by:</span> {review?.report?.reportedBy?.fullName || review?.report?.reportedBy?.email || "Unknown"}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleResolveReviewReport(review._id, "actioned")}
                disabled={actionLoadingKey === `review:${review._id}:actioned`}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
              >
                <ShieldBan className="h-4 w-4" />
                Take action
              </button>
              <button
                type="button"
                onClick={() => handleResolveReviewReport(review._id, "dismissed")}
                disabled={actionLoadingKey === `review:${review._id}:dismissed`}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />
                Dismiss report
              </button>
            </div>
          </section>
        ))}
      </div>

      {reportedReviews.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No pending abusive-review reports.
        </div>
      )}
    </div>
  );

  const renderVerification = () => (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Verification queue</h2>
          <p className="text-sm text-slate-500">Approve students with valid documents. Reject only with a clear reason.</p>
        </div>
        <div className="w-full sm:w-80">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={verificationSearch}
              onChange={(event) => setVerificationSearch(event.target.value)}
              placeholder="Search name, email, department, or ID"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {filteredVerificationQueue.map((user) => (
          <div key={user._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-slate-900">{user.fullName}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
                <p className="text-sm text-slate-500">{user.department} • {user.graduationYear}</p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                Pending
              </span>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Trust score</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{user.trustScore}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Submitted</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{formatDateTime(user.createdAt)}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <p className="font-medium text-slate-900">Student ID</p>
              <p className="break-all">{user.studentIdUrl || "No document attached"}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleApproveVerification(user._id)}
                disabled={actionLoadingKey === `verify:${user._id}`}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => handleRejectVerification(user._id)}
                disabled={actionLoadingKey === `reject:${user._id}`}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>
              <button
                type="button"
                onClick={() => setModerationUserId(user._id)}
                className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Use in moderation
              </button>
            </div>
          </div>
        ))}

        {filteredVerificationQueue.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 xl:col-span-2">
            No pending verification requests match your search.
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block text-sm font-medium text-slate-700">Reject reason</label>
        <textarea
          value={verificationRejectReason}
          onChange={(event) => setVerificationRejectReason(event.target.value)}
          rows={3}
          className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500"
        />
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldBan className="h-5 w-5 text-rose-600" />
          <h2 className="text-xl font-semibold text-slate-900">User moderation</h2>
        </div>
        <p className="mt-2 text-sm text-slate-500">Suspend users or apply complaint penalties when reports are confirmed.</p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">User ID</label>
            <input
              value={moderationUserId}
              onChange={(event) => setModerationUserId(event.target.value)}
              placeholder="Paste a user ID or pick from the flagged list"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Suspension reason</label>
            <input
              value={suspensionReason}
              onChange={(event) => setSuspensionReason(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Complaint reason</label>
            <input
              value={complaintReason}
              onChange={(event) => setComplaintReason(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSuspend}
            disabled={actionLoadingKey.startsWith("suspend:")}
            className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
          >
            <ShieldBan className="h-4 w-4" />
            Suspend
          </button>
          <button
            type="button"
            onClick={handleComplaintPenalty}
            disabled={actionLoadingKey.startsWith("complaint:")}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60"
          >
            <AlertTriangle className="h-4 w-4" />
            Apply penalty
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Flag className="h-5 w-5 text-amber-600" />
          <h3 className="text-xl font-semibold text-slate-900">Flagged users</h3>
        </div>
        <p className="mt-2 text-sm text-slate-500">Quick-select a flagged user to moderate them faster.</p>

        <div className="mt-4 space-y-3">
          {flaggedUsers.map((user) => (
            <button
              type="button"
              key={user._id}
              onClick={() => setModerationUserId(user._id)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left hover:bg-slate-100"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{user.email}</p>
                  <p className="text-xs text-slate-500">ID: {user._id}</p>
                </div>
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                  Flagged
                </span>
              </div>
            </button>
          ))}
          {flaggedUsers.length === 0 && <p className="text-sm text-slate-500">No flagged users at the moment.</p>}
        </div>
      </section>
    </div>
  );

  const renderListings = () => (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-1">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-cyan-600" />
          <h2 className="text-xl font-semibold text-slate-900">Listing moderation</h2>
        </div>
        <p className="mt-2 text-sm text-slate-500">Remove listings that are unsafe, fraudulent, or not campus compliant.</p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Listing ID</label>
            <input
              value={listingIdInput}
              onChange={(event) => setListingIdInput(event.target.value)}
              placeholder="Paste a listing ID or select from the list"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Removal reason</label>
            <input
              value={listingReason}
              onChange={(event) => setListingReason(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleRemoveListing}
          disabled={actionLoadingKey.startsWith("listing:")}
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4" />
          Remove listing
        </button>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">Quick-select listings</h3>
        <p className="mt-2 text-sm text-slate-500">Use this panel to populate the listing form fast.</p>

        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={listingSearch}
              onChange={(event) => setListingSearch(event.target.value)}
              placeholder="Search listing name, category, or ID"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {pagedListings.map((listing) => (
            <button
              key={listing.id}
              type="button"
              onClick={() => setListingIdInput(listing.id)}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left hover:bg-slate-100"
            >
              <p className="line-clamp-1 font-semibold text-slate-900">{listing.title}</p>
              <p className="mt-1 text-xs text-slate-500">{listing.category} • {listing.condition}</p>
              <p className="mt-1 text-xs text-slate-500">ID: {listing.id}</p>
            </button>
          ))}
          {filteredListings.length === 0 && (
            <p className="text-sm text-slate-500">No listings match your search.</p>
          )}
        </div>

        {filteredListings.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
            <p>
              Showing {(safeListingsPage - 1) * LISTINGS_PAGE_SIZE + 1}
              -{Math.min(safeListingsPage * LISTINGS_PAGE_SIZE, filteredListings.length)} of {filteredListings.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setListingsPage((prev) => Math.max(prev - 1, 1))}
                disabled={safeListingsPage <= 1}
                className="rounded-xl border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-slate-500">
                Page {safeListingsPage} of {totalListingPages}
              </span>
              <button
                type="button"
                onClick={() => setListingsPage((prev) => Math.min(prev + 1, totalListingPages))}
                disabled={safeListingsPage >= totalListingPages}
                className="rounded-xl border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Order status analytics</h2>
          <p className="text-sm text-slate-500">Track the state of market activity and identify operational patterns.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleExportCsv("orders")}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Orders CSV
          </button>
          <button
            type="button"
            onClick={() => handleExportCsv("flaggedUsers")}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Flagged Users CSV
          </button>
          <button
            type="button"
            onClick={() => handleExportCsv("reviewReports")}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Review Reports CSV
          </button>
          <button
            type="button"
            onClick={() => handleExportCsv("activity")}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Activity CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ordersByStatus.map((row) => (
          <div key={row.status} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{formatLabel(row.status)}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{row.count}</p>
            <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(row.status)}`}>
              {formatLabel(row.status)}
            </span>
          </div>
        ))}
        {ordersByStatus.length === 0 && <p className="text-sm text-slate-500">No order analytics available.</p>}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-rose-600" />
            <h3 className="text-lg font-semibold text-slate-900">Cancellation trend</h3>
          </div>
          <div className="mt-4 space-y-3">
            {cancellationsTrend.map((row) => (
              <div key={row.date} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{row.date}</span>
                  <span className="font-semibold text-slate-900">{row.count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-rose-500" style={{ width: `${Math.max((row.count / maxTrendCount) * 100, 6)}%` }} />
                </div>
              </div>
            ))}
            {cancellationsTrend.length === 0 && <p className="text-sm text-slate-500">No cancellations recorded in this range.</p>}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-slate-900">Flagged-user trend</h3>
          </div>
          <div className="mt-4 space-y-3">
            {flaggedTrend.map((row) => (
              <div key={row.date} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{row.date}</span>
                  <span className="font-semibold text-slate-900">{row.count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-amber-500" style={{ width: `${Math.max((row.count / maxTrendCount) * 100, 6)}%` }} />
                </div>
              </div>
            ))}
            {flaggedTrend.length === 0 && <p className="text-sm text-slate-500">No flagged-user growth recorded in this range.</p>}
          </div>
        </section>
      </div>
    </div>
  );

  const renderActivity = () => (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Clock3 className="h-5 w-5 text-cyan-600" />
        <h2 className="text-xl font-semibold text-slate-900">Recent moderation activity</h2>
      </div>
      <p className="mt-2 text-sm text-slate-500">Every moderation action should be auditable.</p>

      <div className="mt-4 space-y-3">
        {activity.map((entry) => (
          <div key={`${entry._id || entry.createdAt}-${entry.eventType}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{formatLabel(entry.eventType)}</p>
                <p className="text-sm text-slate-500">
                  Actor: {entry.actorId?.fullName || entry.actorId?.email || "Campus admin"} • {formatDateTime(entry.createdAt)}
                </p>
              </div>
              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                {entry.entityType}
              </span>
            </div>
            {entry.payload?.reason && (
              <p className="mt-3 text-sm text-slate-600">Reason: {entry.payload.reason}</p>
            )}
          </div>
        ))}
        {activity.length === 0 && <p className="text-sm text-slate-500">No moderation activity yet.</p>}
      </div>
    </section>
  );

  const renderPolicy = () => (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Info className="h-5 w-5 text-cyan-600" />
        <h2 className="text-xl font-semibold text-slate-900">Admin functions</h2>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        For a campus marketplace admin, focus on trust, safety, and operational oversight rather than general content management.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {policyFunctions.map((point, index) => (
          <div key={point} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-sm font-semibold text-cyan-700">
              {index + 1}
            </span>
            <p className="text-sm leading-6 text-slate-700">{point}</p>
          </div>
        ))}
      </div>
    </section>
  );

  const renderAllUsers = () => (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-cyan-600" />
          <h2 className="text-xl font-semibold text-slate-900">All registered users</h2>
        </div>
        <span className="rounded-full bg-cyan-100 px-3 py-1 text-sm font-semibold text-cyan-700">
          {userCounts.total || allUsers.length} total
        </span>
      </div>
      
      {allUsers.length === 0 ? (
        <p className="text-sm text-slate-500">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Role</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Trust Score</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Joined</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user) => {
                const status = user.flagged ? "flagged" : (user.verificationStatus || "unverified");
                const statusColor = user.flagged 
                  ? "bg-red-100 text-red-800"
                  : status === "verified" ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800";
                
                return (
                  <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">{user.fullName || "-"}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                        {user.role || "student"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{user.trustScore || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor}`}>
                        {formatLabel(status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDateTime(user.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  const renderContent = () => {
    if (activeTab === "overview") return renderOverview();
    if (activeTab === "notifications") return renderNotifications();
    if (activeTab === "all-users") return renderAllUsers();
    if (activeTab === "verification") return renderVerification();
    if (activeTab === "users") return renderUsers();
    if (activeTab === "reviews") return renderReviewReports();
    if (activeTab === "listings") return renderListings();
    if (activeTab === "orders") return renderOrders();
    if (activeTab === "activity") return renderActivity();
    return renderPolicy();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col border-r border-slate-200 bg-white text-slate-900 shadow-[8px_0_30px_rgba(15,23,42,0.04)]">
        <div className="border-b border-slate-200 p-6">
          <BrandLogo to="/marketplace" compact />
          <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold shadow-sm">
                {adminInitials}
              </div>
              <div>
                <p className="font-semibold">{currentUser?.fullName || "Admin"}</p>
                <p className="text-xs text-slate-600">Verified admin workspace</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          {renderSidebar()}
        </div>
        <div className="border-t border-slate-200 p-4 text-xs text-slate-500">
          Admin-only controls. 
        </div>
      </aside>

      <div className="lg:pl-80">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center text-slate-700 hover:bg-slate-100 lg:hidden"
                aria-label="Open admin menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-600">Admin dashboard</p>
                <h1 className="text-lg font-bold sm:text-2xl">CampusMart operations</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/marketplace"
                className="hidden rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:inline-flex"
              >
                View marketplace
              </Link>
              <button
                type="button"
                onClick={() => {
                  setRefreshing(true);
                  loadData({ silent: true });
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
              >
                <Activity className="h-4 w-4" />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
          {errorMessage && (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
              Loading admin dashboard...
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close admin menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[86vw] max-w-sm overflow-y-auto bg-white text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <BrandLogo to="/marketplace" compact />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-600 hover:bg-slate-100"
                aria-label="Close admin menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">{renderSidebar()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
