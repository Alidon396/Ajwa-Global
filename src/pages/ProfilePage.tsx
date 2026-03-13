import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '@/src/firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { User, Mail, Save, ArrowLeft, Clock, ShoppingBag, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { useUser } from '@/src/contexts/UserContext';

interface RFQ {
  id: string;
  items: { name: string; quantity: number; price: number }[];
  timestamp: Timestamp;
  status: 'pending' | 'reviewing' | 'quoted' | 'closed';
  estimatedTotal: number;
}

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [rfqsLoading, setRfqsLoading] = useState(true);
  const navigate = useNavigate();

  const { user, loading: userLoading } = useUser();

  useEffect(() => {
    if (userLoading) return;
    
    if (!user) {
      navigate('/login');
    } else {
      setDisplayName(user.displayName || '');
      
      const path = 'rfqs';
      const q = query(
        collection(db, path),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newRfqs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as RFQ[];
        setRfqs(newRfqs);
        setRfqsLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
        setRfqsLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user, userLoading, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await updateProfile(user, { displayName });
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] px-4 py-12 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 text-gray-500 hover:text-sage transition-colors rounded-full"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">
          Your Profile
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Form */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-wood/10 dark:border-gray-700">
            <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-6">
              Account Details
            </h3>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 rounded-xl text-sm">
                {message}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    disabled
                    value={user.email || ''}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Email cannot be changed here.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sage focus:border-transparent transition-all"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || displayName === (user.displayName || '')}
                className="w-full py-3 px-4 bg-sage text-gray-900 font-medium rounded-xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* RFQ History */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-wood/10 dark:border-gray-700 h-full">
            <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-sage" /> RFQ History
            </h3>

            {rfqsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin" />
              </div>
            ) : rfqs.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>You haven't submitted any RFQs yet.</p>
                <button 
                  onClick={() => navigate('/products')}
                  className="mt-4 text-sage hover:underline font-medium"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {rfqs.map((rfq) => (
                  <div 
                    key={rfq.id} 
                    className="border border-gray-100 dark:border-gray-700 rounded-xl p-5 hover:border-sage/30 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                          <Clock className="w-4 h-4" />
                          {rfq.timestamp ? new Date(rfq.timestamp.toMillis()).toLocaleString() : 'Just now'}
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          RFQ ID: {rfq.id.slice(0, 8)}...
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase rounded-md ${
                          rfq.status === 'quoted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          rfq.status === 'closed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' :
                          rfq.status === 'reviewing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-sage/20 text-sage'
                        }`}>
                          {rfq.status === 'quoted' && <CheckCircle2 className="w-3 h-3" />}
                          {rfq.status === 'closed' && <CheckCircle2 className="w-3 h-3" />}
                          {rfq.status === 'reviewing' && <Clock className="w-3 h-3" />}
                          {rfq.status === 'pending' && <AlertCircle className="w-3 h-3" />}
                          {rfq.status}
                        </span>
                        <p className="font-serif font-bold text-lg mt-2 text-gray-900 dark:text-white">
                          Est: ${rfq.estimatedTotal?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                      <ul className="space-y-2">
                        {rfq.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">
                              <span className="font-medium text-gray-900 dark:text-white mr-2">{item.quantity}x</span>
                              {item.name}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
