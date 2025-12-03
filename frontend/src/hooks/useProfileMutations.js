import { useState, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { getUserInfo, getAuthHeaders } from '../utils/auth';

/**
 * Custom hook for saving/updating profile data
 * 
 * @returns {Object} - { saveProfile, saving, error }
 *   - saveProfile: function - Function to save all profile data
 *   - saving: boolean - Saving state
 *   - error: string | null - Error message
 */
const useProfileMutations = () => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const saveProfile = useCallback(async (profileData) => {
    try {
      setSaving(true);
      setError(null);

      // Get employee number from token or localStorage
      const userInfo = getUserInfo();
      const employeeNumber = userInfo.employeeNumber || localStorage.getItem('employeeNumber');

      if (!employeeNumber) {
        throw new Error('No employee number found');
      }

      const {
        personalInfo,
        children,
        colleges,
        graduates,
        eligibilities,
        learningDevelopment,
        otherInformation,
        vocational,
        workExperiences,
      } = profileData;

      // Get auth headers for all requests
      const authHeaders = getAuthHeaders();

      // Save personal info
      if (personalInfo) {
        await axios.put(
          `${API_BASE_URL}/personalinfo/person_table/by-employee/${employeeNumber}`,
          personalInfo,
          authHeaders
        );
      }

      // Save children data
      if (children && Array.isArray(children)) {
        for (const child of children) {
          if (child.id) {
            // Update existing child
            await axios.put(
              `${API_BASE_URL}/ChildrenRoute/children-table/${child.id}`,
              child,
              authHeaders
            );
          } else if (
            child.childrenFirstName &&
            child.childrenLastName &&
            child.dateOfBirth
          ) {
            // Add new child
            await axios.post(
              `${API_BASE_URL}/ChildrenRoute/children-table`,
              child,
              authHeaders
            );
          }
        }
      }

      // Save college data
      if (colleges && Array.isArray(colleges)) {
        for (const college of colleges) {
          if (college.id) {
            // Update existing college
            await axios.put(
              `${API_BASE_URL}/college/college-table/${college.id}`,
              college,
              authHeaders
            );
          } else if (college.collegeNameOfSchool && college.collegeDegree) {
            // Add new college
            await axios.post(`${API_BASE_URL}/college/college-table`, college, authHeaders);
          }
        }
      }

      // Save graduate studies data
      if (graduates && Array.isArray(graduates)) {
        for (const graduate of graduates) {
          if (graduate.id) {
            // Update existing graduate
            await axios.put(
              `${API_BASE_URL}/GraduateRoute/graduate-table/${graduate.id}`,
              graduate,
              authHeaders
            );
          } else if (graduate.graduateNameOfSchool && graduate.graduateDegree) {
            // Add new graduate
            await axios.post(`${API_BASE_URL}/GraduateRoute/graduate-table`, graduate, authHeaders);
          }
        }
      }

      // Save eligibility data
      if (eligibilities && Array.isArray(eligibilities)) {
        for (const eligibility of eligibilities) {
          if (eligibility.id) {
            // Update existing eligibility
            await axios.put(
              `${API_BASE_URL}/eligibilityRoute/eligibility/${eligibility.id}`,
              eligibility,
              authHeaders
            );
          } else if (eligibility.eligibilityName && eligibility.DateOfValidity) {
            // Add new eligibility
            await axios.post(
              `${API_BASE_URL}/eligibilityRoute/eligibility`,
              eligibility,
              authHeaders
            );
          }
        }
      }

      // Save learning and development data
      if (learningDevelopment && Array.isArray(learningDevelopment)) {
        for (const learning of learningDevelopment) {
          if (learning.id) {
            // Update existing learning and development
            await axios.put(
              `${API_BASE_URL}/learning_and_development_table/${learning.id}`,
              learning,
              authHeaders
            );
          } else if (
            learning.titleOfProgram &&
            learning.dateFrom &&
            learning.dateTo
          ) {
            // Add new learning and development
            await axios.post(
              `${API_BASE_URL}/learning_and_development_table`,
              learning,
              authHeaders
            );
          }
        }
      }

      // Save other information data
      if (otherInformation && Array.isArray(otherInformation)) {
        for (const info of otherInformation) {
          if (info.id) {
            // Update existing other information
            await axios.put(
              `${API_BASE_URL}/OtherInfo/other-information/${info.id}`,
              info,
              authHeaders
            );
          } else {
            // Add new other information
            await axios.post(`${API_BASE_URL}/OtherInfo/other-information`, info, authHeaders);
          }
        }
      }

      // Save vocational data
      if (vocational && Array.isArray(vocational)) {
        for (const voc of vocational) {
          if (voc.id) {
            // Update existing vocational record
            await axios.put(
              `${API_BASE_URL}/vocational/vocational-table/${voc.id}`,
              voc,
              authHeaders
            );
          } else if (voc.vocationalNameOfSchool && voc.vocationalDegree) {
            // Add new vocational record
            await axios.post(`${API_BASE_URL}/vocational/vocational-table`, voc, authHeaders);
          }
        }
      }

      // Save work experiences data
      if (workExperiences && Array.isArray(workExperiences)) {
        for (const workExp of workExperiences) {
          if (workExp.id) {
            // Update existing work experience
            await axios.put(
              `${API_BASE_URL}/WorkExperienceRoute/work-experience-table/${workExp.id}`,
              workExp,
              authHeaders
            );
          } else if (
            workExp.workPositionTitle &&
            workExp.workCompany &&
            workExp.workDateFrom &&
            workExp.workDateTo
          ) {
            // Add new work experience
            await axios.post(
              `${API_BASE_URL}/WorkExperienceRoute/work-experience-table`,
              workExp,
              authHeaders
            );
          }
        }
      }

      return { success: true };
    } catch (err) {
      console.error('Update failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
      setError(errorMessage);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    saveProfile,
    saving,
    error,
  };
};

export default useProfileMutations;

