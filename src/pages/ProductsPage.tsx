import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Plus, Minus, ChevronRight, CheckCircle2, Globe } from 'lucide-react';
import { PRODUCT_ITEMS, ProductItem } from '@/src/constants';
import { cn } from '@/src/lib/utils';
import { db, auth, handleFirestoreError, OperationType } from '@/src/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [isTabOpen, setIsTabOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const categories = ['All', 'Premium Dates', 'Standard Dates', 'Bulk Packaging', 'Specialty'];

  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return PRODUCT_ITEMS;
    return PRODUCT_ITEMS.filter(item => item.category === activeCategory);
  }, [activeCategory]);

  const addToCart = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[id] > 1) {
        newCart[id]--;
      } else {
        delete newCart[id];
      }
      return newCart;
    });
  };

  const cartTotal = useMemo(() => {
    return Object.entries(cart).reduce((total, [id, quantity]) => {
      const item = PRODUCT_ITEMS.find(i => i.id === id);
      return total + (Number(item?.price) || 0) * Number(quantity);
    }, 0);
  }, [cart]);

  const cartCount: number = (Object.values(cart) as number[]).reduce((a, b) => a + b, 0);

  const submitRFQ = async () => {
    if (cartCount === 0 || isOrdering) return;
    
    setIsOrdering(true);
    const path = 'rfqs'; // Request for Quote
    
    try {
      const orderItems = Object.entries(cart).map(([id, quantity]) => {
        const item = PRODUCT_ITEMS.find(i => i.id === id);
        return {
          name: item?.name || 'Unknown Item',
          quantity,
          price: item?.price || 0
        };
      });

      await addDoc(collection(db, path), {
        items: orderItems,
        status: 'pending',
        timestamp: serverTimestamp(),
        estimatedTotal: cartTotal,
        userId: auth.currentUser?.uid || null,
        userEmail: auth.currentUser?.email || 'Guest',
      });

      setOrderComplete(true);
      setCart({});
      setIsTabOpen(false);
      
      setTimeout(() => setOrderComplete(false), 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-gray-900 pb-32">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-wood/10 dark:border-gray-700 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Product Catalog</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest">Global Export</p>
            </div>
            <div className="flex items-center gap-2 text-sage">
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium">Worldwide Shipping</span>
            </div>
          </div>
          
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  activeCategory === cat 
                    ? "bg-sage text-gray-900 shadow-sm" 
                    : "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-wood/10 dark:border-gray-600 hover:border-sage/50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {orderComplete && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-sage text-gray-900 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-bold"
          >
            <CheckCircle2 className="w-5 h-5" /> RFQ Submitted Successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Items */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <motion.div
              layout
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-wood/10 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  {item.category}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white">{item.name}</h3>
                  <p className="font-serif font-bold text-sage">${item.price.toFixed(2)}</p>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2">{item.description}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  {cart[item.id] ? (
                    <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700 rounded-full p-1 w-full justify-between">
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="w-10 h-10 rounded-full bg-white dark:bg-gray-600 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-sage transition-colors"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="font-bold w-4 text-center text-gray-900 dark:text-white">{cart[item.id]}</span>
                      <button 
                        onClick={() => addToCart(item.id)}
                        className="w-10 h-10 rounded-full bg-sage text-gray-900 shadow-sm flex items-center justify-center hover:bg-opacity-80 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => addToCart(item.id)}
                      className="w-full py-3 bg-gray-50 dark:bg-gray-700 hover:bg-sage hover:text-gray-900 text-gray-900 dark:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add to Inquiry
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating RFQ Cart Button */}
      <AnimatePresence>
        {cartCount > 0 && !isTabOpen && (
          <motion.button
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={() => setIsTabOpen(true)}
            className="fixed bottom-20 md:bottom-8 right-4 md:right-8 bg-sage text-gray-900 px-6 py-4 rounded-full shadow-2xl flex items-center gap-4 hover:scale-105 transition-transform z-40"
          >
            <div className="relative">
              <ShoppingBag className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-gray-900 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">
                {cartCount}
              </span>
            </div>
            <span className="font-bold">View Inquiry</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* RFQ Cart Drawer */}
      <AnimatePresence>
        {isTabOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTabOpen(false)}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-wood/10 dark:border-gray-700 flex items-center justify-between bg-cream dark:bg-gray-900">
                <h2 className="text-2xl font-serif font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                  <ShoppingBag className="w-6 h-6 text-sage" /> Your Inquiry
                </h2>
                <button 
                  onClick={() => setIsTabOpen(false)}
                  className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6">
                {cartCount === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-4">
                    <ShoppingBag className="w-16 h-16 opacity-20" />
                    <p className="font-medium text-lg">Your inquiry list is empty</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(cart).map(([id, quantity]) => {
                      const item = PRODUCT_ITEMS.find(i => i.id === id);
                      if (!item) return null;
                      return (
                        <div key={id} className="flex gap-4">
                          <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-2xl" referrerPolicy="no-referrer" />
                          <div className="flex-grow">
                            <h4 className="font-bold text-gray-900 dark:text-white">{item.name}</h4>
                            <p className="text-sage font-bold text-sm mb-2">${item.price.toFixed(2)}</p>
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 w-fit rounded-full p-1">
                              <button onClick={() => removeFromCart(id)} className="w-6 h-6 rounded-full bg-white dark:bg-gray-600 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-bold text-sm w-4 text-center text-gray-900 dark:text-white">{quantity}</span>
                              <button onClick={() => addToCart(id)} className="w-6 h-6 rounded-full bg-sage text-gray-900 shadow-sm flex items-center justify-center">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="font-serif font-bold text-gray-900 dark:text-white">
                            ${(item.price * Number(quantity)).toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {cartCount > 0 && (
                <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-wood/10 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Estimated Total</span>
                    <span className="text-2xl font-serif font-bold text-gray-900 dark:text-white">${cartTotal.toFixed(2)}</span>
                  </div>
                  
                  <button 
                    onClick={submitRFQ}
                    disabled={isOrdering}
                    className="w-full py-4 bg-sage text-gray-900 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-50"
                  >
                    {isOrdering ? 'Submitting...' : 'Submit Request for Quote'}
                  </button>
                  <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
                    Our sales team will contact you within 24 hours with a formal quote including shipping.
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
