"use client";

import React from "react";
import { CustomDropdown } from "@/components/ui/dropdown-menu";
import SwitchtoDarkMode from "./SwitchtoDarkMode";

const Nav: React.FC = () => {
  return (
    <nav className="flex justify-between items-center p-4 bg-background text-foreground">
      <h1 className="text-lg font-bold">CMS Schedule App</h1>
      <div className="flex items-center gap-4">
        {/* SwitchtoDarkMode is self-contained */}
        <SwitchtoDarkMode />
        <div className="relative z-10">
          <CustomDropdown />
        </div>
      </div>
    </nav>
  );
};

export default Nav;