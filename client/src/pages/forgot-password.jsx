import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import Footer from '../components/footer';
import { forgotPassword } from '../api/auth';

export default function ForgotPassword() {
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setErrorMessage('');
		setSuccessMessage('');

		if (!email.trim()) {
			setErrorMessage('Please enter your email');
			return;
		}

		try {
			setIsSubmitting(true);
			await forgotPassword(email.trim());
			setSuccessMessage('If an account exists with that email, a password reset link has been sent.');
			setEmail('');
			// Optionally redirect after 3 seconds
			setTimeout(() => {
				navigate('/login');
			}, 3000);
		} catch (error) {
			setErrorMessage(error.message || 'Failed to send reset link');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
			<div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
				<div className="w-full max-w-md">
					{/* Logo */}
					<div className="mb-8 flex justify-center">
						<BrandLogo to="/" stacked />
					</div>

					{/* Card */}
					<div className="bg-white rounded-2xl shadow-lg p-8">
						<h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
							Reset Password
						</h1>
						<p className="text-gray-600 text-center mb-6">
							Enter your email address and we'll send you a link to reset your password.
						</p>

						{errorMessage && (
							<div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
								{errorMessage}
							</div>
						)}

						{successMessage && (
							<div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
								{successMessage}
								<p className="text-xs mt-2">Redirecting to login...</p>
							</div>
						)}

						{!successMessage && (
							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
										Email Address
									</label>
									<input
										id="email"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="your.email@st.ug.edu.gh"
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										disabled={isSubmitting}
									/>
									<p className="text-xs text-gray-500 mt-1">
										Use your UG email address
									</p>
								</div>

								<button
									type="submit"
									disabled={isSubmitting || !email.trim()}
									className={`w-full px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
										email.trim() && !isSubmitting
											? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
											: 'bg-gray-300 text-gray-500 cursor-not-allowed'
									}`}
								>
									{isSubmitting ? 'Sending...' : 'Send Reset Link'}
								</button>

								<div className="text-center">
									<p className="text-sm text-gray-600">
										Remember your password?{' '}
										<button
											type="button"
											onClick={() => navigate('/login')}
											className="text-blue-600 hover:text-blue-800 font-medium"
										>
											Back to login
										</button>
									</p>
								</div>
							</form>
						)}

						{successMessage && (
							<div className="text-center mt-6">
								<button
									onClick={() => navigate('/login')}
									className="text-blue-600 hover:text-blue-800 font-medium"
								>
									Go to Login
								</button>
							</div>
						)}
					</div>

					{/* Help text */}
					<div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
						<p className="text-sm text-blue-800">
							<strong>Note:</strong> The reset link is valid for 1 hour. If it expires, you can request a new one.
						</p>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
}
