"use client";

import Link from "next/link";
import { DropdownMenuItem } from "./dropdown-menu";

interface ProfileButtonProps {
  onClick?: () => void;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ onClick }) => (
  <DropdownMenuItem asChild>
    <Link href="/profile/me" onClick={onClick} className="w-full">
      Profile
    </Link>
  </DropdownMenuItem>
);

export default ProfileButton;