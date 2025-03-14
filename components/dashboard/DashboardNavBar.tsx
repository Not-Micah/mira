"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { signOut } from "@/utils/firebaseFunctions";
import { motion } from "framer-motion";
import { LucideIcon, LogOut, Briefcase, List, Settings, PieChart } from "lucide-react";

// Define reusable className patterns
const navStyles = {
  section: "space-y-1",
  sectionTitle: "text-xs font-semibold text-gray-500 uppercase px-4 py-2",
  navItem: {
    base: "px-4 py-3 rounded-lg default-label font-medium transition-all duration-200 flex items-center gap-3 w-full text-left",
    active: "bg-primary-500 text-white shadow-sm",
    inactive: "text-primary-700 hover:bg-primary-50/60 hover:text-primary-800"
  },
  icon: {
    active: "text-white",
    inactive: "text-primary-500"
  },
  description: {
    active: "text-white/70",
    inactive: "text-gray-500"
  },
  signOutButton: "px-4 py-3 rounded-lg default-label font-medium flex items-center gap-3 w-full transition-colors duration-200 text-red-600 hover:bg-red-50/60"
};

interface NavSection {
  title: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  link: string;
  icon?: LucideIcon;
  description?: string;
}

interface DashboardNavBarProps {
  items: NavItem[];
}

const DashboardNavBar = ({ items }: DashboardNavBarProps) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentPage = searchParams.get("page");

  const handleNavigation = (link: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", link);
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Group navigation items into logical sections
  const navSections: NavSection[] = [
    {
      title: "Dashboard",
      items: items.filter(item => item.link === "overview")
    },
    {
      title: "Position Management",
      items: items.filter(item => ["manage-positions", "positions"].includes(item.link))
    },
    {
      title: "Settings",
      items: items.filter(item => item.link === "account-settings")
    }
  ].filter(section => section.items.length > 0);

  return (
    <div className="flex flex-col space-y-4">
      <nav className="flex flex-col space-y-1">
        {navSections.map((section, i) => (
          <div key={i} className={navStyles.section}>
            <h3 className={navStyles.sectionTitle}>{section.title}</h3>
            
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.link;
              
              return (
                <button
                  key={item.link}
                  onClick={() => handleNavigation(item.link)}
                  className={`${navStyles.navItem.base} ${
                    isActive
                      ? navStyles.navItem.active
                      : navStyles.navItem.inactive
                  }`}
                >
                  {Icon && <Icon size={20} className={isActive ? navStyles.icon.active : navStyles.icon.inactive} />}
                  <div className="flex flex-col">
                    <span>{item.label}</span>
                    {item.description && (
                      <span className={`text-xs ${isActive ? navStyles.description.active : navStyles.description.inactive}`}>
                        {item.description}
                      </span>
                    )}
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="navHighlight"
                      className="absolute inset-0 w-full h-full -z-10"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      
      <div className="pt-2 border-t border-gray-200">
        <button
          onClick={signOut}
          className={navStyles.signOutButton}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardNavBar;