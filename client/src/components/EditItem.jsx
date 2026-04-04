import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Upload,
  Camera,
  X,
  ChevronDown,
  DollarSign,
  MapPin,
  Shield,
  AlertCircle,
  Info,
  Save
} from "lucide-react";
import Nav from "./nav";
import { useListings } from "../context";

const EditItem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getListingById, updateListing, updateListingStatus } = useListings();
  
  const [photos, setPhotos] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    condition: "",
    description: "",
    meetingSpot: "",
    subtitle: "",
    conditionColor: "green"
  });
  const [loading, setLoading] = useState(true);

  const categories = [
    "Textbooks",
    "Electronics",
    "Dorm Life",
    "Tickets",
    "Clothing",
    "Furniture",
    "Other"
  ];

  const conditions = [
    { label: "New", color: "blue" },
    { label: "Like New", color: "green" },
    { label: "Good", color: "green" },
    { label: "Fair", color: "orange" }
  ];

  // Load existing listing data - FIXED VERSION
  useEffect(() => {
    const listing = getListingById(parseInt(id));
    
    if (listing) {
      // Safely format condition string
      let conditionValue = "";
      if (listing.condition) {
        conditionValue = listing.condition.charAt(0).toUpperCase() + 
                        listing.condition.slice(1).toLowerCase();
      }

      // Use a single update function to batch state updates
      const initializeData = () => {
        setFormData({
          title: listing.title || "",
          category: listing.category || "",
          price: listing.price ? listing.price.replace('GHC', '').replace('$', '').trim() : "",
          condition: conditionValue,
          description: listing.description || "",
          meetingSpot: listing.meetingSpot || "verified",
          subtitle: listing.subtitle || "",
          conditionColor: listing.conditionColor || "green"
        });
        
        // Handle existing photos
        if (listing.image) {
          setExistingPhotos([listing.image]);
        }
        
        setLoading(false);
      };

      initializeData();
    } else {
      // Item not found, redirect to my listings
      navigate("/my-listings");
    }
  }, [id, getListingById, navigate]); // Removed setLoading from dependencies

  // Map condition to color
  const getConditionColor = (condition) => {
    const map = {
      "New": "blue",
      "Like New": "green",
      "Good": "green",
      "Fair": "orange"
    };
    return map[condition] || "gray";
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + existingPhotos.length + files.length <= 5) {
      const newPhotos = files.map(file => URL.createObjectURL(file));
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const removePhoto = (index, isExisting = false) => {
    if (isExisting) {
      setExistingPhotos(existingPhotos.filter((_, i) => i !== index));
    } else {
      setPhotos(photos.filter((_, i) => i !== index));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Update listing object
    const updatedListing = {
      title: formData.title,
      subtitle: formData.subtitle || "New listing",
      description: formData.description,
      price: formData.price ? `GHC ${parseFloat(formData.price).toFixed(0)}` : "GHC 0",
      condition: formData.condition ? formData.condition.toUpperCase() : "NEW",
      conditionColor: getConditionColor(formData.condition),
      category: formData.category,
      image: photos.length > 0 ? photos[0] : (existingPhotos.length > 0 ? existingPhotos[0] : null),
      meetingSpot: formData.meetingSpot,
      meetingLocation: formData.meetingSpot === "verified" 
        ? "Student Union / Library" 
        : "Custom campus spot (to be arranged)"
    };

    // Update in context
    updateListing(parseInt(id), updatedListing);
    
    console.log("Item updated:", updatedListing);
    
    // Navigate back to My Listings
    navigate("/my-listings");
  };

  const handleMarkAsSold = () => {
    updateListingStatus(parseInt(id), "sold", {
      soldTo: "Buyer",
      soldDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
    navigate("/my-listings");
  };

  const handleDeactivate = () => {
    updateListingStatus(parseInt(id), "inactive");
    navigate("/my-listings");
  };

  if (loading) {
    return (
      <div>
        <Nav />
        <div className="max-w-4xl mx-auto p-6 mt-8 flex justify-center">
          <div className="text-gray-500">Loading listing data...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <div className="max-w-4xl mx-auto p-6 mt-8">
        {/* Header with actions */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Item</h1>
            <p className="text-gray-600">
              Update your listing details below.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleMarkAsSold}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Mark as Sold
            </button>
            <button
              onClick={handleDeactivate}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Deactivate
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Photos Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos</h2>
            <p className="text-sm text-gray-600 mb-4">
              Update photos of your item (max 5).
            </p>

            {/* Photo Upload Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {/* Existing Photos */}
              {existingPhotos.map((photo, index) => (
                <div key={`existing-${index}`} className="aspect-square relative group">
                  <img
                    src={photo}
                    alt={`Existing ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index, true)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                    Current
                  </div>
                </div>
              ))}

              {/* New Photos */}
              {photos.map((photo, index) => (
                <div key={`new-${index}`} className="aspect-square relative group">
                  <img
                    src={photo}
                    alt={`New ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index, false)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                    New
                  </div>
                </div>
              ))}

              {/* Upload Button (if less than 5 total) */}
              {photos.length + existingPhotos.length < 5 && (
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
              )}

              {/* Empty slots indicator */}
              {Array.from({ length: Math.max(0, 5 - photos.length - existingPhotos.length - 1) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="aspect-square border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center"
                >
                  <Camera className="h-6 w-6 text-gray-300" />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {existingPhotos.length + photos.length}/5 photos
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle (Optional)
                </label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
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
                      required
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
                    Price (GHC)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
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
                      key={cond.label}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, condition: cond.label }))}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.condition === cond.label
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cond.label}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
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

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-3xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-9 py-2 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItem;