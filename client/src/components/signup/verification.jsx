import React, { useState, useEffect, useCallback } from 'react';
import ProgressBar from "./progressBar";
import studentID from "../../assets/studentID.webp";
import { useNavigate } from "react-router-dom";
import Navbar from '../navbar';
import Footer from '../footer';
import { getStoredAuthToken } from '../../api/http';
import { uploadStudentId, getCurrentUser, verifyEmail } from '../../api/auth';

export default function Verification() {
	const navigate = useNavigate();
	const [uploadedFile, setUploadedFile] = useState(null);
	const [previewUrl, setPreviewUrl] = useState('');
	const [isDragging, setIsDragging] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isEmailVerified, setIsEmailVerified] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const checkEmailVerification = useCallback(async () => {
		try {
			const authToken = getStoredAuthToken();
			if (!authToken) {
				setErrorMessage('Your signup session has expired. Please sign up again.');
				navigate('/signup');
				return;
			}

			const response = await getCurrentUser({ token: authToken });
			const user = response?.data || response || {};
			const emailVerified = Boolean(user?.emailVerified);

			setIsEmailVerified(emailVerified);
			localStorage.setItem('currentUser', JSON.stringify(user));

			if (emailVerified) {
				setErrorMessage('');
			}
		} catch (error) {
			console.error('Failed to check email verification:', error);
			setErrorMessage('Failed to check email verification status.');
		} finally {
			setIsLoading(false);
		}
	}, [navigate]);

	// Check email verification status on mount
	useEffect(() => {
		checkEmailVerification();
	}, [checkEmailVerification]);

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			processFile(file);
		}
	};

	const processFile = (file) => {
		// Check file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			alert('File size must be less than 5MB');
			return;
		}

		setUploadedFile(file);
		
		// Create preview for images
		if (file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreviewUrl(reader.result);
			};
			reader.readAsDataURL(file);
		} else {
			// For PDF files, show a PDF icon
			setPreviewUrl(null);
		}
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e) => {
		e.preventDefault();
		setIsDragging(false);
		
		const file = e.dataTransfer.files[0];
		if (file) {
			processFile(file);
		}
	};

	const handleRemoveFile = () => {
		setUploadedFile(null);
		setPreviewUrl('');
		// Reset file input
		document.getElementById('studentId').value = '';
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setErrorMessage('');

		if (!uploadedFile) {
			setErrorMessage('Please upload your student ID first');
			return;
		}

		if (!isEmailVerified) {
			setErrorMessage('Please verify your email first by clicking the Verify Email button.');
			return;
		}

		const authToken = getStoredAuthToken();
		if (!authToken) {
			setErrorMessage('Your signup session has expired. Please sign up again.');
			navigate('/signup');
			return;
		}

		try {
			setIsSubmitting(true);
			await uploadStudentId({ token: authToken, file: uploadedFile });
			navigate('/signup/profileSetup');
		} catch (error) {
			setErrorMessage(error.message || 'Failed to submit verification');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleVerifyEmail = async () => {
		const authToken = getStoredAuthToken();
		if (!authToken) {
			setErrorMessage('Your signup session has expired. Please sign up again.');
			navigate('/signup');
			return;
		}

		try {
			setIsVerifyingEmail(true);
			setErrorMessage('');
			const response = await verifyEmail({ token: authToken });
			const verifiedUser = response?.data || response || {};
			setIsEmailVerified(true);
			localStorage.setItem('currentUser', JSON.stringify(verifiedUser));
		} catch (error) {
			setErrorMessage(error.message || 'Failed to verify email. Please try again.');
		} finally {
			setIsVerifyingEmail(false);
		}
	};

	const handleBack = () => {
		// Handle back navigation logic here
		console.log('Navigate back to Step 1');
		navigate('/signup');
	};

	const formatFileSize = (bytes) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	return (
		<div>
			<Navbar />
		<div className="container-main flex flex-col items-center justify-center min-h-screen px-3 sm:px-4 py-6 sm:py-8">
			{/* Progress Bar */}
			<div className="w-full bg-white mb-2">
				<div className="max-w-2xl mx-auto px-1 sm:px-4 py-4 sm:py-6">
					<ProgressBar currentStep={2} />
				</div>
			</div>
			
			<div className="w-full max-w-3xl border border-gray-300 rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-lg bg-white">
				<div className="flex flex-col items-start justify-start mb-6">
					<h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Step 2: Student Verification</h2>
					<p className="text-gray-600">To ensure a secure marketplace, we require student verification. Please upload a valid student ID for verification.</p>
				</div>

				{isLoading ? (
					<div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
						<div className="flex items-center">
							<svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Checking email verification status...
						</div>
					</div>
				) : isEmailVerified ? (
					<div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
						<div className="flex items-center">
							<svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
							</svg>
							Email verified! You can now upload your student ID.
						</div>
					</div>
				) : (
					<div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
						<div className="flex items-start">
							<svg className="w-5 h-5 mr-2 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
							</svg>
							<span>Verify your email before uploading your student ID.</span>
						</div>
						<button
							type="button"
							onClick={handleVerifyEmail}
							disabled={isVerifyingEmail}
							className="mt-3 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isVerifyingEmail ? 'Verifying...' : 'Verify Email'}
						</button>
					</div>
				)}

				{errorMessage && (
					<div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
						{errorMessage}
					</div>
				)}

				<div className='grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8'>
					{/* Left Column - Upload Area */}
					<div className="space-y-4">
						<label className="block text-sm font-medium text-gray-700">
							UPLOAD STUDENT ID
						</label>
						
						{/* Drag & Drop Upload Area */}
						<div
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
							onClick={() => document.getElementById('studentId').click()}
							className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 cursor-pointer ${
								isDragging 
									? 'border-blue-500 bg-blue-50' 
									: uploadedFile 
										? 'border-green-500 bg-green-50' 
										: 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
							}`}
						>
							{!uploadedFile ? (
								// Upload prompt
								<div className="flex flex-col items-center text-center">
									<svg 
										className="w-12 h-12 text-gray-400 mb-3" 
										fill="none" 
										stroke="currentColor" 
										viewBox="0 0 24 24"
									>
										<path 
											strokeLinecap="round" 
											strokeLinejoin="round" 
											strokeWidth="1.5" 
											d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
										/>
									</svg>
									<p className="text-sm text-gray-600 mb-1">
										<span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
									</p>
									<p className="text-xs text-gray-500">
										PNG, JPG or PDF (max. 5MB)
									</p>
								</div>
							) : (
								// Uploaded file preview
								<div className="flex items-center gap-3 sm:gap-4">
									{previewUrl ? (
										// Image preview
										<div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
											<img 
												src={previewUrl} 
												alt="Student ID preview" 
												className="w-full h-full object-cover"
											/>
										</div>
									) : (
										// PDF icon
										<div className="w-16 h-16 rounded-lg bg-red-100 flex items-center justify-center">
											<svg 
												className="w-8 h-8 text-red-500" 
												fill="currentColor" 
												viewBox="0 0 24 24"
											>
												<path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
											</svg>
										</div>
									)}
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-gray-900 truncate">
											{uploadedFile.name}
										</p>
										<p className="text-xs text-gray-500">
											{formatFileSize(uploadedFile.size)}
										</p>
									</div>
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											handleRemoveFile();
										}}
										className="p-1 hover:bg-gray-200 rounded-full transition-colors"
									>
										<svg 
											className="w-5 h-5 text-gray-500" 
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
								</div>
							)}
							
							{/* Hidden file input */}
							<input
								id="studentId"
								name="studentId"
								type="file"
								accept="image/*,application/pdf"
								onChange={handleFileChange}
								className="hidden"
							/>
						</div>
					</div>

					{/* Right Column - Verification Requirements and Example Format */}
					<div className="space-y-6">
						{/* Verification Requirements */}
						<div className="bg-blue-50 rounded-xl p-4">
							<h4 className="text-sm font-semibold text-blue-800 mb-2">Verification Requirements:</h4>
							<ul className="space-y-2">
								<li className="flex items-start text-sm text-blue-700">
									<svg className="w-4 h-4 mr-2 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									Full name must be clearly visible
								</li>
								<li className="flex items-start text-sm text-blue-700">
									<svg className="w-4 h-4 mr-2 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									Photo must be bright and clear
								</li>
								<li className="flex items-start text-sm text-blue-700">
									<svg className="w-4 h-4 mr-2 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									Expiration date must be current
								</li>
							</ul>
						</div>

						{/* Example Format */}
						<div className="space-y-2">
							<label className="block text-sm font-medium text-gray-700">
								EXAMPLE FORMAT
							</label>
							<div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
								<div className="relative">
									<img 
										src={studentID} 
										alt="Student ID Example" 
										className="w-full h-40 sm:h-48 object-contain rounded-lg"
									/>
									<div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center">
										<p className="text-white text-xs p-2">Example of a valid student ID</p>
									</div>
								</div>
								<p className="text-xs text-gray-500 mt-3 text-center">
									Ensure your ID follows this format for faster verification
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col items-center justify-end mt-8 space-y-2">
					<button
						type="submit"
						onClick={handleSubmit}
						disabled={!uploadedFile || isSubmitting || !isEmailVerified || isLoading}
						className={`w-full px-4 py-3 rounded-2xl transition-all duration-300 font-medium ${
							uploadedFile && !isSubmitting && isEmailVerified && !isLoading
								? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer' 
								: 'bg-gray-300 text-gray-500 cursor-not-allowed'
						}`}
					>
						{isLoading
							? 'Checking status...'
							: isSubmitting
								? 'Submitting...'
								: !isEmailVerified
									? 'Verify email to continue'
									: uploadedFile
										? 'Submit for Verification'
										: 'Upload a file to continue'}
					</button>
					<button
						type="button"
						onClick={handleBack}
						className="w-full bg-[#F1F5F9] text-gray-700 py-3 rounded-2xl hover:bg-[#bfd7ef] transition-colors duration-300 font-medium"
					>
						Back to Step 1
					</button>
				</div>
			</div>
		</div>
		<div>
	                <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 text-gray-500 text-sm px-4 text-center sm:text-left">
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