'use client';

import React, { useEffect, useState } from 'react';
import { useAccount } from '@/providers/AccountProvider';
import { getPositionsByOrg } from '@/utils/organizationFunctions';
import { DocumentData, Timestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Users, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Standardized styles for better maintainability
const overviewStyles = {
  // Layout
  container: "flex flex-col gap-8",
  headerWrapper: "flex flex-col md:flex-row gap-6 justify-between",
  gridContainer: "grid grid-cols-1 md:grid-cols-2 gap-6",
  
  // Cards
  card: "default-card",
  cardHeader: "flex items-center justify-between mb-4",
  cardTitle: "default-label font-semibold flex items-center gap-2",
  cardIcon: "text-primary-500",
  viewAllLink: "text-sm text-primary-500 hover:underline",
  
  // Items
  itemsList: "space-y-3",
  itemCard: "p-3 rounded-lg border border-gray-100 hover:border-primary-200 transition-all",
  itemHeader: "flex justify-between items-center",
  itemTitle: "font-medium text-gray-800",
  itemDate: "text-xs text-gray-500",
  itemMeta: "flex items-center mt-1 gap-3",
  
  // Loading state
  loadingContainer: "animate-pulse space-y-3",
  loadingItem: "h-12 bg-gray-100 rounded-lg",
  
  // Empty state
  emptyState: "text-gray-500 p-3",
  
  // Tips section
  tipsContainer: "bg-primary-50/50 rounded-lg p-6 border border-primary-100",
  tipsList: "space-y-2",
  tipItem: "flex items-start gap-2",
  tipText: "text-gray-700",
  
  // Badges
  activeBadge: "text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800",
  hiddenBadge: "text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800",
  applicantsBadge: "text-xs text-gray-500 flex items-center gap-1"
};

// Status badge styles
const statusBadges = {
  approved: "px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium flex items-center gap-1",
  rejected: "px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium flex items-center gap-1",
  pending: "px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium flex items-center gap-1"
};

// Optimized animation variants for performance
const animationConfig = {
  container: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05, // Reduced stagger time
        when: "beforeChildren", 
        delayChildren: 0.1 
      }
    }
  },
  item: {
    hidden: { y: 10, opacity: 0 }, // Reduced distance for smoother animation
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.2 } // Faster animation for better performance
    }
  }
};

const DashboardOverview = () => {
  const { account } = useAccount();
  const [recentPositions, setRecentPositions] = useState<DocumentData[]>([]);
  const [recentApplications, setRecentApplications] = useState<{positionTitle: string; applicantName: string; timestamp: Timestamp; status: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  // Check for device performance to conditionally disable animations
  useEffect(() => {
    // Disable animations on low-end devices
    const checkDevicePerformance = () => {
      // Check if the device has limited memory
      if (typeof navigator !== 'undefined') {
        // @ts-ignore - deviceMemory is not in the standard TS types
        const lowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
        
        // Check if this might be a low-end device based on user agent
        const userAgent = navigator.userAgent;
        const possiblyLowEndDevice = /Android 4/.test(userAgent) || 
                                    /iPhone OS [789]_/.test(userAgent);
        
        if (lowMemory || possiblyLowEndDevice) {
          setShouldAnimate(false);
        }
      }
    };
    
    checkDevicePerformance();
  }, []);

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return '';
    return format(timestamp.toDate(), 'MMM d, yyyy');
  };

  useEffect(() => {
    if (!account?.uid) return;

    const unsubscribe = getPositionsByOrg(account.uid, (positions: DocumentData[]) => {
      // Get recent positions (last 5 created)
      const sortedPositions = [...positions].sort((a, b) => {
        return b.createdAt?.toMillis() - a.createdAt?.toMillis();
      }).slice(0, 5);
      
      setRecentPositions(sortedPositions);
      
      // Get recent applications across all positions
      const applications: any[] = [];
      
      positions.forEach(position => {
        const positionTitle = position.positionTitle || position.title || 'Unnamed Position';
        
        if (position.applications) {
          Object.entries(position.applications).forEach(([_, app]: [string, any]) => {
            applications.push({
              positionTitle,
              applicantName: app.name || 'Applicant',
              timestamp: app.timestamp,
              status: app.status
            });
          });
        }
      });
      
      // Sort applications by timestamp and get the 5 most recent
      const sortedApplications = applications.sort((a, b) => {
        return b.timestamp?.toMillis() - a.timestamp?.toMillis();
      }).slice(0, 5);
      
      setRecentApplications(sortedApplications);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [account?.uid]);

  // Helper function to get status badge style
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved':
        return (
          <span className={statusBadges.approved}>
            <CheckCircle size={12} />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className={statusBadges.rejected}>
            <AlertCircle size={12} />
            Rejected
          </span>
        );
      default:
        return (
          <span className={statusBadges.pending}>
            <Clock size={12} />
            Pending
          </span>
        );
    }
  };

  const MotionWrapper = ({ children, variants }: { children: React.ReactNode, variants: any }) => {
    // Only apply animations when shouldAnimate is true
    if (shouldAnimate) {
      return <motion.div variants={variants}>{children}</motion.div>;
    }
    return <div>{children}</div>;
  };

  return (
    <motion.div
      variants={animationConfig.container}
      initial={shouldAnimate ? "hidden" : false}
      animate={shouldAnimate ? "visible" : false}
      className={overviewStyles.container}
    >
      {/* Welcome and quick actions */}
      <MotionWrapper variants={animationConfig.item}>
        <div className={overviewStyles.headerWrapper}>
          <div>
            <h2 className="default-subheading mb-2">Dashboard Overview</h2>
            <p className="default-text text-gray-600">
              Manage your volunteer positions and track applications
            </p>
          </div>

          <div className="flex gap-3">
            <Link 
              href="/organization-dashboard/create-position"
              className="default-button flex items-center gap-2"
            >
              <Users size={18} />
              Create Position
            </Link>
          </div>
        </div>
      </MotionWrapper>

      {/* Recent positions and applications */}
      <div className={overviewStyles.gridContainer}>
        {/* Recent positions */}
        <MotionWrapper variants={animationConfig.item}>
          <div className={overviewStyles.card}>
            <div className={overviewStyles.cardHeader}>
              <h3 className={overviewStyles.cardTitle}>
                <Calendar size={18} className={overviewStyles.cardIcon} />
                Recent Positions
              </h3>
              <Link href="?page=manage-positions" className={overviewStyles.viewAllLink}>
                View All
              </Link>
            </div>
            
            {loading ? (
              <div className={overviewStyles.loadingContainer}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={overviewStyles.loadingItem}></div>
                ))}
              </div>
            ) : (
              <div className={overviewStyles.itemsList}>
                {recentPositions.length > 0 ? (
                  recentPositions.map((position, index) => (
                    <div 
                      key={position.id || position.pid}
                      className={overviewStyles.itemCard}
                    >
                      <div className={overviewStyles.itemHeader}>
                        <h4 className={overviewStyles.itemTitle}>{position.positionTitle || position.title}</h4>
                        <span className={overviewStyles.itemDate}>{formatDate(position.createdAt)}</span>
                      </div>
                      <div className={overviewStyles.itemMeta}>
                        <span className={(position.visibility || position.visible) 
                          ? overviewStyles.activeBadge 
                          : overviewStyles.hiddenBadge}>
                          {(position.visibility || position.visible) ? 'Active' : 'Hidden'}
                        </span>
                        <span className={overviewStyles.applicantsBadge}>
                          <Users size={12} />
                          {position.applications ? Object.keys(position.applications).length : 0} applicants
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={overviewStyles.emptyState}>No positions created yet.</p>
                )}
              </div>
            )}
          </div>
        </MotionWrapper>

        {/* Recent applications */}
        <MotionWrapper variants={animationConfig.item}>
          <div className={overviewStyles.card}>
            <div className={overviewStyles.cardHeader}>
              <h3 className={overviewStyles.cardTitle}>
                <Users size={18} className={overviewStyles.cardIcon} />
                Recent Applications
              </h3>
              <Link href="?page=positions" className={overviewStyles.viewAllLink}>
                Review All
              </Link>
            </div>
            
            {loading ? (
              <div className={overviewStyles.loadingContainer}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={overviewStyles.loadingItem}></div>
                ))}
              </div>
            ) : (
              <div className={overviewStyles.itemsList}>
                {recentApplications.length > 0 ? (
                  recentApplications.map((app, index) => (
                    <div 
                      key={index}
                      className={overviewStyles.itemCard}
                    >
                      <div className={overviewStyles.itemHeader}>
                        <div className="flex flex-col">
                          <h4 className={overviewStyles.itemTitle}>{app.applicantName}</h4>
                          <span className={overviewStyles.itemDate}>Applied to: {app.positionTitle}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          {getStatusBadge(app.status)}
                          <span className={`${overviewStyles.itemDate} mt-1`}>{formatDate(app.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={overviewStyles.emptyState}>No applications received yet.</p>
                )}
              </div>
            )}
          </div>
        </MotionWrapper>
      </div>

      {/* Quick tips section */}
      <MotionWrapper variants={animationConfig.item}>
        <div className={overviewStyles.tipsContainer}>
          <h3 className="default-label font-semibold mb-3">Tips for Success</h3>
          <ul className={overviewStyles.tipsList}>
            <li className={overviewStyles.tipItem}>
              <CheckCircle className={`${overviewStyles.cardIcon} mt-1`} size={16} />
              <span className={overviewStyles.tipText}>Create detailed position descriptions to attract qualified volunteers</span>
            </li>
            <li className={overviewStyles.tipItem}>
              <CheckCircle className={`${overviewStyles.cardIcon} mt-1`} size={16} />
              <span className={overviewStyles.tipText}>Respond to applications within 48 hours for better engagement</span>
            </li>
            <li className={overviewStyles.tipItem}>
              <CheckCircle className={`${overviewStyles.cardIcon} mt-1`} size={16} />
              <span className={overviewStyles.tipText}>Update your organization profile regularly to showcase your mission</span>
            </li>
          </ul>
        </div>
      </MotionWrapper>
    </motion.div>
  );
};

export default DashboardOverview; 