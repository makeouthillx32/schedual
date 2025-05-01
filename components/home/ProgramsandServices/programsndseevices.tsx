"use client";

import React from "react";
import Image from "next/image";
import "@/app/globals.css";

interface ProgramsAndServicesProps {
  navigateTo: (key: string) => void;
}

const ProgramsAndServices: React.FC<ProgramsAndServicesProps> = ({ navigateTo }) => {
  return (
    <div className="min-h-screen bg-[var(--home-background)] text-[var(--home-text)] p-8">
      <h1 className="text-3xl font-bold mb-4">Programs & Services</h1>
      <p className="text-lg mb-8">
        Desert Area Resources and Training is a non-profit organization that empowers people with
        intellectual and developmental disabilities and their loved ones. Our suite of tailored
        disability services focuses on enriching, empowering, and equipping those we serve to become
        job-ready, confident, and more independent. We help remove barriers preventing individuals
        from finding and keeping gainful employment and assist families in accessing quality
        support.
        <br />
        <br />
        The programs we offer have contributed to increasing the quality of life and reducing the
        chances of people with disabilities falling into homelessness and poverty. Over the last 70
        years, our positive impact on our community has been immeasurable. We are proud to have
        gained a reputation as one of the most respected and innovative nonprofit organizations in
        Ridgecrest.
        <br />
        <br />
        We have a range of disability services and don’t believe in a one-size-fits-all approach.
        Learn more about the variety of disability services and programs at Desert Area Resources
        and Training.
      </p>

      {/* Services Grid */}
      <div className="flex flex-col items-center mt-12 space-y-6">
        {[
          ["Transportation", "transportation", "Transportation.jpg"],
          ["Early Childhood Services", "earlychildhood", "Early Childhood Services.jpg"],
          ["Supported Living Services", "supportedliving", "Supported Living Services.jpg"],
          ["Artists on the Edge", "artists", "Artists on the Edge.jpg"],
          ["Autism Day Camp", "action", "Autism Day Camp.png"],
          ["Employment Services", "employment", "Employment Services.jpg"],
          ["Commission for the Accreditation of Rehabilitation Facilities", "carf", "Commission for the Accreditation.jpg"],
          ["DART Thrift Store", "thrift", "DART Thrift Store.jpg"],
          ["Secure Document Shredding", "shredding", "Secure Document Shredding.jpg"],
        ].map(([title, key, filename]) => (
          <button
            key={key}
            onClick={() => navigateTo(key as string)}
            className="flex items-center space-x-4 hover:opacity-80 transition text-left w-full"
          >
            <div className="w-24 h-24 flex-shrink-0">
              <Image
                src={`/images/home/${filename}`}
                alt={title as string}
                width={96}
                height={96}
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--home-content-heading)]">{title}</h3>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProgramsAndServices;