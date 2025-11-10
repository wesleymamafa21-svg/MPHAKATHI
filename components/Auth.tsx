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
    password?: string;
}

type AuthView = 'login' | 'register' | 'forgot' | 'forgot_confirmation';

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
    const [view, setView] = useState<AuthView>('login');
    
    // Login State
    const [loginEmail, setLoginEmail] = useState('survivor@mphakathi.app');
    const [loginPassword, setLoginPassword] = useState('Password123!');
    const [loginError, setLoginError] = useState('');

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

    // Seed the mock user database with a demo user if it doesn't exist
    useEffect(() => {
        try {
            const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
            const demoUserExists = users.some(u => u.email === 'survivor@mphakathi.app');

            if (!demoUserExists) {
                const demoUser: StoredUser = {
                    id: 'demo-user-survivor-1',
                    fullName: 'Jane Survivor',
                    email: 'survivor@mphakathi.app',
                    password: 'Password123!',
                    gender: Gender.Woman,
                    isSurvivor: true,
                };
                users.push(demoUser);
                localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
            }
        } catch (error) {
            console.error("Failed to initialize user database:", error);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');

        try {
            const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
            const user = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());

            if (user && user.password === loginPassword) {
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
        if (regPassword.length < 8) {
            setRegError('Password must be at least 8 characters long.');
            return;
        }
        
        try {
            const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
            const existingUser = users.find(u => u.email.toLowerCase() === regEmail.toLowerCase());

            if (existingUser) {
                setRegError('A user with this email already exists.');
                return;
            }

            // In a real app, password would be securely hashed on the backend before storage.
            const newUser: StoredUser = {
                id: crypto.randomUUID(),
                fullName: regFullName,
                email: regEmail,
                password: regPassword, // Storing plain text for demo purposes only.
                gender: null, // User can set this in their profile later
                isSurvivor: regIsSurvivor,
            };

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
            <p className="text-center text-sm text-gray-400 pb-2">Login with the demo account or one you've registered.</p>
            <input
                type="email"
                placeholder="Email Address"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-yellow-500"
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-yellow-500"
                required
            />
            <div className="text-right">
                <button type="button" onClick={() => setView('forgot')} className="text-sm font-semibold text-yellow-400 hover:underline">
                    Forgot Password?
                </button>
            </div>
            
            {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}

            <button type="submit" className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full transition-colors font-bold text-lg">
                Log In
            </button>
            
            <p className="text-center text-sm text-gray-400 pt-2">
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
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-yellow-500"
                required
            />
            <input
                type="email"
                placeholder="Email Address"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-yellow-500"
                required
            />
            <input
                type="password"
                placeholder="Password (min. 8 characters)"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-yellow-500"
                required
            />
            <input
                type="password"
                placeholder="Confirm Password"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-yellow-500"
                required
            />
            <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={regIsSurvivor}
                        onChange={(e) => setRegIsSurvivor(e.target.checked)}
                        className="mt-1 h-5 w-5 rounded border-gray-500 bg-gray-700 text-yellow-500 focus:ring-yellow-500"
                    />
                    <div>
                        <span className="text-white font-semibold">I am a survivor of GBV.</span>
                        <p className="text-xs text-gray-400 mt-1">
                            Selecting this helps us personalize your safety features. Your privacy is protected.
                        </p>
                    </div>
                </label>
            </div>

            {regError && <p className="text-red-400 text-sm text-center">{regError}</p>}
            
            <button type="submit" className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full transition-colors font-bold text-lg">
                Register
            </button>

            <p className="text-center text-sm text-gray-400 pt-2">
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
            <p className="text-center text-sm text-gray-400 pb-2">Enter your email and we'll send you instructions to reset your password.</p>
            <input
                type="email"
                placeholder="Email Address"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-yellow-500"
                required
                autoFocus
            />
            
            {forgotError && <p className="text-red-400 text-sm text-center">{forgotError}</p>}

            <button type="submit" className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full transition-colors font-bold text-lg">
                Send Reset Instructions
            </button>
            
            <p className="text-center text-sm text-gray-400 pt-2">
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
            <p className="text-gray-300">
                If an account exists for <strong>{forgotEmail}</strong>, you will receive an email with instructions on how to reset your password.
            </p>
            <button 
                type="button" 
                onClick={() => setView('login')} 
                className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors font-bold text-lg"
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
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                {renderView()}
            </div>
            
            <footer className="text-center mt-8">
                <MamafaLogo />
            </footer>
        </div>
    );
};

export default Auth;