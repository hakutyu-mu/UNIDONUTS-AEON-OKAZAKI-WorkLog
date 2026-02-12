import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
    return (
        <div className={`bg-white shadow-md rounded-lg p-6 border border-gray-100 ${className}`}>
            {title && <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>}
            {children}
        </div>
    );
};
