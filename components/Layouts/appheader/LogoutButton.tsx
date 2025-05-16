"use client";

import React from "react";
import { DropdownMenuItem } from "./dropdown-menu";

const LogoutButton: React.FC = () => {
  const handleLogout = () => {
    window.location.href = "/auth/logout";
  };

  return (
    <DropdownMenuItem variant="danger" onSelect={handleLogout}>
      Log out
    </DropdownMenuItem>
  );
};

export default LogoutButton;