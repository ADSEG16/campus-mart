import React, { useState } from "react";
import {
  Upload,
  Camera,
  Image as ImageIcon,
  X,
  ChevronDown,
  DollarSign,
  MapPin,
  Shield,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
  Info
} from "lucide-react";
import Nav from "./nav";

const PostNewItem = () => {
  const [photos, setPhotos] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    condition: "",
    description: "",
    meetingSpot: ""
  });

  const categories = [
    "Textbooks",
    "Electronics",
    "Dorm Life",
    "Tickets",
    "Clothing",
    "Furniture",
    "Other"
  ];

  const conditions = ["New", "Like New", "Good", "Fair"];

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length <= 5) {
      const newPhotos = files.map(file => URL.createObjectURL(file));
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", { photos, ...formData });
    // Handle form submission
  };

  return (
    <div>
        <Nav />
    <div className="max-w-4xl mx-auto p-6 mt-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Post New Item</h1>
        <p className="text-gray-600">
          Sell your items quickly and safely to fellow students on campus.
        </p>
      </div>


      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Photos Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos</h2>
          <p className="text-sm text-gray-600 mb-4">
            Upload up to 5 clear photos of your item. Items with better lighting sell 3x faster.
          </p>

          {/* Photo Upload Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {/* Upload Button */}
            <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-blue-600">ADD PHOTO</span>
            </label>

            {/* Photo Previews */}
            {photos.map((photo, index) => (
              <div key={index} className="aspect-square relative group">
                <img
                  src={photo}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            {/* Empty slots indicator */}
            {Array.from({ length: Math.max(0, 5 - photos.length - 1) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="aspect-square border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center"
              >
                <Camera className="h-6 w-6 text-gray-300" />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {photos.length}/5 photos uploaded
          </p>
        </div>


        {/* Item Details Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Item Details</h2>
          
          <div className="space-y-4">
            {/* Item Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. TI-84 Graphing Calculator - Like New"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category and Price Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <div className="flex flex-wrap gap-3">
                {conditions.map(cond => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, condition: cond }))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      formData.condition === cond
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Describe the item, including its condition, any flaws, and what's included..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        

        {/* Meeting & Safety Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Meeting & Safety</h2>
          
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Meeting Spot
            </label>
            
            <div className="space-y-2">
                <div className="flex flex-row gap-4">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                <input
                  type="radio"
                  name="meetingSpot"
                  value="verified"
                  checked={formData.meetingSpot === "verified"}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium text-gray-900">Verified Safe Zone</span>
                  </div>
                  <p className="text-sm text-gray-500 ml-7">Student Union, Library, etc.</p>
                </div>
              </label>

              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                <input
                  type="radio"
                  name="meetingSpot"
                  value="custom"
                  checked={formData.meetingSpot === "custom"}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="font-medium text-gray-900">Custom Campus Spot</span>
                  </div>
                  <p className="text-sm text-gray-500 ml-7">Must be public & high-traffic</p>
                </div>
              </label>
              </div>
              {/* Safety Reminder */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 shrink-0" />
                <div>
                <h3 className="text-sm font-semibold text-blue-800 mb-1">SAFETY REMINDER</h3>
                <p className="text-sm text-blue-700">
                    Transactions are most secure when held in the daytime at "Safe Meeting Zones". 
                    Always use COD (Cash on Delivery) after item inspection.
                </p>
                </div>
          </div>
        </div>
            </div>
          </div>
        </div>

        

        {/* Privacy Note */}
        <div className="flex items-center text-sm text-gray-500">
          <Info className="h-4 w-4 mr-2" />
          <span>Your contact info is hidden until you accept a deal.</span>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-3xl text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-9 py-2 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 transition-colors"
          >
            Post Item
          </button>
        </div>
      </form>
    </div>
    </div>
  );
};

export default PostNewItem;