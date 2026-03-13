import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, CheckCircle2, Utensils, AlertCircle, LogIn, BarChart3, History, ChefHat } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { db, auth, handleFirestoreError, OperationType } from '@/src/firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useUser } from '@/src/contexts/UserContext';

interface Order {
  id: string;
  table: string;
  items: { name: string; quantity: number }[];
  timestamp: Timestamp;
  status: 'pending' | 'preparing' | 'done';
  paymentType?: 'prepaid' | 'postpaid';
  orderType?: 'dine-in' | 'takeaway' | 'delivery';
}

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'live' | 'history' | 'reports'>('live');
  const { role, loading: userLoading } = useUser();
  const isAdmin = role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;

    const path = 'orders';
    const q = query(collection(db, path), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(newOrders);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const updateStatus = async (id: string, status: Order['status']) => {
    const path = `orders/${id}`;
    try {
      await updateDoc(doc(db, 'orders', id), { status });
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

  const liveOrders = useMemo(() => orders.filter(o => o.status !== 'done'), [orders]);
  const historyOrders = useMemo(() => orders.filter(o => o.status === 'done'), [orders]);

  const reports = useMemo(() => {
    const totalRevenue = historyOrders.reduce((sum, order) => {
      // Assuming order total is stored or calculated. If not stored, we calculate from items.
      // Wait, let's check if total is in the Order interface. It's not in the interface above, let's add it or calculate it.
      // Actually, looking at the interface, total is not there. Let's calculate from items if possible, or just count orders.
      // I'll add total to the interface if it's in the DB. MenuPage adds `total: cartTotal`.
      return sum + ((order as any).total || 0);
    }, 0);

    const itemCounts: Record<string, number> = {};
    historyOrders.forEach(order => {
      order.items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });

    const popularItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalRevenue,
      totalOrders: historyOrders.length,
      popularItems
    };
  }, [historyOrders]);

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
          <Utensils className="w-16 h-16 text-sage mx-auto mb-6" />
          <h2 className="text-2xl font-serif font-bold text-white mb-4">Staff Access Only</h2>
          <p className="text-gray-400 mb-8">Please sign in with an authorized account to access the Kitchen Display System.</p>
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
              <Utensils className="text-sage" /> Kitchen Display System
            </h1>
            <p className="text-gray-400 mt-1">Real-time order management for Ajwa Global</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500 uppercase tracking-widest">Active Orders</p>
              <p className="text-2xl font-bold">{liveOrders.length}</p>
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
            onClick={() => setActiveTab('live')}
            className={cn(
              "pb-4 px-2 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors",
              activeTab === 'live' ? "border-sage text-sage" : "border-transparent text-gray-500 hover:text-gray-300"
            )}
          >
            <ChefHat className="w-4 h-4" /> Live Orders
            {liveOrders.length > 0 && (
              <span className="bg-sage text-gray-900 px-2 py-0.5 rounded-full text-[10px] ml-1">
                {liveOrders.length}
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
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Total Revenue</p>
                <p className="text-4xl font-serif font-bold text-sage">${reports.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700">
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Completed Orders</p>
                <p className="text-4xl font-serif font-bold text-white">{reports.totalOrders}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700">
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Avg Order Value</p>
                <p className="text-4xl font-serif font-bold text-white">
                  ${reports.totalOrders > 0 ? (reports.totalRevenue / reports.totalOrders).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-sage" /> Popular Items
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
                        {count} ordered
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

        {(activeTab === 'live' || activeTab === 'history') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {(activeTab === 'live' ? liveOrders : historyOrders).map((order) => (
              <motion.div
                layout
                key={order.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={cn(
                  "bg-gray-800 rounded-3xl border-2 overflow-hidden flex flex-col",
                  order.status === 'pending' ? "border-sage/30" : "border-gray-700"
                )}
              >
                {/* Order Header */}
                <div className={cn(
                  "p-6 flex items-center justify-between",
                  order.status === 'pending' ? "bg-sage/10" : "bg-gray-700/30"
                )}>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Table</p>
                    <h2 className="text-3xl font-bold">{order.table}</h2>
                    <div className="flex gap-2 mt-2">
                      {order.orderType && (
                        <span className="px-2 py-0.5 bg-gray-600 text-white text-[10px] font-bold uppercase rounded">
                          {order.orderType}
                        </span>
                      )}
                      {order.paymentType && (
                        <span className={cn(
                          "px-2 py-0.5 text-[10px] font-bold uppercase rounded",
                          order.paymentType === 'prepaid' ? "bg-green-900/50 text-green-400" : "bg-orange-900/50 text-orange-400"
                        )}>
                          {order.paymentType}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-gray-400 text-sm mb-1">
                      <Clock className="w-3 h-3" />
                      {order.timestamp ? `${Math.floor((Date.now() - order.timestamp.toMillis()) / 60000)}m ago` : 'Just now'}
                    </div>
                    {order.status === 'pending' && (
                      <span className="px-2 py-1 bg-sage/20 text-sage text-[10px] font-bold uppercase rounded-md flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> New Order
                      </span>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6 flex-grow space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-700 rounded-md flex items-center justify-center text-xs font-bold">
                          {item.quantity}
                        </div>
                        <span className="text-lg font-medium">{item.name}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                {activeTab === 'live' && (
                  <div className="p-4 bg-gray-900/50 border-t border-gray-700 mt-auto">
                    {order.status === 'pending' ? (
                      <button 
                        onClick={() => updateStatus(order.id, 'preparing')}
                        className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all"
                      >
                        Start Preparing
                      </button>
                    ) : (
                      <button 
                        onClick={() => updateStatus(order.id, 'done')}
                        className="w-full py-3 bg-sage text-gray-900 hover:bg-opacity-90 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <CheckCircle2 className="w-5 h-5" /> Mark as Done
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        )}

        {activeTab === 'live' && liveOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-gray-600">
            <Utensils className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-xl font-serif italic">No active orders in the kitchen</p>
          </div>
        )}

        {activeTab === 'history' && historyOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-gray-600">
            <History className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-xl font-serif italic">No completed orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
