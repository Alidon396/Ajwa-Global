import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/src/firebase';
import { getAuthErrorMessage } from '@/src/utils/authErrors';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkEmailLink = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let emailForSignIn = window.localStorage.getItem('emailForSignIn');
        if (!emailForSignIn) {
          emailForSignIn = window.prompt('Please provide your email for confirmation');
        }
        if (emailForSignIn) {
          setLoading(true);
          try {
            await signInWithEmailLink(auth, emailForSignIn, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            navigate('/');
          } catch (err: any) {
            setError(getAuthErrorMessage(err));
          } finally {
            setLoading(false);
          }
        }
      }
    };
    checkEmailLink();
  }, [navigate]);

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address to reset your password.');
      return;
    }
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email address to receive a magic link.');
      return;
    }
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const actionCodeSettings = {
        url: window.location.origin + '/login',
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setMessage('Magic link sent! Check your email to sign in securely without a password.');
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (isLogin) {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        if (!userCred.user.emailVerified) {
          await sendEmailVerification(userCred.user);
          await signOut(auth);
          setError('Please verify your email before logging in. A new verification link has been sent to your inbox.');
          return;
        }
        navigate('/');
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCred.user.uid), {
          role: 'customer',
          email: userCred.user.email,
          createdAt: serverTimestamp()
        });
        await sendEmailVerification(userCred.user);
        await signOut(auth);
        setMessage('Account created! Please check your email to verify your account before logging in.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleProviderAuth = async (provider: GoogleAuthProvider | FacebookAuthProvider) => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const userCred = await signInWithPopup(auth, provider);
      const userDocRef = doc(db, 'users', userCred.user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          role: 'customer',
          email: userCred.user.email,
          createdAt: serverTimestamp()
        });
      }
      navigate('/');
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-wood/10 dark:border-gray-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {isLogin ? 'Sign in to access your account' : 'Join us to start ordering'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-xl text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sage focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sage focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
            {isLogin && (
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-sm text-sage font-medium hover:underline"
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-sage text-gray-900 font-medium rounded-xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <button
              onClick={handleMagicLink}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 font-medium text-gray-700 dark:text-gray-300"
            >
              <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              Send Magic Link (Passwordless)
            </button>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleProviderAuth(new GoogleAuthProvider())}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button
                onClick={() => handleProviderAuth(new FacebookAuthProvider())}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sage font-semibold hover:underline"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
