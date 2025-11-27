import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, Check, X, Loader } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PatientSidebar from './PatientSidebar';

const PatientProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [showManualEdit, setShowManualEdit] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [completionData, setCompletionData] = useState({
    completion_percentage: 0,
    missing_critical_fields: [],
    is_complete: false
  });
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    alternative_phone: '',
    dob: '',
    gender: '',
    blood_group: '',
    permanent_address: '',
    current_location: {
      address: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    },
    preferred_language: 'English',
    abha_id: '',
    medical_history: [],
    allergies: []
  });

  // Temporary input states for adding new items
  const [newMedicalHistory, setNewMedicalHistory] = useState('');
  const [newAllergy, setNewAllergy] = useState('');

  // API Service Functions
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      navigate('/login');
      return null;
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const getCurrentProfile = async () => {
    try {
      setFetchingData(true);
      setError('');
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return null;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/patients/current`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch profile data');
      }

      const data = await response.json();
      
      // Update form data with profile data
      if (data.profile_data) {
        // Format dob for date input (convert to YYYY-MM-DD)
        let formattedDob = '';
        if (data.profile_data.dob) {
          const dobDate = new Date(data.profile_data.dob);
          if (!isNaN(dobDate.getTime())) {
            formattedDob = dobDate.toISOString().split('T')[0];
          }
        }
        
        setFormData(prev => ({
          ...prev,
          ...data.profile_data,
          dob: formattedDob,
          current_location: data.profile_data.current_location || {
            address: '',
            city: '',
            state: '',
            pincode: '',
            landmark: ''
          },
          medical_history: Array.isArray(data.profile_data.medical_history) ? data.profile_data.medical_history : [],
          allergies: Array.isArray(data.profile_data.allergies) ? data.profile_data.allergies : []
        }));
      }
      
      // Update completion data
      setCompletionData({
        completion_percentage: data.completion_percentage || 0,
        missing_critical_fields: data.missing_critical_fields || [],
        is_complete: data.is_complete || false
      });

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(`Failed to load profile data: ${error.message}`);
      return null;
    } finally {
      setFetchingData(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return null;
      }

      // Clean and prepare the data for backend
      const cleanedData = {
        full_name: profileData.full_name || '',
        email: profileData.email || '',
        phone_number: profileData.phone_number || '',
        alternative_phone: profileData.alternative_phone || '',
        dob: profileData.dob || null,
        gender: profileData.gender || '',
        blood_group: profileData.blood_group || '',
        permanent_address: profileData.permanent_address || '',
        preferred_language: profileData.preferred_language || 'English',
        abha_id: profileData.abha_id || '',
        medical_history: Array.isArray(profileData.medical_history) ? profileData.medical_history : [],
        allergies: Array.isArray(profileData.allergies) ? profileData.allergies : []
      };

      // Include current_location
      if (profileData.current_location) {
        cleanedData.current_location = {
          address: profileData.current_location.address || '',
          city: profileData.current_location.city || '',
          state: profileData.current_location.state || '',
          pincode: profileData.current_location.pincode || '',
          landmark: profileData.current_location.landmark || ''
        };
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/patients/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData)
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update profile');
      }

      const data = await response.json();
      
      // Update completion data
      setCompletionData({
        completion_percentage: data.completion_percentage || 0,
        missing_critical_fields: data.missing_critical_fields || [],
        is_complete: data.is_complete || false
      });

      // Show success message
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(`Failed to save profile: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Load profile data on component mount
  useEffect(() => {
    // Check if data was passed from PrePatientProfile
    if (location.state?.userData) {
      const userData = location.state.userData;
      
      // Format dob for date input (convert to YYYY-MM-DD)
      let formattedDob = '';
      if (userData.dob) {
        const dobDate = new Date(userData.dob);
        if (!isNaN(dobDate.getTime())) {
          formattedDob = dobDate.toISOString().split('T')[0];
        }
      }
      
      setFormData({
        ...formData,
        ...userData,
        dob: formattedDob,
        current_location: userData.current_location || {
          address: '',
          city: '',
          state: '',
          pincode: '',
          landmark: ''
        },
        medical_history: Array.isArray(userData.medical_history) ? userData.medical_history : [],
        allergies: Array.isArray(userData.allergies) ? userData.allergies : []
      });
      setCompletionData({
        completion_percentage: userData.completion_percentage || 0,
        missing_critical_fields: userData.missing_critical_fields || [],
        is_complete: userData.is_complete || false
      });
      setFetchingData(false);
    } else {
      // Fetch profile data if not passed via navigation
      getCurrentProfile();
    }
  }, []);

  const formFields = [
    { key: 'full_name', label: 'Full Name', placeholder: 'Enter your full name', required: true },
    { key: 'email', label: 'Email', placeholder: 'Enter your email address', required: true },
    { key: 'phone_number', label: 'Phone Number', placeholder: 'Enter your phone number', required: true },
    { key: 'alternative_phone', label: 'Alternative Phone', placeholder: 'Enter alternative contact number' },
    { key: 'dob', label: 'Date of Birth', placeholder: 'Select date', required: true },
    { key: 'gender', label: 'Gender', placeholder: 'Select gender', required: true },
    { key: 'blood_group', label: 'Blood Group', placeholder: 'Select blood group', required: true },
    { key: 'permanent_address', label: 'Permanent Address', placeholder: 'Enter your complete address' },
    { key: 'current_location.address', label: 'Current Address', placeholder: 'Enter current address', required: true },
    { key: 'current_location.city', label: 'Current City', placeholder: 'Enter your current city' },
    { key: 'current_location.state', label: 'State', placeholder: 'Enter your state' },
    { key: 'current_location.pincode', label: 'Pincode', placeholder: 'Enter pincode' },
    { key: 'current_location.landmark', label: 'Landmark', placeholder: 'Enter nearby landmark' },
    { key: 'abha_id', label: 'ABHA ID', placeholder: 'Enter ABHA Health ID' },
    { key: 'preferred_language', label: 'Preferred Language', placeholder: 'Select language' }
  ];

  // Helper functions - defined before use
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  };

  const setNestedValue = (obj, path, value) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  };

  // Calculate filled fields including array fields
  const calculateFilledFields = () => {
    let count = 0;
    
    // Count basic fields
    formFields.forEach(field => {
      const value = getNestedValue(formData, field.key);
      if (value && value !== '') count++;
    });
    
    // Count array fields
    if (formData.medical_history && formData.medical_history.length > 0) count++;
    if (formData.allergies && formData.allergies.length > 0) count++;
    
    return count;
  };

  const filledFields = completionData.completion_percentage > 0 
    ? Math.round((completionData.completion_percentage / 100) * (formFields.length + 2)) // +2 for arrays
    : calculateFilledFields();
  const totalFields = formFields.length + 2; // +2 for medical_history and allergies
  const progressPercentage = completionData.completion_percentage || ((filledFields / totalFields) * 100);

  const handleInputChange = (key, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      setNestedValue(newData, key, value);
      return newData;
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen" style={{ scrollBehavior: 'smooth' }}>
      <PatientSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => navigate('/patient/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft size={20} className="text-gray-700 sm:w-6 sm:h-6" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-[#1C1C1C]">Medical Profile</h1>
              <p className="text-xs sm:text-sm text-[#666] hidden sm:block">
                Complete your medical profile information
                {(() => {
                  try {
                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                    return user.fullName ? ` - ${user.fullName}` : '';
                  } catch {
                    return '';
                  }
                })()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setShowManualEdit(!showManualEdit)}
              className={`px-2 py-1 sm:px-4 sm:py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm font-medium ${
                showManualEdit 
                  ? 'bg-green-600 text-white shadow-lg' 
                  : 'bg-gradient-to-r from-[#3B0DA3] to-[#2F077C] text-white'
              }`}
            >
              <span className="hidden sm:inline">{showManualEdit ? '✓ Edit Mode Active' : 'Enable Editing'}</span>
              <span className="sm:hidden">{showManualEdit ? '✓ Edit' : 'Edit'}</span>
            </button>
            
            {/* Logout Button */}
            <button
              onClick={() => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                navigate('/login');
              }}
              className="px-2 py-1 sm:px-3 sm:py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all duration-300 text-xs sm:text-sm font-medium"
            >
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">⏻</span>
            </button>
            
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-all duration-300"
            >
              <div className="w-5 h-4 sm:w-6 sm:h-5 flex flex-col justify-between">
                <span className="w-full h-0.5 bg-gray-700 rounded"></span>
                <span className="w-full h-0.5 bg-gray-700 rounded"></span>
                <span className="w-full h-0.5 bg-gray-700 rounded"></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Single Panel Layout */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {fetchingData && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-4">
            <div className="flex items-center justify-center py-8">
              <Loader size={32} className="text-[#3B0DA3] animate-spin" />
              <span className="ml-3 text-gray-600">Loading profile...</span>
            </div>
          </div>
        )}
        
        {!fetchingData && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
          
          <div className="mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-bold text-[#1C1C1C] mb-2">Complete Your Medical Profile</h2>
            
            {/* Progress Tracker */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium text-[#666]">Profile Completion</span>
                <span className="text-xs sm:text-sm font-medium bg-gradient-to-r from-[#3B0DA3] to-[#2F077C] bg-clip-text text-transparent">
                  {filledFields} of {totalFields} fields filled
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#3B0DA3] to-[#2F077C] h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {formFields.map((field, index) => (
              <div 
                key={field.key} 
                className={`bg-gray-50 rounded-xl border p-3 sm:p-4 transition-all duration-300 border-gray-200 hover:border-[#3B0DA3] focus-within:border-[#3B0DA3] focus-within:bg-purple-50 ${
                  field.key.includes('Address') || field.key === 'permanentAddress' ? 'md:col-span-2' : ''
                }`}
              >
                <label className="block text-xs sm:text-sm font-medium text-[#1C1C1C] mb-2">
                  {field.label}
                </label>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="flex-1">
                    {field.key === 'gender' || field.key === 'preferred_language' || field.key === 'blood_group' ? (
                      <select
                        value={getNestedValue(formData, field.key)}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B0DA3] focus:border-transparent transition-all duration-300"
                      >
                        <option value="">{field.placeholder}</option>
                        {field.key === 'gender' && (
                          <>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer_not_to_say">Prefer not to say</option>
                          </>
                        )}
                        {field.key === 'blood_group' && (
                          <>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="Unknown">Unknown</option>
                          </>
                        )}
                        {field.key === 'preferred_language' && (
                          <>
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Marathi">Marathi</option>
                            <option value="Tamil">Tamil</option>
                          </>
                        )}
                      </select>
                    ) : (
                      <input
                        type={field.key === 'dob' ? 'date' : field.key === 'email' ? 'email' : field.key.includes('phone') ? 'tel' : 'text'}
                        value={getNestedValue(formData, field.key) || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B0DA3] focus:border-transparent transition-all duration-300"
                        disabled={!showManualEdit}
                      />
                    )}
                  </div>
                  
                  {/* Edit Button */}
                  <button
                    onClick={() => {
                      const input = document.querySelector(`input[value="${getNestedValue(formData, field.key) || ''}"], select[value="${getNestedValue(formData, field.key) || ''}"]`);
                      input?.focus();
                    }}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center text-[#666] hover:bg-gray-200 hover:text-[#3B0DA3] transition-all duration-300 hover:scale-105"
                  >
                    <Edit3 size={12} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
                
                {/* Field Completion Indicator */}
                {getNestedValue(formData, field.key) && (
                  <div className="flex items-center mt-2 text-green-600 fadeIn">
                    <Check size={14} className="mr-1 sm:w-4 sm:h-4" />
                    <span className="text-xs">Completed</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Medical History Section */}
          <div className="mt-6 sm:mt-8 bg-gray-50 rounded-xl border p-4 sm:p-6 border-gray-200">
            <h3 className="text-base sm:text-lg font-bold text-[#1C1C1C] mb-4">Medical History</h3>
            
            {/* Add New Medical History */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newMedicalHistory}
                onChange={(e) => setNewMedicalHistory(e.target.value)}
                placeholder="Add medical condition or history"
                className="flex-1 px-3 py-2 sm:px-4 sm:py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B0DA3] focus:border-transparent"
                disabled={!showManualEdit}
              />
              <button
                onClick={() => {
                  if (newMedicalHistory.trim()) {
                    setFormData(prev => ({
                      ...prev,
                      medical_history: [...prev.medical_history, newMedicalHistory.trim()]
                    }));
                    setNewMedicalHistory('');
                  }
                }}
                disabled={!showManualEdit || !newMedicalHistory.trim()}
                className="px-4 py-2 bg-gradient-to-r from-[#3B0DA3] to-[#2F077C] text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={20} />
              </button>
            </div>

            {/* Medical History List */}
            <div className="space-y-2">
              {formData.medical_history.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No medical history added yet</p>
              ) : (
                formData.medical_history.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-700">{item}</span>
                    <button
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          medical_history: prev.medical_history.filter((_, i) => i !== index)
                        }));
                      }}
                      disabled={!showManualEdit}
                      className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Allergies Section */}
          <div className="mt-6 bg-gray-50 rounded-xl border p-4 sm:p-6 border-gray-200">
            <h3 className="text-base sm:text-lg font-bold text-[#1C1C1C] mb-4">Allergies</h3>
            
            {/* Add New Allergy */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="Add allergy (e.g., Penicillin, Peanuts)"
                className="flex-1 px-3 py-2 sm:px-4 sm:py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B0DA3] focus:border-transparent"
                disabled={!showManualEdit}
              />
              <button
                onClick={() => {
                  if (newAllergy.trim()) {
                    setFormData(prev => ({
                      ...prev,
                      allergies: [...prev.allergies, newAllergy.trim()]
                    }));
                    setNewAllergy('');
                  }
                }}
                disabled={!showManualEdit || !newAllergy.trim()}
                className="px-4 py-2 bg-gradient-to-r from-[#3B0DA3] to-[#2F077C] text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={20} />
              </button>
            </div>

            {/* Allergies List */}
            <div className="space-y-2">
              {formData.allergies.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No allergies added yet</p>
              ) : (
                formData.allergies.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-700">{item}</span>
                    <button
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          allergies: prev.allergies.filter((_, i) => i !== index)
                        }));
                      }}
                      disabled={!showManualEdit}
                      className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 sm:mt-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {successMessage}
              </div>
            )}
            
            <button
              onClick={async () => {
                try {
                  setError('');
                  setSuccessMessage('');
                  await updateProfile(formData);
                  
                  // Navigate back to profile view after successful update
                  setTimeout(() => {
                    navigate('/patient/profile');
                  }, 2000);
                } catch (err) {
                  console.error('Error saving profile:', err);
                }
              }}
              disabled={loading}
              className={`w-full py-3 sm:py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] text-sm sm:text-base ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#3B0DA3] to-[#2F077C] hover:shadow-lg'
              }`}
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default PatientProfile;