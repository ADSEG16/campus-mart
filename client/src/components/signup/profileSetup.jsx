import React, { useState } from 'react';
import ProgressBar from "./progressBar";
import { useNavigate } from 'react-router-dom';
import Navbar from '../navbar';
import Footer from '../footer';
import { completeProfile, uploadProfileImage } from '../../api/auth';
import { getStoredAuthToken } from '../../api/http';

export default function Profile() {
		const navigate = useNavigate();	
    const [profileImage, setProfileImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [bio, setBio] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setProfileImage(null);
        setPreviewUrl('');
        // Reset file input
        document.getElementById('profilePicture').value = '';
    };

        const handleCompleteRegistration = async () => {
            setErrorMessage('');
            const authToken = getStoredAuthToken();

            if (!authToken) {
                setErrorMessage('Session expired. Please sign up again.');
                navigate('/signup');
                return;
            }

            try {
                setIsSubmitting(true);

                if (profileImage) {
                    await uploadProfileImage({ token: authToken, file: profileImage });
                }

                const response = await completeProfile({ token: authToken, bio });
                if (response?.data) {
                    localStorage.setItem('currentUser', JSON.stringify(response.data));
                }

                navigate('/dashboard');
            } catch (error) {
                setErrorMessage(error.message || 'Failed to complete profile setup');
            } finally {
                setIsSubmitting(false);
            }
		};

		const handleBackToStep2 = () => {
			navigate('/signup/verification');
		}

    return (
			<div>
				<Navbar />
        <div className="container-main flex flex-col items-center justify-center min-h-screen px-4">
            {/* Progress Bar */}
            <div className="w-full bg-white mb-2">
                <div className="max-w-2xl mx-auto px-4 py-6">
                    <ProgressBar currentStep={3} />
                </div>
            </div>
            
            <div className="border border-gray-300 rounded-2xl p-8 w-2xl max-w-3xl shadow-lg">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Step 3: Profile Setup</h2>
                    <p className="text-gray-600 mb-6">Let the community know a little bit about you.</p>
                </div>

				{errorMessage && (
					<div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
						{errorMessage}
					</div>
				)}
                
                <form className="space-y-6">
                    {/* Profile Picture Upload - Circular Design */}
                    <div className="flex flex-col items-center">
                        <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-3">
                            PROFILE PICTURE
                        </label>
                        
                        <div className="relative">
                            {/* Circular container */}
                            <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-gray-300 overflow-hidden flex items-center justify-center">
                                {previewUrl ? (
                                    <img 
                                        src={previewUrl} 
                                        alt="Profile preview" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    // Gray human profile icon (default)
                                    <svg 
                                        className="w-16 h-16 text-gray-400" 
                                        fill="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                    </svg>
                                )}
                            </div>

                            {/* Upload icon button - positioned at bottom right */}
                            <label 
                                htmlFor="profilePicture" 
                                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors duration-200 shadow-lg border-2 border-white"
                            >
                                <svg 
                                    className="w-4 h-4 text-white" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth="2" 
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                            </label>

                            {/* Remove image button (only shows if image is uploaded) */}
                            {profileImage && (
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-lg border-2 border-white"
                                >
                                    <svg 
                                        className="w-3 h-3 text-white" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth="2" 
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Hidden file input */}
                        <input
                            id="profilePicture"
                            name="profilePicture"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />

                        {/* Helper text */}
                        <p className="text-xs text-gray-500 mt-3">
                            Click the + button to upload a photo
                        </p>
                    </div>

                    {/* Bio Section */}
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700"> 
                            SHORT BIO
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            placeholder="E.g. Senior CS student, selling mostly tech gear and textbooks. Quick to respond!"
                            rows="4"
                            value={bio}
                            onChange={(e) => setBio(e.target.value.slice(0, 200))}
                            className='w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Maximum 200 characters
                        </p>
                    </div>

                    {/* Add more profile fields as needed */}
                </form>

                {/* Action Buttons */}
                <div className="space-y-2">
                    <button 
										type='submit'
										onClick={handleCompleteRegistration}
                                    disabled={isSubmitting}
										className="mt-6 w-full bg-blue-600 text-white py-3 rounded-2xl hover:bg-blue-700 transition-colors duration-300 font-medium">
                                    {isSubmitting ? 'Saving Profile...' : 'Complete Registration'}
                    </button>
                    <button 
										type="button"
										onClick={handleBackToStep2}
										className="w-full bg-[#F1F5F9] text-gray-700 py-3 rounded-2xl hover:bg-[#bfd7ef] transition-colors duration-300 font-medium">
                        Back to Step 2
                    </button>
                </div>
            </div>
        </div>
				<div>
                <div className="mt-8 flex flex-row justify-center items-center gap-6 text-gray-500 text-sm">
                    <p className="flex items-center">
                        <span className="mr-1 text-[#137FEC]">✓</span> 
                        Verified Student
                    </p>
                    <p className="flex items-center">
                        <span className="mr-1 text-[#137FEC]">🛡️</span> 
                        Safe trading
                    </p>
                </div>
            </div>
				<Footer />
				</div>
    );
}