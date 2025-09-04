import React, { useState } from 'react';
import { MapPin, Camera, Video, Phone, Mail, AlertTriangle, Loader2, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { sosAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface SOSFormData {
  title: string;
  description: string;
  category: string;
  priority: string;
  latitude: number;
  longitude: number;
  address: string;
  landmark: string;
  contact_phone: string;
  contact_email: string;
  image?: FileList;
  video?: FileList;
}

const SOSReport = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<SOSFormData>();

  const categories = [
    { value: 'medical', label: 'Medical Emergency' },
    { value: 'rescue', label: 'Rescue Required' },
    { value: 'shelter', label: 'Shelter Needed' },
    { value: 'food', label: 'Food/Water Required' },
    { value: 'evacuation', label: 'Evacuation Required' },
    { value: 'fire', label: 'Fire Emergency' },
    { value: 'flood', label: 'Flood Emergency' },
    { value: 'earthquake', label: 'Earthquake Emergency' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' },
  ];

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          setValue('latitude', location.lat);
          setValue('longitude', location.lng);
          toast.success('Location captured successfully!');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Failed to get current location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
    }
  };

  const onSubmit = async (data: SOSFormData) => {
    if (!currentLocation) {
      toast.error('Please capture your current location');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Add form data
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'image' || key === 'video') {
          if (value && value[0]) {
            formData.append(key, value[0]);
          }
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Add location data
      formData.append('latitude', currentLocation.lat.toString());
      formData.append('longitude', currentLocation.lng.toString());

      await sosAPI.createReport(formData as any);
      toast.success('Emergency report submitted successfully!');
      
      // Reset form
      window.location.reload();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to submit report';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please sign in to submit an SOS report.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Emergency Header */}
      <div className="bg-red-600 text-white rounded-t-xl p-6">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Emergency SOS Report</h1>
            <p className="text-red-100">Report emergencies for immediate assistance</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Emergency Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Title *
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the emergency"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide detailed information about the emergency situation"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level *
                </label>
                <select
                  {...register('priority', { required: 'Priority is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
                {errors.priority && (
                  <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Location Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Location *
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <MapPin className="h-4 w-4" />
                  Get Current Location
                </button>
                {currentLocation && (
                  <span className="px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm">
                    Location captured
                  </span>
                )}
              </div>
              {!currentLocation && (
                <p className="text-red-500 text-sm mt-1">Please capture your current location</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address or Landmark
              </label>
              <input
                {...register('address')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter address or nearby landmark"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nearby Landmark
              </label>
              <input
                {...register('landmark')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter nearby landmark for easier identification"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Phone Number
                </label>
                <input
                  {...register('contact_phone')}
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 98765 43210"
                  defaultValue={user?.phone_number || ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email Address
                </label>
                <input
                  {...register('contact_email')}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your.email@example.com"
                  defaultValue={user?.email || ''}
                />
              </div>
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Media Evidence (Optional)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Camera className="h-4 w-4 inline mr-1" />
                  Upload Image
                </label>
                <input
                  {...register('image')}
                  type="file"
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Video className="h-4 w-4 inline mr-1" />
                  Upload Video
                </label>
                <input
                  {...register('video')}
                  type="file"
                  accept="video/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting || !currentLocation}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting Report...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Send Emergency Report
                </>
              )}
            </button>
          </div>
        </form>

        {/* Emergency Information */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Important Information</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your location will be shared with emergency responders</li>
            <li>• Keep your phone accessible for follow-up calls</li>
            <li>• If this is life-threatening, call 108 immediately</li>
            <li>• False reports are punishable under law</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SOSReport;