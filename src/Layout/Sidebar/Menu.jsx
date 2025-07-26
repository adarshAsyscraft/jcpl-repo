import { icon } from "leaflet";

export const MENUITEMS = [
  {
    menutitle: "General",
    menucontent: "Dashboards,Widgets",
    Items: [
      {
        title: "Dashboard",
        icon: "home",
        type: "sub",
        badge: "badge badge-light-primary",
        badgetxt: "5",
        // active: false,
        roles: ["admin", "sub-admin", "trainer"],
        children: [
          {
            path: `${process.env.PUBLIC_URL}/dashboard/default`,
            title: "Default",
            type: "link",
            roles: ["admin", "sub-admin"],
          },
          {
            path: `${process.env.PUBLIC_URL}/dashboard/users`,
            title: "Users",
            type: "link",
          },
          {
            path: `${process.env.PUBLIC_URL}/dashboard/icds`,
            title: "Icd",
            type: "link",
          },
          {
            path: `${process.env.PUBLIC_URL}/dashboard/yards`,
            title: "Yard",
            type: "link",
          },
          {
            path: `${process.env.PUBLIC_URL}/dashboard/containers`,
            title: "Container",
            type: "link",
          },
          {
            path: `${process.env.PUBLIC_URL}/dashboard/containerTypes`,
            title: "Container Type",
            type: "link",
          },
          {
            path: `${process.env.PUBLIC_URL}/dashboard/forwarders`,
            title: "Shipping Line/Forwarders",
            type: "link",
          },
          {
            path: `${process.env.PUBLIC_URL}/dashboard/transporter`,
            title: "Transporter",
            type: "link",
          },
          {
            path: `${process.env.PUBLIC_URL}/dashboard/survey-clients`,
            title: "Survey Clients",
            type: "link",
          },
          {
            path: `${process.env.PUBLIC_URL}/dashboard/measurement-rate`,
            title: "Measurement Rate",
            type: "link",
          },
        ],
      },
      {
        path: `${process.env.PUBLIC_URL}/app/operation`,
        title: "Operation",
        icon: "others",
        type: "link",
      },
    ],
  },
];
