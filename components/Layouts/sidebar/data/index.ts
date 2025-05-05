import * as Icons from "../icons";

export const NAV_DATA = (id: string) => [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        items: [
          {
            title: "Overview",
            url: `/dashboard/${id}`,
          },
        ],
      },
      {
        title: "Calendar",
        url: `/dashboard/${id}/calendar`,
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "Profile",
        url: `/dashboard/${id}/profile`,
        icon: Icons.User,
        items: [],
      },
      {
        title: "Forms",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Form Elements",
            url: `/dashboard/${id}/forms/form-elements`,
          },
          {
            title: "Form Layout",
            url: `/dashboard/${id}/forms/form-layout`,
          },
        ],
      },
      {
        title: "Tables",
        url: `/dashboard/${id}/tables`,
        icon: Icons.Table,
        items: [
          {
            title: "Tables",
            url: `/dashboard/${id}/tables`,
          },
        ],
      },
      {
        title: "Pages",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Settings",
            url: `/dashboard/${id}/settings`,
          },
        ],
      },
    ],
  },
  {
    label: "OTHERS",
    items: [
      {
        title: "Charts",
        icon: Icons.PieChart,
        items: [
          {
            title: "Basic Chart",
            url: `/dashboard/${id}/charts/basic-chart`,
          },
        ],
      },
      {
        title: "UI Elements",
        icon: Icons.FourCircle,
        items: [
          {
            title: "Alerts",
            url: `/dashboard/${id}/ui-elements/alerts`,
          },
          {
            title: "Buttons",
            url: `/dashboard/${id}/ui-elements/buttons`,
          },
        ],
      },
      {
        title: "Authentication",
        icon: Icons.Authentication,
        items: [
          {
            title: "Sign In",
            url: `/dashboard/${id}/auth/sign-in`,
          },
        ],
      },
    ],
  },
];