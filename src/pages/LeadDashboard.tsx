import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, CheckCircle2, AlertCircle, LogIn, BarChart3, History, Users, Mail, Phone, FileText } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { db, auth, handleFirestoreError, OperationType } from '@/src/firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useUser } from '@/src/contexts/UserContext';

interface RFQ {
  id: string;
  userEmail: string;
  userId: string | null;
  items: { name: string; quantity: number; price: number }[];
  timestamp: Timestamp;
  status: 'pending' | 'reviewing' | 'quoted' | 'closed';
  estimatedTotal: number;
}

export default function LeadDashboard() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'reports'>('active');
  const { role, loading: userLoading } = useUser();
  const isAdmin = role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;

    const path = 'rfqs';
    const q = query(collection(db, path), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newRfqs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RFQ[];
      setRfqs(newRfqs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const updateStatus = async (id: string, status: RFQ['status']) => {
    const path = `rfqs/${id}`;
    try {
      await updateDoc(doc(db, 'rfqs', id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const activeRfqs = useMemo(() => rfqs.filter(r => r.status !== 'closed' && r.status !== 'quoted'), [rfqs]);
  const historyRfqs = useMemo(() => rfqs.filter(r => r.status === 'closed' || r.status === 'quoted'), [rfqs]);

  const reports = useMemo(() => {
    const totalValue = historyRfqs.reduce((sum, rfq) => sum + (rfq.estimatedTotal || 0), 0);

    const itemCounts: Record<string, number> = {};
    historyRfqs.forEach(rfq => {
      rfq.items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });

    const popularItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalValue,
      totalRfqs: historyRfqs.length,
      popularItems
    };
  }, [historyRfqs]);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-3xl p-8 text-center border border-gray-700">
          <Users className="w-16 h-16 text-sage mx-auto mb-6" />
          <h2 className="text-2xl font-serif font-bold text-white mb-4">Staff Access Only</h2>
          <p className="text-gray-400 mb-8">Please sign in with an authorized account to access the Lead Management Dashboard.</p>
          <button
            onClick={handleLogin}
            className="w-full py-4 bg-sage text-gray-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-80 transition-all"
          >
            <LogIn className="w-4 h-4" /> Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-serif font-bold flex items-center gap-3">
              <Users className="text-sage" /> Lead Management
            </h1>
            <p className="text-gray-400 mt-1">Manage RFQs and client inquiries for Ajwa Global</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500 uppercase tracking-widest">Active RFQs</p>
              <p className="text-2xl font-bold">{activeRfqs.length}</p>
            </div>
            <div className="w-px h-10 bg-gray-800 hidden sm:block" />
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-widest">Staff</p>
              <p className="text-sm font-bold text-sage truncate max-w-[150px]">{auth.currentUser?.email}</p>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800 pb-px">
          <button
            onClick={() => setActiveTab('active')}
            className={cn(
              "pb-4 px-2 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors",
              activeTab === 'active' ? "border-sage text-sage" : "border-transparent text-gray-500 hover:text-gray-300"
            )}
          >
            <FileText className="w-4 h-4" /> Active RFQs
            {activeRfqs.length > 0 && (
              <span className="bg-sage text-gray-900 px-2 py-0.5 rounded-full text-[10px] ml-1">
                {activeRfqs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "pb-4 px-2 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors",
              activeTab === 'history' ? "border-sage text-sage" : "border-transparent text-gray-500 hover:text-gray-300"
            )}
          >
            <History className="w-4 h-4" /> History
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={cn(
              "pb-4 px-2 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors",
              activeTab === 'reports' ? "border-sage text-sage" : "border-transparent text-gray-500 hover:text-gray-300"
            )}
          >
            <BarChart3 className="w-4 h-4" /> Reports
          </button>
        </div>

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700">
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Total Quoted Value</p>
                <p className="text-4xl font-serif font-bold text-sage">${reports.totalValue.toFixed(2)}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700">
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Processed RFQs</p>
                <p className="text-4xl font-serif font-bold text-white">{reports.totalRfqs}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700">
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Avg RFQ Value</p>
                <p className="text-4xl font-serif font-bold text-white">
                  ${reports.totalRfqs > 0 ? (reports.totalValue / reports.totalRfqs).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-sage" /> Most Requested Items
              </h3>
              {reports.popularItems.length > 0 ? (
                <div className="space-y-4">
                  {reports.popularItems.map(([name, count], idx) => (
                    <div key={name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 font-bold w-4">{idx + 1}.</span>
                        <span className="font-medium">{name}</span>
                      </div>
                      <span className="bg-gray-700 px-3 py-1 rounded-full text-sm font-bold text-sage">
                        {count} units requested
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No data available yet.</p>
              )}
            </div>
          </div>
        )}

        {(activeTab === 'active' || activeTab === 'history') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {(activeTab === 'active' ? activeRfqs : historyRfqs).map((rfq) => (
              <motion.div
                layout
                key={rfq.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={cn(
                  "bg-gray-800 rounded-3xl border-2 overflow-hidden flex flex-col",
                  rfq.status === 'pending' ? "border-sage/30" : "border-gray-700"
                )}
              >
                {/* RFQ Header */}
                <div className={cn(
                  "p-6 flex items-center justify-between",
                  rfq.status === 'pending' ? "bg-sage/10" : "bg-gray-700/30"
                )}>
                  <div className="flex-grow">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Client Email</p>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <h2 className="text-lg font-bold truncate max-w-[200px]">{rfq.userEmail}</h2>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-gray-400 text-sm mb-1">
                      <Clock className="w-3 h-3" />
                      {rfq.timestamp ? `${Math.floor((Date.now() - rfq.timestamp.toMillis()) / 60000)}m ago` : 'Just now'}
                    </div>
                    {rfq.status === 'pending' && (
                      <span className="px-2 py-1 bg-sage/20 text-sage text-[10px] font-bold uppercase rounded-md flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> New RFQ
                      </span>
                    )}
                    {rfq.status === 'reviewing' && (
                      <span className="px-2 py-1 bg-blue-900/50 text-blue-400 text-[10px] font-bold uppercase rounded-md">
                        Reviewing
                      </span>
                    )}
                    {rfq.status === 'quoted' && (
                      <span className="px-2 py-1 bg-green-900/50 text-green-400 text-[10px] font-bold uppercase rounded-md">
                        Quoted
                      </span>
                    )}
                  </div>
                </div>

                {/* RFQ Items */}
                <div className="p-6 flex-grow space-y-4">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Requested Items</p>
                  {rfq.items.map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-700 rounded-md flex items-center justify-center text-xs font-bold text-sage">
                          {item.quantity}x
                        </div>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm text-gray-400">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-gray-700 flex justify-between items-center">
                    <span className="text-sm text-gray-400">Est. Total</span>
                    <span className="font-bold text-sage">${rfq.estimatedTotal?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>

                {/* Actions */}
                {activeTab === 'active' && (
                  <div className="p-4 bg-gray-900/50 border-t border-gray-700 mt-auto flex gap-2">
                    {rfq.status === 'pending' && (
                      <button 
                        onClick={() => updateStatus(rfq.id, 'reviewing')}
                        className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all text-sm"
                      >
                        Start Review
                      </button>
                    )}
                    {(rfq.status === 'pending' || rfq.status === 'reviewing') && (
                      <button 
                        onClick={() => updateStatus(rfq.id, 'quoted')}
                        className="flex-1 py-3 bg-sage text-gray-900 hover:bg-opacity-90 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Mark Quoted
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        )}

        {activeTab === 'active' && activeRfqs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-gray-600">
            <FileText className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-xl font-serif italic">No active RFQs at the moment</p>
          </div>
        )}

        {activeTab === 'history' && historyRfqs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-gray-600">
            <History className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-xl font-serif italic">No processed RFQs yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
