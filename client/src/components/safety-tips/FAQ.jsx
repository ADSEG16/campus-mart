import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I verify my account?",
      answer: "Verification is simple! Go to your profile settings and click 'Verify Account'. You'll need to use your official university email address. Once you click the link in our confirmation email, you'll receive your 'Verified Student' badge."
    },
    {
      question: "What are Safe Meeting Zones?",
      answer: "Safe Meeting Zones are designated campus locations (like the Library or Student Union) that are well-lit, monitored by CCTV, and have high foot traffic. Look for the 'Safe Zone' icon on the campus map provided in our app."
    },
    {
      question: "How does COD work?",
      answer: "Cash on Delivery (COD) means the buyer pays the seller in person at the time of the exchange. We recommend inspecting the item thoroughly before handing over any cash or completing a digital transfer via Venmo/Zelle."
    },
    {
      question: "How do I report a suspicious user?",
      answer: "If a user makes you feel uncomfortable or requests an off-campus meeting, tap the 'Report' button in your chat menu. Our safety team reviews all reports within 24 hours and takes necessary actions to protect the community."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-6xl bg-white px-6 py-8 sm:px-8 sm:py-10">
      {/* Main Heading */}
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        Frequently Asked Questions
      </h1>
      
      {/* Subheading */}
      <p className="text-gray-600 text-base mb-10">
        Quick answers to common safety and process questions.
      </p>

      {/* FAQ Items */}
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Question Button */}
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center px-8 py-8 text-left bg-white hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-lg font-semibold text-gray-900">
                {faq.question}
              </h2>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            {/* Answer Panel */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                openIndex === index 
                  ? 'max-h-96 opacity-100 pb-6 px-6' 
                  : 'max-h-0 opacity-0 overflow-hidden'
              }`}
            >
              <p className="text-gray-700 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;