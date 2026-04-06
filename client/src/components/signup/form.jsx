import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProgressBar from "./progressBar";
import { signupUser } from '../../api/auth';
import BrandLogo from '../BrandLogo';

export default function SignUpForm() {
  const navigate = useNavigate();
        const hasDigit = (value) => /\d/.test(String(value || ''));
    const [formData, setFormData] = useState({
        fullName: '',
        department: '',
        password: '',
        email: '',
        graduationYear: '',
        confirmPassword: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (formData.password !== formData.confirmPassword) {
            setErrorMessage("Passwords don't match.");
            return;
        }

        if (hasDigit(formData.fullName) || hasDigit(formData.department)) {
            setErrorMessage('Name and department must contain text only (no numbers).');
            return;
        }

        try {
            setIsSubmitting(true);
            const { token, user } = await signupUser(formData);

            localStorage.setItem('authToken', token || '');
            localStorage.setItem('currentUser', JSON.stringify(user || {}));
            localStorage.setItem(
                'signupFlow',
                JSON.stringify({
                    email: formData.email,
                    createdAt: Date.now(),
                })
            );

            navigate('/signup/verification');
        } catch (error) {
            setErrorMessage(error.message || 'Signup failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container-main flex flex-col items-center justify-center w-full px-4 py-6 sm:py-10">
            <BrandLogo
                to="/"
                stacked
                className="mb-4 sm:mb-6"
                iconClassName="h-10 w-10 sm:h-12 sm:w-12"
                textClassName="text-xl sm:text-2xl"
            />

            {/* Progress Bar */}
             <div className="w-full bg-white mb-2">
                <div className="max-w-2xl mx-auto px-1 sm:px-4 py-4 sm:py-6">
                    <ProgressBar currentStep={1} />
                </div>
            </div>

            <div className="w-full max-w-3xl border border-gray-300 rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-lg">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Step 1: Account Details</h2>
                <p className="text-gray-600 mb-6">Let's get started with your basic information.</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {errorMessage && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {errorMessage}
                        </div>
                    )}

                    {/* 2-Column Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                                    pattern="^[^0-9]+$"
                                    title="Use text only. Numbers are not allowed."
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
                                    pattern="^[^0-9]+$"
                                    title="Use text only. Numbers are not allowed."
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
                            disabled={isSubmitting}
                        className="w-full bg-[#137FEC] text-white py-3 px-4 rounded-2xl hover:bg-blue-700 transition duration-200 font-medium mt-4"
                        >
                            {isSubmitting ? 'Creating Account...' : 'Continue to Verification'}
                        </button>
                    </div>
                </form>

                {/* Login Link */}
                <p className="mt-6 text-sm text-gray-600 text-center">
                    Already have an account?{' '}
                    <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
                        Log in
                    </Link>
                </p>
            </div>
            <div>
                <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 text-gray-500 text-sm">
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
        </div>
    );
}