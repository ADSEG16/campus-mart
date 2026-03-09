import { useState } from "react";
import { Send, Paperclip, DollarSign, Clock, MoreVertical, Shield, MapPin } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/navbar";
import MeetingPointModal from "../components/MeetingPointModal";

export default function Messages() {
    const [message, setMessage] = useState("");
    const [showMenu, setShowMenu] = useState(false);
    const [showMeetingModal, setShowMeetingModal] = useState(false);
    const [searchParams] = useSearchParams();
    const chatId = searchParams.get('chat') || '1';

    const conversations = [
        {
            id: '1',
            name: "Alex Johnson",
            avatar: "AJ",
            lastMessage: "Is the textbook still available?",
            time: "2m ago",
            unread: true,
            verified: true,
            status: "Buying: Organic Chemistry Textbook",
            product: {
                title: "Organic Chemistry: Structure and Function (8th Ed)",
                price: "$45.00",
                status: "AVAILABLE"
            }
        },
        {
            id: '2',
            name: "Sarah Kim",
            avatar: "SK",
            lastMessage: "Let's meet at the Student Union",
            time: "1h ago",
            unread: false,
            verified: true,
            status: "Buying: Noise Cancelling Headphones",
            product: {
                title: "Sony WH-1000XM4 Headphones",
                price: "$120.00",
                status: "AVAILABLE"
            }
        },
        {
            id: '3',
            name: "Mike Brown",
            avatar: "MB",
            lastMessage: "Payment sent via Venmo!",
            time: "Yesterday",
            unread: false,
            verified: true,
            status: "Buying: Desk Lamp",
            product: {
                title: "LED Desk Lamp with USB Port",
                price: "$25.00",
                status: "SOLD"
            }
        },
        {
            id: '4',
            name: "Ryan K.",
            avatar: "RK",
            lastMessage: "Still interested in the item",
            time: "2d ago",
            unread: false,
            verified: true,
            status: "Buying: Biology Textbook",
            product: {
                title: "Biology Vol 1. Latest Edition",
                price: "$80.00",
                status: "AVAILABLE"
            }
        }
    ];

    const activeChat = conversations.find(c => c.id === chatId) || conversations[0];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
                    {/* Conversations List */}
                    <div className="lg:col-span-4 bg-gray-900 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-gray-800">
                            <h2 className="text-xl font-bold text-white mb-4">ACTIVE CONVERSATIONS</h2>
                            <div className="space-y-2">
                                {conversations.map((conv) => (
                                    <a
                                        key={conv.id}
                                        href={`/messages?chat=${conv.id}`}
                                        className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                                            conv.id === chatId ? 'bg-gray-800' : 'hover:bg-gray-800'
                                        }`}
                                    >
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center mr-3">
                                                <span className="text-orange-600 font-semibold">{conv.avatar}</span>
                                            </div>
                                            {conv.unread && (
                                                <div className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="font-semibold text-white">{conv.name}</div>
                                            <div className="text-sm text-gray-400 truncate">{conv.lastMessage}</div>
                                        </div>
                                        <div className="text-xs text-gray-500">{conv.time}</div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="p-6">
                            <h3 className="text-sm font-semibold text-gray-400 mb-3">QUICK RESOURCES</h3>
                            <div className="space-y-2">
                                <a href="/safety" className="flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-white">
                                    <Shield className="w-5 h-5 mr-3" />
                                    <span>Safety Guidelines</span>
                                </a>
                                <button className="w-full flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-white">
                                    <span className="mr-3">⚠️</span>
                                    <span>Report a Concern</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="lg:col-span-8 bg-white rounded-xl flex flex-col">
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-orange-600 font-semibold">{activeChat.avatar}</span>
                                </div>
                                <div>
                                    <div className="flex items-center">
                                        <span className="font-semibold text-gray-900 mr-2">{activeChat.name}</span>
                                        {activeChat.verified && (
                                            <span className="text-blue-600 text-xs">✓ VERIFIED STUDENT</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600">{activeChat.status}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setShowMeetingModal(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                                >
                                    <MapPin className="w-4 h-4 mr-2" />
                                    Set Meeting Point
                                </button>
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                                >
                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                    {showMenu && (
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                                            <button className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors">
                                                Report User
                                            </button>
                                            <button className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors">
                                                Block User
                                            </button>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="text-center">
                                <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">TODAY</span>
                            </div>

                            {/* Received Message */}
                            <div className="flex items-start">
                                <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                                    <span className="text-orange-600 text-sm font-semibold">{activeChat.avatar}</span>
                                </div>
                                <div>
                                    <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-md">
                                        <p className="text-gray-900">
                                            {activeChat.lastMessage}
                                        </p>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 ml-2">10:42 AM</div>
                                </div>
                            </div>

                            {/* Sent Message */}
                            <div className="flex items-start justify-end">
                                <div>
                                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-md">
                                        <p>
                                            Yes, it's still available! It's in great condition, no highlights or markings. Are you on campus today?
                                        </p>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 mr-2 text-right">10:41 AM</div>
                                </div>
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                                    <span className="text-white text-sm">🎓</span>
                                </div>
                            </div>
                        </div>

                        {/* Item Details Card */}
                        <div className="px-6 pb-4">
                            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-16 h-16 bg-teal-700 rounded-lg mr-4 flex items-center justify-center">
                                        <span className="text-white text-2xl">📚</span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{activeChat.product.title}</div>
                                        <div className="text-blue-600 font-bold text-lg">{activeChat.product.price}</div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full mb-2 ${
                                        activeChat.product.status === 'AVAILABLE' 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {activeChat.product.status}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                                <div className="flex items-start">
                                    <span className="text-blue-600 mr-2">💡</span>
                                    <div>
                                        <span className="font-semibold text-blue-900">TRADING TIP</span>
                                        <p className="text-sm text-blue-800 mt-1">
                                            Check the book for missing pages before paying. Digital payments like Venmo are recommended after inspection.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
                                    <Paperclip className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
                                    <DollarSign className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
                                    <Clock className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center">
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center">
                                    <Paperclip className="w-4 h-4 mr-1" />
                                    Attach Photo
                                </button>
                                <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center">
                                    <DollarSign className="w-4 h-4 mr-1" />
                                    Request Payment
                                </button>
                                <button className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg text-sm font-medium text-blue-700 transition-colors flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    Propose Time
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showMeetingModal && <MeetingPointModal onClose={() => setShowMeetingModal(false)} />}
        </div>
    );
}