import React from 'react';

export default function HeroBackground() {
  return (
    <>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-teal-500/18 to-transparent rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-gold-500/14 to-transparent rounded-full pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none bg-grid" />
    </>
  );
}
