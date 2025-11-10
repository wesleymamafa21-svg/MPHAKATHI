import React from 'react';

const MphakathiLogo: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center font-['Squada_One'] my-4 text-center">
            <svg viewBox="0 0 152 90" className="h-20 w-auto mb-2" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 90V0H25L63.5 50L102 0H127V90H102V30L72 70H55L25 30V90H0Z" fill="#FACC15"/>
                <path d="M127 0V90H102 M102 0L63.5 50" stroke="white" strokeWidth="6"/>
                <path d="M25 0L63.5 50L102 0H77.75L63.5 20L50.25 0H25Z" fill="#111827"/>
            </svg>
            <h1 className="text-5xl tracking-wider relative">
                <span className="text-yellow-400">MPHA</span>
                <span className="text-white">KATH</span>
                <span className="text-white relative">
                    I
                    <span className="absolute -top-1 -right-2 transform translate-x-1/2 -translate-y-1/2 text-sm">
                       ✊
                    </span>
                </span>
            </h1>
            <p className="text-white text-lg tracking-wider font-sans font-semibold mt-1">
                The Power to Protect
            </p>
        </div>
    );
};

export default MphakathiLogo;