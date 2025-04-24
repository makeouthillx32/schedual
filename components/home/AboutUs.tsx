// components/home/AboutUs.tsx

"use client";
import Image from "next/image";

export default function AboutUsPage() {
  return (
    <div className="space-y-8 text-[var(--home-text)] bg-[var(--home-background)]">
      <div className="text-sm space-y-4">
        <p>Serving the community since 1961</p>
        <p>
          DART operates with highly experienced, well-trained in 1961. We are a
          member of American Network of Community Options and Resources (ANCOR),
          Department of Developmental Services, and Eastern Sierra Regional Center
          (ESRC).
        </p>
        <p>
          DART is a non-profit 501(c)(3) which has been a member of our community
          for 50+ years. We employ approx. 90 people.
        </p>
        <p>
          DART is accredited by CARF (Commission on Accreditation of
          Rehabilitation Commission). A copy of the accreditation is available upon
          request from Executive Director's office. For more information about CARF
          visit{" "}
          <a href="#" className="text-blue-500 hover:underline">
            www.carf.org
          </a>
        </p>
        <p>Our Mission is:</p>
        <p>
          To be a part of people with disabilities in communities and integration in
          society.
        </p>
        <p>
          To provide quality training to enhance the development of individuals who
          have developmental of dignity and worth.
        </p>
        <p>
          To provide opportunities for people with disabilities to make positive
          choices and pursue dreams and lifestyles together while fulfilling their
          needs for meaningful, supported living and recreational skills.
        </p>
        <p>
          We offer a personal touch on how individuals with family, community and
          integration in society.
        </p>
      </div>

      {/* Services Section */}
      <div className="flex flex-col items-center mt-12 space-y-6">
        {[
          ["Transportation", "Transportation.jpg"],
          ["Early Childhood Services", "Early Childhood Services.jpg"],
          ["Supported Living Services", "Supported Living Services.jpg"],
          ["Artists on the Edge", "Artists on the Edge.jpg"],
          ["Autism Day Camp", "Autism Day Camp.png"],
          ["Employment Services", "Employment Services.jpg"],
          [
            "Commission for the Accreditation of Rehabilitation Facilities",
            "Commission for the Accreditation.jpg",
          ],
          ["DART Thrift Store", "DART Thrift Store.jpg"],
          ["Secure Document Shredding", "Secure Document Shredding.jpg"],
        ].map(([title, filename]) => (
          <div key={title} className="flex items-center space-x-4">
            <div className="w-24 h-24 flex-shrink-0">
              <Image
                src={`/images/home/${filename}`}
                alt={title}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--home-content-heading)]">{title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
