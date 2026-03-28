import React from "react";
import { 
  User, 
  Shield, 
  Award, 
  Mail, 
  CheckCircle, 
  Calendar,
  Star,
  BookOpen,
  Laptop,
  Code,
  MapPin,
  Clock,
  ThumbsUp,
  MessageCircle,
  Heart,
  Share2
} from "lucide-react";

const UserProfile = () => {
  return (
    <div className="max-w-6xl bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Cover Photo - Optional */}
      <div className="h-32 bg-linear-to-r from-blue-600 to-blue-400 relative">
        {/* Profile Picture Overlay */}
        <div className="absolute -bottom-12 left-6">
          <div className="h-24 w-24 rounded-full border-4 border-white bg-blue-600 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-white">AR</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 p-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">Alex Rivers</h1>
              <CheckCircle className="h-6 w-6 text-blue-600 fill-blue-600" />
            </div>
            <p className="text-gray-600 mt-1">Computer Science Senior @ Stanford</p>
          </div>
          
          {/* Stats Badges */}
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center space-x-2 bg-green-100 px-3 py-1.5 rounded-full">
              <Award className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Active Seller</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-full">
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">Joined Sep 2021</span>
            </div>
          </div>
        </div>

        {/* Verified Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* VERIFIED STATUS */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800">VERIFIED STATUS</h3>
              </div>
              <span className="text-2xl font-bold text-green-600">98</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <p className="text-sm text-green-700">
                  <span className="font-medium">University Verified</span> — Email ending in @stanford.edu was verified on August 24, 2023. You are a trusted member of the campus community.
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <p className="text-sm text-green-700">
                  <span className="font-medium">Student ID Linked</span>
                </p>
              </div>
            </div>
          </div>

          {/* TRUST SCORE */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-blue-600 fill-blue-600" />
                <h3 className="font-semibold text-blue-800">TRUST SCORE</h3>
              </div>
              <span className="text-2xl font-bold text-blue-600">98</span>
            </div>
            <p className="text-sm text-blue-700">
              <span className="font-medium">Excellent Reputation</span> — Your score is based on 42 successful transactions and 15 positive reviews from verified classmates.
            </p>
          </div>
        </div>

        {/* About Me Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">About Me</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed">
              Mainly selling textbooks for CS and Math courses. All items are kept in excellent condition. Usually available for meetups near the Gates Computer Science building or Tresidder Union.
            </p>
          </div>
        </div>

        {/* Categories/Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm">
            <BookOpen className="h-4 w-4 mr-1" />
            Textbooks
          </span>
          <span className="inline-flex items-center px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm">
            <Laptop className="h-4 w-4 mr-1" />
            Electronics
          </span>
          <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm">
            <Code className="h-4 w-4 mr-1" />
            CS Major
          </span>
        </div>

        {/* Stats Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500">Transactions</p>
            <p className="text-xl font-bold text-gray-900">42</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Reviews</p>
            <p className="text-xl font-bold text-gray-900">15</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Listings</p>
            <p className="text-xl font-bold text-gray-900">8</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Response Rate</p>
            <p className="text-xl font-bold text-gray-900">98%</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center space-x-3">
          <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <MessageCircle className="h-4 w-4" />
            <span>Message</span>
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Heart className="h-4 w-4" />
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;