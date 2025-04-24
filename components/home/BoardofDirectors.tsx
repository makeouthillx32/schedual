"use client";
import Image from "next/image";

export default function BoardPage() {
  return (
    <div className="space-y-8 text-[var(--home-text)] bg-[var(--home-background)]">
      <p className="text-center text-[var(--home-text)] max-w-2xl mx-auto">
        Our Board of Directors is comprised of dedicated community members who volunteer their time and expertise to guide our organization. They are committed to our mission and work tirelessly to ensure that DART continues to provide high-quality services.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        {[
          ["Board of Directors greg-boske.jpg", "Board Member Name", "Position Title"],
          ["Board of DirectorsLady.jpg", "Board Member Name", "Position Title"],
          ["Board of Directors lady 2.jpg", "Board Member Name", "Position Title"],
          ["Board of Directorslady3.jpg", "Board Member Name", "Position Title"],
        ].map(([image, name, title], index) => (
          <div key={index} className="bg-[var(--home-header)] rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200">
              <Image
                src={`/images/home/${image}`}
                alt={name}
                width={300}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-[var(--home-content-heading)]">{name}</h3>
              <p className="text-blue-600 text-sm mb-2">{title}</p>
              <p className="text-[var(--home-text)] text-sm">
                Brief biography of the board member highlighting their background, expertise, and commitment to DART's mission.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
