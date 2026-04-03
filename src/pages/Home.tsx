import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useMediaQuery } from '../hooks/useMediaQuery';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import Sponsors from '../components/Sponsors';
import Testimonials from '../components/Testimonials';
import Stats from '../components/Stats';
import AboutUs from '../components/AboutUs';
import Processes from '../components/Processes';
import Portfolio from '../components/Portfolio';
import ScrollReveal from '../components/ScrollReveal';
import MarketOpportunities from '../components/MarketOpportunities';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    if (user && isMobile) {
      navigate('/hub');
    }
  }, [user, isMobile, navigate]);

  return (
    <div className="flex flex-col w-full bg-background">
      <section className="w-full flex flex-col justify-center"><Hero /></section>
      <section className="w-full flex flex-col justify-center"><ScrollReveal><Sponsors /></ScrollReveal></section>
      <section className="w-full flex flex-col justify-center"><ScrollReveal><AboutUs /></ScrollReveal></section>
      <section className="w-full flex flex-col justify-center"><ScrollReveal><MarketOpportunities /></ScrollReveal></section>
      <section className="w-full flex flex-col justify-center"><ScrollReveal><Features /></ScrollReveal></section>
      <section className="w-full flex flex-col justify-center"><ScrollReveal><Processes /></ScrollReveal></section>
      <section className="w-full flex flex-col justify-center"><ScrollReveal><Portfolio /></ScrollReveal></section>
      <section className="w-full flex flex-col justify-center"><ScrollReveal><Stats /></ScrollReveal></section>
      <section className="w-full flex flex-col justify-center"><ScrollReveal><Pricing /></ScrollReveal></section>
      <section className="w-full flex flex-col justify-center"><ScrollReveal><Testimonials /></ScrollReveal></section>
    </div>
  );
}
