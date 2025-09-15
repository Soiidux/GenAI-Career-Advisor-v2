
/**
 * Dashboard.js - Main dashboard page showing personalized internship recommendations
 * Displays AI-powered internship matches and career development resources
 */
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/entities/User";
import { InternshipOpportunity } from "@/entities/InternshipOpportunity";
import { EligibilityResult } from "@/entities/EligibilityResult";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  IndianRupee, 
  Star,
  TrendingUp,
  Target,
  BookOpen,
  Award,
  ArrowRight,
  ExternalLink,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff
} from "lucide-react";

// Move fallback internships outside component to avoid dependency issues for useCallback
const fallbackInternships = [
  {
    id: "sample-1",
    title: "Digital Marketing Assistant",
    company: "TechStart India",
    description: "Help create social media content and support digital marketing initiatives through various online channels.",
    location: "Mumbai, Maharashtra",
    duration_months: 6,
    stipend: 8000,
    skills_required: ["social media marketing", "communication", "content creation", "SEO basics"],
    category: "marketing",
    is_remote: false,
    difficulty_level: "beginner",
    qualifications_accepted: ["High School", "Undergraduate"],
    languages_supported: ["English", "Hindi"]
  },
  {
    id: "sample-2",
    title: "Customer Service Representative",
    company: "Support Solutions",
    description: "Handle customer inquiries and provide excellent service via phone and email. Resolve issues and maintain customer satisfaction.",
    location: "Delhi, Delhi",
    duration_months: 8,
    stipend: 7500,
    skills_required: ["customer service", "patience", "computer basics", "problem-solving"],
    category: "operations",
    is_remote: false,
    difficulty_level: "beginner",
    qualifications_accepted: ["High School", "Undergraduate"],
    languages_supported: ["English", "Hindi"]
  },
  {
    id: "sample-3",
    title: "Data Entry Specialist",
    company: "Digital Records",
    description: "Accurately input and maintain data in digital systems, ensuring data integrity and timely processing.",
    location: "Chennai, Tamil Nadu",
    duration_months: 6,
    stipend: 6000,
    skills_required: ["typing", "attention to detail", "computer skills", "data management"],
    category: "operations",
    is_remote: true,
    difficulty_level: "beginner",
    qualifications_accepted: ["High School"],
    languages_supported: ["English", "Tamil"]
  },
  {
    id: "sample-4",
    title: "Content Writing Intern",
    company: "WordFlow Agency",
    description: "Assist in writing articles, blog posts, and website content for various clients.",
    location: "Bengaluru, Karnataka",
    duration_months: 4,
    stipend: 9000,
    skills_required: ["writing", "grammar", "research", "creativity"],
    category: "content",
    is_remote: true,
    difficulty_level: "intermediate",
    qualifications_accepted: ["Undergraduate", "Postgraduate"],
    languages_supported: ["English"]
  },
  {
    id: "sample-5",
    title: "Junior Web Developer",
    company: "CodeCraft Studios",
    description: "Work with senior developers to build and maintain web applications using modern frameworks.",
    location: "Hyderabad, Telangana",
    duration_months: 9,
    stipend: 12000,
    skills_required: ["HTML", "CSS", "JavaScript", "React"],
    category: "technology",
    is_remote: false,
    difficulty_level: "intermediate",
    qualifications_accepted: ["Undergraduate", "Postgraduate"],
    languages_supported: ["English"]
  }
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [internships, setInternships] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('online'); // 'online', 'limited', 'offline'

  // Generate simple fallback recommendations without AI
  const generateFallbackRecommendations = useCallback((userData, availableInternships) => {
    if (!userData || !availableInternships || availableInternships.length === 0) {
      setRecommendations([]);
      return;
    }
    
    const userSkills = (userData.skills || []).map(skill => skill.toLowerCase());
    const userQualification = userData.qualification?.toLowerCase();

    const scoredInternships = availableInternships.map(internship => {
      let score = 50; // Base score
      let reasons = [];
      let currentSkillGaps = [];
      
      // Qualification match
      if (internship.qualifications_accepted && userQualification && internship.qualifications_accepted.some(q => q.toLowerCase() === userQualification)) {
        score += 20;
        reasons.push(`Good fit for your qualification (${userData.qualification})`);
      } else if (internship.qualifications_accepted && internship.qualifications_accepted.includes("Any")) {
        score += 10;
        reasons.push("Accepts various qualifications");
      }
      
      // Skill match
      const matchingSkills = (internship.skills_required || []).filter(skill => 
        userSkills.some(userSkill => 
          skill.toLowerCase().includes(userSkill) || userSkill.includes(skill.toLowerCase())
        )
      );
      score += matchingSkills.length * 10;
      if (matchingSkills.length > 0) {
        reasons.push(`Skills match: ${matchingSkills.slice(0, 2).join(', ')}`);
      }

      currentSkillGaps = (internship.skills_required || []).filter(skill => !matchingSkills.includes(skill));
      
      // Beginner friendly bonus
      if (internship.difficulty_level === 'beginner') {
        score += 5;
        reasons.push("Beginner-friendly");
      }

      // Remote preference (if user has voice enabled as proxy)
      if (internship.is_remote && userData.voice_enabled) {
        score += 5;
        reasons.push("Matches remote preference");
      }

      // Default reason if no strong matches
      if (reasons.length === 0) {
        reasons.push("General opportunity that aligns with common profiles.");
      }

      return {
        internship_id: internship.id,
        match_score: Math.min(score, 99), // Cap at 99
        reason: reasons.join('; '),
        skill_gaps: currentSkillGaps.slice(0, 3), // Limit gaps for display
        growth_potential: internship.category === 'technology' ? 'High' : 'Good' // Example logic
      };
    });

    // Sort by score and take top 5
    const topRecommendations = scoredInternships
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 5);
    
    setRecommendations(topRecommendations);
  }, []);

  // Generate recommendations with AI fallback
  const generateRecommendations = useCallback(async (userData, availableInternships) => {
    if (!userData || !availableInternships || availableInternships.length === 0) {
      // If no valid user data or internships, just return or use very basic fallback
      setRecommendations([]);
      setIsGeneratingRecommendations(false);
      return;
    }
    
    setIsGeneratingRecommendations(true);
    
    try {
      const userProfile = {
        skills: userData.skills || [],
        qualification: userData.qualification,
        experience: userData.experience?.substring(0, 200) || "Entry level", // Limit to reduce token usage
        languages: userData.languages || [],
        location: userData.address?.split(',')[0] || "India", // Just city to reduce tokens
        preferences: {
          remote_ok: userData.voice_enabled || false, // Proxy for remote preference
          categories: [] // Could be expanded from user data
        }
      };

      // Limiting internships passed to LLM for performance/token reasons
      const limitedInternships = availableInternships.slice(0, 5).map(internship => ({
        id: internship.id,
        title: internship.title,
        company: internship.company,
        skills_required: internship.skills_required?.slice(0, 4) || [],
        category: internship.category,
        difficulty_level: internship.difficulty_level,
        location: internship.location?.split(',')[0] || "India",
        is_remote: internship.is_remote,
        qualifications_accepted: internship.qualifications_accepted?.slice(0,2) || []
      }));

      const response = await InvokeLLM({
        prompt: `Based on this user profile: ${JSON.stringify(userProfile)}, recommend the top 5 most suitable internships from this list: ${JSON.stringify(limitedInternships)}. Consider skill match, qualification compatibility, location preference, and career growth potential. For each, provide internship_id, match_score (0-100, number), and a concise reason (string).`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  internship_id: { type: "string" },
                  match_score: { type: "number" },
                  reason: { type: "string" }
                  // skill_gaps and growth_potential are not requested from LLM to simplify schema and save tokens
                },
                required: ["internship_id", "match_score", "reason"]
              }
            }
          },
          required: ["recommendations"]
        }
      });

      if (response && response.recommendations && response.recommendations.length > 0) {
        setRecommendations(response.recommendations);
        if (connectionStatus === 'limited') setConnectionStatus('online'); // Restore to online if AI succeeded
      } else {
        throw new Error("Invalid or empty response from AI");
      }

    } catch (error) {
      console.warn("AI recommendation error:", error);
      // Fallback to simple matching on error
      generateFallbackRecommendations(userData, availableInternships);
      if (connectionStatus !== 'offline') setConnectionStatus('limited'); // Indicate limited functionality
    } finally {
      setIsGeneratingRecommendations(false);
    }
  }, [generateFallbackRecommendations, connectionStatus, setRecommendations, setConnectionStatus]);

  // Memoize loadDashboardData as it's a dependency for useEffect
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    let currentOverallStatus = 'online'; // Assume online initially

    let currentUser = null;
    let allInternships = [];
    let currentEligibilityResult = null;

    // 1. Load user data
    try {
      currentUser = await User.me();
      setUser(currentUser);
    } catch (userError) {
      console.error("User.me() failed:", userError);
      setError("Failed to load user profile. Please check your internet connection.");
      // Provide a minimal user object to prevent crashes down the line
      currentUser = {
        id: "fallback-user",
        full_name: "Guest User",
        skills: ["Communication", "Problem Solving"],
        qualification: "Undergraduate",
        experience: "0-1 years",
        languages: ["English", "Hindi"],
        address: "Unknown",
        voice_enabled: false,
        bank_account_seeded: false
      };
      setUser(currentUser);
      currentOverallStatus = 'offline'; // Critical failure
    }

    // Only proceed if we have at least a fallback user
    if (currentUser) {
      // 2. Load all internships
      try {
        const fetchedInternships = await InternshipOpportunity.list();
        if (fetchedInternships.length > 0) {
          allInternships = fetchedInternships;
        } else {
          console.warn("InternshipOpportunity.list() returned empty, using fallback data.");
          allInternships = fallbackInternships;
          if (currentOverallStatus === 'online') currentOverallStatus = 'limited';
        }
        setInternships(allInternships);
      } catch (internshipError) {
        console.warn("InternshipOpportunity.list() failed, using fallback data:", internshipError.message);
        allInternships = fallbackInternships;
        setInternships(allInternships);
        if (currentOverallStatus === 'online') currentOverallStatus = 'limited';
      }

      // 3. Load eligibility results
      try {
        const eligibilityResults = await EligibilityResult.filter({ user_id: currentUser.id }, '-created_date', 1);
        if (eligibilityResults.length > 0) {
          currentEligibilityResult = eligibilityResults[0];
        } else {
          console.warn("EligibilityResult.filter() returned empty, using default eligibility.");
          currentEligibilityResult = { is_eligible: true, eligibility_score: 85, readiness_score: 70 };
          if (currentOverallStatus === 'online') currentOverallStatus = 'limited';
        }
        setEligibilityResult(currentEligibilityResult);
      } catch (eligibilityError) {
        console.warn("EligibilityResult.filter() failed, using default eligibility:", eligibilityError.message);
        currentEligibilityResult = { is_eligible: true, eligibility_score: 85, readiness_score: 70 };
        setEligibilityResult(currentEligibilityResult);
        if (currentOverallStatus === 'online') currentOverallStatus = 'limited';
      }

      // 4. Generate AI recommendations (will use its own fallback if AI fails)
      await generateRecommendations(currentUser, allInternships);

    } else { // If user data failed to load, populate with basic fallbacks
      setInternships(fallbackInternships);
      setEligibilityResult({ is_eligible: true, eligibility_score: 85, readiness_score: 70 });
      generateFallbackRecommendations(currentUser || { /* minimal user for fallback */ skills: [], qualification: 'none' }, fallbackInternships);
    }
    
    setConnectionStatus(currentOverallStatus);
    setIsLoading(false);
  }, [
    generateRecommendations, 
    generateFallbackRecommendations, 
    setUser, 
    setInternships, 
    setEligibilityResult, 
    setIsLoading, 
    setError, 
    setConnectionStatus
  ]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const getInternshipById = (id) => {
    return internships.find(internship => internship.id === id);
  };

  const categoryColors = {
    technology: "bg-blue-100 text-blue-800",
    marketing: "bg-purple-100 text-purple-800",
    finance: "bg-green-100 text-green-800",
    operations: "bg-orange-100 text-orange-800",
    design: "bg-pink-100 text-pink-800",
    content: "bg-yellow-100 text-yellow-800",
    sales: "bg-red-100 text-red-800",
    hr: "bg-indigo-100 text-indigo-800"
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary-orange" />
            <h3 className="text-xl font-semibold">Loading Your Dashboard</h3>
            <p className="text-gray-600 text-center">
              Personalizing internship recommendations...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Connection Status Alert */}
        {connectionStatus !== 'online' && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-400 text-yellow-800">
            <div className="flex items-center gap-2">
              {connectionStatus === 'offline' ? (
                <WifiOff className="h-4 w-4 text-red-500" />
              ) : (
                <Wifi className="h-4 w-4 text-yellow-600" />
              )}
              <AlertDescription>
                {connectionStatus === 'offline' ? (
                  <span>Limited connectivity detected. Showing cached data and basic recommendations.</span>
                ) : (
                  <span>Using fallback data due to server limitations. Some features may be limited.</span>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setError(null);
                  loadDashboardData();
                }}
                className="ml-4 bg-red-50 hover:bg-red-100 text-red-800 border-red-500"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-xl text-secondary-blue font-medium">
              स्वागत है, आपका करियर डैशबोर्ड
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="text-center border-primary-orange">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary-orange rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-primary-orange mb-1">
                  {eligibilityResult?.eligibility_score || 75}%
                </div>
                <div className="text-sm text-gray-600">Eligibility Score</div>
              </CardContent>
            </Card>

            <Card className="text-center border-secondary-blue">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-secondary-blue rounded-xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-secondary-blue mb-1">
                  {eligibilityResult?.readiness_score || 68}%
                </div>
                <div className="text-sm text-gray-600">Career Readiness</div>
              </CardContent>
            </Card>

            <Card className="text-center border-accent-green">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent-green rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-accent-green mb-1">
                  {recommendations.length || 0}
                </div>
                <div className="text-sm text-gray-600">Matched Internships</div>
              </CardContent>
            </Card>

            <Card className="text-center border-orange-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {user?.skills?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Skills Listed</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Eligibility Status */}
        {eligibilityResult && (
          <Alert className={`mb-8 ${eligibilityResult.is_eligible ? 'bg-green-50 border-accent-green text-accent-green' : 'bg-orange-50 border-orange-400 text-orange-700'}`}>
            <Star className={`h-4 w-4 ${eligibilityResult.is_eligible ? 'text-accent-green' : 'text-orange-600'}`} />
            <AlertDescription className={eligibilityResult.is_eligible ? 'text-accent-green' : 'text-orange-700'}>
              <strong>
                {eligibilityResult.is_eligible ? 
                  'Congratulations! You are eligible for the PM Internship Scheme.' :
                  'You are currently not eligible for the PM Internship Scheme.'
                }
              </strong>
              {eligibilityResult.is_eligible ? 
                ' Explore the recommended internships below to find your perfect match.' :
                ' Work on the areas mentioned in your results page to become eligible.'
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Recommendations Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-orange-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Briefcase className="w-6 h-6 text-primary-orange" />
                    Recommended Internships
                    {connectionStatus === 'limited' && (
                      <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-300">Limited Mode</Badge>
                    )}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateRecommendations(user, internships)}
                    disabled={isGeneratingRecommendations}
                    className="flex items-center gap-2"
                  >
                    {isGeneratingRecommendations ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Refresh
                  </Button>
                </div>
                <p className="text-secondary-blue font-medium">
                  सिफारिश की गई इंटर्नशिप
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {isGeneratingRecommendations ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-orange mx-auto mb-4" />
                    <p className="text-gray-600">Generating personalized recommendations...</p>
                  </div>
                ) : recommendations.length > 0 ? (
                  recommendations.map((rec, index) => {
                    const internship = getInternshipById(rec.internship_id);
                    // If an internship is not found (e.g., due to AI returning ID not in current list), skip it
                    if (!internship) return null;

                    return (
                      <Card key={rec.internship_id || index} className="hover:shadow-lg transition-all border-gray-200 hover:border-primary-orange">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {internship.title}
                              </h3>
                              <p className="text-lg text-secondary-blue font-medium mb-2">
                                {internship.company}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-primary-orange text-white mb-2">
                                {rec.match_score || 75}% Match
                              </Badge>
                              <div className="text-sm text-gray-500">
                                Match Score
                              </div>
                            </div>
                          </div>

                          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                            {internship.description}
                          </p>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              {internship.location}
                              {internship.is_remote && (
                                <Badge variant="outline" className="ml-2">Remote</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              {internship.duration_months} months
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <IndianRupee className="w-4 h-4" />
                              Rs {internship.stipend?.toLocaleString()}/month
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge className={categoryColors[internship.category] || "bg-gray-100"}>
                                {internship.category}
                              </Badge>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Why this matches you:
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {rec.reason}
                            </p>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="text-sm">
                              <span className="text-gray-500">Difficulty:</span>
                              <Badge variant="outline" className="ml-2 capitalize">
                                {internship.difficulty_level}
                              </Badge>
                            </div>
                            <Button className="bg-secondary-blue hover:bg-blue-600">
                              Apply Now
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recommendations available. Complete your profile to get personalized suggestions.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <Card className="border-accent-green">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent-green" />
                  Profile Strength
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Profile Completion</span>
                      <span className="font-semibold">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Basic Info</span>
                      <span className="text-accent-green">✓</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Skills Listed</span>
                      <span className="text-accent-green">✓</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bank Account</span>
                      <span className={user?.bank_account_seeded ? 'text-accent-green' : 'text-orange-500'}>
                        {user?.bank_account_seeded ? '✓' : '!'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skill Development */}
            <Card className="border-secondary-blue">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-secondary-blue" />
                  Skill Development
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    Based on your profile and internship interests:
                  </p>
                  
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-medium text-sm">Digital Marketing</h4>
                      <p className="text-xs text-gray-600 mt-1">High demand skill for modern businesses</p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h4 className="font-medium text-sm">Communication Skills</h4>
                      <p className="text-xs text-gray-600 mt-1">Essential for all career paths</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-medium text-sm">Computer Basics</h4>
                      <p className="text-xs text-gray-600 mt-1">Foundation for digital work</p>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full mt-4" size="sm">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Explore Courses
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary-orange" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  Update Skills
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  View All Internships
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  Eligibility Check
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
