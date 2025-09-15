/**
 * EligibilityChecker.jsx - Logic component for checking PM Internship Scheme eligibility
 * Contains all eligibility criteria validation and scoring logic
 */
import React from "react";

export const checkEligibility = (userData) => {
  const results = {
    is_eligible: true,
    criteria_results: {},
    failed_criteria: [],
    recommendations: [],
    eligibility_score: 0,
    readiness_score: 0
  };

  // Age Check (21-24 years)
  const age = userData.age || Math.floor((Date.now() - new Date(userData.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  results.criteria_results.age_check = age >= 21 && age <= 24;
  if (!results.criteria_results.age_check) {
    results.is_eligible = false;
    if (age < 21) {
      results.failed_criteria.push("You must be at least 21 years old");
      results.recommendations.push("Wait until you turn 21 to apply for the PM Internship Scheme");
    } else if (age > 24) {
      results.failed_criteria.push("You must be 24 years or younger");
      results.recommendations.push("Consider other skill development programs for your age group");
    }
  }

  // Citizenship Check
  results.criteria_results.citizenship_check = userData.citizenship_confirmed === true;
  if (!results.criteria_results.citizenship_check) {
    results.is_eligible = false;
    results.failed_criteria.push("Indian citizenship confirmation required");
    results.recommendations.push("Please confirm your Indian citizenship to proceed");
  }

  // Qualification Check
  const validQualifications = ["class_10", "iti", "diploma", "ba", "bsc", "bcom", "bba", "bca", "b_pharma"];
  results.criteria_results.qualification_check = validQualifications.includes(userData.qualification);
  if (!results.criteria_results.qualification_check) {
    results.is_eligible = false;
    results.failed_criteria.push("Qualification not eligible for the scheme");
    results.recommendations.push("Complete one of the eligible qualifications: Class 10, ITI, Diploma, BA, B.Sc, B.Com, BBA, BCA, or B.Pharma");
  }

  // Employment Status Check
  const validEmploymentStatus = ["unemployed", "part_time", "freelance"];
  results.criteria_results.employment_check = validEmploymentStatus.includes(userData.employment_status);
  if (!results.criteria_results.employment_check) {
    results.is_eligible = false;
    results.failed_criteria.push("Currently employed full-time");
    results.recommendations.push("You must not be in full-time employment to be eligible");
  }

  // Education Status Check
  const validEducationStatus = ["not_enrolled", "part_time_remote"];
  results.criteria_results.education_check = validEducationStatus.includes(userData.education_status);
  if (!results.criteria_results.education_check) {
    results.is_eligible = false;
    results.failed_criteria.push("Currently enrolled in full-time in-person education");
    results.recommendations.push("Complete your current education or switch to part-time/remote learning");
  }

  // Income Check
  const familyIncome = parseFloat(userData.family_income) || 0;
  results.criteria_results.income_check = familyIncome < 800000;
  if (!results.criteria_results.income_check) {
    results.is_eligible = false;
    results.failed_criteria.push("Family income exceeds ₹8,00,000 annually");
    results.recommendations.push("This scheme is designed for families with annual income below ₹8 lakhs");
  }

  // Exclusion Criteria Check
  const hasExclusions = userData.premium_institute_graduate || 
                       userData.advanced_degree_holder || 
                       userData.govt_training_enrolled || 
                       userData.family_govt_employee;
  
  results.criteria_results.exclusion_check = !hasExclusions;
  if (hasExclusions) {
    results.is_eligible = false;
    if (userData.premium_institute_graduate) {
      results.failed_criteria.push("Graduated from premium institute (IIT/IIM/NLU/IISER/NID/IIIT)");
    }
    if (userData.advanced_degree_holder) {
      results.failed_criteria.push("Holds advanced degree (CA/MBA/Master's)");
    }
    if (userData.govt_training_enrolled) {
      results.failed_criteria.push("Currently in government skill training program");
    }
    if (userData.family_govt_employee) {
      results.failed_criteria.push("Family member in permanent government service");
    }
    results.recommendations.push("These exclusion criteria ensure the scheme reaches its intended beneficiaries");
  }

  // Calculate eligibility score
  const criteriaCount = Object.keys(results.criteria_results).length;
  const passedCriteria = Object.values(results.criteria_results).filter(Boolean).length;
  results.eligibility_score = Math.round((passedCriteria / criteriaCount) * 100);

  // Calculate readiness score based on skills, experience, etc.
  let readinessFactors = 0;
  let totalFactors = 5;

  // Skills assessment
  if (userData.skills && userData.skills.length > 0) {
    readinessFactors += Math.min(userData.skills.length / 3, 1);
  }

  // Language skills
  if (userData.languages && userData.languages.length > 1) {
    readinessFactors += 0.5;
  }

  // Experience
  if (userData.experience && userData.experience.trim().length > 50) {
    readinessFactors += 1;
  }

  // Certifications
  if (userData.certifications && userData.certifications.length > 0) {
    readinessFactors += 0.5;
  }

  // Basic requirements met
  if (userData.bank_account_seeded) {
    readinessFactors += 1;
  }

  results.readiness_score = Math.round((readinessFactors / totalFactors) * 100);

  // Add general recommendations for improvement
  if (results.is_eligible) {
    if (results.readiness_score < 50) {
      results.recommendations.push("Consider building more relevant skills before applying");
      results.recommendations.push("Complete some online certifications in your field of interest");
    }
    if (!userData.bank_account_seeded) {
      results.recommendations.push("Ensure you have a seeded bank account for stipend payments");
    }
    if (!userData.skills || userData.skills.length < 3) {
      results.recommendations.push("Add more skills to your profile to improve internship matching");
    }
  }

  return results;
};

export default function EligibilityChecker({ userData, onResults }) {
  React.useEffect(() => {
    if (userData && onResults) {
      const results = checkEligibility(userData);
      onResults(results);
    }
  }, [userData, onResults]);

  return null; // This is a logic-only component
}