import React, { useState } from "react";
import {
  Star,
  CheckCircle,
  Clock,
  Tag,
  MessageCircle,
  X,
  User,
  ThumbsUp,
  Calendar,
  Shield
} from "lucide-react";

const SellerRatingPopup = ({ sellerName = "Sarah M.", productName = "Noise Cancelling Headphones", onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [trustTags, setTrustTags] = useState({
    onTime: false,
    accurateDescription: true,
    fairPrice: false,
    friendly: false,
    quickResponse: false
  });
  const [review, setReview] = useState("Smooth transaction! The headphones were in perfect condition and Sarah was very punctual at the library meeting spot.");
  const [reviewTitle, setReviewTitle] = useState("Great experience!");

  const tags = [
    { id: "onTime", label: "On Time", icon: <Clock className="h-4 w-4" /> },
    { id: "accurateDescription", label: "Accurate Description", icon: <CheckCircle className="h-4 w-4" /> },
    { id: "fairPrice", label: "Fair Price", icon: <Tag className="h-4 w-4" /> },
    { id: "friendly", label: "Friendly", icon: <ThumbsUp className="h-4 w-4" /> },
    { id: "quickResponse", label: "Quick Response", icon: <MessageCircle className="h-4 w-4" /> }
  ];

  const handleTagToggle = (tagId) => {
    setTrustTags(prev => ({
      ...prev,
      [tagId]: !prev[tagId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      rating,
      trustTags,
      reviewTitle,
      review,
      seller: sellerName,
      product: productName
    });
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Rate your experience</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Seller Info */}
          <div className="flex items-center space-x-4 pb-4 border-b border-gray-100">
            <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center">
              <User className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{sellerName}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Verified Student</span>
              </div>
            </div>
          </div>

          {/* Reviewing Purchase */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-blue-600 mb-1">REVIEWING PURCHASE</p>
            <p className="text-sm font-medium text-gray-900">{productName}</p>
          </div>

          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Rating
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Title */}
          <div>
            <input
              type="text"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Trust Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Trust Tags (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    trustTags[tag.id]
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className={trustTags[tag.id] ? 'text-white' : 'text-gray-500'}>
                    {tag.icon}
                  </span>
                  <span>{tag.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Written Review */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Written Review
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Share details about your experience..."
            />
          </div>

          {/* Review Preview (optional - shows what the review looks like) */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-2">PREVIEW</p>
            <div className="flex items-center space-x-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm font-medium text-gray-900">"{reviewTitle}"</p>
            <p className="text-sm text-gray-600 mt-1">{review}</p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Submit Review
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-gray-500 text-center">
            Your review will be visible on {sellerName}'s profile to help other students.
          </p>
        </form>
      </div>
    </div>
  );
};

export default SellerRatingPopup;