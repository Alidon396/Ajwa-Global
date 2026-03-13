import { ReactNode, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Utensils, LogOut, User, Menu, X, Moon, Sun, MessageCircle, Mail, Phone } from 'lucide-react';
import { auth } from '@/src/firebase';
import { signOut } from 'firebase/auth';
import { useUser } from '@/src/contexts/UserContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, role } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 glass shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Utensils className="w-8 h-8 text-sage" />
            <span className="text-xl font-serif font-semibold tracking-tight">Ajwa Global</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium hover:text-sage transition-colors">Home</Link>
            <Link to="/products" className="text-sm font-medium hover:text-sage transition-colors">Products</Link>
            {role === 'admin' && (
              <Link to="/leads" className="text-sm font-medium hover:text-sage transition-colors">Leads</Link>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-500 hover:text-sage transition-colors rounded-full"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {user ? (
              <div className="flex items-center gap-3">
                <Link 
                  to="/profile"
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-sage transition-colors"
                  title="View Profile"
                >
                  {user.displayName || user.email}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-sage transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-sage transition-colors"
              >
                <User className="w-4 h-4" />
                Sign In
              </Link>
            )}
            <Link 
              to="/products" 
              className="px-4 py-2 bg-sage text-gray-900 rounded-full text-sm font-medium hover:bg-opacity-80 transition-all"
            >
              Request Quote
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 hover:text-sage transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -mr-2 text-gray-600 hover:text-sage transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-lg py-4 px-4 flex flex-col gap-4">
            <nav className="flex flex-col gap-2">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-base font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">Home</Link>
              <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-base font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">Products</Link>
              {role === 'admin' && (
                <Link to="/leads" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-base font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">Leads</Link>
              )}
            </nav>
            
            <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />
            
            <div className="flex flex-col gap-3">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Signed in as {user.displayName || user.email}
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-base font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-left"
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-2 px-4 py-3 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-base font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <User className="w-5 h-5" />
                  Sign In
                </Link>
              )}
              <Link 
                to="/products" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-2 flex items-center justify-center px-4 py-3 bg-sage text-gray-900 rounded-xl text-base font-medium hover:bg-opacity-80 transition-all"
              >
                Request Quote
              </Link>
            </div>
          </div>
        )}
      </header>
      <main className="flex-grow pb-16 md:pb-0">
        {children}
      </main>
      <footer className="bg-cream dark:bg-gray-900 border-t border-wood/20 dark:border-gray-800 py-12 transition-colors duration-200 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">© 2026 Ajwa Global. All rights reserved.</p>
        </div>
      </footer>

      {/* Sticky Quick Action Bar (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 flex justify-around items-center p-3">
        <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 text-green-600 dark:text-green-500">
          <MessageCircle className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase">WhatsApp</span>
        </a>
        <a href="mailto:export@ajwaglobal.com" className="flex flex-col items-center gap-1 text-blue-600 dark:text-blue-500">
          <Mail className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase">Email</span>
        </a>
        <a href="tel:+1234567890" className="flex flex-col items-center gap-1 text-sage">
          <Phone className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase">Call</span>
        </a>
      </div>
    </div>
  );
}
