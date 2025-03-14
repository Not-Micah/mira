'use client';

import React, { useEffect, useState } from 'react';
import { DocumentData } from 'firebase/firestore';
import { getAllPositions } from '@/utils/globalFunctions';
import { motion } from 'framer-motion';
import { Search, Filter, Users, Calendar, ClipboardList } from 'lucide-react';
import Link from 'next/link';

import PositionFilters from './PositionFilters';
import PositionCard from './PositionCard';
import PositionPreview from './PositionPreview';

// Common classes for consistent styling
const listingStyles = {
  container: "flex flex-col gap-6",
  headerWrapper: "flex flex-col md:flex-row items-start md:items-center justify-between gap-4",
  heading: "default-subheading",
  subtext: "default-text text-gray-600 mt-1",
  linkButton: "px-5 py-2.5 rounded-lg default-label font-medium transition-colors duration-200 text-primary-700 hover:bg-primary-50/60 hover:text-primary-800 border border-primary-100 flex items-center gap-2",
  mainGrid: "grid grid-cols-1 lg:grid-cols-2 gap-6",
  applicantBadge: "absolute top-4 right-4 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors flex items-center gap-1.5 shadow-sm",
  emptyState: "text-center py-12 bg-white rounded-xl border border-gray-100",
};

// Animation config - optimized for performance
const animationConfig = {
  // Using slower staggering to reduce animation overhead
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  },
  fadeInUp: {
    hidden: { y: 10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.4 }
    }
  }
};

// Add this helper function outside the component
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

interface FilterParams {
  search: string;
  locationType: string;
  positionType: string;
}

interface PositionListingProps {
  allowApply?: boolean;
  activeApplications?: string[];
}

export default function PositionListing({ 
  allowApply = false, 
  activeApplications = [] 
}: PositionListingProps) {
  const [positions, setPositions] = useState<DocumentData[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<DocumentData[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  // Disable animations on low-end devices
  useEffect(() => {
    if (
      // Check if device has navigator.deviceMemory (Chrome only)
      //@ts-ignore
      (navigator.deviceMemory && navigator.deviceMemory < 4) || 
      // Or if it's likely a mobile device
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    ) {
      setShouldAnimate(false);
    }
  }, []);

  const handleFiltersChange = (filters: FilterParams) => {
    let filtered = [...positions];

    // Apply search filters...
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(position => 
        position.positionTitle?.toLowerCase().includes(searchLower) ||
        position.positionDescription?.toLowerCase().includes(searchLower) ||
        position.organizationName?.toLowerCase().includes(searchLower) ||
        position.positionRequirements?.toLowerCase().includes(searchLower) ||
        position.positionType?.toLowerCase().includes(searchLower)
      );
    }

    // Apply location type filter...
    if (filters.locationType) {
      filtered = filtered.filter(position => 
        position.locationType?.toLowerCase() === filters.locationType.toLowerCase()
      );
    }

    // Apply position type filter...
    if (filters.positionType) {
      filtered = filtered.filter(position => 
        position.positionType?.toLowerCase() === filters.positionType.toLowerCase()
      );
    }

    setFilteredPositions(filtered);
    
    // Update selected position if it's no longer in filtered results
    if (selectedPosition && !filtered.find(p => p.pid === selectedPosition.pid)) {
      setSelectedPosition(filtered[0] || null);
    }
  };

  // Fetch positions (on component mount)
  useEffect(() => {
    setLoading(true);
    const unsubscribe = getAllPositions((fetchedPositions) => {
      const visiblePositions = fetchedPositions.filter(pos => pos.visible === true);
      setPositions(visiblePositions);
      setFilteredPositions(visiblePositions);
      
      if (visiblePositions.length > 0 && !selectedPosition) {
        setSelectedPosition(visiblePositions[0]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <motion.div 
      className={listingStyles.container}
      initial={shouldAnimate ? "hidden" : false}
      animate={shouldAnimate ? "visible" : false}
      variants={shouldAnimate ? animationConfig.staggerContainer : undefined}
    >
      <motion.div 
        className={listingStyles.headerWrapper}
        variants={shouldAnimate ? animationConfig.fadeInUp : undefined}
      >
        <div>
          <h1 className={listingStyles.heading}>Browse Active Listings</h1>
          <p className={listingStyles.subtext}>
            View and manage applications for your positions
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href="/organization-dashboard?page=manage-positions"
            className={listingStyles.linkButton}
          >
            <ClipboardList size={18} />
            <span>Manage Positions</span>
          </Link>
        </div>
      </motion.div>
      
      <motion.div 
        variants={shouldAnimate ? animationConfig.fadeInUp : undefined}
      >
        <PositionFilters onFiltersChange={handleFiltersChange} />
      </motion.div>
      
      <div className={listingStyles.mainGrid}>
        {/* Position List */}
        <motion.div 
          className="space-y-4"
          variants={shouldAnimate ? animationConfig.fadeInUp : undefined}
        >
          {loading ? (
            // Loading skeleton for position cards
            [...Array(3)].map((_, index) => (
              <div key={index} className="default-card animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-8 bg-gray-100 rounded w-24"></div>
                  <div className="h-8 bg-gray-100 rounded w-24"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))
          ) : filteredPositions.length > 0 ? (
            filteredPositions.map((position) => (
              <div key={position.pid} className="relative">
                <PositionCard
                  position={position}
                  onClick={() => setSelectedPosition(position)}
                  isSelected={selectedPosition?.pid === position.pid}
                  allowApply={allowApply}
                  hasApplied={activeApplications.includes(position.pid)}
                />
                {getApplicantCount(position) > 0 && (
                  <Link 
                    href={`/organization-dashboard/review?pid=${position.pid}`}
                    className={listingStyles.applicantBadge}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Users size={14} />
                    <span>
                      {getApplicantCount(position)} Applicant{getApplicantCount(position) !== 1 ? 's' : ''}
                    </span>
                  </Link>
                )}
              </div>
            ))
          ) : (
            <motion.div 
              className={listingStyles.emptyState}
              variants={shouldAnimate ? animationConfig.fadeInUp : undefined}
            >
              <Search size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="default-text text-gray-500">No positions match your filters</p>
              <p className="default-label text-gray-400 mt-1">Try adjusting your search criteria</p>
            </motion.div>
          )}
        </motion.div>

        {/* Position Preview */}
        <motion.div 
          className="hidden lg:block"
          variants={shouldAnimate ? animationConfig.fadeInUp : undefined}
        >
          {loading ? (
            // Loading skeleton for position preview
            <div className="sticky top-6 default-card animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-4"></div>
              <div className="flex gap-2 mb-6">
                <div className="h-8 bg-gray-100 rounded w-24"></div>
                <div className="h-8 bg-gray-100 rounded w-24"></div>
              </div>
              <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3 mt-4"></div>
            </div>
          ) : (
            <PositionPreview 
              position={selectedPosition} 
              allowApply={allowApply}
              hasApplied={selectedPosition ? activeApplications.includes(selectedPosition.pid) : false}
            />
          )}
        </motion.div>
      </div>

      {/* Mobile view selected position details - only show when a position is selected */}
      {selectedPosition && (
        <motion.div 
          className="lg:hidden mt-4"
          variants={shouldAnimate ? animationConfig.fadeInUp : undefined}
        >
          <PositionPreview 
            position={selectedPosition} 
            allowApply={allowApply}
            hasApplied={activeApplications.includes(selectedPosition.pid)}
          />
        </motion.div>
      )}
    </motion.div>
  );
}