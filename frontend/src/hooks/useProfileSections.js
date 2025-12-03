import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { getUserInfo, getAuthHeaders } from '../utils/auth';

/**
 * Custom hook for fetching all profile section data
 * 
 * @returns {Object} - { sections, loading, errors, refresh }
 *   - sections: Object - Contains all section data (children, colleges, graduates, etc.)
 *   - loading: boolean - Loading state
 *   - errors: Object - Error messages for each section
 *   - refresh: function - Function to manually refresh all data
 */
const useProfileSections = () => {
  const [sections, setSections] = useState({
    children: [],
    colleges: [],
    graduates: [],
    eligibilities: [],
    learningDevelopment: [],
    otherInformation: [],
    vocational: [],
    workExperiences: [],
  });

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const fetchAllSections = useCallback(async () => {
    try {
      setLoading(true);
      setErrors({});

      // Get employee number from token or localStorage
      const userInfo = getUserInfo();
      const employeeNumber = userInfo.employeeNumber || localStorage.getItem('employeeNumber');

      if (!employeeNumber) {
        setErrors({ general: 'No employee number found' });
        setLoading(false);
        return;
      }

      // Get auth headers for all requests
      const authHeaders = getAuthHeaders();

      // Fetch all sections in parallel
      const [
        childrenRes,
        collegesRes,
        graduatesRes,
        eligibilitiesRes,
        learningRes,
        otherInfoRes,
        vocationalRes,
        workExpRes,
      ] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/ChildrenRoute/children-by-person/${employeeNumber}`, authHeaders),
        axios.get(`${API_BASE_URL}/college/college-by-person/${employeeNumber}`, authHeaders),
        axios.get(`${API_BASE_URL}/GraduateRoute/graduate-by-person/${employeeNumber}`, authHeaders),
        axios.get(`${API_BASE_URL}/eligibilityRoute/eligibility-by-person/${employeeNumber}`, authHeaders),
        axios.get(`${API_BASE_URL}/learning_and_development_table/by-person/${employeeNumber}`, authHeaders),
        axios.get(`${API_BASE_URL}/OtherInfo/other-information-by-person/${employeeNumber}`, authHeaders),
        axios.get(`${API_BASE_URL}/vocational/vocational-by-person/${employeeNumber}`, authHeaders),
        axios.get(`${API_BASE_URL}/WorkExperienceRoute/work-experience-by-person/${employeeNumber}`, authHeaders),
      ]);

      const newErrors = {};
      const newSections = {
        children: [],
        colleges: [],
        graduates: [],
        eligibilities: [],
        learningDevelopment: [],
        otherInformation: [],
        vocational: [],
        workExperiences: [],
      };

      // Process children
      if (childrenRes.status === 'fulfilled') {
        const formattedChildren = (childrenRes.value.data || []).map((child) => ({
          ...child,
          dateOfBirth: formatDate(child.dateOfBirth),
        }));
        newSections.children = formattedChildren;
      } else {
        newErrors.children = childrenRes.reason?.response?.data?.message || 'Failed to load children data';
        console.error('Error fetching children:', childrenRes.reason);
      }

      // Process colleges
      if (collegesRes.status === 'fulfilled') {
        newSections.colleges = collegesRes.value.data || [];
      } else {
        newErrors.colleges = collegesRes.reason?.response?.data?.message || 'Failed to load college data';
        console.error('Error fetching colleges:', collegesRes.reason);
      }

      // Process graduates
      if (graduatesRes.status === 'fulfilled') {
        newSections.graduates = graduatesRes.value.data || [];
      } else {
        newErrors.graduates = graduatesRes.reason?.response?.data?.message || 'Failed to load graduate data';
        console.error('Error fetching graduates:', graduatesRes.reason);
      }

      // Process eligibilities
      if (eligibilitiesRes.status === 'fulfilled') {
        const formattedEligibilities = (eligibilitiesRes.value.data || []).map((eligibility) => ({
          ...eligibility,
          eligibilityDateOfExam: formatDate(eligibility.eligibilityDateOfExam),
          DateOfValidity: formatDate(eligibility.DateOfValidity),
        }));
        newSections.eligibilities = formattedEligibilities;
      } else {
        newErrors.eligibilities = eligibilitiesRes.reason?.response?.data?.message || 'Failed to load eligibility data';
        console.error('Error fetching eligibilities:', eligibilitiesRes.reason);
      }

      // Process learning and development
      if (learningRes.status === 'fulfilled') {
        newSections.learningDevelopment = learningRes.value.data || [];
      } else {
        newErrors.learningDevelopment = learningRes.reason?.response?.data?.message || 'Failed to load learning and development data';
        console.error('Error fetching learning and development:', learningRes.reason);
      }

      // Process other information
      if (otherInfoRes.status === 'fulfilled') {
        newSections.otherInformation = otherInfoRes.value.data || [];
      } else {
        newErrors.otherInformation = otherInfoRes.reason?.response?.data?.message || 'Failed to load other information data';
        console.error('Error fetching other information:', otherInfoRes.reason);
      }

      // Process vocational
      if (vocationalRes.status === 'fulfilled') {
        newSections.vocational = vocationalRes.value.data || [];
      } else {
        newErrors.vocational = vocationalRes.reason?.response?.data?.message || 'Failed to load vocational data';
        console.error('Error fetching vocational:', vocationalRes.reason);
      }

      // Process work experiences
      if (workExpRes.status === 'fulfilled') {
        const formattedWorkExperiences = (workExpRes.value.data || []).map((workExp) => ({
          ...workExp,
          workDateFrom: formatDate(workExp.workDateFrom),
          workDateTo: formatDate(workExp.workDateTo),
        }));
        newSections.workExperiences = formattedWorkExperiences;
      } else {
        newErrors.workExperiences = workExpRes.reason?.response?.data?.message || 'Failed to load work experience data';
        console.error('Error fetching work experiences:', workExpRes.reason);
      }

      setSections(newSections);
      setErrors(newErrors);
    } catch (err) {
      console.error('Error fetching profile sections:', err);
      setErrors({ general: 'Failed to load profile sections' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllSections();
  }, [fetchAllSections]);

  const refresh = useCallback(() => {
    fetchAllSections();
  }, [fetchAllSections]);

  return {
    sections,
    loading,
    errors,
    refresh,
  };
};

export default useProfileSections;

