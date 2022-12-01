import { APP_NAME, SUPPORT_MAIL_ADDRESS } from "@calcom/lib/constants";
import { validJson } from "@calcom/lib/jsonUtils";
import type { AppMeta } from "@calcom/types/App";

import _package from "./package.json";

export const metadata = {
  name: "Google Meet",
  description: _package.description,
  installed: !!(process.env.GOOGLE_API_CREDENTIALS && validJson(process.env.GOOGLE_API_CREDENTIALS)),
  slug: "google-meet",
  category: "video",
  type: "google_video",
  title: "Google Meet",
  imageSrc: "/api/app-store/googlevideo/logo.webp",
  variant: "conferencing",
  logo: "/api/app-store/googlevideo/logo.webp",
  publisher: APP_NAME,
  rating: 5,
  reviews: 69,
  trending: false,
  url: "https://cal.com/",
  verified: true,
  isGlobal: true,
  email: SUPPORT_MAIL_ADDRESS,
  appData: {
    location: {
      linkType: "dynamic",
      type: "integrations:google:meet",
      label: "Google Meet",
    },
  },
} as AppMeta;

export default metadata;
