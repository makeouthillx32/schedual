"use client";

import React from "react";
import "@/app/globals.css";

interface CareersPageProps {
  navigateTo: (key: string) => void;
}

export default function CareersPage({ navigateTo }: CareersPageProps) {
  return (
    <div className="min-h-screen bg-[var(--home-background)] text-[var(--home-text)] p-8">
      <h1 className="text-3xl font-bold mb-4 text-[var(--home-content-heading)]">
        Find a Meaningful Career
      </h1>

      <p className="text-lg mb-6">
        Making a difference starts here.
      </p>

      <button
        onClick={() => navigateTo("jobs")}
        className="bg-[var(--home-accent)] text-white px-6 py-2 rounded hover:opacity-90 transition"
      >
        Current Openings
      </button>

      <div className="mt-10 space-y-4 text-lg">
        <p>
          If your heart is gracious and your enthusiasm unwavering, the place to start is Desert Area Resources and Training!
        </p>
        <p>
          A not-for-profit organization that serves people in our community with intellectual disabilities to enhance their lives and the lives of their families, DART is rooted in enriching the lives of its employees, too. With a workplace that’s undoubtedly as diverse as you’ll find in the state of California, the collective, steadfast desire to empower the adults with disabilities that we serve and fulfill our mission is unequivocal. And trust us: As you make a difference in their lives, they’ll make a difference in yours just as quickly.
        </p>
        <p className="font-semibold text-xl mt-6">
          Current Openings
        </p>
        <p>
          Since 1961, DART has been dedicated to helping people with disabilities find the very best version of themselves. Through workforce development, community employment, day services, inclusive housing, arts, and social recreation, they are able to find new friends, realize future career paths, seek independence and community integration, and unleash creative passions.
        </p>
        <p>
          DART thrives with the funding from our social enterprises, signature events, and the generous philanthropy of our donors and community partners. Together, we are successfully empowering, employing, and serving people with disabilities – positively impacting lives.
        </p>
        <p>
          DART also offers a wide array of additional benefits including health, dental and vision insurance, retirement savings accounts, training and development opportunities and much more! You’ll find the experience rewarding in every sense of the word, both professionally and personally. To learn more about our culture of care and values, check out THE DART WAY.
        </p>
      </div>
    </div>
  );
}