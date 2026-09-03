import { motion } from 'motion/react';
import { MapPin, Zap, Shield, Server } from 'lucide-react';
import { fluidSpring } from '../components/SystemManager';

const locations = [
  {
    id: 'iceland',
    name: 'Reykjavík, Iceland',
    image: 'https://images.unsplash.com/photo-1520769945061-0a448c463865?auto=format&fit=crop&q=80',
    description: 'Powered by 100% renewable geothermal and volcanic subterranean steam. Our premier Nordic facility provides direct arctic free-air cooling and zero carbon emissions.',
    stats: { hashRate: '4.8 EH/s', uptime: '99.99%', power: '100% Geothermal' }
  },
  {
    id: 'norway',
    name: 'Tromsø & Oslo, Norway',
    image: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&q=80',
    description: 'Connected directly to glacial fjord hydroelectric dams. Houses our high-density immersion pods with an industry-leading PUE of 1.04.',
    stats: { hashRate: '5.6 EH/s', uptime: '99.99%', power: '100% Hydroelectric' }
  },
  {
    id: 'sweden',
    name: 'Boden, Sweden',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80',
    description: 'High-voltage hydro grid access on the Lule River. Hosts our specialized Kaspa KS5 Pro arrays and AI Tensor compute clusters.',
    stats: { hashRate: '3.9 EH/s', uptime: '99.98%', power: 'Hydro & Wind Mix' }
  },
  {
    id: 'canada',
    name: 'Quebec, Canada',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80',
    description: 'Deep North American operations fed by Hydro-Québec. Features closed-loop dielectric liquid cooling for Bitmain S21 Hydro rigs.',
    stats: { hashRate: '4.2 EH/s', uptime: '99.96%', power: 'Hydro-Québec Clean' }
  },
  {
    id: 'texas',
    name: 'West Texas, USA',
    image: 'https://images.unsplash.com/photo-1542222024-c39e2281f121?auto=format&fit=crop&q=80',
    description: 'Massive gigawatt-scale facility utilizing curtailed wind and utility solar across the ERCOT corridor for ultra-low daytime operational costs.',
    stats: { hashRate: '7.2 EH/s', uptime: '99.95%', power: 'Solar & Wind Grid' }
  },
  {
    id: 'finland',
    name: 'Espoo, Finland',
    image: 'https://images.unsplash.com/photo-1558588942-930faae5a389?auto=format&fit=crop&q=80',
    description: 'District-heating integrated datacenter where waste heat from mining ASIC rigs is redirected to warm local municipal housing.',
    stats: { hashRate: '2.5 EH/s', uptime: '99.99%', power: 'Carbon Negative' }
  }
];

export default function Locations() {
  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
          transition={{ ...fluidSpring, duration: 1.5, repeat: Infinity }}
          className="text-4xl md:text-5xl font-bold mb-6 cursor-default"
        >
          Global Mining <span className="text-primary">Infrastructure</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fluidSpring, delay: 0.1 }}
          className="text-lg text-secondary max-w-3xl mx-auto"
        >
          We operate state-of-the-art mining facilities across four continents, strategically located to maximize efficiency, utilize renewable energy, and ensure maximum uptime for your investments.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {locations.map((loc, index) => (
          <motion.div
            key={loc.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...fluidSpring, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="group relative bg-surface border border-border rounded-3xl overflow-hidden hover:border-primary/50 transition-colors cursor-default"
          >
            <div className="aspect-video overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              <img 
                src={loc.image} 
                alt={loc.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 text-white">
                <MapPin className="text-primary" size={20} />
                <motion.h3 
                  whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-2xl font-bold cursor-default"
                >
                  {loc.name}
                </motion.h3>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-secondary mb-6">{loc.description}</p>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-subtle rounded-xl p-3 text-center">
                  <Server className="w-5 h-5 text-primary mx-auto mb-2" />
                  <div className="text-xs text-secondary uppercase tracking-wider mb-1">Hash Rate</div>
                  <div className="font-semibold">{loc.stats.hashRate}</div>
                </div>
                <div className="bg-subtle rounded-xl p-3 text-center">
                  <Shield className="w-5 h-5 text-primary mx-auto mb-2" />
                  <div className="text-xs text-secondary uppercase tracking-wider mb-1">Uptime</div>
                  <div className="font-semibold">{loc.stats.uptime}</div>
                </div>
                <div className="bg-subtle rounded-xl p-3 text-center">
                  <Zap className="w-5 h-5 text-primary mx-auto mb-2" />
                  <div className="text-xs text-secondary uppercase tracking-wider mb-1">Power</div>
                  <div className="font-semibold text-sm truncate">{loc.stats.power}</div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
