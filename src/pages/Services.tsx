import { motion } from 'motion/react';
import { Cloud, Users, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

const services = [
  {
    id: 'cloud',
    title: 'Cloud Mining',
    icon: <Cloud className="w-12 h-12 text-primary" />,
    description: 'Rent our state-of-the-art mining hardware without the hassle of managing it yourself. We handle the setup, maintenance, and electricity costs.',
    features: [
      'Zero hardware setup or maintenance',
      'Daily payouts directly to your wallet',
      'Choose your preferred hash power',
      '100% uptime guarantee'
    ],
    image: 'https://images.unsplash.com/photo-1621504450181-5d356f61d307?auto=format&fit=crop&q=80'
  },
  {
    id: 'pool',
    title: 'Pool Mining',
    icon: <Users className="w-12 h-12 text-primary" />,
    description: 'Connect your own mining rigs to our highly optimized mining pools. Combine your hash power with thousands of others to ensure consistent, predictable rewards.',
    features: [
      'Low 1% pool fee',
      'PPS+ and PPLNS payout methods',
      'Real-time worker monitoring',
      'Global stratum servers for low latency'
    ],
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80'
  },
  {
    id: 'crypto',
    title: 'Crypto Mining',
    icon: <Cpu className="w-12 h-12 text-primary" />,
    description: 'Purchase and host your own ASIC miners in our world-class facilities. You own the hardware, we provide the power, cooling, and security.',
    features: [
      'Competitive electricity rates',
      '24/7 on-site security and support',
      'Full hardware ownership',
      'VPN access to your machines'
    ],
    image: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?auto=format&fit=crop&q=80'
  },
  {
    id: 'hardware',
    title: 'Hardware Purchase',
    icon: <Cpu className="w-12 h-12 text-primary" />,
    description: 'Purchase complete, fully optimized mining hardware. We offer professional management, e-payment gateway integration, and on-demand shipping.',
    features: [
      'Fully optimized mining hardware',
      'Professional management options',
      'Secure e-payment gateway',
      'On-demand shipping'
    ],
    image: 'https://images.unsplash.com/photo-1591405351957-89d7e9953d03?auto=format&fit=crop&q=80'
  }
];

export default function Services() {
  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-20">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-4xl md:text-5xl font-bold mb-6 cursor-default"
        >
          Our Mining <span className="text-primary">Services</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-secondary max-w-3xl mx-auto"
        >
          Whether you want to rent hash power, connect your own rigs, or host your hardware in our facilities, we have the perfect solution for your crypto mining needs.
        </motion.p>
      </div>

      <div className="space-y-24">
        {services.map((service, index) => (
          <motion.div 
            key={service.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center`}
          >
            <div className="flex-1 space-y-8">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="bg-subtle w-20 h-20 rounded-2xl flex items-center justify-center cursor-default"
              >
                {service.icon}
              </motion.div>
              
              <div>
                <motion.h2 
                  whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-3xl font-bold mb-4 cursor-default"
                >
                  {service.title}
                </motion.h2>
                <p className="text-lg text-secondary leading-relaxed">
                  {service.description}
                </p>
              </div>

              <ul className="space-y-4">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="text-primary w-6 h-6 flex-shrink-0" />
                    <span className="text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link 
                to="/signup" 
                className="inline-flex items-center gap-2 bg-primary text-background px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                Get Started <ArrowRight size={18} />
              </Link>
            </div>

            <div className="flex-1 w-full">
              <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10" />
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
