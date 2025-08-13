'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

const VerifyOTPPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('otp'); // 'otp' or 'password'
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      toast.error('Email not found. Please start the password reset process again.');
      router.push('/admin/forgot-password');
    }
  }, [email, router]);

  const onSubmitOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      await axios.post(`${API_URL}/auth/verify-otp`, { 
        email: email, 
        otp: otp 
      });
      
      setStep('password');
      toast.success('OTP verified! Enter your new password.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async ({ password, confirmPassword }) => {
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      await axios.post(`${API_URL}/auth/reset-password-with-otp`, {
        email: email,
        otp: otp,
        password: password,
        confirmPassword: confirmPassword
      });
      
      toast.success('Password updated successfully! You can now login.');
      router.push('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const renderOTPStep = () => (
    <form className="space-y-6" onSubmit={onSubmitOTP}>
      <div>
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Enter OTP</label>
        <div className="mt-1">
          <input
            id="otp"
            name="otp"
            type="text"
            maxLength="6"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-center text-lg tracking-widest"
            required
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">OTP sent to {email}</p>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading || otp.length !== 6}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isLoading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </div>
    </form>
  );

  const renderPasswordStep = () => (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmitPassword)}>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
        <div className="mt-1">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            {...register('confirmPassword', {
              required: 'Please confirm your password'
            })}
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isLoading ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </form>
  );

  const getStepTitle = () => {
    return step === 'otp' ? 'Verify OTP' : 'Set New Password';
  };

  const getStepDescription = () => {
    return step === 'otp' 
      ? 'Enter the 6-digit OTP sent to your email.' 
      : 'Enter your new password.';
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{getStepTitle()}</h2>
        <p className="mt-2 text-center text-sm text-gray-600">{getStepDescription()}</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 'otp' && renderOTPStep()}
          {step === 'password' && renderPasswordStep()}

          <div className="mt-4 text-center">
            <Link href="/admin/forgot-password" className="text-sm text-primary-600 hover:underline">
              Back to forgot password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
