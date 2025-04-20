"use client"

import type React from "react"

import Image from "next/image"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Home() {
  const [currentPage, setCurrentPage] = useState("home")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Function to handle navigation
  const navigateTo = (page: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentPage(page)
    setMobileMenuOpen(false) // Close mobile menu when navigating
    // Scroll to top when changing pages
    window.scrollTo(0, 0)
  }

  return (
    <div className="home-page flex flex-col min-h-screen">
      {/* Header Navigation */}
      <header className="border-b border-gray-200 py-2 px-4 relative">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="font-bold text-lg">
            <a href="#" onClick={navigateTo("home")} className="flex items-center">
              <Image src="/images/home/dartlogo.svg" alt="DART Logo" width={80} height={80} className="h-12 w-auto" />
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 text-sm">
            <a href="#" onClick={navigateTo("about")} className="hover:underline">
              About Us
            </a>
            <a href="#" onClick={navigateTo("board")} className="hover:underline">
              Board of Directors
            </a>
            <a href="#" onClick={navigateTo("title9")} className="hover:underline">
              Title 9 Information
            </a>
            <a href="#" onClick={navigateTo("action")} className="hover:underline">
              Action Day Gala
            </a>
            <a href="#" onClick={navigateTo("jobs")} className="hover:underline">
              Jobs
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-md z-50 border-b border-gray-200">
            <div className="flex flex-col py-2">
              <a href="#" onClick={navigateTo("about")} className="px-4 py-2 hover:bg-gray-100">
                About Us
              </a>
              <a href="#" onClick={navigateTo("board")} className="px-4 py-2 hover:bg-gray-100">
                Board of Directors
              </a>
              <a href="#" onClick={navigateTo("title9")} className="px-4 py-2 hover:bg-gray-100">
                Title 9 Information
              </a>
              <a href="#" onClick={navigateTo("action")} className="px-4 py-2 hover:bg-gray-100">
                Action Day Gala
              </a>
              <a href="#" onClick={navigateTo("jobs")} className="px-4 py-2 hover:bg-gray-100">
                Jobs
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Blue Banner with Page Title - Only show on non-home pages */}
      {currentPage !== "home" && (
        <div className="bg-blue-500 h-12 md:h-16 flex items-center justify-center">
          <h1 className="text-white text-xl md:text-2xl font-semibold">
            {currentPage === "about"
              ? "About Us"
              : currentPage === "board"
                ? "Board of Directors"
                : currentPage === "title9"
                  ? "Title 9 Information"
                  : currentPage === "action"
                    ? "Action Day Gala"
                    : currentPage === "jobs"
                      ? "Jobs"
                      : ""}
          </h1>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow bg-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {currentPage === "home" && <HomePage />}
          {currentPage === "about" && <AboutUsPage />}
          {currentPage === "board" && <BoardPage />}
          {currentPage === "title9" && <Title9Page />}
          {currentPage === "action" && <ActionDayPage />}
          {currentPage === "jobs" && <JobsPage />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-4 text-center text-xs text-gray-500 border-t border-gray-200">
        © 2023 Desert Area Resources and Training (DART)
      </footer>
    </div>
  )
}

// Home Page Component
function HomePage() {
  return (
    <>
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
        <div className="w-48 h-48 flex-shrink-0">
          <Image
            src="/images/home/dartboard.jpg"
            alt="DART Target Logo"
            width={192}
            height={192}
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-2">
            Welcome to Desert Area Resources and Training
          </h1>
          <h2 className="text-lg md:text-xl font-medium mb-4">Our Mission is to:</h2>
          <p className="text-gray-600 mb-2">
            Provide support and opportunities for people who have intellectual or developmental disabilities
          </p>
          <p className="text-gray-600 mb-2">
            to make positive choices, to live and learn together, and pursue the dreams and lifestyles they choose.
          </p>
        </div>
      </div>

      <div className="space-y-6 text-gray-700 text-sm md:text-base mb-12">
        <p>
          DART offers programs and services to people with and without developmental disabilities or other special
          needs. Our staff is here to provide services and opportunities to meet the needs of the individual.
        </p>
        <p>
          After an initial referral from the State of California - Department of Developmental Services - Regional
          Center, young children who are found eligible are assessed and their plans are developed on an individual
          basis. Children in this program are offered specialized instruction and supports to aid with their
          development. The ratio of child to teacher is kept as low as 1-to-1, toddler and pre-school settings.
        </p>
        <p>
          Children with developmental disabilities are provided with early intervention services to address their
          educational and social developmental milestones. Our Early Childhood Services teach children basic educational
          skills and social skills they need to prepare for attending school in the future.
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

      {/* Partner Logos */}
      <div className="flex flex-wrap justify-center gap-8 mb-12">
        <Image src="/images/home/sponsor1.jpg" alt="Sponsor 1" width={150} height={80} className="object-contain" />
        <Image src="/images/home/sponsor2.jpg" alt="Sponsor 2" width={150} height={80} className="object-contain" />
        <Image src="/images/home/sponsor3.jpg" alt="Sponsor 3" width={150} height={80} className="object-contain" />
      </div>

      {/* History Section */}
      <div className="space-y-4 text-gray-700 text-sm">
        <h3 className="font-semibold text-base">The History of Desert Area Resources and Training</h3>
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
              Activity on the Fair Grounds. In 1961, twenty parents of children with disabilities met and established
              the Indian Wells Valley Council for Retarded Children. The council developed a recreation program for
              preschoolers with disabilities, which continued until 1966.
            </p>
          </div>
        </div>
        <p>
          The council also worked with the Kern County Superintendent of Schools and petitioned the Office of Kern
          County Superintendent of Schools to establish a special education class in the valley. Until then, there was
          no classes in the valley for students with mental or intellectual challenges, except for rare cases involving
          mild special needs. At that time, children under six or over sixteen years of age with developmental
          disabilities were not served by the public school system. Children with more severe disabilities or who were
          developmentally disabled were not cared until the early 1970's.
        </p>
        <p>
          In 1962, the United Way of the Indian Wells Valley began their support of the organization; this support
          continues to the present day. The Sunshine House began in 1973 as a day care center for adults with
          developmental disabilities. In 1979, the Indian Wells Valley Association for Retarded Citizens changed its
          name Indian Wells Valley Council for Retarded Children and the Sunshine Activity Training Center merged to
          become the Indian Wells Valley Association for Retarded Citizens. Renamed Desert Area Resources and Training
          in 1991, the organization now provides a variety of programs and services to both children and adults.
          Expansion has continued over the years to include not only the Indian Wells Valley but the entire surrounding
          communities and concepts for the Inyo and Eastern communities in Inyo, Kern, Mono, and San Bernardino
          counties.
        </p>
      </div>
    </>
  )
}

// About Us Page Component
function AboutUsPage() {
  return (
    <div className="space-y-8">
      <div className="text-sm text-gray-700 space-y-4">
        <p>Serving the community since 1961</p>
        <p>
          DART operates with highly experienced, well-trained in 1961. We are a member of American Network of Community
          Options and Resources (ANCOR), Department of Developmental Services, and Eastern Sierra Regional Center
          (ESRC).
        </p>
        <p>
          DART is a non-profit 501(c)(3) which has been a member of our community for 50+ years. We employ approx. 90
          people.
        </p>
        <p>
          DART is accredited by CARF (Commission on Accreditation of Rehabilitation Commission). A copy of the
          accreditation is available upon request from Executive Director's office. For more information about CARF
          visit{" "}
          <a href="#" className="text-blue-600 hover:underline">
            www.carf.org
          </a>
        </p>
        <p>Our Mission is:</p>
        <p>To be a part of people with disabilities in communities and integration in society.</p>
        <p>
          To provide quality training to enhance the development of individuals who have developmental of dignity and
          worth.
        </p>
        <p>
          To provide opportunities for people with disabilities to make positive choices and pursue dreams and
          lifestyles together while fulfilling their needs for meaningful, supported living and recreational skills.
        </p>
        <p>We offer a personal touch on how individuals with family, community and integration in society.</p>
      </div>

      {/* Services Section */}
      <div className="flex flex-col items-center mt-12 space-y-6">
        {/* Transportation */}
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 flex-shrink-0">
            <Image
              src="/images/home/Transportation.jpg"
              alt="Transportation"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold">Transportation</h3>
          </div>
        </div>

        {/* Early Childhood Services */}
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 flex-shrink-0">
            <Image
              src="/images/home/Early Childhood Services.jpg"
              alt="Early Childhood Services"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold">Early Childhood Services</h3>
          </div>
        </div>

        {/* Supported Living Services */}
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 flex-shrink-0">
            <Image
              src="/images/home/Supported Living Services.jpg"
              alt="Supported Living Services"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold">Supported Living Services</h3>
          </div>
        </div>

        {/* Artists on the Edge */}
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 flex-shrink-0">
            <Image
              src="/images/home/Artists on the Edge.jpg"
              alt="Artists on the Edge"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold">Artists on the Edge</h3>
          </div>
        </div>

        {/* Autism Day Camp */}
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 flex-shrink-0">
            <Image
              src="/images/home/Autism Day Camp.png"
              alt="Autism Day Camp"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold">Autism Day Camp</h3>
          </div>
        </div>

        {/* Employment Services */}
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 flex-shrink-0">
            <Image
              src="/images/home/Employment Services.jpg"
              alt="Employment Services"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold">Employment Services</h3>
          </div>
        </div>

        {/* Commission for the Accreditation of Rehabilitation Facilities */}
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 flex-shrink-0">
            <Image
              src="/images/home/Commission for the Accreditation.jpg"
              alt="Commission for the Accreditation of Rehabilitation Facilities"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold">Commission for the Accreditation of Rehabilitation Facilities</h3>
          </div>
        </div>

        {/* DART Thrift Store */}
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 flex-shrink-0">
            <Image
              src="/images/home/DART Thrift Store.jpg"
              alt="DART Thrift Store"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold">DART Thrift Store</h3>
          </div>
        </div>

        {/* Secure Document Shredding */}
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 flex-shrink-0">
            <Image
              src="/images/home/Secure Document Shredding.jpg"
              alt="Secure Document Shredding"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold">Secure Document Shredding</h3>
          </div>
        </div>
      </div>
    </div>
  )
}

// Board of Directors Page Component
function BoardPage() {
  return (
    <div className="space-y-8">
      <p className="text-center text-gray-600 max-w-2xl mx-auto">
        Our Board of Directors is comprised of dedicated community members who volunteer their time and expertise to
        guide our organization. They are committed to our mission and work tirelessly to ensure that DART continues to
        provide high-quality services.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        {/* Board Member 1 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-48 bg-gray-200">
            <Image
              src="/images/home/Board of Directors greg-boske.jpg"
              alt="Board Member 1"
              width={300}
              height={200}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg">Board Member Name</h3>
            <p className="text-blue-600 text-sm mb-2">Position Title</p>
            <p className="text-gray-600 text-sm">
              Brief biography of the board member highlighting their background, expertise, and commitment to DART's
              mission.
            </p>
          </div>
        </div>

        {/* Board Member 2 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-48 bg-gray-200">
            <Image
              src="/images/home/Board of DirectorsLady.jpg"
              alt="Board Member 2"
              width={300}
              height={200}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg">Board Member Name</h3>
            <p className="text-blue-600 text-sm mb-2">Position Title</p>
            <p className="text-gray-600 text-sm">
              Brief biography of the board member highlighting their background, expertise, and commitment to DART's
              mission.
            </p>
          </div>
        </div>

        {/* Board Member 3 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-48 bg-gray-200">
            <Image
              src="/images/home/Board of Directors lady 2.jpg"
              alt="Board Member 3"
              width={300}
              height={200}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg">Board Member Name</h3>
            <p className="text-blue-600 text-sm mb-2">Position Title</p>
            <p className="text-gray-600 text-sm">
              Brief biography of the board member highlighting their background, expertise, and commitment to DART's
              mission.
            </p>
          </div>
        </div>

        {/* Board Member 4 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-48 bg-gray-200">
            <Image
              src="/images/home/Board of Directorslady3.jpg"
              alt="Board Member 4"
              width={300}
              height={200}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg">Board Member Name</h3>
            <p className="text-blue-600 text-sm mb-2">Position Title</p>
            <p className="text-gray-600 text-sm">
              Brief biography of the board member highlighting their background, expertise, and commitment to DART's
              mission.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Placeholder components for other pages
function Title9Page() {
  return (
    <div className="space-y-8">
      <p className="text-center">Title 9 information content will be displayed here.</p>
    </div>
  )
}

function ActionDayPage() {
  return (
    <div className="space-y-8">
      <p className="text-center">Action Day Gala information will be displayed here.</p>
    </div>
  )
}

function JobsPage() {
  return (
    <div className="space-y-8">
      <p className="text-center">Job listings and application information will be displayed here.</p>
    </div>
  )
}
