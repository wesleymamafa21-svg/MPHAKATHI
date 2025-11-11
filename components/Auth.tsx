import React, { useState, useEffect } from 'react';
import { User, Gender } from '../types';
import MamafaLogo from './MamafaLogo';
import MphakathiLogo from './MphakathiLogo';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

// For mock DB in localStorage
const USERS_DB_KEY = 'mphakathi_users';
interface StoredUser extends User {
    // In a real application, this would be a securely hashed password, not plaintext.
    password?: string;
}

type AuthView = 'login' | 'register' | 'forgot' | 'forgot_confirmation';

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
    const [view, setView] = useState<AuthView>('login');
    
    // Login State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    // Register State
    const [regFullName, setRegFullName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');
    const [regIsSurvivor, setRegIsSurvivor] = useState(false);
    const [regError, setRegError] = useState('');

    // Forgot Password State
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotError, setForgotError] = useState('');

    useEffect(() => {
        try {
            const rememberedEmail = localStorage.getItem('mphakathi_remembered_email');
            const rememberedPassword = localStorage.getItem('mphakathi_remembered_password');

            if (rememberedEmail && rememberedPassword) {
                setLoginEmail(rememberedEmail);
                setLoginPassword(rememberedPassword);
                setRememberMe(true);
            }
        } catch (error) {
            console.error("Failed to load remembered credentials", error);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');

        try {
            const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
            const user = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());

            // In a real app, you would send the password to the server,
            // which would compare it against the stored hash.
            if (user && user.password === loginPassword) {
                if (rememberMe) {
                    localStorage.setItem('mphakathi_remembered_email', loginEmail);
                    localStorage.setItem('mphakathi_remembered_password', loginPassword);
                } else {
                    localStorage.removeItem('mphakathi_remembered_email');
                    localStorage.removeItem('mphakathi_remembered_password');
                }
                
                // Destructure to avoid passing password into the app's state
                const { password, ...userToAuth } = user;
                onAuthSuccess(userToAuth);
            } else {
                setLoginError('Invalid email or password.');
            }
        } catch (error) {
            console.error("Failed to login:", error);
            setLoginError('An error occurred. Please try again.');
        }
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setRegError('');

        if (!regFullName || !regEmail || !regPassword) {
            setRegError('Please fill in all required fields.');
            return;
        }
        if (regPassword !== regConfirmPassword) {
            setRegError('Passwords do not match.');
            return;
        }

        // More robust password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(regPassword)) {
            setRegError('Password must be 8+ characters and include uppercase, lowercase, a number, and a special character (@$!%*?&).');
            return;
        }
        
        try {
            const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
            const existingUser = users.find(u => u.email.toLowerCase() === regEmail.toLowerCase());

            if (existingUser) {
                setRegError('A user with this email already exists.');
                return;
            }

            // In a real app, the password would be securely hashed on the backend before storage.
            // Storing plain text is for demo purposes only and is a major security risk.
            const newUser: StoredUser = {
                id: crypto.randomUUID(),
                fullName: regFullName,
                email: regEmail,
                password: regPassword, 
                gender: null, // User can set this in their profile later
                isSurvivor: regIsSurvivor,
            };

            // --- SIMULATE SENDING WELCOME EMAIL ---
            console.log(`
            ==============================================
            📧 SIMULATING WELCOME EMAIL 📧
            ==============================================
            To: ${newUser.email}
            From: no-reply@mphakathi.app
            Subject: Welcome to Mphakathi!

            Hi ${newUser.fullName.split(' ')[0]},

            Welcome to Mphakathi, your community safety partner. 
            Please take a moment to set up your emergency contacts and Voice Secret Code in the app to get the full protection Mphakathi offers.

            Stay safe,
            The Mphakathi Team
            ==============================================
            `);
            // --- END OF SIMULATION ---

            // Automatically remember credentials after registration
            localStorage.setItem('mphakathi_remembered_email', newUser.email);
            localStorage.setItem('mphakathi_remembered_password', newUser.password);

            users.push(newUser);
            localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
            
            // Destructure to avoid passing password into the app's state
            const { password, ...userToAuth } = newUser;
            onAuthSuccess(userToAuth);

        } catch (error) {
            console.error("Failed to register:", error);
            setRegError('An error occurred during registration. Please try again.');
        }
    };
    
    const handleForgotPassword = (e: React.FormEvent) => {
        e.preventDefault();
        setForgotError('');

        if (!forgotEmail) {
            setForgotError('Please enter your email address.');
            return;
        }

        try {
            const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
            const userExists = users.some(u => u.email.toLowerCase() === forgotEmail.toLowerCase());

            // For security, we show a success message even if the user doesn't exist.
            // This prevents user enumeration attacks.
            console.log(`Password reset requested for ${forgotEmail}. User exists: ${userExists}.`);
            console.log('In a real app, an email would be sent with a password reset link.');
            
            setView('forgot_confirmation');

        } catch (error) {
            console.error("Forgot password check failed:", error);
            setForgotError('An error occurred. Please try again later.');
        }
    };

    const renderLogin = () => (
         <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-2xl font-bold text-yellow-400 text-center">Welcome Back</h2>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 pb-2">Please log in to continue.</p>
            <input
                type="email"
                placeholder="Email Address"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                required
            />
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-5 w-5 rounded border-gray-400 dark:border-gray-500 bg-gray-200 dark:bg-gray-700 text-yellow-500 focus:ring-yellow-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Remember me</span>
                </label>
                <button type="button" onClick={() => setView('forgot')} className="text-sm font-semibold text-yellow-400 hover:underline">
                    Forgot Password?
                </button>
            </div>
            
            {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}

            <button type="submit" className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full transition-colors font-bold text-lg">
                Log In
            </button>
            
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
                Don't have an account?{' '}
                <button type="button" onClick={() => setView('register')} className="font-semibold text-yellow-400 hover:underline">
                    Register
                </button>
            </p>
        </form>
    );

    const renderRegister = () => (
        <form onSubmit={handleRegister} className="space-y-4">
            <h2 className="text-2xl font-bold text-yellow-400 text-center">Create Account</h2>
            <input
                type="text"
                placeholder="Full Name"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                required
            />
            <input
                type="email"
                placeholder="Email Address"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                required
            />
             <div>
                <input
                    type="password"
                    placeholder="Password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                    required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">8+ characters, with uppercase, lowercase, number, & special character.</p>
            </div>
            <input
                type="password"
                placeholder="Confirm Password"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                required
            />
            <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={regIsSurvivor}
                        onChange={(e) => setRegIsSurvivor(e.target.checked)}
                        className="mt-1 h-5 w-5 rounded border-gray-400 dark:border-gray-500 bg-gray-200 dark:bg-gray-700 text-yellow-500 focus:ring-yellow-500"
                    />
                    <div>
                        <span className="text-gray-900 dark:text-white font-semibold">I am a survivor of GBV.</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Selecting this helps us personalize your safety features. Your privacy is protected.
                        </p>
                    </div>
                </label>
            </div>

            {regError && <p className="text-red-400 text-sm text-center">{regError}</p>}
            
            <button type="submit" className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full transition-colors font-bold text-lg">
                Register
            </button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
                Already have an account?{' '}
                <button type="button" onClick={() => setView('login')} className="font-semibold text-yellow-400 hover:underline">
                    Log In
                </button>
            </p>
        </form>
    );
    
    const renderForgot = () => (
        <form onSubmit={handleForgotPassword} className="space-y-4">
            <h2 className="text-2xl font-bold text-yellow-400 text-center">Reset Password</h2>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 pb-2">Enter your email and we'll send you instructions to reset your password.</p>
            <input
                type="email"
                placeholder="Email Address"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                required
                autoFocus
            />
            
            {forgotError && <p className="text-red-400 text-sm text-center">{forgotError}</p>}

            <button type="submit" className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full transition-colors font-bold text-lg">
                Send Reset Instructions
            </button>
            
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
                Remember your password?{' '}
                <button type="button" onClick={() => setView('login')} className="font-semibold text-yellow-400 hover:underline">
                    Back to Login
                </button>
            </p>
        </form>
    );
    
    const renderForgotConfirmation = () => (
        <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-yellow-400">Check Your Email</h2>
            <p className="text-gray-700 dark:text-gray-300">
                If an account exists for <strong>{forgotEmail}</strong>, you will receive an email with instructions on how to reset your password.
            </p>
            <button 
                type="button" 
                onClick={() => setView('login')} 
                className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full transition-colors font-bold text-lg"
            >
                Back to Login
            </button>
        </div>
    );

    const renderView = () => {
        switch (view) {
            case 'login':
                return renderLogin();
            case 'register':
                return renderRegister();
            case 'forgot':
                return renderForgot();
            case 'forgot_confirmation':
                return renderForgotConfirmation();
            default:
                return renderLogin();
        }
    };


    return (
        <div className="w-full max-w-md mx-auto p-4 md:p-8">
            <MphakathiLogo />
            
            <div className="bg-white/80 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
                {renderView()}
            </div>
            
            <footer className="text-center mt-8">
                <MamafaLogo />
            </footer>
        </div>
    );
};

export default Auth;