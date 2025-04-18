/**
 * OverviewTab Component
 * Displays a table of accepted applicants with their commitment status and provides rescind functionality.
 * - Shows all accepted applicants, including those who have been rescinded
 * - Displays commitment status and last update time for each applicant
 * - Provides rescind functionality for applicants who haven't responded within 3 days
 * - Shows available positions count and rescind policy information
 */

'use client';

import React from 'react';
import { DocumentData, Timestamp } from 'firebase/firestore';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'react-hot-toast';

import { Application } from '@/data/types';
import { rescindApplicant } from '@/utils/organizationFunctions';
import { useConfirmationModal } from "@/hooks/useConfirmationModal";

interface OverviewTabProps {
    applicants: Application[];
    position: DocumentData | null;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ applicants, position }) => {
    const acceptedApplicants = applicants.filter(applicant => applicant.status === 'accepted');
    const { onOpen } = useConfirmationModal();

    const getCommitmentStatus = (applicant: Application) => {
        if (applicant.rescinded) {
            return (
                <span className="
                    inline-flex items-center px-2.5 py-1 rounded-md default-label
                    text-red-700 bg-red-50 border border-red-100
                ">
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Rescinded
                </span>
            );
        }
        if (applicant.committed === undefined) return null;
        return applicant.committed ? (
            <span className="
                inline-flex items-center px-2.5 py-1 rounded-md default-label
                text-emerald-700 bg-emerald-50 border border-emerald-100
            ">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Committed
            </span>
        ) : (
            <span className="
                inline-flex items-center px-2.5 py-1 rounded-md default-label
                text-amber-700 bg-amber-50 border border-amber-100
            ">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Withdrawn
            </span>
        );
    };

    const canRescind = (applicant: Application) => {
        if (!applicant.updatedAt || applicant.committed !== undefined || applicant.rescinded) {
            return false;
        }
        const daysSinceAcceptance = differenceInDays(new Date(), applicant.updatedAt.toDate());
        return daysSinceAcceptance >= 3;
    };

    return (
        <div className="space-y-8">
            {/* Stats and Policy Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stats Cards */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="default-text font-medium mb-4">Position Statistics</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <p className="default-label mb-1">Accepted</p>
                                <p className="default-text text-2xl font-semibold">
                                    {acceptedApplicants.length}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <p className="default-label mb-1">Available Slots</p>
                                <p className="default-text text-2xl font-semibold">
                                    {position?.openSlots || 0}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <p className="default-label mb-1">Committed</p>
                                <p className="default-text text-2xl font-semibold">
                                    {position?.committedApplicants || 0}/{position?.totalSlots || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Policy Card */}
                <div className="bg-primary-50 p-6 rounded-lg border border-primary-100 shadow-sm">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 bg-primary-100 rounded-full p-2">
                                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="default-text font-medium">Rescind Policy</h3>
                        </div>
                        <div>
                            <p className="default-label text-primary-700 leading-relaxed">
                                If an applicant hasn&apos;t accepted or withdrawn from their accepted position within 3 days,
                                you can choose to rescind their offer and accept another candidate.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Accepted Applicants Table */}
            <div>
                <h2 className="default-text font-medium mb-4">Accepted Applicants</h2>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left default-label uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left default-label uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left default-label uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left default-label uppercase tracking-wider">
                                        Last Updated
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left default-label uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {acceptedApplicants.map((applicant, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="default-text">{applicant.fullName}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap default-label">{applicant.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getCommitmentStatus(applicant)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap default-label">
                                        {applicant.updatedAt ? format((applicant.updatedAt as Timestamp).toDate(), 'MMM d, yyyy') : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => {
                                                onOpen(
                                                    'Are you sure you want to rescind this applicant\'s acceptance? This action cannot be undone.',
                                                    async () => {
                                                        try {
                                                            await rescindApplicant({
                                                                uid: applicant.uid,
                                                                email: applicant.email,
                                                                fullName: applicant.fullName,
                                                                positionTitle: position?.title,
                                                                organizationName: position?.organizationName,
                                                                pid: position?.pid
                                                            });
                                                            toast.success('Successfully rescinded applicant\'s acceptance');
                                                        } catch (error) {
                                                            console.error('Failed to rescind applicant:', error);
                                                            toast.error('Failed to rescind applicant');
                                                        }
                                                    }
                                                );
                                            }}
                                            disabled={!canRescind(applicant)}
                                            className={`
                                                inline-flex items-center px-3 py-1.5 rounded-md default-label
                                                transition-colors duration-150 ease-in-out
                                                ${canRescind(applicant)
                                                    ? "text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                    : "text-gray-400 cursor-not-allowed"
                                                }
                                            `}
                                        >
                                            {canRescind(applicant) && (
                                                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            )}
                                            Rescind
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;