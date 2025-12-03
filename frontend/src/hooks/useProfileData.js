import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { getUserInfo, getAuthHeaders } from '../utils/auth';

/**
 * Custom hook for fetching personal profile data
 * 
 * @returns {Object} - { person, profilePicture, loading, error, refresh }
 *   - person: Object - Personal information data
 *   - profilePicture: string | null - Profile picture URL
 *   - loading: boolean - Loading state
 *   - error: string | null - Error message
 *   - refresh: function - Function to manually refresh data
 */
const useProfileData = () => {
  const [person, setPerson] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPersonData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get employee number from token or localStorage
      const userInfo = getUserInfo();
      const employeeNumber = userInfo.employeeNumber || localStorage.getItem('employeeNumber');

      if (!employeeNumber) {
        setError('No employee number found');
        setLoading(false);
        return;
      }

      // Fetch personal info using direct endpoint with auth headers
      const response = await axios.get(
        `${API_BASE_URL}/personalinfo/person_table/${employeeNumber}`,
        getAuthHeaders()
      );

      const personData = response.data;
      setPerson(personData);

      if (personData) {
        setProfilePicture(personData.profile_picture || null);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPersonData();
  }, [fetchPersonData]);

  const refresh = useCallback(() => {
    fetchPersonData();
  }, [fetchPersonData]);

  return {
    person,
    profilePicture,
    loading,
    error,
    refresh,
  };
};

export default useProfileData;

