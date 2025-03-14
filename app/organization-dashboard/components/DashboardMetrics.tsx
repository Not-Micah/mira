'use client';

import React, { useEffect, useState } from 'react';
import { Users, Briefcase, Clock, Zap, BarChart2 } from 'lucide-react';
import { useAccount } from '@/providers/AccountProvider';
import { getPositionsByOrg } from '@/utils/organizationFunctions';
import { DocumentData } from 'firebase/firestore';
import { motion } from 'framer-motion';

// Standardized styles for better maintainability
const metricStyles = {
  // Layout
  container: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
  card: "default-card p-6 flex flex-col",
  
  // Card elements
  header: "flex items-center mb-3",
  iconWrapper: "p-2 rounded-lg",
  title: "default-label font-semibold ml-3",
  valueWrapper: "flex items-end mt-2",
  value: "default-subheading font-bold text-gray-800",
  
  // Loading state
  loadingValue: "h-8 w-16 bg-gray-200 animate-pulse rounded"
};

// Optimized animation variants
const animationConfig = {
  card: {
    hidden: { opacity: 0, y: 10 }, // Reduced distance for smoother animation
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 } // Faster animation
    }
  }
};

const DashboardMetrics = () => {
  const { account } = useAccount();
  const [metrics, setMetrics] = useState({
    activePositions: 0,
    totalApplications: 0,
    pendingReviews: 0, 
    completedPositions: 0
  });
  const [loading, setLoading] = useState(true);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  // Check for device performance to conditionally disable animations
  useEffect(() => {
    const checkDevicePerformance = () => {
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

  useEffect(() => {
    if (!account?.uid) return;

    const unsubscribe = getPositionsByOrg(account.uid, (positions: DocumentData[]) => {
      const activePositions = positions.filter(pos => pos.visibility && !pos.locked).length;
      const completedPositions = positions.filter(pos => pos.locked).length;
      
      // Calculate total applications and pending reviews
      let totalApplications = 0;
      let pendingReviews = 0;
      
      positions.forEach(position => {
        if (position.applications) {
          totalApplications += Object.keys(position.applications).length;
          
          // Count pending reviews
          Object.values(position.applications).forEach((app: any) => {
            if (app.status === 'pending') {
              pendingReviews += 1;
            }
          });
        }
      });

      setMetrics({
        activePositions,
        totalApplications,
        pendingReviews,
        completedPositions
      });
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [account?.uid]);

  const metricCards = [
    {
      title: 'Active Positions',
      value: metrics.activePositions,
      icon: Briefcase,
      color: 'bg-primary-500',
      iconBg: 'bg-primary-100',
      textColor: 'text-primary-500'
    },
    {
      title: 'Total Applications',
      value: metrics.totalApplications,
      icon: Users,
      color: 'bg-secondary-500',
      iconBg: 'bg-secondary-100',
      textColor: 'text-secondary-500'
    },
    {
      title: 'Pending Reviews',
      value: metrics.pendingReviews,
      icon: Clock,
      color: 'bg-accent-500',
      iconBg: 'bg-accent-100',
      textColor: 'text-accent-500'
    },
    {
      title: 'Completed Positions',
      value: metrics.completedPositions,
      icon: Zap,
      color: 'bg-primary-600',
      iconBg: 'bg-primary-100',
      textColor: 'text-primary-500'
    }
  ];

  return (
    <div className={metricStyles.container}>
      {metricCards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <motion.div
            key={card.title}
            variants={animationConfig.card}
            className={metricStyles.card}
            initial={shouldAnimate ? "hidden" : false}
            animate={shouldAnimate ? "visible" : false}
            transition={{ delay: shouldAnimate ? index * 0.05 : 0 }} // Reduced delay for smoother animation
          >
            <div className={metricStyles.header}>
              <div className={`${card.iconBg} ${metricStyles.iconWrapper}`}>
                <Icon className={card.textColor} size={24} />
              </div>
              <h3 className={metricStyles.title}>{card.title}</h3>
            </div>
            
            {loading ? (
              <div className={metricStyles.loadingValue}></div>
            ) : (
              <div className={metricStyles.valueWrapper}>
                <span className={metricStyles.value}>
                  {card.value}
                </span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default DashboardMetrics; 