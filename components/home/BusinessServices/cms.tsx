"use client";

import React from "react";

export default function CMSPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--home-background)] text-[var(--home-text)]">
      {/* Content wrapper gives horizontal + vertical padding */}
      <div className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <section id="cms" className="sr-only">CMS</section>

        <h1 className="text-3xl font-bold mb-6 text-[var(--home-content-heading)]">
          Commercial Cleaning That Meets Your Needs
        </h1>

        <div className="space-y-6 text-lg leading-relaxed">
          <h2 className="text-2xl font-semibold">General cleaning</h2>
          <p>Daily dust, grime and trash can make a space feel unprofessional. Our general cleaning and janitorial service keeps your workplace fresh, organized, and ready for business. From dusting and sanitizing to vacuuming and trash removal, we take care of the mess, so you can focus on your business.</p>

          <h2 className="text-2xl font-semibold">Deep cleaning</h2>
          <p>Sometimes, a surface clean just isn’t enough. Our deep cleaning service gets into every corner, removing built‑up dirt, bacteria, and allergens. An immaculate space isn’t just about appearances; it’s about health, safety, and longevity.</p>

          <p>Services. You have probably already seen DART Commercial Services at some of the places you frequent every day. We have contracts with most of the trash cans around the town, the water district, and many more places all around Ridgecrest.</p>
        </div>
      </div>

      {/* push footer to bottom */}
      <div className="mt-auto" />
    </div>
  );
}