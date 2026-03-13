import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Plus, Minus, ChevronRight, Info, CheckCircle2, MapPin } from 'lucide-react';
import { MENU_ITEMS, MenuItem } from '@/src/constants';
import { cn } from '@/src/lib/utils';
import { db, auth, handleFirestoreError, OperationType } from '@/src/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Example coordinates for Ajwa Global (can be adjusted)
const AJWA_GLOBAL_LOCATION = { lat: 3.1390, lng: 101.6869 };

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
}

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table') || 'General';
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [isTabOpen, setIsTabOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [paymentType, setPaymentType] = useState<'prepaid' | 'postpaid'>('postpaid');
  const [isAtRestaurant, setIsAtRestaurant] = useState<boolean>(true);
  const [locationLoading, setLocationLoading] = useState<boolean>(true);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const distance = calculateDistance(latitude, longitude, AJWA_GLOBAL_LOCATION.lat, AJWA_GLOBAL_LOCATION.lng);
          // Assuming within 500 meters is "at the restaurant"
          const atRestaurant = distance < 0.5 || tableNumber !== 'General';
          setIsAtRestaurant(atRestaurant);
          if (!atRestaurant) {
            setPaymentType('prepaid'); // Default remote orders to prepaid
          }
          setLocationLoading(false);
        },
        (error) => {
          console.warn("Geolocation error:", error);
          // Fallback: if they scanned a specific table QR, assume they are there
          setIsAtRestaurant(tableNumber !== 'General');
          setLocationLoading(false);
        },
        { timeout: 10000 }
      );
    } else {
      setIsAtRestaurant(tableNumber !== 'General');
      setLocationLoading(false);
    }
  }, [tableNumber]);

  const categories = ['All', 'Appetizers', 'Mains', 'Drinks', 'Birthday Specials'];

  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return MENU_ITEMS;
    return MENU_ITEMS.filter(item => item.category === activeCategory);
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
      const item = MENU_ITEMS.find(i => i.id === id);
      return total + (Number(item?.price) || 0) * Number(quantity);
    }, 0);
  }, [cart]);

  const cartCount: number = (Object.values(cart) as number[]).reduce((a, b) => a + b, 0);

  const sendToKitchen = async () => {
    if (cartCount === 0 || isOrdering) return;
    
    setIsOrdering(true);
    const path = 'orders';
    
    try {
      const orderItems = Object.entries(cart).map(([id, quantity]) => {
        const item = MENU_ITEMS.find(i => i.id === id);
        return {
          name: item?.name || 'Unknown Item',
          quantity,
          price: item?.price || 0
        };
      });

      await addDoc(collection(db, path), {
        table: tableNumber,
        items: orderItems,
        status: 'pending',
        timestamp: serverTimestamp(),
        total: cartTotal,
        userId: auth.currentUser?.uid || null,
        paymentType,
        orderType: isAtRestaurant ? 'dine-in' : 'delivery'
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
    <div className="min-h-screen bg-cream pb-32">
      {/* Header */}
      <div className="bg-white border-b border-wood/10 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-serif font-bold">Digital Menu</h1>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Table {tableNumber}</p>
            </div>
            <div className="flex items-center gap-2 text-sage">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-medium">
                {locationLoading ? 'Locating...' : (isAtRestaurant ? 'At Ajwa Global' : 'Remote Order')}
              </span>
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
                    : "bg-white text-gray-500 border border-wood/10 hover:border-sage/50"
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
            <CheckCircle2 className="w-5 h-5" /> Order Sent to Kitchen!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Items */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <motion.div
              layout
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border border-wood/10 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                  ${item.price.toFixed(2)}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-serif font-semibold mb-2">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">{item.description}</p>
                
                <div className="flex items-center justify-between">
                  {cart[item.id] ? (
                    <div className="flex items-center gap-4 bg-cream rounded-full p-1 border border-wood/10">
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-gray-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-sm min-w-[20px] text-center">{cart[item.id]}</span>
                      <button 
                        onClick={() => addToCart(item.id)}
                        className="w-8 h-8 rounded-full bg-sage flex items-center justify-center shadow-sm hover:bg-opacity-80"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item.id)}
                      className="w-full py-3 bg-cream border border-wood/10 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-sage/10 hover:border-sage transition-all"
                    >
                      <Plus className="w-4 h-4" /> Add to Order
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-50"
          >
            <button
              onClick={() => setIsTabOpen(true)}
              className="w-full bg-gray-900 text-white rounded-full p-4 flex items-center justify-between shadow-2xl hover:bg-gray-800 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sage rounded-full flex items-center justify-center text-gray-900">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">View Your Tab</p>
                  <p className="text-sm font-bold">{cartCount} Items Selected</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-serif font-bold">${cartTotal.toFixed(2)}</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Modal */}
      <AnimatePresence>
        {isTabOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTabOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[70] max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-wood/10 flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold">Your Active Tab</h2>
                <button onClick={() => setIsTabOpen(false)} className="text-gray-400 hover:text-gray-600">
                  Close
                </button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-8 space-y-6">
                {Object.entries(cart).map(([id, quantity]) => {
                  const item = MENU_ITEMS.find(i => i.id === id);
                  if (!item) return null;
                  return (
                    <div key={id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-bold">{item.name}</h4>
                          <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold">x{quantity}</span>
                        <span className="font-serif font-bold">${(Number(item.price) * Number(quantity)).toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-8 bg-cream border-t border-wood/10">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-medium text-gray-700">Payment Method</span>
                  <div className="flex bg-gray-200 rounded-lg p-1">
                    <button
                      onClick={() => setPaymentType('prepaid')}
                      className={cn(
                        "px-4 py-1.5 rounded-md text-sm font-bold transition-all",
                        paymentType === 'prepaid' ? "bg-white shadow-sm text-sage" : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      Prepaid
                    </button>
                    <button
                      onClick={() => setPaymentType('postpaid')}
                      disabled={!isAtRestaurant}
                      className={cn(
                        "px-4 py-1.5 rounded-md text-sm font-bold transition-all",
                        paymentType === 'postpaid' ? "bg-white shadow-sm text-sage" : "text-gray-500 hover:text-gray-700",
                        !isAtRestaurant && "opacity-50 cursor-not-allowed"
                      )}
                      title={!isAtRestaurant ? "Postpaid only available for dine-in" : ""}
                    >
                      Postpaid
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <span className="text-gray-500 font-medium">Total Amount</span>
                  <span className="text-3xl font-serif font-bold">${cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  disabled={isOrdering}
                  className="w-full py-5 bg-sage text-gray-900 rounded-2xl font-bold text-lg shadow-lg hover:bg-opacity-80 transition-all disabled:opacity-50"
                  onClick={sendToKitchen}
                >
                  {isOrdering ? 'Sending...' : (isAtRestaurant ? 'Send to Kitchen' : 'Place Order')}
                </button>
                <p className="text-center text-xs text-gray-400 mt-4 uppercase tracking-widest">
                  {paymentType === 'postpaid' ? 'Pay at the counter after your meal' : 'Pay now to confirm your order'}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
