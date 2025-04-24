"use client";
import { useState } from "react";
import Image from "next/image";

import Transportation from "@/components/home/services/Transportation";
import EarlyChildhood from "@/components/home/services/EarlyChildhood";
import SupportedLiving from "@/components/home/services/SupportedLiving";
import Artists from "@/components/home/services/Artists";
import AutismDayCamp from "@/components/home/services/AutismDayCamp";
import Employment from "@/components/home/services/Employment";
import CARF from "@/components/home/services/CARF";
import ThriftStore from "@/components/home/services/ThriftStore";
import Shredding from "@/components/home/services/Shredding";
import React from "react";

const components: Record<string, React.ReactElement> = {
  transportation: <Transportation />,
  earlychildhood: <EarlyChildhood />,
  supportedliving: <SupportedLiving />,
  artists: <Artists />,
  action: <AutismDayCamp />,
  employment: <Employment />,
  carf: <CARF />,
  thrift: <ThriftStore />,
  shredding: <Shredding />,
};

export default function AboutUsPage() {
  const [active, setActive] = useState<string | null>(null);

  if (active) {
    return (
      <div className="p-6 bg-[var(--home-background)] text-[var(--home-text)] space-y-4">
        <button
          onClick={() => setActive(null)}
          className="text-sm text-blue-600 underline hover:opacity-80"
        >
          ← Back to Overview
        </button>
        {components[active]}
      </div>
    );
  }

  return (
    <div className="space-y-8 text-[var(--home-text)] bg-[var(--home-background)]">
      <div className="text-sm space-y-4">
        <p className="text-lg font-medium">Serving the community since 1961</p>
        <p>
          DART, a private, not-for-profit corporation, was founded in 1961. We are a provider of
          services for Regional Centers, Department of Rehabilitation, and Sierra Sands Unified School District.
        </p>
        <p>
          DART is accredited by CARF, which stands as a symbol of our commitment to the highest quality of services.
        </p>
        <p>
          Desert Area Resources and Training has received a three-year accreditation from CARF, the
          Rehabilitation Accreditation Commission. A copy of the accreditation survey is available
          upon request from the main DART office. For more information about CARF go to{" "}
          <a href="https://www.carf.org" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            www.carf.org
          </a>.
        </p>
        <div className="border-l-4 border-gray-400 pl-4 space-y-2 mt-6">
          <p className="font-semibold">We Believe…</p>
          <p>
            IN the right of persons with disabilities to accessibility and integration in society.
          </p>
          <p>
            IN providing quality training to enhance the achievement of individual skills and
            development of dignity and self worth.
          </p>
          <p>
            IN an obligation of excellence by providing integrated community events, public awareness
            and a structured support and advocacy system and by fulfilling client needs for vocational,
            supported living and recreational skills.
          </p>
          <p>
            WE will be a success when we have achieved community awareness and integration in society.
          </p>
        </div>
      </div>

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
            onClick={() => setActive(key)}
            className="flex items-center space-x-4 hover:opacity-80 transition text-left w-full"
          >
            <div className="w-24 h-24 flex-shrink-0">
              <Image
                src={`/images/home/${filename}`}
                alt={title}
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
}
