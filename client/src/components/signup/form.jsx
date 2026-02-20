import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from "./progressBar";

export default function SignUpForm() {
  const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        department: '',
        password: '',
        email: '',
        graduationYear: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add validation here
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        console.log('Form submitted:', formData);
        // Proceed to next step or submit to API

        // Save data to localStorage or context
        localStorage.setItem('signupData', JSON.stringify(formData));
        
        // Navigate to verification step
        navigate('/signup/verification');
    };

    return (
        <div className="container-main flex flex-col items-center justify-center min-h-screen px-4">
            {/* Progress Bar */}
            <div className="w-full bg-white mb-8">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <ProgressBar currentStep={1} />
                </div>
            </div>

            <div className="border border-gray-300 rounded-2xl p-8 w-2xl max-w-3xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Step 1: Account Details</h2>
                <p className="text-gray-600 mb-6">Let's get started with your basic information.</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 2-Column Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column - 3 Fields */}
                        <div className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                    FULL NAME
                                </label>
                                <input 
                                    id="fullName"
                                    name="fullName"
                                    type="text" 
                                    placeholder="Enter your full name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Department/Major */}
                            <div>
                                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                                    DEPARTMENT / MAJOR
                                </label>
                                <input 
                                    id="department"
                                    name="department"
                                    type="text" 
                                    placeholder="Enter your department or major"
                                    value={formData.department}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    PASSWORD
                                </label>
                                <input 
                                    id="password"
                                    name="password"
                                    type="password" 
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength="8"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Right Column - 3 Fields */}
                        <div className="space-y-4">
                            {/* University Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    UNIVERSITY EMAIL
                                </label>
                                <input 
                                    id="email"
                                    name="email"
                                    type="email" 
                                    placeholder="student@st.ug.edu.gh"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Graduation Year */}
                            <div>
                                <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700">
                                    GRADUATION YEAR
                                </label>
                                <input 
                                    id="graduationYear"
                                    name="graduationYear"
                                    type="number" 
                                    placeholder="Enter your graduation year"
                                    value={formData.graduationYear}
                                    onChange={handleChange}
                                    min={new Date().getFullYear()}
                                    max={new Date().getFullYear() + 6}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    CONFIRM PASSWORD
                                </label>
                                <input 
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password" 
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button - Full Width */}
                    <div className="flex justify-center pt-4">
                        <button 
                            type="submit" 
                        className="w-full bg-[#137FEC] text-white py-3 px-4 rounded-2xl hover:bg-blue-700 transition duration-200 font-medium mt-4"
                        >
                            Continue to Verification
                        </button>
                    </div>
                </form>

                {/* Login Link */}
                <p className="mt-6 text-sm text-gray-600 text-center">
                    Already have an account?{' '}
                    <a href="/" className="text-blue-600 hover:text-blue-800 font-medium">
                        Log in
                    </a>
                </p>
            </div>
        </div>
    );
}