/**
 * Profile.js - User profile and eligibility form page
 * Main form collection page for AAROHAN platform
 */
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User as UserIcon, ArrowLeft } from "lucide-react";
import EligibilityForm from "../components/forms/EligibilityForm";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      // User might not be logged in, redirect to login
      await User.loginWithRedirect(window.location.href);
    }
    setIsLoading(false);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Update user profile with form data
      await User.updateMyUserData(formData);
      
      // Navigate to results page
      navigate(createPageUrl("Results"));
    } catch (error) {
      setError("Failed to save profile. Please try again.");
      console.error("Profile save error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="p-8">
          <div className="flex items-center gap-3 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary-orange" />
            <p className="text-lg">Loading your profile...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl("Landing"))}
            className="mb-4 hover:bg-orange-50 hover:border-primary-orange"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur border-orange-200">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-orange to-orange-600 rounded-2xl flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl text-gray-900 dark:text-white">
                Profile Setup
              </CardTitle>
              <p className="text-lg text-secondary-blue font-medium">
                प्रोफ़ाइल सेटअप
              </p>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Please fill out your details to check eligibility for the PM Internship Scheme. 
                All information will be kept secure and used only for eligibility assessment.
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        {isSubmitting ? (
          <Card className="p-8 text-center border-orange-200">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary-orange" />
              <h3 className="text-xl font-semibold">Processing Your Application</h3>
              <p className="text-gray-600 max-w-md">
                We're analyzing your eligibility for the PM Internship Scheme. This may take a few moments...
              </p>
            </div>
          </Card>
        ) : (
          <EligibilityForm
            onSubmit={handleFormSubmit}
            initialData={user}
          />
        )}

        {/* Help Section */}
        <Card className="mt-8 bg-blue-50/80 dark:bg-gray-800/80 border-secondary-blue">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-3 text-secondary-blue">
              Need Help? / सहायता चाहिए?
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div>
                <p className="font-medium mb-2">✓ Voice Support Available</p>
                <p>Click the microphone icon on any input field to use voice input</p>
              </div>
              <div>
                <p className="font-medium mb-2">✓ Multilingual Interface</p>
                <p>Switch languages using the language selector in the sidebar</p>
              </div>
              <div>
                <p className="font-medium mb-2">✓ Secure & Private</p>
                <p>Your data is encrypted and used only for eligibility assessment</p>
              </div>
              <div>
                <p className="font-medium mb-2">✓ Mobile Optimized</p>
                <p>Form works seamlessly on all devices and connection speeds</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}