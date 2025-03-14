'use client';

import React, { useEffect, useState } from 'react';
import { DocumentData, Timestamp } from 'firebase/firestore';
import Link from 'next/link';
import { toTitleCase } from '@/utils/misc';
import { Users, ExternalLink, Calendar, MapPin, Clock, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

// Standardized styles for better maintainability
const previewStyles = {
  // Layout
  container: "sticky top-6 bg-white rounded-lg border border-gray-100 overflow-hidden",
  emptyContainer: "sticky top-6 p-8 bg-white rounded-lg border border-gray-100 text-center default-text text-gray-500",
  section: "p-6 border-b border-gray-100",
  
  // Typography
  title: "default-subheading mb-2",
  orgLink: "default-text text-gray-500 hover:text-primary-600 transition-colors flex items-center gap-1",
  
  // Tags and badges
  tagContainer: "flex flex-wrap gap-3",
  primaryTag: "px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium flex items-center gap-1.5",
  secondaryTag: "px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium flex items-center gap-1.5",
  
  // Headings
  sectionHeading: "font-semibold text-gray-900 mb-2",
  
  // Content
  description: "text-gray-700 whitespace-pre-line",
  
  // Action section
  actionSection: "p-6 flex flex-col gap-3",
  actionButton: "default-button w-full flex justify-center items-center",
  actionButtonDisabled: "opacity-50 cursor-not-allowed",
  secondaryButton: "px-4 py-2 rounded-lg text-center text-primary-600 border border-primary-200 hover:bg-primary-50 transition-colors font-medium",
  noApplicantsState: "flex items-center justify-center text-gray-500 border border-gray-200 rounded-lg py-3"
};

// Optimized animation variants
const animationConfig = {
  container: {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  }
};

interface PositionPreviewProps {
  position: DocumentData | null;
  allowApply: boolean;
  hasApplied: boolean;
}

const OrganizationLink: React.FC<{ oid: string; name: string }> = ({ oid, name }) => (
  <Link 
    href={`/organization?id=${oid}`}
    className={previewStyles.orgLink}
  >
    <span>{name}</span>
    <ExternalLink size={14} />
  </Link>
);

const PositionPreview: React.FC<PositionPreviewProps> = ({ position, allowApply, hasApplied }) => {
  const [applicantCount, setApplicantCount] = useState(0);
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
    if (position) {
      setApplicantCount(getApplicantCount(position));
    }
  }, [position]);
  
  if (!position) {
    return (
      <div className={previewStyles.emptyContainer}>
        Select a position to view details
      </div>
    );
  }

  // Enhanced function to calculate applicant count from different data structures
  const getApplicantCount = (position: DocumentData) => {
    // If there's a totalApplicants field, use it (legacy data structure)
    if (typeof position.totalApplicants === 'number') {
      return position.totalApplicants;
    }
    
    // If applications is an object, count its keys
    if (position.applications && typeof position.applications === 'object') {
      return Object.keys(position.applications).length;
    }
    
    // Alternative field names that might store applications
    if (position.applicants && typeof position.applicants === 'object') {
      return Object.keys(position.applicants).length;
    }
    
    // If there's a direct count field
    if (typeof position.applicantCount === 'number') {
      return position.applicantCount;
    }
    
    // Default to 0 if no application data found
    return 0;
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return '';
    try {
      return format(timestamp.toDate(), 'MMM d, yyyy');
    } catch (error) {
      return '';
    }
  };

  return (
    <motion.div 
      className={previewStyles.container}
      initial={shouldAnimate ? "hidden" : false}
      animate={shouldAnimate ? "visible" : false}
      variants={shouldAnimate ? animationConfig.container : undefined}
    >
      {/* Header Section */}
      <div className={previewStyles.section}>
        <h2 className={previewStyles.title}>
          {position.positionTitle}
        </h2>
        <div className="mb-4">
          <OrganizationLink oid={position.oid} name={`@${position.organizationName}`} />
        </div>
        <div className={previewStyles.tagContainer}>
          <span className={previewStyles.primaryTag}>
            <Calendar size={14} />
            {toTitleCase(position.positionType)}
          </span>
          <span className={previewStyles.secondaryTag}>
            <MapPin size={14} />
            {position.positionLocation || "Remote"}
          </span>
          {position.requireResume && (
            <span className={previewStyles.secondaryTag}>
              <FileText size={14} />
              Resume Required
            </span>
          )}
        </div>
      </div>

      {/* Description Section */}
      <div className={previewStyles.section}>
        <h3 className={previewStyles.sectionHeading}>Description</h3>
        <p className={previewStyles.description}>
          {position.positionDescription}
        </p>
      </div>

      {/* Requirements Section (if available) */}
      {position.positionRequirements && (
        <div className={previewStyles.section}>
          <h3 className={previewStyles.sectionHeading}>Requirements</h3>
          <p className={previewStyles.description}>
            {position.positionRequirements}
          </p>
        </div>
      )}

      {/* Action Button Section */}
      <div className={previewStyles.actionSection}>
        {allowApply ? (
          <Link 
            href={hasApplied ? '#' : `/applicant-dashboard/apply?pid=${position.pid}`}
            className={`${previewStyles.actionButton} ${
              hasApplied ? previewStyles.actionButtonDisabled : ''
            }`}
            onClick={(e) => hasApplied && e.preventDefault()}
          >
            {hasApplied ? 'Already Applied' : 'Apply Now'}
          </Link>
        ) : (
          <>
            {applicantCount > 0 ? (
              <Link 
                href={`/organization-dashboard/review?pid=${position.pid}`}
                className={`${previewStyles.actionButton} gap-2`}
              >
                <Users size={18} />
                Review {applicantCount} Applicant{applicantCount !== 1 ? 's' : ''}
              </Link>
            ) : (
              <div className={previewStyles.noApplicantsState}>
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  <span>No Applicants Yet</span>
                </div>
              </div>
            )}
            
            <Link
              href={`/organization-dashboard/create-position?pid=${position.pid}`}
              className={previewStyles.secondaryButton}
            >
              Edit Position
            </Link>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default PositionPreview;