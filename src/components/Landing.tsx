import React from 'react';
import { Header } from './landing/Header';
import { Hero } from './landing/Hero';
import { Features } from './landing/Features';
import { Pricing } from './landing/Pricing';
import { Testimonials } from './landing/Testimonials';
import { Footer } from './landing/Footer';

export function Landing() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <Footer />
    </div>
  );
}