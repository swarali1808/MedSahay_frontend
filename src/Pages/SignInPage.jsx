import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheck, FaMobileAlt, FaHeadset, FaShieldAlt } from 'react-icons/fa';
import { MdPersonOutline } from 'react-icons/md';
import doctorsImage from '../assets/CommonImgs/Signindocs.svg';
import logoImage from '../assets/CommonImgs/HorizontalLogo.png';

const SignInPage = () => {
  const navigate = useNavigate();
  
  // State for form inputs
  const [formData, setFormData] = useState({
    role: 'Doctor',
    email: '',
    password: '',
    rememberMe: false
  });

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token and user data in localStorage
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('Login successful:', data);
        alert('Login successful!');
        
        // Navigate to dashboard based on user role from API response
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
        console.error('Login failed:', data.detail || data.message);
        alert(data.detail || data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Image */}
      <div className="hidden md:block md:w-1/2 bg-[#3B0DA3] relative">
        {/* Diagonal stripes pattern overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.1) 10px, transparent 10px, transparent 20px)',
          opacity: 0.15
        }}></div>

        <div className="flex flex-col h-full justify-start items-center relative overflow-hidden">
          {/* Logo section */}
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
          
          {/* Doctors image */}
          <div className="flex-1 w-full flex justify-center items-center overflow-hidden px-6">
            <img 
              src={doctorsImage} 
              alt="Doctors" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-1">Sign In</h1>
          <p className="text-[#3B0DA3] mb-8 text-lg">Welcome back to your health portal</p>

          <form onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <MdPersonOutline className="text-[#3B0DA3]" size={20} />
                Select Role
              </label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#3B0DA3] appearance-none text-gray-700"
                  required
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Patient">Patient</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Email Address Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <FaEnvelope className="text-[#3B0DA3]" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#3B0DA3] text-gray-700"
                required
              />
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <FaLock className="text-[#3B0DA3]" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#3B0DA3] text-gray-700"
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

            {/* Remember Me and Forgot Password */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-[#3B0DA3] rounded border-gray-300"
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-[#3B0DA3] text-sm hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#3B0DA3] hover:bg-[#2F077C] text-white font-medium rounded-lg focus:outline-none transition-colors"
            >
              Sign In
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center mt-8 text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#3B0DA3] hover:underline font-medium">Sign up here</Link>
          </p>

          {/* Features Section */}
          <div className="flex justify-between mt-10">
            <div className="flex flex-col items-center">
              <FaMobileAlt className="text-[#3B0DA3] text-xl mb-1" />
              <span className="text-xs text-gray-600">Mobile App</span>
            </div>
            <div className="flex flex-col items-center">
              <FaHeadset className="text-[#3B0DA3] text-xl mb-1" />
              <span className="text-xs text-gray-600">24/7 Support</span>
            </div>
            <div className="flex flex-col items-center">
              <FaShieldAlt className="text-[#3B0DA3] text-xl mb-1" />
              <span className="text-xs text-gray-600">Secure Login</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
