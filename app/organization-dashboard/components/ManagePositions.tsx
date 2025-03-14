'use client';

import React, { useEffect, useState } from 'react';

import { DocumentData, Timestamp } from 'firebase/firestore';
import { getPositionsByOrg, deletePosition, updateVisibility } from '@/utils/organizationFunctions';
import { toTitleCase } from '@/utils/misc';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useAccount } from '@/providers/AccountProvider';
import { useConfirmationModal } from "@/hooks/useConfirmationModal";
import * as Switch from '@radix-ui/react-switch';
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { 
  Eye, EyeOff, Trash2, Edit, Users, Clock, Lock, AlertCircle, 
  PlusCircle, Calendar, Search, Filter
} from 'lucide-react';
import Link from 'next/link';

const ManagePositions = () => {
  const { account } = useAccount();
  const [positions, setPositions] = useState<DocumentData[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const router = useRouter();
  const { onOpen } = useConfirmationModal();

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return '';
    return format(timestamp.toDate(), 'MMM d, yyyy');
  };

  useEffect(() => {
    if (!account?.uid) return;

    const unsubscribe = getPositionsByOrg(account.uid, (updatedPositions) => {
      setPositions(updatedPositions);
    });

    return () => unsubscribe();
  }, [account?.uid]);

  const handleDelete = async (pid: string) => {
    onOpen(
      "Are you sure you want to delete this position?",
      async () => {
        try {
          setDeleting(pid);
          await deletePosition(pid);
          setDeleting(null);
          router.refresh();
        } catch {
          toast.error("Failed to delete position. Please try again.");
          setDeleting(null);
        }
      }
    );
  };

  const handleVisibilityChange = async (pid: string, newVisibility: boolean, locked: boolean) => {
    // If position is locked, visibility cannot be changed
    if (locked) {
      toast.error("Position is complete and locked. No further modifications are allowed.");
      return;
    }

    try {
      await updateVisibility(pid, newVisibility);
      toast.success(`Position is now ${newVisibility ? 'visible' : 'hidden'}.`);
    } catch {
      toast.error("Failed to update visibility. Please try again.");
    }
  };

  // Filter positions based on search query and filter status
  const filteredPositions = positions.filter(position => {
    // Check if title property exists and use safe property access
    const titleText = position.positionTitle || position.title || '';
    const matchesSearch = titleText.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Use either visibility or visible property
    const isVisible = position.visibility || position.visible || false;
    
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "active") return matchesSearch && isVisible && !position.locked;
    if (filterStatus === "hidden") return matchesSearch && !isVisible && !position.locked;
    if (filterStatus === "locked") return matchesSearch && position.locked;
    
    return matchesSearch;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6"
    >
      {/* Header and actions */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="default-subheading">Manage Positions</h2>
          <p className="default-text text-gray-600 mt-1">
            Create, edit and manage your volunteer positions
          </p>
        </div>
        
        <Link 
          href="/organization-dashboard/create-position"
          className="default-button flex items-center gap-2"
        >
          <PlusCircle size={18} />
          Create Position
        </Link>
      </motion.div>

      {/* Search and filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search positions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="default-field pl-10 w-full"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="default-field min-w-[120px]"
          >
            <option value="all">All Positions</option>
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
            <option value="locked">Locked</option>
          </select>
        </div>
      </motion.div>

      {/* Positions list */}
      <motion.div variants={itemVariants} className="border border-gray-100 rounded-xl overflow-hidden">
        {filteredPositions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <AlertCircle size={48} className="text-gray-300 mb-3" />
            {searchQuery || filterStatus !== "all" ? (
              <>
                <h3 className="default-label font-semibold mb-1">No matching positions found</h3>
                <p className="text-gray-500 text-sm">Try changing your search or filter criteria</p>
              </>
            ) : (
              <>
                <h3 className="default-label font-semibold mb-1">No positions created yet</h3>
                <p className="text-gray-500 text-sm mb-4">Create your first position to get started</p>
                <Link 
                  href="/organization-dashboard/create-position"
                  className="default-button flex items-center gap-2"
                >
                  <PlusCircle size={16} />
                  Create Position
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicants</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visibility</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredPositions.map((position) => {
                  const locked = position.locked || false;
                  const applicationsCount = position.applications ? Object.keys(position.applications).length : 0;

                  return (
                    <motion.tr 
                      key={position.id || position.pid}
                      variants={itemVariants}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{position.positionTitle || position.title}</div>
                        <div className="text-sm text-gray-500">
                          {toTitleCase(position.skills?.join(', ') || position.positionType || '')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{formatDate(position.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm">
                          <Users size={14} className="text-gray-500" />
                          <span className="font-medium">{applicationsCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {locked ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 font-medium flex items-center gap-1 w-fit">
                            <Lock size={12} />
                            Locked
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium flex items-center gap-1 w-fit">
                            <Clock size={12} />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Switch.Root
                            checked={position.visibility || position.visible}
                            onCheckedChange={(checked) => handleVisibilityChange(position.id || position.pid, checked, locked)}
                            disabled={locked || deleting === position.id || deleting === position.pid}
                            className={`w-10 h-5 rounded-full relative ${(position.visibility || position.visible) ? 'bg-primary-400' : 'bg-gray-300'} ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Switch.Thumb className={`block w-4 h-4 bg-white rounded-full transition-transform ${(position.visibility || position.visible) ? 'translate-x-5' : 'translate-x-0.5'} transform will-change-transform`} />
                          </Switch.Root>
                          <span className="ml-2 text-sm text-gray-500">
                            {(position.visibility || position.visible) ? (
                              <span className="flex items-center gap-1">
                                <Eye size={14} /> 
                                Visible
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <EyeOff size={14} /> 
                                Hidden
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/organization-dashboard/create-position?pid=${position.id || position.pid}`}
                            className={`p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors ${locked ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                            aria-disabled={locked}
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(position.id || position.pid)}
                            disabled={deleting === position.id || deleting === position.pid || locked}
                            className={`p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors ${(deleting === position.id || deleting === position.pid || locked) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ManagePositions;