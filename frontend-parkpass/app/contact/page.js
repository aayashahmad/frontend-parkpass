'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    // Prevent multiple submissions
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Prepare email data
      const emailData = {
        to: 'bhatashu954@gmail.com',
        from: data.email,
        subject: `ParkPass Contact: ${data.subject}`,
        message: `
          Name: ${data.name}
          Email: ${data.email}
          Phone: ${data.phone || 'Not provided'}
          Subject: ${data.subject}

          Message:
          ${data.message}

          ---
          Sent from ParkPass Contact Form
        `
      };

      // Simulate API call to send email
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo purposes, just show success message
      // In production, this would send an actual email to bhatashu954@gmail.com
      toast.success('🎉 Message sent successfully to Aayash Ahmad Bhat! We\'ll get back to you soon.', {
        id: 'contact-success', // Unique ID to prevent duplicates
        duration: 4000
      });

      reset();
    } catch (error) {
      toast.error('❌ Failed to send message. Please try again.', {
        id: 'contact-error', // Unique ID to prevent duplicates
        duration: 4000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-bounce"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16 animate-fadeInUp">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Contact Us
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Have questions about park bookings in Pulwama? Need assistance with your reservation?
              Contact Aayash Ahmad Bhat for personalized service and local expertise!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {/* Contact Information */}
            <div className="space-y-8 animate-fadeInLeft">
              <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                  <span className="text-4xl mr-3">📞</span>
                  Get in Touch
                </h2>
                
                <div className="space-y-6">
                  {/* Contact Person */}
                  <div className="flex items-start space-x-4 p-4 bg-indigo-50 rounded-2xl hover:bg-indigo-100 transition-colors duration-300">
                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-xl">👤</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Contact Person</h3>
                      <p className="text-gray-600 font-medium">Aayash Ahmad Bhat</p>
                      <p className="text-sm text-gray-500">ParkPass Administrator</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start space-x-4 p-4 bg-emerald-50 rounded-2xl hover:bg-emerald-100 transition-colors duration-300">
                    <div className="flex-shrink-0 w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-xl">📱</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Phone</h3>
                      <p className="text-gray-600">+91 7006052604</p>
                      <p className="text-sm text-gray-500">Mon-Fri 9AM-6PM IST</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors duration-300">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-xl">📧</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email</h3>
                      <p className="text-gray-600">bhatashu954@gmail.com</p>
                      <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-2xl hover:bg-purple-100 transition-colors duration-300">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-xl">📍</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Office Address</h3>
                      <p className="text-gray-600">Near Main Market<br />Pulwama, Jammu & Kashmir<br />PIN: 192301, India</p>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-2xl hover:bg-green-100 transition-colors duration-300">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-xl">💬</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                      <p className="text-gray-600">+91 7006052604</p>
                      <p className="text-sm text-gray-500">Quick support & booking help</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="text-3xl mr-3">🌐</span>
                  Follow Us
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <a href="#" className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors duration-300">
                    <span className="text-2xl">📘</span>
                    <span className="font-medium text-gray-900">Facebook</span>
                  </a>
                  <a href="#" className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors duration-300">
                    <span className="text-2xl">🐦</span>
                    <span className="font-medium text-gray-900">Twitter</span>
                  </a>
                  <a href="#" className="flex items-center space-x-3 p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors duration-300">
                    <span className="text-2xl">📷</span>
                    <span className="font-medium text-gray-900">Instagram</span>
                  </a>
                  <a href="#" className="flex items-center space-x-3 p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors duration-300">
                    <span className="text-2xl">📺</span>
                    <span className="font-medium text-gray-900">YouTube</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="animate-fadeInRight">
              <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                  <span className="text-4xl mr-3">✉️</span>
                  Send us a Message
                </h2>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6"
                  onKeyDown={(e) => {
                    // Prevent Enter key from submitting form multiple times
                    if (e.key === 'Enter' && e.target.type !== 'textarea') {
                      e.preventDefault();
                    }
                  }}
                >
                  {/* Name and Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        {...register('name', { required: 'Name is required' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-300"
                        placeholder="Your full name"
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^\S+@\S+\.\S+$/,
                            message: 'Invalid email address'
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-300"
                        placeholder="your.email@example.com"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>
                  </div>

                  {/* Phone and Subject */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        {...register('phone')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-300"
                        placeholder="+91 7006052604"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <select
                        id="subject"
                        {...register('subject', { required: 'Subject is required' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-300"
                      >
                        <option value="">Select a subject</option>
                        <option value="booking">Booking Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="feedback">Feedback</option>
                        <option value="partnership">Partnership</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      rows={6}
                      {...register('message', { required: 'Message is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-300 resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                    {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={(e) => {
                      // Prevent multiple rapid clicks
                      if (isSubmitting) {
                        e.preventDefault();
                        return;
                      }
                    }}
                    className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-emerald-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Message...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <span className="mr-2">🚀</span>
                        Send Message
                      </span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 animate-fadeInUp" style={{animationDelay: '0.6s'}}>
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center">
                <span className="text-4xl mr-3">❓</span>
                Frequently Asked Questions
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 bg-emerald-50 rounded-2xl">
                    <h3 className="font-semibold text-gray-900 mb-2">How do I book a park visit?</h3>
                    <p className="text-gray-600 text-sm">Simply browse our parks, select your preferred date and number of visitors, and complete the booking process online.</p>
                  </div>

                  <div className="p-6 bg-blue-50 rounded-2xl">
                    <h3 className="font-semibold text-gray-900 mb-2">Can I cancel my booking?</h3>
                    <p className="text-gray-600 text-sm">Yes, you can cancel your booking up to 24 hours before your visit date for a full refund.</p>
                  </div>

                  <div className="p-6 bg-purple-50 rounded-2xl">
                    <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
                    <p className="text-gray-600 text-sm">We accept all major credit/debit cards, UPI payments, and digital wallets like GPay, PhonePe, and Paytm.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-yellow-50 rounded-2xl">
                    <h3 className="font-semibold text-gray-900 mb-2">Do I need to print my ticket?</h3>
                    <p className="text-gray-600 text-sm">No, you can show your digital ticket on your mobile device at the park entrance.</p>
                  </div>

                  <div className="p-6 bg-pink-50 rounded-2xl">
                    <h3 className="font-semibold text-gray-900 mb-2">Are there group discounts available?</h3>
                    <p className="text-gray-600 text-sm">Yes, we offer special rates for groups of 10 or more. Contact us for custom pricing.</p>
                  </div>

                  <div className="p-6 bg-green-50 rounded-2xl">
                    <h3 className="font-semibold text-gray-900 mb-2">What if the weather is bad?</h3>
                    <p className="text-gray-600 text-sm">In case of severe weather, we offer free rescheduling or full refunds for affected bookings.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ContactPage;
