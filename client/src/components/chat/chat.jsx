import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  CheckCircle, 
  Image, 
  CreditCard, 
  Clock, 
  Send, 
  MapPin, 
  MoreVertical,
  X,
  AlertTriangle,
  Ban,
  Smartphone,
  DollarSign,
  ArrowLeft,
  MessageCircle
} from "lucide-react";

const ChatComponent = ({ selectedConversation, onBack, onSelectConversation }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [selectedAmount, setSelectedAmount] = useState("");
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [hasProcessedMeeting, setHasProcessedMeeting] = useState(false);
  
  // Mock conversations data - move to localStorage or state that persists
  const [conversations, setConversations] = useState(() => {
    // Try to load from localStorage first
    const saved = localStorage.getItem('chat_conversations');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      1: {
        id: 1,
        name: "Alex Johnson",
        buying: "Organic Chemistry Textbook",
        verified: true,
        messages: [
          {
            id: 1,
            text: "Hi! Is the Organic Chemistry textbook still available? I'm interested in buying it today.",
            time: "10:42 AM",
            type: "incoming",
            sender: "Alex Johnson"
          },
          {
            id: 2,
            text: "Yes, it's still available! It's in great condition, no highlights or markings. Are you on campus today?",
            time: "10:45 AM",
            type: "outgoing",
            sender: "You"
          }
        ]
      },
      2: {
        id: 2,
        name: "Sarah Kim",
        buying: "Calculus Textbook",
        verified: true,
        messages: [
          {
            id: 1,
            text: "Let's meet at the Student Union.",
            time: "1:30 PM",
            type: "incoming",
            sender: "Sarah Kim"
          },
          {
            id: 2,
            text: "Sounds good! What time works for you?",
            time: "1:32 PM",
            type: "outgoing",
            sender: "You"
          },
          {
            id: 3,
            text: "How about 3 PM?",
            time: "1:35 PM",
            type: "incoming",
            sender: "Sarah Kim"
          }
        ]
      },
      3: {
        id: 3,
        name: "Mike Brown",
        buying: "Physics Lab Kit",
        verified: false,
        messages: [
          {
            id: 1,
            text: "Payment sent via Venmo!",
            time: "Yesterday",
            type: "incoming",
            sender: "Mike Brown"
          },
          {
            id: 2,
            text: "Received! When can you pick up?",
            time: "Yesterday",
            type: "outgoing",
            sender: "You"
          }
        ]
      }
    };
  });

  const currentConversation = selectedConversation ? conversations[selectedConversation] : null;
  const [messages, setMessages] = useState(currentConversation?.messages || []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chat_conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Update messages when conversation changes
  useEffect(() => {
    if (selectedConversation && conversations[selectedConversation]) {
      setMessages(conversations[selectedConversation].messages);
    } else {
      setMessages([]);
    }
  }, [selectedConversation, conversations]);

  // Listen for new conversations being added
  useEffect(() => {
    const handleConversationUpdate = () => {
      const saved = localStorage.getItem('chat_conversations');
      if (saved) {
        setConversations(JSON.parse(saved));
      }
    };
    
    window.addEventListener('conversationUpdate', handleConversationUpdate);
    
    return () => window.removeEventListener('conversationUpdate', handleConversationUpdate);
  }, []);

  // Handle incoming meeting details from navigation state
  useEffect(() => {
    const meetingDetails = location.state?.meetingDetails;
    
    if (meetingDetails && !hasProcessedMeeting && selectedConversation) {
      const { location: meetingLocation, address, date, time, notes, conversationId } = meetingDetails;
      
      if (conversationId === selectedConversation) {
        const newMessage = {
          id: messages.length + 1,
          text: `📍 Meeting Point Proposed:\n\nLocation: ${meetingLocation}\nAddress: ${address}\nDate: ${date}\nTime: ${time}${notes ? `\n\nAdditional Notes: ${notes}` : ''}\n\nPlease confirm if this meeting point works for you.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "outgoing",
          sender: "You",
          isSystem: true
        };
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        setConversations(prev => ({
          ...prev,
          [selectedConversation]: {
            ...prev[selectedConversation],
            messages: updatedMessages
          }
        }));
        setHasProcessedMeeting(true);
        
        // Clear the state to prevent re-processing
        setTimeout(() => {
          window.history.replaceState({}, document.title);
        }, 100);
      }
    }
  }, [location.state, selectedConversation, messages.length, hasProcessedMeeting]);

  // Handle sending message
  const handleSendMessage = () => {
    if (messageInput.trim() && currentConversation) {
      const newMessage = {
        id: messages.length + 1,
        text: messageInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "outgoing",
        sender: "You"
      };
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      setConversations(prev => ({
        ...prev,
        [selectedConversation]: {
          ...prev[selectedConversation],
          messages: updatedMessages
        }
      }));
      setMessageInput("");
    }
  };

  // Handle Attach Photo click
  const handleAttachPhoto = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file && currentConversation) {
        const newMessage = {
          id: messages.length + 1,
          text: `📷 Attached photo: "${file.name}"`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "outgoing",
          sender: "You",
          isSystem: true
        };
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        setConversations(prev => ({
          ...prev,
          [selectedConversation]: {
            ...prev[selectedConversation],
            messages: updatedMessages
          }
        }));
      }
    };
    fileInput.click();
  };

  // Handle Payment Mode click
  const handlePaymentMode = () => {
    setShowPaymentModal(true);
  };

  // Handle Propose Time click
  const handleProposeTime = () => {
    setShowTimeModal(true);
  };

  // Handle Set Meeting Point click - Navigate to meeting point page
  const handleSetMeetingPoint = () => {
    if (currentConversation) {
      navigate(`/meetings/${selectedConversation}`, {
        state: {
          conversationId: selectedConversation,
          userName: currentConversation.name,
          itemName: currentConversation.buying
        }
      });
    }
  };

  // Handle Report User
  const handleReportUser = () => {
    const reason = prompt(
      "Please provide a reason for reporting this user:\n\n" +
      "Examples:\n" +
      "- Suspicious behavior\n" +
      "- Inappropriate messages\n" +
      "- Requesting off-campus meeting\n" +
      "- Other"
    );
    
    if (reason) {
      alert(`Report submitted. Our safety team will review it within 24 hours.\n\nReason: ${reason}`);
    }
    setShowMoreMenu(false);
  };

  // Handle Block User
  const handleBlockUser = () => {
    const confirmBlock = window.confirm(
      `Are you sure you want to block ${currentConversation?.name}?\n\n` +
      "They will not be able to message you or see your listings."
    );
    
    if (confirmBlock) {
      alert(`${currentConversation?.name} has been blocked successfully.`);
    }
    setShowMoreMenu(false);
  };

  // Submit payment mode selection
  const submitPaymentSelection = () => {
    if (selectedAmount && !isNaN(selectedAmount) && parseFloat(selectedAmount) > 0 && selectedPaymentMode && currentConversation) {
      const paymentModeText = selectedPaymentMode === "mobile_money" 
        ? "Mobile Money Transfer (MTN/Vodafone/AirtelTigo)" 
        : "Cash on Delivery";
      
      const newMessage = {
        id: messages.length + 1,
        text: `💰 Payment Details:\nAmount: GHC${selectedAmount}\nPayment Mode: ${paymentModeText}\n\nPlease confirm when you're ready to proceed.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "outgoing",
        sender: "You",
        isSystem: true
      };
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      setConversations(prev => ({
        ...prev,
        [selectedConversation]: {
          ...prev[selectedConversation],
          messages: updatedMessages
        }
      }));
      setShowPaymentModal(false);
      setSelectedAmount("");
      setSelectedPaymentMode("");
    } else {
      alert("Please enter a valid amount and select a payment mode");
    }
  };

  // Submit time proposal
  const submitTimeProposal = () => {
    if (selectedDate && selectedTime && currentConversation) {
      const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      const newMessage = {
        id: messages.length + 1,
        text: `⏰ Meeting Proposed:\nDate: ${formattedDate}\nTime: ${selectedTime}\n\nDoes this work for you?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "outgoing",
        sender: "You",
        isSystem: true
      };
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      setConversations(prev => ({
        ...prev,
        [selectedConversation]: {
          ...prev[selectedConversation],
          messages: updatedMessages
        }
      }));
      setShowTimeModal(false);
      setSelectedDate("");
      setSelectedTime("");
    } else {
      alert("Please select both date and time");
    }
  };

  if (!currentConversation) {
    return (
      <div className="max-w-4xl bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col h-150 items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col h-150 relative">
      {/* Header */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button 
                onClick={onBack}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{currentConversation.name}</h3>
              <p className="text-sm text-gray-500">Buying: {currentConversation.buying}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentConversation.verified && (
              <div className="flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">VERIFIED STUDENT</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons Row */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
          <button 
            onClick={handleSetMeetingPoint}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-2xl transition-colors"
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Set Meeting Point</span>
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
            
            {/* More Options Menu */}
            {showMoreMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMoreMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
                  <button
                    onClick={handleReportUser}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-700">Report User</span>
                  </button>
                  <button
                    onClick={handleBlockUser}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-t border-gray-100"
                  >
                    <Ban className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-700">Block User</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Date Divider */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex justify-center">
          <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">TODAY</span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-5 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex flex-col ${message.type === "outgoing" ? "items-end" : "items-start"}`}>
            <div className={`rounded-2xl px-4 py-2 max-w-[85%] ${
              message.type === "outgoing" 
                ? message.isSystem 
                  ? "bg-blue-50 border border-blue-200" 
                  : "bg-blue-600"
                : "bg-gray-100"
            }`}>
              <p className={`text-sm ${message.type === "outgoing" && !message.isSystem ? "text-white" : "text-gray-800"} whitespace-pre-line`}>
                {message.text}
              </p>
            </div>
            <span className="text-xs text-gray-400 mt-1 ml-2">{message.time}</span>
          </div>
        ))}
      </div>

      {/* Message Input Area */}
      <div className="border-t border-gray-200 p-4">
        {/* Input Field */}
        <div className="mb-3">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Message ${currentConversation.name}...`}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <button 
              onClick={handleAttachPhoto}
              className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Image className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-xs text-gray-500">Attach Photo</span>
            </button>
            
            <button 
              onClick={handlePaymentMode}
              className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-xs text-gray-500">Payment Mode</span>
            </button>
            
            <button 
              onClick={handleProposeTime}
              className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-xs text-gray-500">Propose Time</span>
            </button>
          </div>
          
          <button 
            onClick={handleSendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Payment Mode Modal */}
      {showPaymentModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setShowPaymentModal(false)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-96 z-40 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (GHC)</label>
              <input
                type="number"
                value={selectedAmount}
                onChange={(e) => setSelectedAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMode"
                    value="mobile_money"
                    checked={selectedPaymentMode === "mobile_money"}
                    onChange={(e) => setSelectedPaymentMode(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Smartphone className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Mobile Money Transfer</p>
                    <p className="text-xs text-gray-500">MTN, Vodafone, AirtelTigo</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMode"
                    value="cash"
                    checked={selectedPaymentMode === "cash"}
                    onChange={(e) => setSelectedPaymentMode(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <DollarSign className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Cash on Delivery</p>
                    <p className="text-xs text-gray-500">Pay in person at meeting</p>
                  </div>
                </label>
              </div>
            </div>
            
            <button
              onClick={submitPaymentSelection}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors"
            >
              Send Payment Details
            </button>
          </div>
        </>
      )}

      {/* Propose Time Modal */}
      {showTimeModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setShowTimeModal(false)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-96 z-40 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Propose Meeting Time</h3>
              <button onClick={() => setShowTimeModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={submitTimeProposal}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors mt-6"
            >
              Propose Time
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatComponent;