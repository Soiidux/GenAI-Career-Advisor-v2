
/**
 * Results.js - Eligibility results page showing PM Internship Scheme eligibility status
 * Displays detailed eligibility analysis and recommendations
 */
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/entities/User";
import { EligibilityResult } from "@/entities/EligibilityResult";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft,
  BarChart3,
  Target,
  Lightbulb,
  Loader2
} from "lucide-react";
import EligibilityChecker, { checkEligibility } from "../components/results/EligibilityChecker";

export default function Results() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUserAndResults = useCallback(async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      // Check if user has completed profile
      if (!currentUser.date_of_birth || !currentUser.qualification) {
        navigate(createPageUrl("Profile"));
        return;
      }

      // Calculate eligibility
      const eligibilityResults = checkEligibility(currentUser);
      setResults(eligibilityResults);

      // Save results to database
      await EligibilityResult.create({
        user_id: currentUser.id,
        ...eligibilityResults
      });

    } catch (error) {
      setError("Failed to load results. Please try again.");
      console.error("Results loading error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadUserAndResults();
  }, [loadUserAndResults]);

  const handleResultsUpdate = (newResults) => {
    setResults(newResults);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary-orange" />
            <h3 className="text-xl font-semibold">Analyzing Your Eligibility</h3>
            <p className="text-gray-600 text-center max-w-md">
              We're checking your profile against PM Internship Scheme criteria...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <div className="text-center mt-6">
            <Button onClick={() => navigate(createPageUrl("Profile"))}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <EligibilityChecker userData={user} onResults={handleResultsUpdate} />
        
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl("Profile"))}
            className="mb-4 hover:bg-orange-50 hover:border-primary-orange"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
        </div>

        {/* Main Result Card */}
        <Card className={`mb-8 border-2 ${results?.is_eligible ? 'border-accent-green bg-green-50/50' : 'border-red-400 bg-red-50/50'} dark:bg-gray-800/90`}>
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                results?.is_eligible ? 'bg-accent-green' : 'bg-red-500'
              }`}>
                {results?.is_eligible ? (
                  <CheckCircle2 className="w-10 h-10 text-white" />
                ) : (
                  <XCircle className="w-10 h-10 text-white" />
                )}
              </div>
            </div>
            
            <CardTitle className="text-3xl mb-2">
              {results?.is_eligible ? (
                <span className="text-accent-green">Congratulations! You're Eligible</span>
              ) : (
                <span className="text-red-600">Not Currently Eligible</span>
              )}
            </CardTitle>
            
            <p className="text-xl text-secondary-blue font-medium">
              {results?.is_eligible ? 
                "बधाई हो! आप पात्र हैं" : 
                "वर्तमान में पात्र नहीं हैं"
              }
            </p>

            <div className="mt-6 grid md:grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="text-center p-4 bg-white/80 dark:bg-gray-700/80 rounded-xl">
                <div className="text-2xl font-bold text-primary-orange mb-1">
                  {results?.eligibility_score || 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Eligibility Score
                </div>
              </div>
              <div className="text-center p-4 bg-white/80 dark:bg-gray-700/80 rounded-xl">
                <div className="text-2xl font-bold text-secondary-blue mb-1">
                  {results?.readiness_score || 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Career Readiness
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Criteria Breakdown */}
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-orange" />
                Eligibility Criteria / पात्रता मापदंड
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results?.criteria_results && Object.entries(results.criteria_results).map(([key, passed]) => {
                  const criteriaLabels = {
                    age_check: "Age between 21-24 years / आयु 21-24 वर्ष",
                    citizenship_check: "Indian Citizenship / भारतीय नागरिकता",
                    qualification_check: "Valid Qualification / वैध योग्यता",
                    employment_check: "Employment Status / रोजगार स्थिति",
                    education_check: "Education Status / शिक्षा स्थिति",
                    income_check: "Family Income < Rs 8L / पारिवारिक आय < Rs 8L",
                    exclusion_check: "No Exclusion Criteria / कोई बहिष्करण मापदंड नहीं"
                  };

                  return (
                    <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <span className="font-medium text-sm">
                        {criteriaLabels[key] || key}
                      </span>
                      <Badge variant={passed ? "default" : "destructive"} className={passed ? "bg-accent-green" : ""}>
                        {passed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Pass
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Fail
                          </>
                        )}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="border-secondary-blue">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-secondary-blue" />
                Recommendations / सिफारिशें
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results?.failed_criteria && results.failed_criteria.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-red-600">Issues to Address:</h4>
                    {results.failed_criteria.map((criteria, index) => (
                      <Alert key={index} variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>{criteria}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}

                {results?.recommendations && results.recommendations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-secondary-blue">Next Steps:</h4>
                    {results.recommendations.map((recommendation, index) => (
                      <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-secondary-blue/20">
                        <p className="text-sm">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                )}

                {results?.is_eligible && (
                  <Alert className="bg-green-50 border-accent-green">
                    <CheckCircle2 className="h-4 w-4 text-accent-green" />
                    <AlertDescription className="text-accent-green">
                      You meet all eligibility criteria! Proceed to find the best internship opportunities for you.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          {results?.is_eligible ? (
            <>
              <Button
                size="lg"
                className="bg-primary-orange hover:bg-orange-600 px-8"
                onClick={() => navigate(createPageUrl("Dashboard"))}
              >
                View Dashboard / डैशबोर्ड देखें
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-secondary-blue text-secondary-blue hover:bg-blue-50 px-8"
                onClick={() => navigate(createPageUrl("Dashboard"))}
              >
                Find Internships / इंटर्नशिप खोजें
              </Button>
            </>
          ) : (
            <>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate(createPageUrl("Profile"))}
                className="px-8"
              >
                Update Profile / प्रोफ़ाइल अपडेट करें
              </Button>
              <Button
                size="lg"
                className="bg-secondary-blue hover:bg-blue-600 px-8"
                onClick={() => navigate(createPageUrl("Dashboard"))}
              >
                Skill Development / कौशल विकास
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </>
          )}
        </div>

        {/* Career Readiness Breakdown */}
        <Card className="mt-8 border-accent-green">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent-green" />
              Career Readiness Analysis / करियर तैयारी विश्लेषण
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Overall Readiness Score</span>
                  <span className="text-xl font-bold text-accent-green">
                    {results?.readiness_score || 0}%
                  </span>
                </div>
                <Progress 
                  value={results?.readiness_score || 0} 
                  className="h-3"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Skills & Experience</h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex justify-between">
                      <span>Skills Listed:</span>
                      <span className="font-medium">{user?.skills?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Languages:</span>
                      <span className="font-medium">{user?.languages?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Certifications:</span>
                      <span className="font-medium">{user?.certifications?.length || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Profile Completion</h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex justify-between">
                      <span>Bank Account:</span>
                      <span className={`font-medium ${user?.bank_account_seeded ? 'text-accent-green' : 'text-red-500'}`}>
                        {user?.bank_account_seeded ? 'Ready' : 'Needed'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Experience Description:</span>
                      <span className={`font-medium ${user?.experience?.length > 50 ? 'text-accent-green' : 'text-orange-500'}`}>
                        {user?.experience?.length > 50 ? 'Detailed' : 'Basic'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

 