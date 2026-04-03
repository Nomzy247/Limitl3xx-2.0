import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { fluidSpring } from './SystemManager';

export default function ScrollDots() {
  const [sections, setSections] = useState<HTMLElement[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // Find all sections or major divs that act as sections
    const updateSections = () => {
      // We look for main sections, typically direct children of the main container or elements with specific IDs
      // For this app, we can select all major sections by looking at elements with significant height
      const elements = Array.from(document.querySelectorAll('main section, main > div > div, main > div > section, main > div > * > section, main > div > * > div')).filter(
        (el) => {
          const rect = el.getBoundingClientRect();
          return rect.height > 300; // Only consider substantial sections
        }
      ) as HTMLElement[];
      
      // Deduplicate nested sections by checking if an element contains another
      const uniqueSections = elements.filter((el, index, self) => {
        return !self.some((other, otherIndex) => index !== otherIndex && other.contains(el));
      });

      setSections(uniqueSections);
    };

    updateSections();
    // Re-run on route change or dynamic content load
    const observer = new MutationObserver(updateSections);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (sections.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      let currentIdx = 0;
      let minDistance = Infinity;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + window.scrollY + rect.height / 2;
        const distance = Math.abs(scrollPosition - sectionCenter);
        
        if (distance < minDistance) {
          minDistance = distance;
          currentIdx = index;
        }
      });

      setActiveIndex(currentIdx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (index: number) => {
    const section = sections[index];
    if (section) {
      const top = section.getBoundingClientRect().top + window.scrollY - 80; // offset for navbar
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  if (sections.length <= 1) return null;

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-3">
      {sections.map((_, index) => (
        <motion.button
          key={index}
          onClick={() => scrollToSection(index)}
          className="relative flex items-center justify-center group"
          initial={false}
          animate={{
            height: activeIndex === index ? 16 : 6,
            opacity: activeIndex === index ? 1 : 0.4
          }}
          transition={fluidSpring}
        >
          <div 
            className={`w-1.5 rounded-full transition-colors duration-300 ${
              activeIndex === index 
                ? 'bg-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.8)] h-full' 
                : 'bg-secondary group-hover:bg-primary h-1.5'
            }`}
          />
        </motion.button>
      ))}
    </div>
  );
}
