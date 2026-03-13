import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Star, Calendar, UtensilsCrossed, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=2000" 
            alt="Ajwa Global Ambience"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif mb-6"
          >
            Where Every Moment <br /> <span className="italic text-sage">Becomes a Memory</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl font-body mb-10 text-gray-200 max-w-2xl mx-auto"
          >
            Experience the perfect blend of premium dining and exquisite event hosting at Ajwa Global.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              to="/menu" 
              className="px-8 py-4 bg-sage text-gray-900 rounded-full font-medium flex items-center justify-center gap-2 hover:scale-105 transition-transform"
            >
              Explore Menu <ArrowRight className="w-4 h-4" />
            </Link>
            <button 
              onClick={() => document.getElementById('birthday-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full font-medium hover:bg-white/20 transition-all"
            >
              Plan a Birthday
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<UtensilsCrossed className="w-6 h-6 text-sage" />}
              title="Smart Dining"
              description="Scan, order, and enjoy. Our digital menu makes ordering seamless and wait-free."
            />
            <FeatureCard 
              icon={<Calendar className="w-6 h-6 text-sage" />}
              title="Event Planning"
              description="From intimate birthdays to grand celebrations, our AI concierge helps you plan every detail."
            />
            <FeatureCard 
              icon={<Camera className="w-6 h-6 text-sage" />}
              title="Exquisite Ambience"
              description="Modern, airy, and designed for the perfect photo opportunity."
            />
          </div>
        </div>
      </section>

      {/* Venue Gallery */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif mb-4">Exquisite Spaces</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Discover the perfect backdrop for your next celebration.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GalleryItem 
              image="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800"
              title="Modern Hall"
              capacity="50 Guests"
            />
            <GalleryItem 
              image="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800"
              title="Garden Terrace"
              capacity="30 Guests"
            />
            <GalleryItem 
              image="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800"
              title="Private VIP Suite"
              capacity="12 Guests"
            />
          </div>
        </div>
      </section>

      {/* Birthday Section */}
      <section id="birthday-section" className="py-24 bg-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-4xl md:text-5xl font-serif mb-6">Celebrate Your <br /> Special Day</h2>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Our dedicated birthday packages are designed to make your celebration truly unforgettable. 
                Enjoy custom decorations, premium catering, and a dedicated host for your event.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-gray-700">
                  <Star className="w-5 h-5 text-sage fill-sage" />
                  Customized Theme Decorations
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <Star className="w-5 h-5 text-sage fill-sage" />
                  Premium 3-Course Menu
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <Star className="w-5 h-5 text-sage fill-sage" />
                  Professional Event Photography
                </li>
              </ul>
              <button className="px-8 py-4 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all">
                Inquire Now
              </button>
            </div>
            <div className="flex-1 relative">
              <div className="grid grid-cols-2 gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=800" 
                  alt="Birthday Cake" 
                  className="rounded-2xl shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <img 
                  src="https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&q=80&w=800" 
                  alt="Party Decoration" 
                  className="rounded-2xl shadow-lg mt-8"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-sage/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function GalleryItem({ image, title, capacity }: { image: string, title: string, capacity: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="group relative h-[400px] rounded-3xl overflow-hidden shadow-sm"
    >
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
      <div className="absolute bottom-0 left-0 p-8 text-white">
        <p className="text-xs uppercase tracking-widest text-sage font-bold mb-2">{capacity}</p>
        <h3 className="text-2xl font-serif font-bold">{title}</h3>
      </div>
    </motion.div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 bg-cream rounded-3xl border border-wood/10"
    >
      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-serif font-semibold mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}
