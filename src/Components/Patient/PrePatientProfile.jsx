import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, CheckCircle, MoreVertical, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PatientSidebar from './PatientSidebar';

const PrePatientProfile = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch patient profile data
  useEffect(() => {
    const fetchPatientProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/patients/current`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data.profile_data);
          setLoading(false);
        } else {
          if (response.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            navigate('/login');
          } else {
            const errorData = await response.json();
            setError(errorData.detail || 'Failed to fetch profile data');
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Network error. Please check your connection.');
        setLoading(false);
      }
    };

    fetchPatientProfile();
  }, [navigate]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader size={40} className="text-[#3B0DA3] animate-spin" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-md mx-4">
          <p className="text-red-600 text-center mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 bg-[#3B0DA3] text-white rounded-lg hover:bg-[#2F077C] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen" style={{ scrollBehavior: 'smooth' }}>
      <PatientSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto lg:max-w-6xl">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/patient/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-[#1C1C1C]">My Profile</h1>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300">
            <MoreVertical size={20} className="text-gray-700" />
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-all duration-300"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className="w-full h-0.5 bg-gray-700 rounded"></span>
              <span className="w-full h-0.5 bg-gray-700 rounded"></span>
              <span className="w-full h-0.5 bg-gray-700 rounded"></span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto lg:max-w-6xl px-4 py-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col items-center text-center">
            {/* Profile Picture with Green Dot */}
            <div className="relative w-20 h-20 mb-4">
              {userData.profilePicture ? (
                <img
                  src={userData.profilePicture}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#3B0DA3] to-[#2F077C] rounded-full flex items-center justify-center">
                  <User size={32} className="text-white" />
                </div>
              )}
              {/* Green online dot */}
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>

            {/* Basic Details */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#1C1C1C]">{userData.full_name || 'User'}</h2>
              <div className="flex items-center justify-center space-x-2 text-[#666]">
                <span className="text-sm">{userData.email}</span>
              </div>
              
              {/* Email Verified Badge */}
              <div className="flex items-center justify-center space-x-1 mt-3">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm text-green-600 font-medium">Email Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Status */}
        <div className={`${userData.completion_percentage === 100 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'} border rounded-xl p-4 mb-6`}>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 ${userData.completion_percentage === 100 ? 'bg-green-500' : 'bg-orange-500'} rounded-full`}></div>
            <span className={`text-sm ${userData.completion_percentage === 100 ? 'text-green-700' : 'text-orange-700'}`}>
              Your profile is {userData.completion_percentage}% complete. 
              {userData.missing_critical_fields && userData.missing_critical_fields.length > 0 && 
                ` ${userData.missing_critical_fields.length} field(s) missing.`
              }
            </span>
          </div>
        </div>

        {/* Complete Profile Button */}
        <button
          onClick={() => navigate('/patient/pre-profile', { state: { userData } })}
          className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-[#3B0DA3] to-[#2F077C] text-white rounded-xl py-4 px-6 font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] mb-6"
        >
          <User size={20} />
          <span>Edit Profile</span>
        </button>

        {/* Profile Overview Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <h3 className="text-base font-semibold text-[#1C1C1C] mb-4">Profile Overview</h3>
          
          {/* Basic Information */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-[#1C1C1C]">Basic Information</h4>
              <span className={`text-xs ${userData.dob && userData.gender && userData.phone_number ? 'text-green-600 bg-green-100' : 'text-orange-600 bg-orange-100'} px-2 py-1 rounded-full`}>
                {userData.dob && userData.gender && userData.phone_number ? 'Complete' : 'Incomplete'}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">Date of Birth</span>
                <span className={`text-sm ${userData.dob ? 'text-[#1C1C1C]' : 'text-orange-600'} font-medium`}>
                  {formatDate(userData.dob)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">Gender</span>
                <span className={`text-sm ${userData.gender ? 'text-[#1C1C1C]' : 'text-orange-600'} font-medium`}>
                  {userData.gender || 'Not provided'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">Phone Number</span>
                <span className="text-sm text-[#1C1C1C] font-medium">{userData.phone_number || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">Alternative Phone</span>
                <span className={`text-sm ${userData.alternative_phone ? 'text-[#1C1C1C]' : 'text-orange-600'} font-medium`}>
                  {userData.alternative_phone || 'Not provided'}
                </span>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-[#1C1C1C]">Medical Information</h4>
              <span className={`text-xs ${userData.blood_group && userData.abha_id ? 'text-green-600 bg-green-100' : 'text-orange-600 bg-orange-100'} px-2 py-1 rounded-full`}>
                {userData.blood_group && userData.abha_id ? 'Complete' : 'Incomplete'}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">Blood Group</span>
                <span className={`text-sm ${userData.blood_group ? 'text-[#1C1C1C]' : 'text-orange-600'} font-medium`}>
                  {userData.blood_group || 'Not provided'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">ABHA ID</span>
                <span className={`text-sm ${userData.abha_id ? 'text-[#1C1C1C]' : 'text-orange-600'} font-medium`}>
                  {userData.abha_id || 'Not provided'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">Allergies</span>
                <span className="text-sm text-[#1C1C1C] font-medium">
                  {userData.allergies && userData.allergies.length > 0 ? userData.allergies.join(', ') : 'None reported'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">Medical History</span>
                <span className="text-sm text-[#1C1C1C] font-medium">
                  {userData.medical_history && userData.medical_history.length > 0 ? userData.medical_history.join(', ') : 'None reported'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact & Address */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-[#1C1C1C]">Contact & Address</h4>
              <span className={`text-xs ${userData.permanent_address && userData.current_location?.address && userData.current_location?.city && userData.current_location?.state && userData.current_location?.pincode ? 'text-green-600 bg-green-100' : 'text-orange-600 bg-orange-100'} px-2 py-1 rounded-full`}>
                {userData.permanent_address && userData.current_location?.address && userData.current_location?.city && userData.current_location?.state && userData.current_location?.pincode ? 'Complete' : 'Incomplete'}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">Permanent Address</span>
                <span className={`text-sm ${userData.permanent_address ? 'text-[#1C1C1C]' : 'text-orange-600'} font-medium`}>
                  {userData.permanent_address || 'Not provided'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">Current Address</span>
                <span className={`text-sm ${userData.current_location?.address ? 'text-[#1C1C1C]' : 'text-orange-600'} font-medium`}>
                  {userData.current_location?.address || 'Not provided'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">City</span>
                <span className={`text-sm ${userData.current_location?.city ? 'text-[#1C1C1C]' : 'text-orange-600'} font-medium`}>
                  {userData.current_location?.city || 'Not provided'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">State</span>
                <span className={`text-sm ${userData.current_location?.state ? 'text-[#1C1C1C]' : 'text-orange-600'} font-medium`}>
                  {userData.current_location?.state || 'Not provided'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">Pincode</span>
                <span className={`text-sm ${userData.current_location?.pincode ? 'text-[#1C1C1C]' : 'text-orange-600'} font-medium`}>
                  {userData.current_location?.pincode || 'Not provided'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">Landmark</span>
                <span className={`text-sm ${userData.current_location?.landmark ? 'text-[#1C1C1C]' : 'text-orange-600'} font-medium`}>
                  {userData.current_location?.landmark || 'Not provided'}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-[#1C1C1C]">Additional Information</h4>
              <span className={`text-xs ${userData.preferred_language && userData.emergency_contact ? 'text-green-600 bg-green-100' : 'text-orange-600 bg-orange-100'} px-2 py-1 rounded-full`}>
                {userData.preferred_language && userData.emergency_contact ? 'Complete' : 'Incomplete'}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">Preferred Language</span>
                <span className={`text-sm ${userData.preferred_language ? 'text-[#1C1C1C]' : 'text-orange-600'} font-medium`}>
                  {userData.preferred_language || 'Not provided'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">Emergency Contact</span>
                <span className={`text-sm ${userData.emergency_contact ? 'text-[#1C1C1C]' : 'text-orange-600'} font-medium`}>
                  {userData.emergency_contact || 'Not provided'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrePatientProfile;