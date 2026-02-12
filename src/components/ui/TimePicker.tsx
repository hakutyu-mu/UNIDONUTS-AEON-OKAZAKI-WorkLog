import React from 'react';

interface TimePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    step?: number; // seconds, default 60 (1 min). Use 300 for 5 min.
}

export const TimePicker: React.FC<TimePickerProps> = ({
    label,
    error,
    step = 60,
    className = '',
    ...props
}) => {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <input
                type="time"
                step={step}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-lg ${error ? 'border-red-500' : 'border-gray-300'
                    } ${className}`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};
