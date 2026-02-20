import React, { useState } from 'react';
import ProgressBar from "./progressBar";
import studentID from "../../assets/studentID.webp";
import { useNavigate } from "react-router-dom";

export default function Verification() {
	const navigate = useNavigate();
	const [uploadedFile, setUploadedFile] = useState(null);
	const [previewUrl, setPreviewUrl] = useState('');
	const [isDragging, setIsDragging] = useState(false);

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

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!uploadedFile) {
			alert('Please upload your student ID first');
			return;
		}
		// Handle verification submission logic here
		console.log('Verification submitted', uploadedFile);
		// You can add API call here
		navigate('/signup/profileSetup');
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
		<div className="container-main flex flex-col items-center justify-center min-h-screen px-4 py-8">
						 {/* Progress Bar */}
			<div className="w-full bg-white mb-8">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <ProgressBar currentStep={3} />
                </div>
            </div>
			
			<div className="border border-gray-300 rounded-2xl p-8 w-2xl max-w-3xl shadow-lg bg-white">
				<div className="flex flex-col items-left justify-left mb-6">
					<h2 className="text-2xl font-bold text-gray-800 mb-2">Step 2: Student Verification</h2>
					<p className="text-gray-600">To ensure a secure marketplace, we require student verification. Please upload a valid student ID for verification.</p>
				</div>
				
				<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
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
								<div className="flex items-center space-x-4">
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
									<svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									Full name must be clearly visible
								</li>
								<li className="flex items-start text-sm text-blue-700">
									<svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									Photo must be bright and clear
								</li>
								<li className="flex items-start text-sm text-blue-700">
									<svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									Expiration date must be current
								</li>
							</ul>
						</div>

						{/* Example Format */}
						<div className="space-y-2">
							<label className="block text-sm font-medium text-gray-700">
								SAMPLE VALID
							</label>
							<div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
								<div className="relative">
									<img 
										src={studentID} 
										alt="Student ID Example" 
										className="w-full h-48 object-contain rounded-lg"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center">
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
						disabled={!uploadedFile}
						className={`w-full px-4 py-3 rounded-2xl transition-all duration-300 font-medium ${
							uploadedFile 
								? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer' 
								: 'bg-gray-300 text-gray-500 cursor-not-allowed'
						}`}
					>
						{uploadedFile ? 'Submit for Verification' : 'Upload a file to continue'}
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
	);
}