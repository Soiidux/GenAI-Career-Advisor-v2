/**
 * Landing.js - Welcome page for AAROHAN Career Guidance Platform
 * Introduces PM Internship Scheme and provides language selection
 */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowRight, 
  Users, 
  Target, 
  Award, 
  Globe, 
  Mic,
  CheckCircle2,
  Briefcase,
  IndianRupee
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  const [selectedLanguage, setSelectedLanguage] = useState("english");

  const languages = [
    { code: "english", name: "English", native: "English" },
    { code: "hindi", name: "Hindi", native: "हिंदी" },
    { code: "bengali", name: "Bengali", native: "বাংলা" },
    { code: "tamil", name: "Tamil", native: "தமிழ்" },
    { code: "telugu", name: "Telugu", native: "తెలుగు" },
    { code: "marathi", name: "Marathi", native: "मराठी" },
    { code: "gujarati", name: "Gujarati", native: "ગુજરાતી" },
    { code: "punjabi", name: "Punjabi", native: "ਪੰਜਾਬੀ" }
  ];

  const features = [
    {
      icon: Target,
      title: "Eligibility Screening",
      titleHindi: "पात्रता जांच",
      description: "Automated check for PM Internship Scheme eligibility",
      descriptionHindi: "पीएम इंटर्नशिप योजना की पात्रता की स्वचालित जांच"
    },
    {
      icon: Award,
      title: "AI Recommendations",
      titleHindi: "एआई सिफारिशें",
      description: "Personalized internship suggestions based on your profile",
      descriptionHindi: "आपकी प्रोफाइल के आधार पर व्यक्तिगत इंटर्नशिप सुझाव"
    },
    {
      icon: Globe,
      title: "Multilingual Support",
      titleHindi: "बहुभाषी सहायता",
      description: "Available in 8+ Indian languages with voice support",
      descriptionHindi: "वॉयस सपोर्ट के साथ 8+ भारतीय भाषाओं में उपलब्ध"
    },
    {
      icon: Mic,
      title: "Voice Interface",
      titleHindi: "आवाज़ इंटरफेस",
      description: "Voice-first design for users with low digital literacy",
      descriptionHindi: "कम डिजिटल साक्षरता वाले उपयोगकर्ताओं के लिए आवाज़-प्राथमिकता डिज़ाइन"
    }
  ];

  const benefits = [
    {
      icon: IndianRupee,
      title: "Monthly Stipend",
      titleHindi: "मासिक वेतन",
      value: "Rs 5,000 - Rs 10,000",
      description: "Financial support during internship"
    },
    {
      icon: Award,
      title: "Skill Development",
      titleHindi: "कौशल विकास",
      value: "Industry Training",
      description: "Learn from experienced professionals"
    },
    {
      icon: Briefcase,
      title: "Career Path",
      titleHindi: "करियर पथ",
      value: "Job Opportunities",
      description: "Direct pathway to employment"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <Badge className="px-6 py-2 bg-primary-orange text-white text-lg font-medium">
                🇮🇳 Government of India Initiative
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="text-primary-orange">AAROHAN</span>
              <br />
              <span className="text-2xl md:text-4xl font-medium">आरोहण</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4 max-w-4xl mx-auto leading-relaxed">
              Digital Guide to Career Beginnings
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              करियर शुरुआत के लिए डिजिटल गाइड
            </p>

            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-2xl p-6 mb-12 max-w-4xl mx-auto shadow-xl border border-orange-100">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Prime Minister's Internship Scheme
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                Get automated eligibility screening and personalized internship recommendations for the PM Internship Scheme. 
                Designed especially for youth from rural, tribal, and underserved communities.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <div className="flex items-center gap-2 text-accent-green">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Age 21-24 Years</span>
                </div>
                <div className="flex items-center gap-2 text-accent-green">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Income &lt; Rs 8 Lakhs</span>
                </div>
                <div className="flex items-center gap-2 text-accent-green">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Indian Citizen</span>
                </div>
              </div>
            </div>
          </div>

          {/* Language Selection */}
          <Card className="max-w-2xl mx-auto mb-12 shadow-xl border-orange-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center justify-center gap-2">
                <Globe className="w-6 h-6 text-secondary-blue" />
                Choose Your Language / भाषा चुनें
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedLanguage === lang.code
                        ? 'border-primary-orange bg-orange-50 text-primary-orange'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                    }`}
                  >
                    <div className="font-bold text-lg">{lang.native}</div>
                    <div className="text-sm text-gray-500">{lang.name}</div>
                  </button>
                ))}
              </div>
              
              <div className="text-center">
                <Link to={createPageUrl("Profile")}>
                  <Button size="lg" className="bg-primary-orange hover:bg-orange-600 text-white px-8 py-4 text-lg">
                    Get Started / शुरू करें
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Platform Features / प्लेटफॉर्म विशेषताएं
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Designed for accessibility, inclusivity, and ease of use
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow border-orange-100">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-orange to-orange-600 rounded-2xl flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-lg font-medium text-primary-orange mb-3">
                  {feature.titleHindi}
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Internship Benefits / इंटर्नशिप के फायदे
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center p-8 hover:shadow-xl transition-all border-orange-100 hover:border-orange-300">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-secondary-blue to-blue-600 rounded-2xl flex items-center justify-center">
                    <benefit.icon className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-lg font-medium text-secondary-blue mb-4">
                  {benefit.titleHindi}
                </p>
                <div className="text-3xl font-bold text-primary-orange mb-4">
                  {benefit.value}
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary-orange to-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Career Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            अपनी करियर यात्रा शुरू करने के लिए तैयार हैं?
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Profile")}>
              <Button size="lg" variant="secondary" className="bg-white text-primary-orange hover:bg-gray-50 px-8 py-4 text-lg font-semibold">
                Check Eligibility / पात्रता जांचें
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl("Dashboard")}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold">
                View Dashboard / डैशबोर्ड देखें
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}