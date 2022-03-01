import { Prisma } from "@prisma/client";
import _ from "lodash";

import type { App } from "@calcom/types/App";

import { validJson } from "@lib/jsonUtils";

export const APPS = {
  jitsi_video: {
    installed: true,
    type: "jitsi_video",
    title: "Jitsi Meet",
    imageSrc: "integrations/jitsi.svg",
    description: "Video Conferencing",
    variant: "conferencing",
    name: "Daily",
    label: "",
    slug: "",
    category: "",
    logo: "",
    publisher: "",
    url: "",
    verified: true,
    trending: true,
    rating: 0,
    reviews: 0,
  },
  huddle01_video: {
    installed: true,
    type: "huddle01_video",
    title: "Huddle01",
    imageSrc: "integrations/huddle.svg",
    description: "Video Conferencing",
    variant: "conferencing",
    name: "Daily",
    label: "",
    slug: "",
    category: "",
    logo: "",
    publisher: "",
    url: "",
    verified: true,
    trending: true,
    rating: 0,
    reviews: 0,
  },
  tandem_video: {
    installed: !!(process.env.TANDEM_CLIENT_ID && process.env.TANDEM_CLIENT_SECRET),
    type: "tandem_video",
    title: "Tandem Video",
    imageSrc: "integrations/tandem.svg",
    description: "Virtual Office | Video Conferencing",
    variant: "conferencing",
    name: "Daily",
    label: "",
    slug: "",
    category: "",
    logo: "",
    publisher: "",
    url: "",
    verified: true,
    trending: true,
    rating: 0,
    reviews: 0,
  },
} as Record<string, App>;

export const ALL_INTEGRATIONS = [
  {
    installed: true,
    type: "metamask_web3",
    title: "Metamask",
    imageSrc: "integrations/apple-calendar.svg",
    description: "For personal and business calendars",
    variant: "web3",
  },
];
