import React from 'react';

interface MamafaLogoProps {
    className?: string;
    imgClassName?: string;
}

const MamafaLogo: React.FC<MamafaLogoProps> = ({ className = '' }) => {
    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <p className="text-xs text-gray-500">Powered by</p>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mamafa Project Management</span>
        </div>
    );
};

export default MamafaLogo;