"use client";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="home-page min-h-screen bg-[var(--home-background)] text-[var(--home-text)] dark:bg-[var(--home-background)] dark:text-[var(--home-text)]">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
        <div className="w-48 h-48 flex-shrink-0">
          <Image
            src="/images/home/dartboard.svg"
            alt="DART Target Logo"
            width={192}
            height={192}
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--home-heading)] mb-2">
            Welcome to Desert Area Resources and Training
          </h1>
          <hr className="border-t-4 border-[var(--home-text)] my-4 w-80" />
        </div>
      </div>

      {/* Mission Statement Heading */}
      <h2 className="text-xl md:text-2xl font-semibold mb-2">Our Mission is to:</h2>

      {/* Mission Statement Box */}
      <div className="border-l-4 border-[var(--home-accent)] pl-4 mb-12 max-w-3xl mx-auto">
        <p className="text-[var(--home-text)]">
          Provide services and opportunities to people who have intellectual or developmental disabilities or other
          special needs, so they and their families can pursue the dreams and lifestyles they choose.
        </p>
      </div>

      {/* Welcome Text */}
      <div className="space-y-6 text-[var(--home-text)] text-sm md:text-base mb-12">
        <p>
          DART offers programs and services to people with and without developmental disabilities or other special
          needs. Our staff is here to provide services and opportunities to meet the needs of the individual.
        </p>
        <p>
          After an initial referral from the State of California - Department of Developmental Services - Regional
          Center, young children who are found eligible are assessed and their plans are developed on an individual
          basis.
        </p>
        <p>
          Children in this program are offered specialized instruction and supports to aid with their
          development. The ratio of child to teacher is kept as low as 1-to-1, toddler and pre-school settings.
        </p>
        <p>
          Children with developmental disabilities are provided with early intervention services to address their
          educational and social developmental milestones.
        </p>
        <p>
          For adults with developmental disabilities and other special needs, there are various programs and services
          offered such as Supported Employment, Work Activity Program and Supported Living Programming. We support
          adults on the job and special events annually and do collaborative community projects for adults.
        </p>
        <p>
          In the summer we host day camp for children with Autism and support advocacy for children, adults and
          families.
        </p>
      </div>

      {/* Sponsor Logos */}
      <div className="flex flex-wrap justify-center gap-8 mb-12">
        <Image src="/images/home/sponsor1.png" alt="Sponsor 1" width={150} height={80} className="object-contain" />
        <Image src="/images/home/sponsor2.png" alt="Sponsor 2" width={150} height={80} className="object-contain" />
        <Image src="/images/home/sponsor3.png" alt="Sponsor 3" width={150} height={80} className="object-contain" />
      </div>

      {/* History Section */}
      <div className="space-y-4 text-[var(--home-text)] text-sm">
        <h3 className="font-semibold text-base text-[var(--home-content-heading)]">
          The History of Desert Area Resources and Training
        </h3>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="md:w-1/4">
            <Image
              src="/images/home/founders.png"
              alt="DART Founders"
              width={200}
              height={150}
              className="w-full object-contain rounded-md"
            />
          </div>
          <div className="md:w-3/4">
            <p>
              Founded in the first Board of Directors - Officers of the IWV-ARC - in the center of the picture are Don
              and Louise Fowler, parents of Janie. At the right of the photo is Jean Backman and on the other side is
              Doris Bjornstad. Janie Fowler would become one of the first participants of the Desert Area Resources and
              Training program in 1979. Janie is still served today by DART over 30 years since their idea to run
              Activity on the Fair Grounds.
            </p>
          </div>
        </div>

        <p>
          In 1961, twenty parents of children with disabilities met and established the Indian Wells Valley Council
          for Retarded Children. The council developed a recreation program for preschoolers with disabilities, which
          continued until 1966.
        </p>
        <p>
          The council also worked with the Kern County Superintendent of Schools and petitioned the Office of Kern
          County Superintendent of Schools to establish a special education class in the valley.
        </p>
        <p>
          In 1962, the United Way of the Indian Wells Valley began their support of the organization; this support
          continues to the present day. The Sunshine House began in 1973 as a day care center for adults with
          developmental disabilities.
        </p>
        <p>
          In 1979, the Indian Wells Valley Association for Retarded Citizens changed its name and merged with the
          Sunshine Activity Training Center. It became Desert Area Resources and Training in 1991 and has continued
          to expand its programs and impact throughout surrounding counties.
        </p>
      </div>
    </div>
  );
}
