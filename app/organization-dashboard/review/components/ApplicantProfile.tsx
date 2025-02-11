'use client';

import React from 'react';
import { DocumentData } from 'firebase/firestore';
import { Applicant } from '@/data/types';
import { setApplicationStatus, toggleBookmarkStatus } from '@/utils/organizationFunctions';

interface ApplicantProfileProps {
    applicant: Applicant;
    position: DocumentData | null;
}

const ApplicantProfile: React.FC<ApplicantProfileProps> = ({ applicant, position }) => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="default-subheading">{applicant.fullName}</h2>
                <div className="mt-4 space-y-4">
                    <div>
                        <h3 className="font-semibold text-gray-700">Education</h3>
                        <p className="default-text">{applicant.education}</p>
                    </div>
                    {applicant.resume && (
                        <div>
                            <h3 className="font-semibold text-gray-700">Resume</h3>
                            <p className="default-text whitespace-pre-wrap">{applicant.resume}</p>
                        </div>
                    )}
                    {(applicant.resumeLink || applicant.portfolioLink) && (
                        <div className="space-y-2">
                            {applicant.resumeLink && (
                                <div>
                                    <h3 className="font-semibold text-gray-700">Resume Link</h3>
                                    <a 
                                        href={applicant.resumeLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="default-text text-blue-600 hover:text-blue-800 underline"
                                    >
                                        {applicant.resumeLink}
                                    </a>
                                </div>
                            )}
                            {applicant.portfolioLink && (
                                <div>
                                    <h3 className="font-semibold text-gray-700">Portfolio Link</h3>
                                    <a 
                                        href={applicant.portfolioLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="default-text text-blue-600 hover:text-blue-800 underline"
                                    >
                                        {applicant.portfolioLink}
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Questions and Responses */}
            {position?.positionQuestions && (
                <div className="space-y-4">
                    <h3 className="default-text font-semibold">Application Responses</h3>
                    {position.positionQuestions.map((question: string, index: number) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                            <p className="font-medium text-gray-700">{question}</p>
                            <p className="mt-2 default-text">
                                {applicant.applicantResponses && applicant.applicantResponses[index]}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
                <button 
                    onClick={async () => {
                        if (window.confirm('Are you sure you want to accept this applicant? This action cannot be undone.')) {
                            await setApplicationStatus(applicant.uid, "accepted");
                        }
                    }}
                    disabled={applicant.status !== 'pending'}
                    className={`default-button bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    Accept
                </button>
                <button 
                    onClick={async () => {
                        if (window.confirm('Are you sure you want to reject this applicant? This action cannot be undone.')) {
                            await setApplicationStatus(applicant.uid, "rejected");
                        }
                    }}
                    disabled={applicant.status !== 'pending'}
                    className={`default-button bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    Reject
                </button>
                <button 
                    onClick={async () => {
                        await toggleBookmarkStatus(applicant.uid);
                    }}
                    disabled={applicant.status !== 'pending'}
                    className={`default-button ${
                        applicant.bookMark 
                            ? 'bg-gray-600 hover:bg-gray-700' 
                            : 'bg-yellow-600 hover:bg-yellow-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {applicant.bookMark ? 'Remove Bookmark' : 'Bookmark'}
                </button>
            </div>
        </div>
    );
};

export default ApplicantProfile;