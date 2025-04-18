"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getUserAuth } from "@/utils/firebaseFunctions";
import { getApplicationsByUser } from "@/utils/applicantFunctions";
import DashboardNavBar from "@/components/dashboard/DashboardNavBar";
import PositionListing from "@/components/dashboard/position-listing/PositionListing";
import { Application } from "@/data/types";

import Header from "./components/Header";

import AccountSettings from "./components/AccountSettings";
import ActiveApplications from "./components/ActiveApplications";

const ApplicantDashboard = () => {
  const searchParams = useSearchParams();
  const currentPage = searchParams.get("page") || "positions";
  const [applications, setApplications] = useState<Application[]>([]);
  const auth = getUserAuth(true);

  useEffect(() => {
    let unsubscribe: () => void;

    const setupSubscription = async () => {
      if (auth.currentUser) {
        unsubscribe = getApplicationsByUser(auth.currentUser.uid, (fetchedApplications) => {
          setApplications(fetchedApplications);
        });
      }
    };

    setupSubscription();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [auth.currentUser]);

  const renderContent = () => {
    switch (currentPage) {
      case "positions":
        return <PositionListing 
          allowApply={true} 
          activeApplications={applications.map(app => app.pid)}
        />;
      case "active-applications":
        return <ActiveApplications applications={applications} />;
      case "account-settings":
        return <AccountSettings />;
    }
  };

  return (
    <>
      <Header />
      <div className="default-container w-full flex flex-col gap-6 mb-24">
        <DashboardNavBar items={[
          { label: "View Listings", link: "positions" }, 
          { label: "Active Applications", link: "active-applications" },
          { label: "Settings", link: "account-settings" }
        ]} />
        <div className="">
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default ApplicantDashboard;