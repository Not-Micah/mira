import React from 'react';
import Select, { SingleValue } from 'react-select';
import { SelectOption } from '@/data/types';

type SelectFieldProps = {
    label: string;
    value: SelectOption | null;
    onChange: (value: SingleValue<SelectOption>) => void;
    options: readonly SelectOption[];
    required?: boolean;
    placeholder?: string;
    isSearchable?: boolean;
    isClearable?: boolean;
};

const SelectField = ({
    label,
    value,
    onChange,
    options,
    required,
    placeholder,
    isSearchable,
    isClearable,
}: SelectFieldProps) => {
    const customStyles = {
        // @typescript-eslint/no-explicit-any
        control: (base: any, state: any) => ({
            ...base,
            minHeight: '42px',
            borderRadius: '10px',
            background: 'rgb(249 250 251)', // Gray Background
            borderColor: state.isFocused ? '#8b5cf6' : '#dad0ff', // Focus & Non Focus Border Colors
            boxShadow: state.isFocused ? '0 0 0 2px #8b5cf6' : 'none', 
            '&:hover': {
                borderColor: '#a78bfa', 
            },
        }),
        // @typescript-eslint/no-explicit-any
        placeholder: (base: any) => ({
            ...base,
            fontSize: '13.5px', // Placeholder Text Size
            color: '#ACA6B2', // Placeholder Text Color
        }),
    };

    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-2 text-primary-900">
                {label}
                {required && <span className="text-red-500 text-xs">*</span>}
            </label>
            <Select
                value={value}
                onChange={onChange}
                options={options}
                isSearchable={isSearchable}
                isClearable={isClearable}
                placeholder={placeholder}
                styles={customStyles}
                className="text-sm"
            />
        </div>
    );
};

export default SelectField;
