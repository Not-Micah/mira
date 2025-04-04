'use client';

import { updateAccount } from '@/utils/globalFunctions';
import { FormField } from '@/data/types';

import { useForm } from 'react-hook-form';
import { useAccount } from '@/providers/AccountProvider';
import { toast } from 'react-hot-toast';

import EntryField from '@/components/common/EntryField';

interface FormData {
  fullName: string;
  educationLevel: string;
  resumeText: string;
  resumeLink: string;
  portfolioLink: string;
}

const AccountSettings = () => {
  const { account, accountData } = useAccount();
  const { register, handleSubmit, formState: { isDirty }, reset } = useForm<FormData>({
    defaultValues: {
      fullName: accountData?.fullName || '',
      educationLevel: accountData?.educationLevel || '',
      resumeText: accountData?.resumeText || '',
      resumeLink: accountData?.resumeLink || '',
      portfolioLink: accountData?.portfolioLink || ''
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      await updateAccount({
        uid: account?.uid,
        type: 'individual',
        ...data
      });
      toast.success('Profile updated successfully!');
      // Reset form with new values to update dirty state
      reset(data, { keepDirty: false });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const fields: FormField[] = [
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'Enter your full name',
      maxLength: 50
    },
    {
      name: 'educationLevel',
      label: 'Education',
      type: 'text',
      multiline: true,
      required: true,
      placeholder: 'Enter your educational background',
      maxLength: 300
    },
    {
      name: 'resumeText',
      label: 'Resume',
      type: 'text',
      multiline: true,
      required: true,
      placeholder: 'Write your resume here',
      maxLength: 1000
    },
    {
      name: 'resumeLink',
      label: 'Resume Link',
      type: 'text',
      required: false,
      placeholder: 'Link to your resume (optional)',
      maxLength: 200
    },
    {
      name: 'portfolioLink',
      label: 'Portfolio Link',
      type: 'text',
      required: false,
      placeholder: 'Link to your portfolio (optional)',
      maxLength: 200
    }
  ];

  return (
    <div className="space-y-6">
      <div className="
      flex items-center gap-6 pb-8
      max-sm:flex-col">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md">
          <img
            src={accountData?.profile}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h1 className="default-subheading max-sm:text-center">Update Profile</h1>
          <p className="default-label text-gray-500 max-sm:text-center">Keep your information up to date!</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {fields.map((field) => (
          <EntryField
            key={field.name}
            field={field}
            register={register}
          />
        ))}

        <div className="pt-4">
          <button
            type="submit"
            disabled={!isDirty}
            className={`w-full default-button ${
              !isDirty && 'opacity-50 cursor-not-allowed'
            }`}
          >
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountSettings;