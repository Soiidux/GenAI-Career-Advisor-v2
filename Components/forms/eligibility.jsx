/**
 * EligibilityForm.jsx - Multi-step form for collecting user eligibility data
 * Handles all PM Internship Scheme eligibility criteria with validation
 */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  GraduationCap, 
  Briefcase, 
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  Plus,
  X
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function EligibilityForm({ onSubmit, initialData = {} }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Details
    full_name: initialData.full_name || "",
    email: initialData.email || "",
    phone: "",
    date_of_birth: "",
    gender: "",
    address: "",
    category: "",
    differently_abled: false,
    bank_account_seeded: false,
    
    // Eligibility Criteria
    citizenship_confirmed: false,
    qualification: "",
    employment_status: "",
    education_status: "",
    family_income: "",
    
    // Exclusion Criteria (all should be false for eligibility)
    premium_institute_graduate: false,
    advanced_degree_holder: false,
    govt_training_enrolled: false,
    family_govt_employee: false,
    
    // Skills & Experience
    skills: [],
    languages: [],
    certifications: [],
    experience: "",
    
    // Preferences
    preferred_language: "english",
    voice_enabled: false
  });

  const [errors, setErrors] = useState({});
  const [skillInput, setSkillInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [certificationInput, setCertificationInput] = useState("");

  const steps = [
    {
      title: "Basic Details",
      titleHindi: "बुनियादी विवरण",
      icon: User,
      fields: ["full_name", "email", "phone", "date_of_birth", "gender", "address"]
    },
    {
      title: "Category & Status",
      titleHindi: "श्रेणी और स्थिति",
      icon: User,
      fields: ["category", "differently_abled", "bank_account_seeded"]
    },
    {
      title: "Education",
      titleHindi: "शिक्षा",
      icon: GraduationCap,
      fields: ["citizenship_confirmed", "qualification", "education_status"]
    },
    {
      title: "Employment",
      titleHindi: "रोजगार",
      icon: Briefcase,
      fields: ["employment_status", "family_income"]
    },
    {
      title: "Exclusion Check",
      titleHindi: "बहिष्करण जांच",
      icon: AlertTriangle,
      fields: ["premium_institute_graduate", "advanced_degree_holder", "govt_training_enrolled", "family_govt_employee"]
    },
    {
      title: "Skills",
      titleHindi: "कौशल",
      icon: CheckCircle2,
      fields: ["skills", "languages", "certifications", "experience"]
    }
  ];

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateStep = (stepIndex) => {
    const step = steps[stepIndex];
    const stepErrors = {};

    step.fields.forEach(field => {
      const value = formData[field];
      
      switch (field) {
        case "full_name":
          if (!value || value.trim().length < 2) {
            stepErrors[field] = "Name is required (minimum 2 characters)";
          }
          break;
        case "email":
          if (!value || !/\S+@\S+\.\S+/.test(value)) {
            stepErrors[field] = "Valid email is required";
          }
          break;
        case "phone":
          if (!value || !/^\d{10}$/.test(value)) {
            stepErrors[field] = "Valid 10-digit phone number is required";
          }
          break;
        case "date_of_birth":
          if (!value) {
            stepErrors[field] = "Date of birth is required";
          } else {
            const age = Math.floor((Date.now() - new Date(value).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
            if (age < 21 || age > 24) {
              stepErrors[field] = "Age must be between 21-24 years for PM Internship Scheme";
            }
          }
          break;
        case "gender":
        case "category":
        case "qualification":
        case "employment_status":
        case "education_status":
          if (!value) {
            stepErrors[field] = `${field.replace('_', ' ')} is required`;
          }
          break;
        case "family_income":
          if (!value || isNaN(value) || parseFloat(value) < 0) {
            stepErrors[field] = "Valid family income is required";
          } else if (parseFloat(value) >= 800000) {
            stepErrors[field] = "Family income must be less than Rs 8,00,000 for eligibility";
          }
          break;
        case "citizenship_confirmed":
          if (!value) {
            stepErrors[field] = "Indian citizenship confirmation is required";
          }
          break;
        case "address":
          if (!value || value.trim().length < 10) {
            stepErrors[field] = "Complete address is required";
          }
          break;
        case "experience":
          if (!value || value.trim().length < 20) {
            stepErrors[field] = "Please provide a detailed description of your experience (minimum 20 characters)";
          }
          break;
      }
    });

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      const age = Math.floor((Date.now() - new Date(formData.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      onSubmit({
        ...formData,
        age,
        skills: formData.skills.filter(skill => skill.trim()),
        languages: formData.languages.filter(lang => lang.trim()),
        certifications: formData.certifications.filter(cert => cert.trim())
      });
    }
  };

  const addToArray = (field, value) => {
    if (value.trim()) {
      updateField(field, [...formData[field], value.trim()]);
    }
  };

  const removeFromArray = (field, index) => {
    updateField(field, formData[field].filter((_, i) => i !== index));
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <Card className="mb-6 border-orange-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <currentStepData.icon className="w-6 h-6 text-primary-orange" />
              <div>
                <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
                <p className="text-secondary-blue font-medium">{currentStepData.titleHindi}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-orange-50 text-primary-orange border-primary-orange">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
      </Card>

      {/* Form Content */}
      <Card className="border-orange-200">
        <CardContent className="p-8">
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-base font-medium">
                    Full Name / पूरा नाम *
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => updateField("full_name", e.target.value)}
                    placeholder="Enter your full name"
                    className={errors.full_name ? "border-red-500" : ""}
                  />
                  {errors.full_name && (
                    <p className="text-red-500 text-sm">{errors.full_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">
                    Email / ईमेल *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="Enter your email"
                    className={errors.email ? "border-red-500" : ""}
                    disabled={!!initialData.email}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base font-medium">
                    Phone Number / फ़ोन नंबर *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="10-digit mobile number"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth" className="text-base font-medium">
                    Date of Birth / जन्म तिथि *
                  </Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => updateField("date_of_birth", e.target.value)}
                    className={errors.date_of_birth ? "border-red-500" : ""}
                  />
                  {errors.date_of_birth && (
                    <p className="text-red-500 text-sm">{errors.date_of_birth}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">Gender / लिंग *</Label>
                  <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)}>
                    <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male / पुरुष</SelectItem>
                      <SelectItem value="female">Female / महिला</SelectItem>
                      <SelectItem value="other">Other / अन्य</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-red-500 text-sm">{errors.gender}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-base font-medium">
                  Complete Address / पूरा पता *
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Enter your complete address including city, state, pincode"
                  className={errors.address ? "border-red-500" : ""}
                  rows={3}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm">{errors.address}</p>
                )}
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base font-medium">Category / श्रेणी *</Label>
                <Select value={formData.category} onValueChange={(value) => updateField("category", value)}>
                  <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select your category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General / सामान्य</SelectItem>
                    <SelectItem value="obc">OBC / अन्य पिछड़ा वर्ग</SelectItem>
                    <SelectItem value="sc">SC / अनुसूचित जाति</SelectItem>
                    <SelectItem value="st">ST / अनुसूचित जनजाति</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-red-500 text-sm">{errors.category}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="differently_abled"
                    checked={formData.differently_abled}
                    onCheckedChange={(checked) => updateField("differently_abled", checked)}
                  />
                  <Label htmlFor="differently_abled" className="text-base">
                    I am differently abled / मैं दिव्यांग हूँ
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bank_account_seeded"
                    checked={formData.bank_account_seeded}
                    onCheckedChange={(checked) => updateField("bank_account_seeded", checked)}
                  />
                  <Label htmlFor="bank_account_seeded" className="text-base">
                    I have a seeded bank account / मेरे पास एक सीडेड बैंक खाता है
                  </Label>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <Alert className="bg-blue-50 border-secondary-blue">
                <AlertTriangle className="h-4 w-4 text-secondary-blue" />
                <AlertDescription className="text-secondary-blue">
                  <strong>Important:</strong> You must be an Indian citizen aged 21-24 years to be eligible for the PM Internship Scheme.
                </AlertDescription>
              </Alert>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="citizenship_confirmed"
                  checked={formData.citizenship_confirmed}
                  onCheckedChange={(checked) => updateField("citizenship_confirmed", checked)}
                />
                <Label htmlFor="citizenship_confirmed" className="text-base font-medium">
                  I confirm that I am an Indian citizen / मैं पुष्टि करता हूं कि मैं भारतीय नागरिक हूं *
                </Label>
              </div>
              {errors.citizenship_confirmed && (
                <p className="text-red-500 text-sm">{errors.citizenship_confirmed}</p>
              )}

              <div className="space-y-2">
                <Label className="text-base font-medium">Educational Qualification / शैक्षणिक योग्यता *</Label>
                <Select value={formData.qualification} onValueChange={(value) => updateField("qualification", value)}>
                  <SelectTrigger className={errors.qualification ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select your highest qualification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="class_10">Class 10 / कक्षा 10</SelectItem>
                    <SelectItem value="iti">ITI / आईटीआई</SelectItem>
                    <SelectItem value="diploma">Diploma / डिप्लोमा</SelectItem>
                    <SelectItem value="ba">BA / बीए</SelectItem>
                    <SelectItem value="bsc">B.Sc / बीएससी</SelectItem>
                    <SelectItem value="bcom">B.Com / बीकॉम</SelectItem>
                    <SelectItem value="bba">BBA / बीबीए</SelectItem>
                    <SelectItem value="bca">BCA / बीसीए</SelectItem>
                    <SelectItem value="b_pharma">B.Pharma / बी फार्मा</SelectItem>
                  </SelectContent>
                </Select>
                {errors.qualification && (
                  <p className="text-red-500 text-sm">{errors.qualification}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">Current Education Status / वर्तमान शिक्षा स्थिति *</Label>
                <Select value={formData.education_status} onValueChange={(value) => updateField("education_status", value)}>
                  <SelectTrigger className={errors.education_status ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select your current education status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_enrolled">Not enrolled in any course / किसी कोर्स में नामांकित नहीं</SelectItem>
                    <SelectItem value="part_time_remote">Part-time/Remote learning only / केवल अंशकालिक/रिमोट लर्निंग</SelectItem>
                  </SelectContent>
                </Select>
                {errors.education_status && (
                  <p className="text-red-500 text-sm">{errors.education_status}</p>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <Alert className="bg-orange-50 border-primary-orange">
                <Briefcase className="h-4 w-4 text-primary-orange" />
                <AlertDescription className="text-primary-orange">
                  <strong>Employment Requirements:</strong> You must not be in full-time employment to be eligible for the PM Internship Scheme.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label className="text-base font-medium">Current Employment Status / वर्तमान रोजगार स्थिति *</Label>
                <Select value={formData.employment_status} onValueChange={(value) => updateField("employment_status", value)}>
                  <SelectTrigger className={errors.employment_status ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select your current employment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unemployed">Unemployed / बेरोजगार</SelectItem>
                    <SelectItem value="part_time">Part-time work / अंशकालिक काम</SelectItem>
                    <SelectItem value="freelance">Freelance work / स्वतंत्र काम</SelectItem>
                  </SelectContent>
                </Select>
                {errors.employment_status && (
                  <p className="text-red-500 text-sm">{errors.employment_status}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="family_income" className="text-base font-medium">
                  Annual Family Income (in Rs) / वार्षिक पारिवारिक आय (रुपये में) *
                </Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="family_income"
                    type="number"
                    value={formData.family_income}
                    onChange={(e) => updateField("family_income", e.target.value)}
                    placeholder="Enter annual family income"
                    className={`pl-10 ${errors.family_income ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.family_income && (
                  <p className="text-red-500 text-sm">{errors.family_income}</p>
                )}
                <p className="text-sm text-gray-600">
                  Your family's total annual income must be less than Rs 8,00,000 to be eligible
                </p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <Alert className="bg-red-50 border-red-400">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  <strong>Important:</strong> Answer "No" to all questions below to be eligible. These exclusion criteria ensure the scheme reaches its intended beneficiaries.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id="premium_institute_graduate"
                      checked={formData.premium_institute_graduate}
                      onCheckedChange={(checked) => updateField("premium_institute_graduate", checked)}
                    />
                    <Label htmlFor="premium_institute_graduate" className="text-base font-medium">
                      I have graduated from a premium institute
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">
                    IIT, IIM, NLU, IISER, NID, or IIIT / आईआईटी, आईआईएम, एनएलयू, आईआईएसईआर, एनआईडी, या आईआईआईटी
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id="advanced_degree_holder"
                      checked={formData.advanced_degree_holder}
                      onCheckedChange={(checked) => updateField("advanced_degree_holder", checked)}
                    />
                    <Label htmlFor="advanced_degree_holder" className="text-base font-medium">
                      I hold an advanced degree
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">
                    CA, MBA, Master's degree or higher / सीए, एमबीए, मास्टर डिग्री या उच्चतर
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id="govt_training_enrolled"
                      checked={formData.govt_training_enrolled}
                      onCheckedChange={(checked) => updateField("govt_training_enrolled", checked)}
                    />
                    <Label htmlFor="govt_training_enrolled" className="text-base font-medium">
                      I am currently in a government training program
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">
                    Any government-run skill training or apprenticeship program / कोई भी सरकारी कौशल प्रशिक्षण या अप्रेंटिसशिप कार्यक्रम
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id="family_govt_employee"
                      checked={formData.family_govt_employee}
                      onCheckedChange={(checked) => updateField("family_govt_employee", checked)}
                    />
                    <Label htmlFor="family_govt_employee" className="text-base font-medium">
                      A family member is in permanent government service
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">
                    Parents or spouse in permanent government employment / माता-पिता या जीवनसाथी स्थायी सरकारी नौकरी में
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <Alert className="bg-green-50 border-accent-green">
                <CheckCircle2 className="h-4 w-4 text-accent-green" />
                <AlertDescription className="text-accent-green">
                  <strong>Almost Done!</strong> Add your skills and experience to get better internship recommendations.
                </AlertDescription>
              </Alert>

              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-medium">Skills / कौशल</Label>
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Add a skill (e.g., Communication, Computer, Marketing)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addToArray('skills', skillInput);
                          setSkillInput('');
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      onClick={() => {
                        addToArray('skills', skillInput);
                        setSkillInput('');
                      }}
                      disabled={!skillInput.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeFromArray('skills', index)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">Languages / भाषाएं</Label>
                  <div className="flex gap-2">
                    <Input
                      value={languageInput}
                      onChange={(e) => setLanguageInput(e.target.value)}
                      placeholder="Add a language (e.g., Hindi, English, Tamil)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addToArray('languages', languageInput);
                          setLanguageInput('');
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      onClick={() => {
                        addToArray('languages', languageInput);
                        setLanguageInput('');
                      }}
                      disabled={!languageInput.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.map((language, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {language}
                        <button
                          type="button"
                          onClick={() => removeFromArray('languages', index)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">Certifications / प्रमाणपत्र</Label>
                  <div className="flex gap-2">
                    <Input
                      value={certificationInput}
                      onChange={(e) => setCertificationInput(e.target.value)}
                      placeholder="Add a certification (e.g., Computer Course, Typing Certificate)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addToArray('certifications', certificationInput);
                          setCertificationInput('');
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      onClick={() => {
                        addToArray('certifications', certificationInput);
                        setCertificationInput('');
                      }}
                      disabled={!certificationInput.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {cert}
                        <button
                          type="button"
                          onClick={() => removeFromArray('certifications', index)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-base font-medium">
                    Work Experience / कार्य अनुभव *
                  </Label>
                  <Textarea
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => updateField("experience", e.target.value)}
                    placeholder="Describe any work experience, projects, or relevant activities (minimum 20 characters)"
                    className={errors.experience ? "border-red-500" : ""}
                    rows={4}
                  />
                  {errors.experience && (
                    <p className="text-red-500 text-sm">{errors.experience}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    Include any internships, part-time jobs, freelance work, volunteer activities, or personal projects
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleSubmit}
                className="bg-primary-orange hover:bg-orange-600 flex items-center gap-2"
              >
                Submit Application
                <CheckCircle2 className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="bg-primary-orange hover:bg-orange-600 flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}