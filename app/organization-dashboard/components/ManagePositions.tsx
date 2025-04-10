'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentData } from 'firebase/firestore';
import { toast } from "react-hot-toast";
import { FiPlus, FiPackage, FiSearch } from 'react-icons/fi';

// Components
import PositionCard from './PositionCard';
import SelectField from '@/components/common/SelectField';
import { SelectOption } from '@/data/types';

// Hooks & Context
import { useAccount } from '@/providers/AccountProvider';
import { useConfirmationModal } from "@/hooks/useConfirmationModal";

// Utils & Functions
import { getPositionsByOrg, deletePosition, updateVisibility } from '@/utils/organizationFunctions';

const ManagePositions = () => {
  // Hooks
  const router = useRouter();
  const { account } = useAccount();
  const { onOpen } = useConfirmationModal();
  
  // State
  const [positions, setPositions] = useState<DocumentData[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<SelectOption | null>(null);
  
  // Filter Options
  const statusOptions: SelectOption[] = [
    { label: "Active", value: "active" },
    { label: "Hidden", value: "hidden" },
    { label: "Locked", value: "locked" }
  ];

  // Load Positions on Mount
  useEffect(() => {
    if (!account?.uid) return;

    const unsubscribe = getPositionsByOrg(account.uid, (updatedPositions) => {
      setPositions(updatedPositions);
    });

    return () => unsubscribe();
  }, [account?.uid]);
  
  // Filter Positions Based on Queries
  const filteredPositions = positions.filter(position => {
    // SEARCH QUERY
    const titleText = position.positionTitle || '';
    const matchesSearch = titleText.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    // STATUS FILTER
    if (!selectedStatus) return true;
    
    const isVisible = position.visible || false;
    const isLocked = position.locked || false;
    
    switch (selectedStatus.value) {
      case "active": return isVisible && !isLocked;
      case "hidden": return !isVisible && !isLocked;
      case "locked": return isLocked;
      default: return true;
    }
  });

  // Event Handlers
  const handleDelete = async (pid: string) => {
    onOpen(
      "Are you sure you want to delete this position?",
      async () => {
        try {
          setDeleting(pid);
          await deletePosition(pid);
          setDeleting(null);
          router.refresh();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) {
          toast.error("Failed to delete position. Please try again.");
          setDeleting(null);
        }
      }
    );
  };

  const handleVisibilityChange = async (pid: string, newVisibility: boolean, locked: boolean) => {
    if (locked) {
      toast.error("Position is complete and locked. No further modifications are allowed.");
      return;
    }

    try {
      await updateVisibility(pid, newVisibility);
      toast.success(`Position is now ${newVisibility ? 'visible' : 'hidden'}.`);
      router.refresh();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      toast.error("Failed to update visibility. Please try again.");
    }
  };

  // UI Components
  const renderHeader = () => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="default-subheading text-gray-900 font-poppins">Manage Positions</h2>
            <p className="default-label text-gray-500 mt-1 font-poppins">Review and manage your positions!</p>
          </div>

          <button 
            onClick={() => router.push('/organization-dashboard/create-position')}
            className="outlined-button inline-flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <FiPlus className="w-4 h-4" />
            <span>Create Position</span>
          </button>
        </div>
        
        {/* Search and Filters */}
        <div className="space-y-4 bg-white rounded-lg border border-gray-100 p-4">
          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search positions..."
              className="default-field w-full pl-10 pr-4 font-poppins"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <SelectField
                label="Position Status"
                value={selectedStatus}
                onChange={setSelectedStatus}
                options={statusOptions}
                placeholder="All Positions"
                isClearable
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => {
    const emptyStateClasses = "text-center py-16 bg-white border border-gray-200 rounded-lg font-poppins";
    
    // Different Empty State Messages
    if (searchQuery || selectedStatus) {
      return (
        <div className={emptyStateClasses}>
          <FiSearch className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium">No matching positions found</p>
          <p className="text-gray-400 text-sm mt-1.5">Try changing your search or filter criteria</p>
        </div>
      );
    }
    
    return (
      <div className={emptyStateClasses}>
        <FiPackage className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 font-medium">No positions posted yet</p>
        <p className="text-gray-400 text-sm mt-1.5">Create your first position to get started</p>
      </div>
    );
  };
  

  return (
    <div className="space-y-6 mt-4">
      {renderHeader()}

      <div className="flex flex-col gap-4">
        {filteredPositions.length > 0 ? (
          filteredPositions.map((position) => (
            <PositionCard
              key={position.pid}
              position={position}
              onVisibilityChange={handleVisibilityChange}
              onDelete={handleDelete}
              isDeleting={deleting === position.pid}
            />
          ))
        ) : renderEmptyState()}
      </div>
    </div>
  );
};

export default ManagePositions;