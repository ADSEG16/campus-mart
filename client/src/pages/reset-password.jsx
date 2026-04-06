import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import Footer from '../components/footer';
import { resetPassword } from '../api/auth';

export default function ResetPassword() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const token = searchParams.get('token');

	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	// Validate token on load
	React.useEffect(() => {
		if (!token) {
			setErrorMessage('Invalid or missing reset token. Please request a new password reset link.');
		}
	}, [token]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setErrorMessage('');
		setSuccessMessage('');

		if (!newPassword || !confirmPassword) {
			setErrorMessage('Please fill in all fields');
			return;
		}

		if (newPassword.length < 6) {
			setErrorMessage('Password must be at least 6 characters');
			return;
		}

		if (newPassword !== confirmPassword) {
			setErrorMessage('Passwords do not match');
			return;
		}

		try {
			setIsSubmitting(true);
			await resetPassword({
				token,
				newPassword,
				confirmPassword,
			});
			setSuccessMessage('Password reset successfully! Redirecting to login...');
			setNewPassword('');
			setConfirmPassword('');
			setTimeout(() => {
				navigate('/login');
			}, 2000);
		} catch (error) {
			setErrorMessage(error.message || 'Failed to reset password');
		} finally {
			setIsSubmitting(false);
		}
	};

	const getPasswordStrength = () => {
		if (!newPassword) return null;
		if (newPassword.length < 6) return { text: 'Too short', color: 'text-red-600', bg: 'bg-red-100' };
		if (newPassword.length < 8) return { text: 'Weak', color: 'text-yellow-600', bg: 'bg-yellow-100' };
		if (/[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword)) return { text: 'Strong', color: 'text-green-600', bg: 'bg-green-100' };
		return { text: 'Medium', color: 'text-blue-600', bg: 'bg-blue-100' };
	};

	const passwordStrength = getPasswordStrength();
	const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

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
							Create New Password
						</h1>
						<p className="text-gray-600 text-center mb-6">
							Enter your new password below.
						</p>

						{errorMessage && (
							<div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
								{errorMessage}
							</div>
						)}

						{successMessage && (
							<div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
								{successMessage}
							</div>
						)}

						{!successMessage && token && (
							<form onSubmit={handleSubmit} className="space-y-4">
								{/* New Password */}
								<div>
									<label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
										New Password
									</label>
									<div className="relative">
										<input
											id="newPassword"
											type={showPassword ? 'text' : 'password'}
											value={newPassword}
											onChange={(e) => setNewPassword(e.target.value)}
											placeholder="Enter new password"
											className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
											disabled={isSubmitting}
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
										>
											{showPassword ? '👁️' : '👁️‍🗨️'}
										</button>
									</div>
									{passwordStrength && (
										<div className={`mt-2 p-2 rounded ${passwordStrength.bg}`}>
											<p className={`text-xs font-medium ${passwordStrength.color}`}>
												Strength: {passwordStrength.text}
											</p>
										</div>
									)}
								</div>

								{/* Confirm Password */}
								<div>
									<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
										Confirm Password
									</label>
									<div className="relative">
										<input
											id="confirmPassword"
											type={showConfirmPassword ? 'text' : 'password'}
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											placeholder="Re-enter password"
											className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
												confirmPassword && !passwordsMatch
													? 'border-red-300 bg-red-50'
													: 'border-gray-300'
											}`}
											disabled={isSubmitting}
										/>
										<button
											type="button"
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
											className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
										>
											{showConfirmPassword ? '👁️' : '👁️‍🗨️'}
										</button>
									</div>
									{confirmPassword && !passwordsMatch && (
										<p className="text-xs text-red-600 mt-1">Passwords do not match</p>
									)}
									{confirmPassword && passwordsMatch && (
										<p className="text-xs text-green-600 mt-1">Passwords match ✓</p>
									)}
								</div>

								<button
									type="submit"
									disabled={isSubmitting || !newPassword || !confirmPassword || !passwordsMatch}
									className={`w-full px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
										newPassword && confirmPassword && passwordsMatch && !isSubmitting
											? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
											: 'bg-gray-300 text-gray-500 cursor-not-allowed'
									}`}
								>
									{isSubmitting ? 'Resetting...' : 'Reset Password'}
								</button>

								<div className="text-center">
									<p className="text-sm text-gray-600">
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
							<strong>Password Requirements:</strong>
							<ul className="mt-2 space-y-1 text-xs">
								<li>• Minimum 6 characters</li>
								<li>• For security, use a mix of letters and numbers</li>
							</ul>
						</p>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
}
