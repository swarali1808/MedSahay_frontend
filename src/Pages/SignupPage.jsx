import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheck, FaPhone } from 'react-icons/fa';
import { MdPersonOutline } from 'react-icons/md';
import doctorImage from '../assets/CommonImgs/Signupdoc.png'; // Placeholder image, replace with actual image path
import logoImage from '../assets/CommonImgs/HorizontalLogo.png'; // Placeholder logo, replace with actual logo path
const SignupPage = () => {
  const navigate = useNavigate();
  
  // State for form inputs
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    phone_number: '',
    agreeToTerms: false
  });

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: formData.role,
          phone_number: formData.phone_number,
          agreeToTerms: formData.agreeToTerms
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token in localStorage
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('Signup successful:', data);
        alert('Account created successfully!');
        
        // Navigate to dashboard based on user role
        const userRole = data.user.role.toLowerCase();
        if (userRole === 'doctor') {
          navigate('/doctor/dashboard');
        } else if (userRole === 'patient') {
          navigate('/patient/dashboard');
        } else {
          // Default navigation for other roles or fallback
          navigate('/');
        }
      } else {
        console.error('Signup failed:', data.detail);
        alert(data.detail || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-1">Sign Up</h1>
          <p className="text-cyan-500 mb-8 text-lg">Create your account to begin</p>

          <form onSubmit={handleSubmit}>
            {/* Full Name Input */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 flex items-center gap-2 mb-1">
                <FaUser className="text-cyan-500" />
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-4 border border-gray-100 bg-gray-50 rounded-md focus:outline-none focus:border-cyan-500 text-gray-600"
                required
              />
            </div>

            {/* Email Address Input */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 flex items-center gap-2 mb-1">
                <FaEnvelope className="text-cyan-500" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-4 border border-gray-100 bg-gray-50 rounded-md focus:outline-none focus:border-cyan-500 text-gray-600"
                required
              />
            </div>

            {/* Phone Number Input */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 flex items-center gap-2 mb-1">
                <FaPhone className="text-cyan-500" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+911234567890"
                className="w-full px-4 py-4 border border-gray-100 bg-gray-50 rounded-md focus:outline-none focus:border-cyan-500 text-gray-600"
                required
              />
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 flex items-center gap-2 mb-1">
                <FaLock className="text-cyan-500" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="w-full px-4 py-4 border border-gray-100 bg-gray-50 rounded-md focus:outline-none focus:border-cyan-500 text-gray-600"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 flex items-center gap-2 mb-1">
                <FaLock className="text-purple-500" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-4 border border-gray-100 bg-gray-50 rounded-md focus:outline-none focus:border-cyan-500 text-gray-600"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 flex items-center gap-2 mb-1">
                <MdPersonOutline className="text-purple-500" />
                Select Role
              </label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-4 border border-gray-100 bg-gray-50 rounded-md focus:outline-none focus:border-cyan-500 appearance-none text-gray-600"
                  required
                >
                  <option value="" disabled>Choose your role</option>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>

                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="mb-6 flex items-start gap-2">
              <input
                type="checkbox"
                name="agreeToTerms"
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="mt-1"
                required
              />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                I agree to the{" "}
                <a href="/terms" className="text-cyan-500 hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="/privacy" className="text-purple-500 hover:underline">Privacy Policy</a>
              </label>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              className="w-full py-4 bg-[#3B0DA3] hover:bg-[#2F077C] text-white font-medium rounded-lg focus:outline-none transition-colors text-lg"
            >
              Create Account
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-center mt-6 text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-cyan-500 hover:underline font-medium">Login</Link>
          </p>

          {/* Security Features */}
          <div className="flex justify-center gap-6 mt-6">
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <FaCheck className="text-green-500" /> Secure
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <FaCheck className="text-purple-500" /> HIPAA Compliant
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <FaCheck className="text-cyan-500" /> Encrypted
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden md:block md:w-1/2 bg-[#3B0DA3] relative">
        {/* Diagonal stripes pattern overlay - can be removed if not desired */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.1) 10px, transparent 10px, transparent 20px)',
          opacity: 0.15
        }}></div>

        <div className="flex flex-col h-full justify-start items-center relative overflow-hidden">
          {/* Logo section - with significantly larger size for prominence */}
          <div className="w-full flex flex-col items-center pt-8 pb-6">
            <div className="flex flex-col items-center">
              <div className="w-[90%] max-w-[320px]">
                <img 
                  src={logoImage} 
                  alt="MedSahay Logo" 
                  className="w-full h-auto"
                />
              </div>
              <p className="text-white text-base md:text-lg mt-3 font-light tracking-wide">Line mei nahi, online aao.</p>
            </div>
          </div>
          
          {/* Doctor image - sized to be 683px height as shown in image */}
          <div className="flex-1 w-full flex justify-center overflow-hidden" style={{ maxHeight: 'calc(100% - 173px)' }}>
            <img 
              src={doctorImage} 
              alt="Doctor" 
              className="w-full h-full object-cover object-top" 
              style={{
                maxWidth: '100%',
                height: '683px'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;