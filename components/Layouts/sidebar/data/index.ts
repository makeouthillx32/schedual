
"use client";

import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        items: [
          {
            title: "Homepage",
            url: "/",
          },
          {
            title: "Commercial Services",
            url: "/commercial",
          },
        ],
        roles: ["admin", "jobcoach"],
      },
      {
        title: "Calendar",
        url: "/calendar",
        icon: Icons.Calendar,
        items: [],
        roles: ["admin", "jobcoach", "client"],
      },
      {
        title: "Calendar Planner",
        url: "/calendar/planner",
        icon: Icons.Calendar,
        items: [],
        roles: ["admin"],
      },
      {
        title: "Profile",
        url: "/profile",
        icon: Icons.User,
        items: [],
        roles: ["admin", "jobcoach", "client"],
      },
      {
        title: "Messages",
        url: "/messages",
        icon: Icons.Authentication,
        items: [
          {
            title: "Chats",
            url: "/messages",
          },
          {
            title: "Activity",
            url: "/messages/activity",
          }
        ],
        roles: ["admin", "jobcoach", "client"],
      },
      {
        title: "Admin",
        icon: Icons.Authentication,
        items: [
          {
            title: "Members",
            url: "/settings/members",
            icon: Icons.User
          },
          {
            title: "Roles",
            url: "/settings/roles",
            icon: Icons.Authentication
          },
          {
            title: "Invites",
            url: "/settings/invites",
            icon: Icons.Table
          }
        ],
        roles: ["admin"],
      }
    ],
  },
  {
    label: "DEVELOPMENT",
    items: [
      {
        title: "Forms",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Form Elements",
            url: "/forms/form-elements",
          },
          {
            title: "Form Layout",
            url: "/forms/form-layout",
          },
        ],
        roles: ["admin"],
      },
      {
        title: "Tables",
        icon: Icons.Table,
        items: [
          {
            title: "Tables",
            url: "/tables",
          },
        ],
        roles: ["admin"],
      },
      {
        title: "UI Elements",
        icon: Icons.FourCircle,
        items: [
          {
            title: "Alerts",
            url: "/ui-elements/alerts",
          },
          {
            title: "Buttons",
            url: "/ui-elements/buttons",
          },
        ],
        roles: ["admin"],
      },
    ],
  },
];