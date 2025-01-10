"use client";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 text-center py-4 text-sm text-gray-500">
      <p>
        Powered by <span className="font-bold">Unenter</span> &copy; {currentYear}
      </p>
    </footer>
  );
};

export default Footer;