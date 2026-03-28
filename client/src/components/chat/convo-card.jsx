import React, { useState, useEffect } from "react";
import { MessageCircle, Shield, Flag, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ConversationsCard = ({ onSelectConversation, selectedId }) => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);

  // Load conversations from localStorage
  const loadConversations = () => {
    const saved = localStorage.getItem('chat_conversations');
    if (saved) {
      const convos = JSON.parse(saved);
      // Convert object to array and sort by latest message time
      const conversationsArray = Object.values(convos).map(convo => ({
        id: convo.id,
        name: convo.name,
        lastMessage: convo.messages[convo.messages.length - 1]?.text || "No messages",
        time: convo.messages[convo.messages.length - 1]?.time || "Just now",
        initials: convo.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        verified: convo.verified,
        buying: convo.buying
      }));
      
      // Sort by most recent message time
      conversationsArray.sort((a, b) => {
        // Simple time comparison - you might want to implement proper time parsing
        if (a.time === "Just now") return -1;
        if (b.time === "Just now") return 1;
        return 0;
      });
      
      setConversations(conversationsArray);
    } else {
      // Default conversations if none exist
      setConversations([
        { id: 1, name: "Alex Johnson", lastMessage: "Is the textbook still available?", time: "2m ago", initials: "AJ", verified: true, buying: "Organic Chemistry Textbook" },
        { id: 2, name: "Sarah Kim", lastMessage: "Let's meet at the Student Union.", time: "1h ago", initials: "SK", verified: true, buying: "Calculus Textbook" },
        { id: 3, name: "Mike Brown", lastMessage: "Payment sent via Venmo!", time: "Yesterday", initials: "MB", verified: false, buying: "Physics Lab Kit" }
      ]);
    }
  };

  // Add a new conversation
  const addNewConversation = (newConvoData) => {
    const saved = localStorage.getItem('chat_conversations');
    let allConversations = {};
    
    if (saved) {
      allConversations = JSON.parse(saved);
    }
    
    // Check if conversation already exists
    if (!allConversations[newConvoData.id]) {
      // Create new conversation with initial message
      const newConversation = {
        id: newConvoData.id,
        name: newConvoData.name,
        buying: newConvoData.buying,
        verified: newConvoData.verified || false,
        sellerId: newConvoData.sellerId,
        itemId: newConvoData.itemId,
        itemImage: newConvoData.itemImage,
        itemPrice: newConvoData.itemPrice,
        sellerAge: newConvoData.sellerAge,
        sellerUniversity: newConvoData.sellerUniversity,
        messages: [
          {
            id: 1,
            text: newConvoData.initialMessage || `Hi ${newConvoData.name}! I'm interested in your ${newConvoData.buying}. Is it still available?`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: "outgoing",
            sender: "You"
          }
        ]
      };
      
      allConversations[newConvoData.id] = newConversation;
      localStorage.setItem('chat_conversations', JSON.stringify(allConversations));
      
      // Refresh the conversations list
      loadConversations();
      
      // Trigger event to notify other components
      const refreshEvent = new Event('conversationUpdate');
      window.dispatchEvent(refreshEvent);
      
      return newConversation;
    }
    
    return null;
  };

  // Listen for new conversation events
  useEffect(() => {
    loadConversations();
    
    // Listen for storage changes (when new conversation is added from other tabs)
    const handleStorageChange = () => {
      loadConversations();
    };
    
    // Listen for custom event to add new conversation
    const handleAddNewConversation = (event) => {
      const newConvo = addNewConversation(event.detail);
      if (newConvo && onSelectConversation) {
        // Auto-select the new conversation
        onSelectConversation(newConvo.id);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('addNewConversation', handleAddNewConversation);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('addNewConversation', handleAddNewConversation);
    };
  }, []);

  // Also reload when component mounts and when localStorage changes via custom event
  useEffect(() => {
    const refreshConversations = () => {
      loadConversations();
    };
    
    // Create a custom event listener for conversation updates
    window.addEventListener('conversationUpdate', refreshConversations);
    
    return () => window.removeEventListener('conversationUpdate', refreshConversations);
  }, []);

  const handleSafetyClick = () => {
    navigate("/safety");
  };

  if (conversations.length === 0) {
    return (
      <div className="max-w-4xl bg-[#0F172A] rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-5 pb-3">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-md font-semibold text-[#94A3B8]">ACTIVE CONVERSATIONS</h3>
          </div>
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No conversations yet</p>
            <p className="text-gray-500 text-xs mt-1">Message a seller to start chatting</p>
          </div>
        </div>
        <div className="border-t border-gray-600"></div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-md font-semibold text-[#94A3B8]">QUICK RESOURCES</h3>
          </div>
          <div className="space-y-2">
            <button onClick={handleSafetyClick} className="w-full flex items-center justify-between py-2 text-left hover:bg-gray-600 px-2 -mx-2 rounded-lg transition-colors">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="text-white">Safety Guidelines</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between py-2 text-left hover:bg-gray-600 px-2 -mx-2 rounded-lg transition-colors">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-gray-500" />
                <span className="text-white">Report a Concern</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl bg-[#0F172A] rounded-2xl border border-gray-200 overflow-hidden">
      {/* Active Conversations Section */}
      <div className="p-5 pb-3">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-md font-semibold text-[#94A3B8]">ACTIVE CONVERSATIONS</h3>
        </div>
        
        {conversations.map((convo) => (
          <div 
            key={convo.id}
            onClick={() => onSelectConversation(convo.id)}
            className={`flex items-start justify-between py-3 mb-1 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer ${
              selectedId === convo.id ? 'bg-gray-700' : ''
            }`}
          >
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-sm">
                {convo.initials}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="font-semibold text-white">{convo.name}</p>
                  {convo.verified && (
                    <span className="text-blue-500 text-xs">✓</span>
                  )}
                </div>
                <p className="text-sm text-gray-400 truncate max-w-45">{convo.lastMessage}</p>
                {convo.buying && (
                  <p className="text-xs text-gray-500 truncate max-w-45 mt-0.5">About: {convo.buying}</p>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{convo.time}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-600"></div>

      {/* Quick Resources Section */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-md font-semibold text-[#94A3B8]">QUICK RESOURCES</h3>
        </div>
        
        <div className="space-y-2">
          <button onClick={handleSafetyClick} className="w-full flex items-center justify-between py-2 text-left hover:bg-gray-600 px-2 -mx-2 rounded-lg transition-colors">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-500" />
              <span className="text-white">Safety Guidelines</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          
          <button className="w-full flex items-center justify-between py-2 text-left hover:bg-gray-600 px-2 -mx-2 rounded-lg transition-colors">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-gray-500" />
              <span className="text-white">Report a Concern</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationsCard;