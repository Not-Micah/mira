'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Users, X, ChevronRight, Eye, PenLine, Clock, CheckSquare } from 'lucide-react';

// Organize classes for better maintainability
const modalStyles = {
  // Layout
  overlay: "fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4",
  container: "bg-white rounded-xl shadow-xl max-w-3xl w-full",
  header: "flex justify-between items-center p-6 border-b border-gray-100",
  content: "p-6",
  footer: "flex justify-between items-center p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl",
  
  // Typography
  title: "default-subheading",
  sectionTitle: "default-subheading text-center text-primary-600 flex items-center justify-center gap-2",
  sectionText: "default-text text-center",
  
  // Cards
  cardGrid: "grid grid-cols-1 md:grid-cols-3 gap-4 mt-6",
  card: "default-card flex flex-col items-center text-center p-4",
  cardIcon: "text-primary-500 mb-3",
  cardTitle: "font-semibold",
  cardText: "text-sm text-gray-600 mt-1",
  
  // Buttons
  closeButton: "p-1 rounded-full hover:bg-gray-100 transition-colors",
  actionButton: "default-button flex items-center gap-2",
  
  // Step indicator
  stepIndicator: "text-sm text-gray-500"
};

// Optimized animation variants
const modalAnimation = {
  container: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.15 }
    }
  }
};

interface WorkflowHelpModalProps {
  onClose: () => void;
}

const WorkflowHelpModal = ({ onClose }: WorkflowHelpModalProps) => {
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className={modalStyles.sectionTitle}>
              <ClipboardList size={24} />
              Manage Positions
            </h3>
            <p className={modalStyles.sectionText}>
              This section is where you create, edit, and manage your volunteer positions.
            </p>
            
            <div className={modalStyles.cardGrid}>
              <div className={modalStyles.card}>
                <PenLine size={40} className={modalStyles.cardIcon} />
                <h4 className={modalStyles.cardTitle}>Create & Edit</h4>
                <p className={modalStyles.cardText}>
                  Create new positions or edit existing ones with detailed descriptions
                </p>
              </div>
              
              <div className={modalStyles.card}>
                <Eye size={40} className={modalStyles.cardIcon} />
                <h4 className={modalStyles.cardTitle}>Show & Hide</h4>
                <p className={modalStyles.cardText}>
                  Control visibility of positions to make them public or private
                </p>
              </div>
              
              <div className={modalStyles.card}>
                <Clock size={40} className={modalStyles.cardIcon} />
                <h4 className={modalStyles.cardTitle}>Track Status</h4>
                <p className={modalStyles.cardText}>
                  Monitor active, hidden, and completed positions
                </p>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <h3 className={modalStyles.sectionTitle}>
              <Users size={24} />
              View Listings & Review Applicants
            </h3>
            <p className={modalStyles.sectionText}>
              This workflow is focused on managing applications and reviewing candidates.
            </p>
            
            <div className={modalStyles.cardGrid}>
              <div className={modalStyles.card}>
                <Eye size={40} className={modalStyles.cardIcon} />
                <h4 className={modalStyles.cardTitle}>Browse Listings</h4>
                <p className={modalStyles.cardText}>
                  See how your positions appear to applicants and check applicant count
                </p>
              </div>
              
              <div className={modalStyles.card}>
                <Users size={40} className={modalStyles.cardIcon} />
                <h4 className={modalStyles.cardTitle}>Review Applications</h4>
                <p className={modalStyles.cardText}>
                  Access applicant details, resumes, and contact information
                </p>
              </div>
              
              <div className={modalStyles.card}>
                <CheckSquare size={40} className={modalStyles.cardIcon} />
                <h4 className={modalStyles.cardTitle}>Manage Status</h4>
                <p className={modalStyles.cardText}>
                  Approve or reject applications and track applicant progress
                </p>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <div className={modalStyles.overlay}>
        <motion.div 
          className={modalStyles.container}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalAnimation.container}
        >
          {/* Header */}
          <div className={modalStyles.header}>
            <h2 className={modalStyles.title}>Organization Dashboard Guide</h2>
            <button 
              onClick={onClose}
              className={modalStyles.closeButton}
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          
          {/* Content */}
          <div className={modalStyles.content}>
            {renderStepContent()}
          </div>
          
          {/* Footer */}
          <div className={modalStyles.footer}>
            <div className={modalStyles.stepIndicator}>
              Step {step} of {totalSteps}
            </div>
            <button
              onClick={nextStep}
              className={modalStyles.actionButton}
            >
              {step < totalSteps ? 'Next' : 'Got it'}
              <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WorkflowHelpModal; 