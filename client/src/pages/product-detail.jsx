import { useState } from "react";
import { Heart, MessageCircle, MapPin, Star } from "lucide-react";
import { useParams } from "react-router-dom";
import Navbar from "../components/navbar";
import ConfirmInterestModal from "../components/ConfirmInterestModal";
import headphonesImg from "../assets/headphones.jpg";

export default function ProductDetail() {
    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const { id } = useParams();

    // Product data - in a real app, this would come from an API
    const products = {
        '1': {
            title: "Noise Cancelling Headphones",
            price: "$45.00",
            condition: "EXCELLENT CONDITION",
            category: "Electronics",
            seller: {
                id: '1',
                name: "Alex Johnson",
                avatar: "AJ",
                major: "Computer Science • Junior",
                rating: 4.9,
                reviews: 24,
                verified: true
            },
            description: "Selling my Sony WH-1000XM4 headphones. I've had these for about a semester and they are in perfect working condition. The noise cancellation is world-class, perfect for studying in the quiet zone of the main library or focusing in a loud dorm room.",
            highlights: [
                "Original carrying case included",
                "Battery health is excellent (+ 30 hours)",
                "Cleaned and sanitized for next owner"
            ],
            meetingPreferences: [
                "Student Union (Ground Floor)",
                "Main Library Entrance"
            ]
        },
        '2': {
            title: "Biology Vol 1. Textbook",
            price: "$120.00",
            condition: "NEW",
            category: "Textbooks",
            seller: {
                id: '2',
                name: "Sarah Kim",
                avatar: "SK",
                major: "Biology • Sophomore",
                rating: 4.8,
                reviews: 15,
                verified: true
            },
            description: "Latest edition Biology textbook. Never used, still in shrink wrap. Includes digital access code.",
            highlights: [
                "Brand new, never opened",
                "Digital access code included",
                "Latest edition"
            ],
            meetingPreferences: [
                "Science Building Lobby",
                "Main Library Entrance"
            ]
        },
        '3': {
            title: "Study Desk Lamp",
            price: "$15.00",
            condition: "FAIR",
            category: "Dorm Life",
            seller: {
                id: '3',
                name: "Mike Brown",
                avatar: "MB",
                major: "Engineering • Senior",
                rating: 4.7,
                reviews: 8,
                verified: true
            },
            description: "Adjustable LED desk lamp. Works perfectly, just upgrading to a new one.",
            highlights: [
                "USB charging port",
                "Adjustable brightness",
                "Flexible arm"
            ],
            meetingPreferences: [
                "Student Union Hub",
                "Engineering Building"
            ]
        },
        '4': {
            title: "Organic Chemistry Textbook",
            price: "$80.00",
            condition: "GOOD",
            category: "Textbooks",
            seller: {
                id: '4',
                name: "Ryan K.",
                avatar: "RK",
                major: "Chemistry • Senior",
                rating: 4.9,
                reviews: 18,
                verified: true
            },
            description: "Organic Chemistry textbook in good condition. Some highlighting but all pages intact.",
            highlights: [
                "All pages intact",
                "Minimal highlighting",
                "Great for studying"
            ],
            meetingPreferences: [
                "Science Building",
                "Main Library"
            ]
        }
    };

    const product = products[id] || products['1'];

    const images = [
        headphonesImg,
        headphonesImg,
        headphonesImg,
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar variant="product" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Breadcrumb */}
                <div className="flex items-center text-sm text-gray-600 mb-6">
                    <a href="/dashboard" className="hover:text-gray-900">Marketplace</a>
                    <span className="mx-2">›</span>
                    <a href="#" className="hover:text-gray-900">Electronics</a>
                    <span className="mx-2">›</span>
                    <span className="text-gray-900">Noise Cancelling Headphones</span>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Image Gallery */}
                    <div>
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-4">
                            <img
                                src={images[selectedImage]}
                                alt="Product"
                                className="w-full h-96 object-cover"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`bg-white rounded-lg overflow-hidden border-2 ${
                                        selectedImage === idx ? 'border-blue-600' : 'border-transparent'
                                    }`}
                                >
                                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-20 object-cover" />
                                </button>
                            ))}
                            <div className="bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 text-sm font-medium">
                                +2 More
                            </div>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
                            <div className="flex items-center justify-between mb-4">
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                                    {product.condition}
                                </span>
                                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <Heart className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                {product.title}
                            </h1>

                            <div className="text-4xl font-bold text-blue-600 mb-6">
                                {product.price}
                            </div>

                            {/* Seller Info */}
                            <div className="border-t border-b border-gray-200 py-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-orange-600 font-semibold">{product.seller.avatar}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center">
                                                <span className="font-semibold text-gray-900 mr-2">{product.seller.name}</span>
                                                {product.seller.verified && (
                                                    <span className="text-blue-600 text-sm">✓ VERIFIED STUDENT</span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-600">{product.seller.major}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-yellow-500">
                                        <Star className="w-5 h-5 fill-current" />
                                        <span className="ml-1 font-semibold text-gray-900">{product.seller.rating}</span>
                                        <span className="text-gray-500 text-sm ml-1">({product.seller.reviews})</span>
                                    </div>
                                </div>
                                <a 
                                    href={`/messages?chat=${product.seller.id}`}
                                    className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                                >
                                    <MessageCircle className="w-5 h-5 mr-2" />
                                    Message Seller
                                </a>
                                <a href="/settings" className="block text-center text-blue-600 hover:text-blue-700 font-medium mt-2">
                                    View Profile
                                </a>
                            </div>

                            {/* Action Buttons */}
                            <button
                                onClick={() => setShowModal(true)}
                                className="w-full px-4 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center mb-3"
                            >
                                <span className="mr-2">💰</span>
                                Confirm Interest / COD
                            </button>

                            {/* Meeting Preferences */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <MapPin className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                                    <div>
                                        <div className="font-semibold text-gray-900 mb-2">Meeting Preferences</div>
                                        <ul className="space-y-1 text-sm text-gray-700">
                                            {product.meetingPreferences.map((pref, idx) => (
                                                <li key={idx} className="flex items-center">
                                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                                                    {pref}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Item Description */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Item Description</h2>
                            <p className="text-gray-700 mb-4">
                                {product.description}
                            </p>
                            
                            <h3 className="font-semibold text-gray-900 mb-2">Highlights:</h3>
                            <ul className="space-y-2">
                                {product.highlights.map((highlight, idx) => (
                                    <li key={idx} className="flex items-start text-gray-700">
                                        <span className="text-blue-600 mr-2">○</span>
                                        {highlight}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && <ConfirmInterestModal onClose={() => setShowModal(false)} onConfirm={() => {
                setShowModal(false);
                window.location.href = '/messages';
            }} />}
        </div>
    );
}