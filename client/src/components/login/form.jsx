import React, { useState } from 'react';
import secLogo from "../../assets/sec-logo.svg";
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/auth';

export default function LoginForm() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            setErrorMessage('');

            const { token, user } = await loginUser({ email, password });
            localStorage.setItem('authToken', token || '');
            localStorage.setItem('currentUser', JSON.stringify(user || {}));

            navigate('/marketplace');
        } catch (error) {
            setErrorMessage(error.message || 'Login failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container-main flex flex-col items-center justify-center w-full h-full px-4 py-10">
            {/* Added border container */}
            <div className="border border-gray-300 rounded-2xl p-8 w-full max-w-md shadow-lg">
                <div className="login-header flex flex-col items-center justify-center mb-6">
                    <img 
                        src={secLogo} 
                        alt="SEC Logo" 
                        className="sec-logo w-16 h-16 mb-4" 
                    />
                    <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                    <p className="text-gray-600 mt-2">Log in to the verified student marketplace</p>
                </div>
                
                <form onSubmit={handleSubmit} className="login-form flex flex-col w-full space-y-4">
                    {errorMessage && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {errorMessage}
                        </div>
                    )}

                    <div className='flex flex-col space-y-1'>
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">
                           UNIVERSITY EMAIL
                        </label>
                        <input 
                            id="email"
                            type="email" 
                            placeholder="student@st.ug.edu.gh" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className='w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                    </div>
                    
                    <div className='flex flex-col space-y-1'>
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">
                            PASSWORD
                        </label>
                        <input 
                            id="password"
                            type="password" 
                            placeholder="*************" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className='w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                            <input
                                id="remember"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                                Remember me
                            </label>
                        </div>
                        
                        <div className="text-sm">
                            <Link to="/signup" className="text-blue-600 hover:text-blue-800">
                                Forgot password?
                            </Link>
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                                                disabled={isSubmitting}
                        className="w-full bg-[#137FEC] text-white py-3 px-4 rounded-2xl hover:bg-blue-700 transition duration-200 font-medium mt-4"
                    >
                                            {isSubmitting ? 'Logging in...' : 'Login to CampusMart'}
                    </button>
                </form>
                
                <p className="mt-6 text-sm text-gray-600 text-center">
                    New to CampusMart?{' '}
                    <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
                        Create a verified account
                    </Link>
                </p>
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
        </div>
    );
}