/**
 * Layout.js - Main layout wrapper for AAROHAN Career Guidance Platform
 * Provides consistent navigation, theme management, and language selection
 */
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Home, 
  User, 
  BarChart3, 
  Briefcase, 
  Settings, 
  Moon, 
  Sun, 
  Globe,
  Menu,
  X
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navigationItems = [
  {
    title: "होम / Home",
    url: createPageUrl("Landing"),
    icon: Home,
  },
  {
    title: "प्रोफाइल / Profile",
    url: createPageUrl("Profile"),
    icon: User,
  },
  {
    title: "परिणाम / Results",
    url: createPageUrl("Results"),
    icon: BarChart3,
  },
  {
    title: "डैशबोर्ड / Dashboard",
    url: createPageUrl("Dashboard"),
    icon: Briefcase,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <style>{`
        :root {
          --primary-orange: #FF6B35;
          --secondary-blue: #4A90E2;
          --accent-green: #2ECC71;
          --warm-gray: #F7F5F3;
          --deep-gray: #2C3E50;
        }
        
        .theme-orange { background: linear-gradient(135deg, var(--primary-orange), #FF8C00); }
        .theme-blue { background: linear-gradient(135deg, var(--secondary-blue), #1E88E5); }
        .theme-green { background: linear-gradient(135deg, var(--accent-green), #27AE60); }
        
        .text-primary-orange { color: var(--primary-orange); }
        .text-secondary-blue { color: var(--secondary-blue); }
        .text-accent-green { color: var(--accent-green); }
        
        .bg-primary-orange { background-color: var(--primary-orange); }
        .bg-secondary-blue { background-color: var(--secondary-blue); }
        .bg-accent-green { background-color: var(--accent-green); }
        
        .border-primary-orange { border-color: var(--primary-orange); }
        
        .glass { backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.9); }
        .dark .glass { background: rgba(0, 0, 0, 0.7); }
        
        body { transition: all 0.3s ease; }
      `}</style>
      
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-warm-gray to-white dark:from-gray-900 dark:to-gray-800">
          <Sidebar className="border-r border-orange-200 dark:border-gray-700 hidden lg:flex">
            <SidebarHeader className="border-b border-orange-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 theme-orange rounded-xl flex items-center justify-center shadow-lg">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-gray-900 dark:text-white">AAROHAN</h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Career Guidance Platform</p>
                </div>
              </div>
            </SidebarHeader>
            
            <SidebarContent className="p-4">
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                  नेवीगेशन / Navigation
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`hover:bg-orange-50 hover:text-primary-orange transition-colors duration-200 rounded-xl mb-2 ${
                            location.pathname === item.url ? 'bg-orange-50 text-primary-orange border-l-4 border-primary-orange' : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium text-sm">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                  सुविधाएं / Features
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-3 py-2 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-secondary-blue" />
                      <span className="text-gray-600 dark:text-gray-400">Multilingual</span>
                      <Badge variant="secondary" className="ml-auto bg-secondary-blue/10 text-secondary-blue">Active</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BarChart3 className="w-4 h-4 text-accent-green" />
                      <span className="text-gray-600 dark:text-gray-400">AI Powered</span>
                      <Badge variant="secondary" className="ml-auto bg-accent-green/10 text-accent-green">Beta</Badge>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-orange-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDark(!isDark)}
                  className="hover:bg-orange-50 hover:text-primary-orange"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Made in India 🇮🇳
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 flex flex-col">
            {/* Mobile Header */}
            <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-orange-200 dark:border-gray-700 px-4 py-3 lg:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="hover:bg-orange-50"
                  >
                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </Button>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 theme-orange rounded-lg flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg">AAROHAN</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDark(!isDark)}
                  className="hover:bg-orange-50"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              </div>
            </header>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-orange-200 dark:border-gray-700">
                <div className="p-4 space-y-2">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.url}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        location.pathname === item.url 
                          ? 'bg-orange-50 text-primary-orange' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Main content area */}
            <div className="flex-1 overflow-auto bg-gradient-to-br from-orange-50/30 to-blue-50/30 dark:from-gray-800 dark:to-gray-900">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}