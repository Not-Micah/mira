"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardNavBar from "@/components/dashboard/DashboardNavBar";
import ManagePositions from "./components/ManagePositions";
import PositionListing from "@/components/dashboard/position-listing/PositionListing";
import AccountSettings from "./components/AccountSettings";
import { motion } from "framer-motion";
import { useAccount } from "@/providers/AccountProvider";
import { BarChart2, ClipboardList, Users, Settings, HelpCircle } from "lucide-react";

// Dashboard overview components
import DashboardOverview from "./components/DashboardOverview";
import DashboardMetrics from "./components/DashboardMetrics";
import WorkflowHelpModal from "./components/WorkflowHelpModal";

// Performance optimization: Only animate key elements, not entire sections
const animationConfig = {
  // Reduced staggering for better performance
  containerVariants: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15, // Increased from 0.1 to reduce frequency of animations
        duration: 0.3 
      }
    }
  },
  // Simplified item animation
  itemVariants: {
    hidden: { y: 15, opacity: 0 }, // Reduced distance from 20 to 15
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4 } // Slightly faster
    }
  }
};

const OrganizationDashboard = () => {
  const searchParams = useSearchParams();
  const { account } = useAccount();
  const currentPage = searchParams.get("page") || "overview";
  const [orgName, setOrgName] = useState("Organization");
  const [showHelpModal, setShowHelpModal] = useState(false);
  // Performance optimization: Detect low-end devices to disable animations
  const [shouldAnimate, setShouldAnimate] = useState(true);

  // Check device performance and disable animations on low-end devices
  useEffect(() => {
    // Simple performance check - if device has low memory or slow CPU
    // We could implement more sophisticated checks in a production app
    const checkPerformance = () => {
      if (
        // Check if device has navigator.deviceMemory (Chrome only)
        //@ts-ignore
        (navigator.deviceMemory && navigator.deviceMemory < 4) || 
        // Or if it's a mobile device
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      ) {
        setShouldAnimate(false);
      }
    };
    
    checkPerformance();
  }, []);

  // Check if it's the user's first time visiting
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem("org_dashboard_guide_seen");
    if (!hasSeenGuide) {
      // Wait a bit before showing the guide
      const timer = setTimeout(() => {
        setShowHelpModal(true);
        localStorage.setItem("org_dashboard_guide_seen", "true");
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (account?.organization?.name) {
      setOrgName(account.organization.name);
    }
  }, [account]);

  const renderContent = () => {
    switch (currentPage) {
      case "overview":
        return <DashboardOverview />;
      case "manage-positions":
        return <ManagePositions />;
      case "positions":
        return <PositionListing allowApply={false} />;
      case "account-settings":
        return <AccountSettings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-white to-primary-50/30"
      initial={shouldAnimate ? "hidden" : false}
      animate={shouldAnimate ? "visible" : false}
      variants={shouldAnimate ? animationConfig.containerVariants : undefined}
    >
      {/* Help modal */}
      {showHelpModal && (
        <WorkflowHelpModal onClose={() => setShowHelpModal(false)} />
      )}
      
      {/* Welcome header */}
      <div className="bg-gradient-to-r from-primary-400 to-primary-600 text-white py-8 px-standard">
        <div className="default-container flex justify-between items-center">
          <div>
            <h1 className="default-heading mb-2">Welcome back, {orgName}</h1>
            <p className="default-text opacity-90">Manage your volunteer positions and track applications</p>
          </div>
          
          <button 
            onClick={() => setShowHelpModal(true)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Show help"
            title="Dashboard Guide"
          >
            <HelpCircle size={24} className="text-white" />
          </button>
        </div>
      </div>

      <div className="default-container w-full my-6">
        {/* Dashboard metrics overview - Only animate this key component */}
        <motion.div 
          variants={shouldAnimate ? animationConfig.itemVariants : undefined}
          initial={shouldAnimate ? "hidden" : false}
          animate={shouldAnimate ? "visible" : false}
        >
          <DashboardMetrics />
        </motion.div>
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation */}
          <div className="lg:col-span-1">
            <DashboardNavBar items={[
              { 
                label: "Dashboard Overview", 
                link: "overview", 
                icon: BarChart2,
                description: "Key metrics and summary"
              },
              { 
                label: "Manage Positions", 
                link: "manage-positions", 
                icon: ClipboardList,
                description: "Create and edit positions"
              }, 
              { 
                label: "View Listings", 
                link: "positions", 
                icon: Users,
                description: "Review applications"
              },
              { 
                label: "Account Settings", 
                link: "account-settings", 
                icon: Settings,
                description: "Configure your organization"
              }
            ]} />
          </div>

          {/* Main content area */}
          <motion.div 
            className="lg:col-span-3 bg-white rounded-xl border border-primary-100 shadow-sm p-6"
            variants={shouldAnimate ? animationConfig.itemVariants : undefined}
            initial={shouldAnimate ? "hidden" : false}
            animate={shouldAnimate ? "visible" : false}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrganizationDashboard;