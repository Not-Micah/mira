'use client';

import { useState } from "react";
import { useAccount } from "@/providers/AccountProvider";
import { updateOrganization } from "@/utils/organizationFunctions";
import { updateEmail, updatePassword } from "@/utils/firebaseFunctions";
import { User, Check, Building, Mail, Shield, Edit2, X, Save } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

const AccountSettings = () => {
  const { account, setAccount } = useAccount();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: account?.organization?.name || "",
    website: account?.organization?.website || "",
    description: account?.organization?.description || "",
    email: account?.email || "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!account) return;
    
    setLoading(true);
    
    try {
      // Update organization details
      if (
        formData.name !== account.organization?.name ||
        formData.website !== account.organization?.website ||
        formData.description !== account.organization?.description
      ) {
        await updateOrganization(account.uid, {
          name: formData.name,
          website: formData.website,
          description: formData.description,
        });

        // Update local state
        setAccount({
          ...account,
          organization: {
            ...account.organization,
            name: formData.name,
            website: formData.website,
            description: formData.description,
          },
        });
      }

      // Update email if changed
      if (formData.email !== account.email) {
        await updateEmail(formData.email);
        setAccount({ ...account, email: formData.email });
      }

      // Update password if both fields are filled and match
      if (formData.password && formData.password === formData.confirmPassword) {
        await updatePassword(formData.password);
        // Clear password fields
        setFormData({ ...formData, password: "", confirmPassword: "" });
      } else if (formData.password && formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        setLoading(false);
        return;
      }

      toast.success("Account settings updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update account settings. Please try again.");
      console.error("Error updating account settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    // Reset form data to current account values
    setFormData({
      name: account?.organization?.name || "",
      website: account?.organization?.website || "",
      description: account?.organization?.description || "",
      email: account?.email || "",
      password: "",
      confirmPassword: "",
    });
    setIsEditing(false);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
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
      {/* Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          <h2 className="default-subheading">Account Settings</h2>
          <p className="default-text text-gray-600 mt-1">
            Manage your organization's profile and account settings
          </p>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="default-button flex items-center gap-2 bg-white text-primary-500 border border-primary-200 hover:bg-primary-50"
          >
            <Edit2 size={18} />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={cancelEdit}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              <X size={18} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="default-button flex items-center gap-2"
              disabled={loading}
            >
              <Save size={18} />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </motion.div>

      {/* Organization Information */}
      <motion.div variants={itemVariants}>
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h3 className="default-label font-medium flex items-center gap-2">
              <Building size={18} className="text-primary-500" />
              Organization Information
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="default-field w-full"
                  placeholder="Organization Name"
                />
              ) : (
                <p className="default-text text-gray-800">
                  {account?.organization?.name || "Not provided"}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="default-field w-full"
                  placeholder="https://example.com"
                />
              ) : (
                <p className="default-text text-gray-800">
                  {account?.organization?.website ? (
                    <a 
                      href={account.organization.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-500 hover:underline"
                    >
                      {account.organization.website}
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Description
              </label>
              {isEditing ? (
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="default-field w-full h-32"
                  placeholder="Describe your organization's mission and purpose"
                ></textarea>
              ) : (
                <p className="default-text text-gray-800">
                  {account?.organization?.description || "Not provided"}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Account Information */}
      <motion.div variants={itemVariants}>
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h3 className="default-label font-medium flex items-center gap-2">
              <User size={18} className="text-primary-500" />
              Account Information
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="default-field w-full"
                  placeholder="email@example.com"
                />
              ) : (
                <p className="default-text text-gray-800 flex items-center gap-2">
                  <Mail size={16} className="text-gray-500" />
                  {account?.email || "Not provided"}
                </p>
              )}
            </div>
            
            {isEditing && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="default-field w-full"
                    placeholder="Leave blank to keep current password"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="default-field w-full"
                    placeholder="Confirm new password"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Security Tips */}
      <motion.div variants={itemVariants} className="bg-primary-50/50 rounded-lg p-6 border border-primary-100">
        <h3 className="default-label font-semibold mb-3 flex items-center gap-2">
          <Shield size={18} className="text-primary-500" />
          Security Tips
        </h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <Check className="text-primary-500 mt-1" size={16} />
            <span className="text-gray-700">Use a strong, unique password for your account</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="text-primary-500 mt-1" size={16} />
            <span className="text-gray-700">Update your password regularly for better security</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="text-primary-500 mt-1" size={16} />
            <span className="text-gray-700">Ensure your contact information is up-to-date</span>
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default AccountSettings;