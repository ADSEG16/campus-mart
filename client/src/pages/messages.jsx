import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Nav from "../components/nav";
import Footer from "../components/footer";
import ConvoCard from "../components/chat/convo-card";
import ChatComponent from "../components/chat/chat";
import ItemDetailsCard from "../components/chat/product-detail-card";
import TrustCard from "../components/profile/TrustCard";

export default function Messages() {
  const location = useLocation();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [newConversationAdded, setNewConversationAdded] = useState(false);

  // Handle incoming conversation from navigation state
  useEffect(() => {
    const newConvo = location.state?.newConversation;
    const openChat = location.state?.openChat;
    
    if (newConvo && openChat && !newConversationAdded) {
      // Create custom event to add new conversation
      const addEvent = new CustomEvent('addNewConversation', { 
        detail: newConvo 
      });
      window.dispatchEvent(addEvent);
      
      // Set the selected conversation ID
      setSelectedConversation(newConvo.id);
      setShowMobileChat(true);
      setNewConversationAdded(true);
      
      // Clear the state to prevent re-processing
      setTimeout(() => {
        window.history.replaceState({}, document.title);
      }, 100);
    }
  }, [location.state, newConversationAdded]);

  const handleSelectConversation = (id) => {
    setSelectedConversation(id);
    setShowMobileChat(true);
  };

  const handleBackToConversations = () => {
    setShowMobileChat(false);
  };

  return (
    <div>
      <Nav />
      <div className="flex flex-row gap-6 m-8">
        {/* Left Sidebar - Conversations Card */}
        <div className={`${showMobileChat ? 'hidden lg:block' : 'block'} lg:block w-full lg:w-96 shrink-0`}>
          <ConvoCard 
            onSelectConversation={handleSelectConversation} 
            selectedId={selectedConversation}
          />
        </div>
        
        {/* Center - Chat Component */}
        <div className={`${showMobileChat ? 'block' : 'hidden lg:block'} flex-1`}>
          <ChatComponent 
            selectedConversation={selectedConversation}
            onBack={handleBackToConversations}
            onSelectConversation={handleSelectConversation}
          />
        </div>
        
        {/* Right Sidebar - Item Details and Trust Card */}
        <div className="hidden lg:block w-80 shrink-0 flex-col gap-4">
          <ItemDetailsCard />
          <TrustCard />
        </div>
      </div>
      <Footer />
    </div>
  );
}