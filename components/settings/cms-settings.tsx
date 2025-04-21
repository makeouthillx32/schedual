"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import BusinessManager from "./RWbuissnes";
import ChangeCleaning from "./changecleaning";

export default function CMSSettings() {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">CMS Cleaning Schedule Settings</h2>

      <div className="mb-10">
        <ChangeCleaning />
      </div>

      <div className="mb-10">
        <BusinessManager />
      </div>
    </div>
  );
}
