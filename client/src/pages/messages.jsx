import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Search, Shield, MessageSquare, Clock3, Flag, X, AlertTriangle, ChevronLeft } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/navbar";
import { getStoredAuthToken } from "../api/http";
import { confirmOrderDelivery, listOrders, updateOrderStatus } from "../api/orders";
import { getConversationMessages, getConversations, startConversation } from "../api/conversations";
import { getSocket, onSocketMessage } from "../api/socket";
import { reportUser } from "../api/user";

const getInitials = (name) =>
  String(name || "Campus User")
    .split(" ")
    .slice(0, 2)
    .map((part) => part?.[0] || "")
    .join("")
    .toUpperCase() || "CU";

const toSafeDate = (value) => {
  const date = new Date(value || Date.now());
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const formatRelativeTime = (value) => {
  const date = toSafeDate(value);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.max(Math.floor(diffMs / 60000), 1);

  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatBubbleTime = (value) => {
  return toSafeDate(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toChatMessage = (message) => ({
  id: String(message?._id || message?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
  type: "text",
  senderId: String(message?.senderId || ""),
  text: String(message?.text || ""),
  createdAt: message?.createdAt || new Date().toISOString(),
  status: message?.status || "sent",
});

const getConversationThreadKey = (conversation) =>
  String(conversation?.orderId || conversation?.conversationId || "");

export default function Messages() {
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [conversations, setConversations] = useState([]);
  const [threadsByOrder, setThreadsByOrder] = useState({});
  const [activeOrderId, setActiveOrderId] = useState("");
  const [isConfirmingReceipt, setIsConfirmingReceipt] = useState(false);
  const [receiptNotice, setReceiptNotice] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportNotice, setReportNotice] = useState("");
  const [reportError, setReportError] = useState("");
  const [reportedUserIds, setReportedUserIds] = useState([]);
  const [isSettingMeetupSpot, setIsSettingMeetupSpot] = useState(false);
  const [isScreenVisible, setIsScreenVisible] = useState(
    typeof document !== "undefined" ? document.visibilityState === "visible" : true
  );
  const [isMobileViewport, setIsMobileViewport] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const socketRef = useRef(null);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "{}");
    } catch {
      return {};
    }
  }, []);

  const requestedConversationId = searchParams.get("conversation") || "";
  const requestedOrderId = searchParams.get("order") || "";
  const requestedProductId = searchParams.get("product") || "";
  const requestedChatId = searchParams.get("chat") || "";

  useEffect(() => {
    const loadConversations = async () => {
      const authToken = getStoredAuthToken();
      if (!authToken) {
        setErrorMessage("Please login to access messages.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        const [loadedConversations, orders] = await Promise.all([
          getConversations({ token: authToken }),
          listOrders({ token: authToken }),
        ]);

        const productLookup = new Map();
        orders.forEach((order) => {
          const product = order?.items?.[0]?.productId;
          const productId = String(product?._id || "");

          if (productId && !productLookup.has(productId)) {
            productLookup.set(productId, product);
          }
        });

        const normalizedConversations = loadedConversations
          .map((conversation) => {
            const participants = Array.isArray(conversation?.participants) ? conversation.participants : [];
            const otherParticipant = participants.find((participant) => String(participant?._id || participant) !== String(currentUser?._id || ""));
            const product = conversation?.productId || conversation?.orderId?.items?.[0]?.productId || null;
            const resolvedProduct = product?.title ? product : productLookup.get(String(product?._id || "")) || null;
            const order = conversation?.orderId || null;

            return {
              id: String(conversation?._id || conversation?.id || ""),
              counterpartId: String(otherParticipant?._id || otherParticipant || ""),
              counterpartName: otherParticipant?.fullName || otherParticipant?.email || "Campus User",
              counterpartInitials: getInitials(otherParticipant?.fullName || otherParticipant?.email || "Campus User"),
              counterpartImage: otherParticipant?.profileImageUrl || "",
              verified: Boolean(otherParticipant?.emailVerified),
              isCurrentUserSeller: String(order?.sellerId?._id || order?.sellerId || "") === String(currentUser?._id || ""),
              buyerConfirmed: Boolean(order?.buyerConfirmed),
              sellerConfirmed: Boolean(order?.sellerConfirmed),
              orderStatus: String(order?.status || "pending").toLowerCase(),
              lastActivity: conversation?.updatedAt || conversation?.createdAt || new Date().toISOString(),
              lastMessage: conversation?.lastMessage?.text || "No messages yet",
              product: {
                id: String(resolvedProduct?._id || product?._id || ""),
                title: String(resolvedProduct?.title || product?.title || "Listing unavailable"),
                image: resolvedProduct?.images?.[0]?.url || "",
                price: Number(order?.totalAmount || resolvedProduct?.price || 0),
              },
              orderId: String(order?._id || conversation?.orderId?._id || conversation?.orderId || ""),
              conversationId: String(conversation?._id || conversation?.id || ""),
            };
          })
          .filter((conversation) => Boolean(conversation.counterpartId && conversation.conversationId))
          .sort((a, b) => toSafeDate(b.lastActivity).getTime() - toSafeDate(a.lastActivity).getTime());

        let preferredConversation =
          normalizedConversations.find((conversation) => conversation.conversationId === requestedConversationId) ||
          normalizedConversations.find((conversation) => conversation.orderId === requestedOrderId) ||
          normalizedConversations.find((conversation) => conversation.product.id === requestedProductId) ||
          normalizedConversations.find((conversation) => conversation.counterpartId === requestedChatId) ||
          normalizedConversations[0] ||
          null;

        if (!preferredConversation && requestedProductId && requestedChatId) {
          const room = await startConversation({
            token: authToken,
            recipientId: requestedChatId,
            productId: requestedProductId,
            orderId: requestedOrderId || null,
          });

          if (room?._id || room?.id) {
            const resolvedProduct = productLookup.get(String(requestedProductId)) || null;
            preferredConversation = {
              id: String(room?._id || room?.id),
              counterpartId: requestedChatId,
              counterpartName: room?.participants?.find ? "Campus User" : "Campus User",
              counterpartInitials: "CU",
              counterpartImage: "",
              verified: false,
              isCurrentUserSeller: false,
              buyerConfirmed: false,
              sellerConfirmed: false,
              orderStatus: "pending",
              lastActivity: new Date().toISOString(),
              lastMessage: "No messages yet",
              product: {
                id: String(resolvedProduct?._id || requestedProductId),
                title: String(resolvedProduct?.title || "Listing unavailable"),
                image: resolvedProduct?.images?.[0]?.url || "",
                price: Number(resolvedProduct?.price || 0),
              },
              orderId: String(requestedOrderId || ""),
              conversationId: String(room?._id || room?.id || ""),
            };
            normalizedConversations.unshift(preferredConversation);
          }
        }

        setConversations(normalizedConversations);
        setActiveOrderId(preferredConversation?.orderId || preferredConversation?.conversationId || "");
      } catch (error) {
        setErrorMessage(error.message || "Failed to load conversations");
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [currentUser?._id, requestedConversationId, requestedOrderId, requestedProductId, requestedChatId]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobileViewport(mobile);
      if (!mobile) {
        setIsMobileChatOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsScreenVisible(document.visibilityState === "visible");
    };

    const handleWindowFocus = () => setIsScreenVisible(true);
    const handleWindowBlur = () => setIsScreenVisible(false);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  const filteredConversations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return conversations;

    return conversations.filter((conversation) =>
      [conversation.counterpartName, conversation.product.title, conversation.orderStatus]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [conversations, searchTerm]);

  const activeConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.conversationId === activeOrderId || conversation.orderId === activeOrderId
      ) || null,
    [conversations, activeOrderId]
  );

  const activeMessages = useMemo(() => {
    if (!activeConversation) return [];
    return threadsByOrder[getConversationThreadKey(activeConversation)] || [];
  }, [threadsByOrder, activeConversation]);

  const conversationById = useMemo(() => {
    return new Map(
      conversations
        .filter((conversation) => Boolean(conversation.conversationId))
        .map((conversation) => [String(conversation.conversationId), conversation])
    );
  }, [conversations]);

  const loadMessagesForConversation = useMemo(
    () => async (conversation) => {
      if (!conversation?.conversationId) return;

      const token = getStoredAuthToken();
      if (!token) return;

      try {
        const backendMessages = await getConversationMessages({
          token,
          conversationId: conversation.conversationId,
        });

        const threadKey = getConversationThreadKey(conversation);

        setThreadsByOrder((prev) => ({
          ...prev,
          [threadKey]: backendMessages.map(toChatMessage),
        }));
      } catch {
        // Keep existing local thread state when history fails.
      }
    },
    []
  );

  const activeConversationId = activeConversation?.conversationId || "";
  const activeConversationOrderId = activeConversation?.orderId || "";

  useEffect(() => {
    const token = getStoredAuthToken();
    if (!token) return;

    socketRef.current = getSocket(token);

    const unsubscribe = onSocketMessage((payload) => {
      const conversation = conversationById.get(String(payload?.conversationId || ""));
      if (!conversation || !payload?.text) return;

      const incomingMessage = toChatMessage({
        _id: payload.messageId,
        senderId: payload.senderId,
        text: payload.text,
        createdAt: payload.createdAt,
        status: payload.status,
      });
      const threadKey = getConversationThreadKey(conversation);

      setThreadsByOrder((prev) => {
        const existing = prev[threadKey] || [];
        if (existing.some((msg) => String(msg.id) === String(incomingMessage.id))) {
          return prev;
        }

        return {
          ...prev,
          [threadKey]: [...existing, incomingMessage],
        };
      });

      updateConversationPreview(threadKey, incomingMessage.text, incomingMessage.createdAt);
    });

    return () => {
      unsubscribe();
    };
  }, [conversationById]);

  useEffect(() => {
    if (!activeConversationId || !socketRef.current) return;

    socketRef.current.emit("conversation:join", {
      conversationId: activeConversationId,
    });

    loadMessagesForConversation({
      conversationId: activeConversationId,
      orderId: activeConversationOrderId,
    });

    return () => {
      socketRef.current?.emit("conversation:leave", {
        conversationId: activeConversationId,
      });
    };
  }, [activeConversationId, activeConversationOrderId, loadMessagesForConversation]);

  const myInitials = getInitials(currentUser?.fullName || "Campus User");

  const updateConversationPreview = (threadKey, previewText, previewTime) => {
    setConversations((prev) =>
      prev
        .map((conversation) => {
          if (getConversationThreadKey(conversation) !== threadKey) return conversation;
          return {
            ...conversation,
            lastMessage: previewText,
            lastActivity: previewTime,
          };
        })
        .sort((a, b) => toSafeDate(b.lastActivity).getTime() - toSafeDate(a.lastActivity).getTime())
    );
  };

  const handleSelectConversation = (conversationId) => {
    const selectedConversation = conversations.find(
      (conversation) => conversation.conversationId === conversationId || conversation.orderId === conversationId
    );

    setActiveOrderId(selectedConversation?.conversationId || conversationId);

    if (selectedConversation) {
      setSearchParams({
        conversation: selectedConversation.conversationId || "",
        order: selectedConversation.orderId || "",
        product: selectedConversation.product?.id || "",
        chat: selectedConversation.counterpartId || "",
      });
      loadMessagesForConversation(selectedConversation);
      if (isMobileViewport) {
        setIsMobileChatOpen(true);
      }
    } else {
      setSearchParams({ order: conversationId });
    }
  };

  const handleBackToRooms = () => {
    setIsMobileChatOpen(false);
  };

  const sendMessage = (text) => {
    if (!activeConversation || !activeConversation.conversationId || !socketRef.current) return;
    const trimmed = String(text || "").trim();
    if (!trimmed) return;

    socketRef.current.emit(
      "message:send",
      {
        conversationId: activeConversation.conversationId,
        text: trimmed,
      },
      (response) => {
        if (!response?.ok) {
          setErrorMessage(response?.message || "Failed to send message.");
        }
      }
    );

    setMessage("");
  };

  const verifiedMeetupSpots = [
    {
      name: "Central Cafeteria",
      location: "University of Ghana, Legon - Central Cafeteria",
    },
    {
      name: "Balme Library",
      location: "University of Ghana, Legon - Balme Library",
    },
    {
      name: "PBET",
      location: "University of Ghana, Legon - PBET",
    },
    {
      name: "Main Campus",
      location: "University of Ghana, Legon - Main Campus",
    },
  ];

  const handleSuggestMeetupSpot = async (spot) => {
    if (!activeConversation?.orderId) return;

    const token = getStoredAuthToken();
    if (!token) {
      setErrorMessage("Please login again to set a meetup spot.");
      return;
    }

    try {
      setIsSettingMeetupSpot(true);
      setErrorMessage("");

      const updatedOrder = await updateOrderStatus({
        token,
        orderId: activeConversation.orderId,
        payload: {
          nextStatus: "meetup_scheduled",
          meetupType: "verified",
          meetupLocation: spot.location,
        },
      });

      applyOrderSnapshot(updatedOrder?.order || updatedOrder?.data || updatedOrder);
      sendMessage(`Let's meet at ${spot.name}.`);
      setReceiptNotice(`Meetup spot set to ${spot.name}.`);
    } catch (error) {
      setErrorMessage(error.message || "Failed to set a verified meetup spot.");
    } finally {
      setIsSettingMeetupSpot(false);
    }
  };

  const applyOrderSnapshot = (orderSnapshot) => {
    if (!orderSnapshot?._id) return;

    const normalizedStatus = String(orderSnapshot.status || "pending").toLowerCase();
    const updatedAt = orderSnapshot.updatedAt || new Date().toISOString();

    setConversations((prev) =>
      prev
        .map((conversation) => {
          if (conversation.orderId !== String(orderSnapshot._id)) return conversation;
          return {
            ...conversation,
            orderStatus: normalizedStatus,
            buyerConfirmed: Boolean(orderSnapshot.buyerConfirmed),
            sellerConfirmed: Boolean(orderSnapshot.sellerConfirmed),
            lastMessage: `Order ${normalizedStatus} update`,
            lastActivity: updatedAt,
          };
        })
        .sort((a, b) => toSafeDate(b.lastActivity).getTime() - toSafeDate(a.lastActivity).getTime())
    );
  };

  const handleConfirmReceipt = async () => {
    if (!activeConversation?.orderId) return;

    const token = getStoredAuthToken();
    if (!token) {
      setReceiptNotice("Please login again to confirm receipt.");
      return;
    }

    try {
      setIsConfirmingReceipt(true);
      setReceiptNotice("");

      const { order } = await confirmOrderDelivery({ token, orderId: activeConversation.orderId });
      let finalOrder = order;

      const bothConfirmed = Boolean(order?.buyerConfirmed) && Boolean(order?.sellerConfirmed);
      const isMeetupScheduled = String(order?.status || "").toLowerCase() === "meetup_scheduled";

      if (bothConfirmed && isMeetupScheduled) {
        try {
          finalOrder = await updateOrderStatus({
            token,
            orderId: activeConversation.orderId,
            payload: { nextStatus: "delivered" },
          });
          setReceiptNotice("Receipt confirmed. Order is now marked delivered.");
        } catch {
          setReceiptNotice("Receipt confirmed. Waiting for delivery status sync.");
        }
      } else {
        setReceiptNotice("Receipt confirmed. Waiting for the other party to confirm.");
      }

      applyOrderSnapshot(finalOrder || order);
    } catch (error) {
      setReceiptNotice(error.message || "Failed to confirm receipt.");
    } finally {
      setIsConfirmingReceipt(false);
    }
  };

  const handleOpenReport = () => {
    setReportError("");
    setReportNotice("");
    setReportReason("");
    setShowReportModal(true);
  };

  const handleSubmitReport = async (event) => {
    event.preventDefault();

    if (!activeConversation?.counterpartId) {
      setReportError("No user selected for reporting.");
      return;
    }

    const token = getStoredAuthToken();
    if (!token) {
      setReportError("Please login again to report this user.");
      return;
    }

    const trimmedReason = reportReason.trim();
    if (!trimmedReason) {
      setReportError("Please provide a reason for the report.");
      return;
    }

    try {
      setIsSubmittingReport(true);
      setReportError("");

      await reportUser({
        token,
        userId: activeConversation.counterpartId,
        reason: trimmedReason,
        orderId: activeConversation.orderId,
        conversationId: activeConversation.conversationId,
      });

      setReportedUserIds((prev) => (prev.includes(activeConversation.counterpartId) ? prev : [...prev, activeConversation.counterpartId]));
      setReportNotice("Report submitted. Admin will review it from the moderation queue.");
      setShowReportModal(false);
      setReportReason("");
    } catch (error) {
      setReportError(error.message || "Failed to submit report.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const quickActions = verifiedMeetupSpots;
  const presenceLabel = isScreenVisible ? "Online" : "Offline";
  const presenceTone = isScreenVisible ? "text-emerald-600" : "text-gray-500";

  const canConfirmReceipt = activeConversation?.orderStatus === "meetup_scheduled";
  const currentUserConfirmed = activeConversation
    ? activeConversation.isCurrentUserSeller
      ? activeConversation.sellerConfirmed
      : activeConversation.buyerConfirmed
    : false;
  const hasReportedCounterpart = activeConversation ? reportedUserIds.includes(activeConversation.counterpartId) : false;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:h-[calc(100vh-200px)]">
          <div
            className={`lg:col-span-4 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col min-h-80 lg:min-h-0 lg:order-1 ${
              isMobileViewport && isMobileChatOpen ? "hidden lg:flex" : ""
            }`}
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">MESSAGES</h2>
              <div className="relative">
                <Search className="h-4 w-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by product or user"
                  className="w-full rounded-lg bg-gray-50 text-gray-900 placeholder:text-gray-500 border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              {isLoading && <div className="text-sm text-gray-500 px-3 py-2">Loading conversations...</div>}
              {errorMessage && !isLoading && <div className="text-sm text-red-600 px-3 py-2">{errorMessage}</div>}

              {filteredConversations.map((conv) => (
                <button
                  key={conv.conversationId || conv.orderId}
                  type="button"
                  onClick={() => handleSelectConversation(conv.conversationId || conv.orderId)}
                  className={`w-full text-left flex items-center p-3 rounded-lg transition-colors ${
                    (conv.conversationId || conv.orderId) === activeOrderId ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="w-12 h-12 bg-orange-200 rounded-full overflow-hidden flex items-center justify-center mr-3">
                    {conv.counterpartImage ? (
                      <img src={conv.counterpartImage} alt={conv.counterpartName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-orange-600 font-semibold">{conv.counterpartInitials}</span>
                    )}
                  </div>

                  <div className="flex-1 text-left min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{conv.counterpartName}</div>
                    <div className="text-xs text-blue-700 truncate">
                      Chat on {conv.product.title}
                    </div>
                    <div className="text-sm text-gray-600 truncate">{conv.lastMessage}</div>
                  </div>

                  <div className="text-xs text-gray-500">{formatRelativeTime(conv.lastActivity)}</div>
                </button>
              ))}

              {!isLoading && !errorMessage && filteredConversations.length === 0 && (
                <div className="text-sm text-gray-500 px-3 py-2">No order chats found yet.</div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">SAFETY</h3>
              <Link to="/safety" className="flex items-center p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-gray-900">
                <Shield className="w-5 h-5 mr-3" />
                <span>Safety Guidelines</span>
              </Link>
            </div>
          </div>

          <div
            className={`lg:col-span-8 bg-white rounded-xl flex flex-col min-h-130 lg:min-h-0 lg:order-2 ${
              isMobileViewport && !isMobileChatOpen ? "hidden lg:flex" : ""
            }`}
          >
            {!activeConversation ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-semibold text-gray-800">No order chat selected</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-md">
                  Conversations are linked to buyer-seller orders. Once orders exist, each order appears as its own chat thread.
                </p>
              </div>
            ) : (
              <>
                {isMobileViewport && (
                  <div className="p-3 border-b border-gray-200">
                    <button
                      type="button"
                      onClick={handleBackToRooms}
                      className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back to rooms
                    </button>
                  </div>
                )}
                <div className="p-4 border-b border-gray-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center min-w-0 w-full sm:w-auto">
                    <div className="w-10 h-10 bg-orange-200 rounded-full overflow-hidden flex items-center justify-center mr-3 shrink-0">
                      {activeConversation.counterpartImage ? (
                        <img
                          src={activeConversation.counterpartImage}
                          alt={activeConversation.counterpartName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-orange-600 font-semibold">{activeConversation.counterpartInitials}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 truncate">{activeConversation.counterpartName}</span>
                        {activeConversation.verified && <span className="text-blue-600 text-xs font-semibold">VERIFIED</span>}
                      </div>
                      <div className={`text-sm font-medium ${presenceTone}`}>
                        {presenceLabel}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end self-end sm:self-auto ml-auto">
                    <button
                      onClick={handleOpenReport}
                      disabled={!activeConversation?.counterpartId || hasReportedCounterpart}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
                      aria-label={hasReportedCounterpart ? "Reported" : "Report user"}
                      title={hasReportedCounterpart ? "Reported" : "Report user"}
                    >
                      <Flag className="w-4 h-4" />
                    </button>

                  </div>

                  {canConfirmReceipt && (
                    <button
                      onClick={handleConfirmReceipt}
                      disabled={isConfirmingReceipt || currentUserConfirmed}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors shrink-0 ml-auto"
                    >
                      {isConfirmingReceipt ? "Confirming..." : currentUserConfirmed ? "Receipt Confirmed" : "Confirm Receipt"}
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {activeMessages.map((chatMessage) => {
                    if (chatMessage.type === "system") {
                      return (
                        <div key={chatMessage.id} className="text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            <Clock3 className="h-3 w-3" />
                            {chatMessage.text}
                          </span>
                        </div>
                      );
                    }

                    const isMine = String(chatMessage.senderId) === String(currentUser?._id || "");

                    return (
                      <div key={chatMessage.id} className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                        {!isMine && (
                          <div className="w-8 h-8 bg-orange-200 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                            {activeConversation.counterpartImage ? (
                              <img
                                src={activeConversation.counterpartImage}
                                alt={activeConversation.counterpartName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-orange-600 text-sm font-semibold">{activeConversation.counterpartInitials}</span>
                            )}
                          </div>
                        )}

                        <div className={`${isMine ? "items-end" : "items-start"} flex flex-col`}>
                          <div
                            className={`max-w-md rounded-2xl px-4 py-3 ${
                              isMine ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-100 text-gray-900 rounded-bl-none"
                            }`}
                          >
                            <p>{chatMessage.text}</p>
                          </div>
                          <span className="text-xs text-gray-500 mt-1 px-1">{formatBubbleTime(chatMessage.createdAt)}</span>
                        </div>

                        {isMine && (
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-white text-sm font-semibold">{myInitials}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="px-6 pb-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center min-w-0 w-full sm:w-auto">
                      <div className="w-16 h-16 bg-slate-100 rounded-lg mr-4 overflow-hidden flex items-center justify-center shrink-0">
                        {activeConversation.product.image ? (
                          <img src={activeConversation.product.image} alt={activeConversation.product.title} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-semibold text-slate-500">No image</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{activeConversation.product.title}</div>
                        <div className="text-blue-600 font-bold text-lg">GHC {activeConversation.product.price.toFixed(2)}</div>
                        <div className="text-xs text-gray-500 mt-1">Order #{activeConversation.orderId.slice(-6).toUpperCase()}</div>
                      </div>
                    </div>

                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 uppercase self-start sm:self-center">
                      {activeConversation.orderStatus}
                    </span>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3 text-xs text-gray-700">
                    Delivery confirmations: Buyer {activeConversation.buyerConfirmed ? "confirmed" : "pending"} • Seller {activeConversation.sellerConfirmed ? "confirmed" : "pending"}
                  </div>

                  {receiptNotice && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 mt-3 text-sm text-emerald-800">
                      {receiptNotice}
                    </div>
                  )}

                  {reportNotice && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 mt-3 text-sm text-rose-800">
                      {reportNotice}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-gray-200">
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      sendMessage(message);
                    }}
                    className="flex flex-col sm:flex-row items-stretch gap-2"
                  >
                    <input
                      type="text"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="px-5 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>

                  <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">Suggested verified spots</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {quickActions.map((spot) => (
                        <button
                          key={spot.name}
                          type="button"
                          onClick={() => handleSuggestMeetupSpot(spot)}
                          disabled={isSettingMeetupSpot || !activeConversation?.orderId}
                          className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {spot.name}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-blue-700">Pick one in chat to agree on the meetup spot and keep the order moving.</p>
                  </div>

                  <div className="flex gap-2 mt-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => sendMessage("Please confirm a verified spot from the suggestions above.")}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                    >
                      Ask for confirmation
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showReportModal && activeConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Report user</h3>
                <p className="text-sm text-gray-500">This sends a moderation signal to admin.</p>
              </div>
              <button type="button" onClick={() => setShowReportModal(false)} className="rounded-full p-2 hover:bg-gray-100" aria-label="Close report modal">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4 px-6 py-5">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                You are reporting <span className="font-semibold text-gray-900">{activeConversation.counterpartName}</span> for the order chat on <span className="font-semibold text-gray-900">{activeConversation.product.title}</span>.
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Reason</label>
                <textarea
                  value={reportReason}
                  onChange={(event) => setReportReason(event.target.value)}
                  rows={4}
                  placeholder="Describe what happened and why you are reporting this user."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>

              {reportError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{reportError}</div>}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="inline-flex items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingReport ? "Submitting..." : "Submit report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
