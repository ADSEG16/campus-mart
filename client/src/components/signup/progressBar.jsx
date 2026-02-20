import React from 'react';

const HorizontalProgressBar = ({ currentStep = 1 }) => {
    return (
        <div className="flex flex-col w-full py-2">
            {/* Progress bar container */}
            <div className="relative flex items-center justify-between w-full">
                {/* Background line (gray) - positioned in the middle vertically */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full"></div>
                
                {/* Progress line (blue) - width changes based on current step */}
                <div 
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 rounded-full transition-all duration-500 ease-in-out"
                    style={{ 
                        width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
                    }}
                ></div>
                
                {/* Step 1 - Account details */}
                <div className="relative flex flex-col items-center">
                    <div className="bg-white p-1 rounded-full">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                            currentStep >= 1 
                                ? 'bg-blue-600 border-2 border-blue-600' 
                                : 'bg-white border-2 border-gray-300'
                        }`}>
                            {currentStep > 1 ? (
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <span className={`text-sm font-bold ${
                                    currentStep >= 1 ? 'text-white' : 'text-gray-500'
                                }`}>1</span>
                            )}
                        </div>
                    </div>
                    <span className={`text-xs sm:text-sm font-medium mt-3 text-center ${
                        currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                        Account Details
                    </span>
                </div>

                {/* Step 2 - Verification */}
                <div className="relative flex flex-col items-center">
                    <div className="bg-white p-1 rounded-full">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                            currentStep >= 2 
                                ? 'bg-blue-600 border-2 border-blue-600' 
                                : 'bg-white border-2 border-gray-300'
                        }`}>
                            {currentStep > 2 ? (
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <span className={`text-sm font-bold ${
                                    currentStep >= 2 ? 'text-white' : 'text-gray-500'
                                }`}>2</span>
                            )}
                        </div>
                    </div>
                    <span className={`text-xs sm:text-sm font-medium mt-3 text-center ${
                        currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                        Verification
                    </span>
                </div>

                {/* Step 3 - Profile Setup */}
                <div className="relative flex flex-col items-center">
                    <div className="bg-white p-1 rounded-full">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                            currentStep >= 3 
                                ? 'bg-blue-600 border-2 border-blue-600' 
                                : 'bg-white border-2 border-gray-300'
                        }`}>
                            {currentStep > 3 ? (
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <span className={`text-sm font-bold ${
                                    currentStep >= 3 ? 'text-white' : 'text-gray-500'
                                }`}>3</span>
                            )}
                        </div>
                    </div>
                    <span className={`text-xs sm:text-sm font-medium mt-3 text-center ${
                        currentStep >= 3 ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                        Profile Setup
                    </span>
                </div>
            </div>

            {/* Optional: Step description for better UX */}
            <div className="flex justify-between mt-2 px-2">
                <div className="text-[10px] sm:text-xs text-gray-500 text-center w-20">
                    {currentStep === 1 && 'Basic information'}
                    {currentStep > 1 && 'Completed'}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 text-center w-20">
                    {currentStep === 2 && 'ID verification'}
                    {currentStep > 2 && 'Completed'}
                    {currentStep < 2 && 'Pending'}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 text-center w-20">
                    {currentStep === 3 && 'Complete your profile'}
                    {currentStep > 3 && 'Completed'}
                    {currentStep < 3 && 'Pending'}
                </div>
            </div>
        </div>
    );
};

export default HorizontalProgressBar;