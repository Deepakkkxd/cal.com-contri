const VERCEL_URL = process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "";
const RAILWAY_STATIC_URL = process.env.RAILWAY_STATIC_URL ? `https://${process.env.RAILWAY_STATIC_URL}` : "";
const HEROKU_URL = process.env.HEROKU_APP_NAME ? `https://${process.env.HEROKU_APP_NAME}.herokuapp.com` : "";
const RENDER_URL = process.env.RENDER_EXTERNAL_URL ? `https://${process.env.RENDER_EXTERNAL_URL}` : "";
export const CALCOM_ENV = process.env.CALCOM_ENV || process.env.NODE_ENV;
export const IS_PRODUCTION = CALCOM_ENV === "production";
export const IS_PRODUCTION_BUILD = process.env.NODE_ENV === "production";

export const WEBAPP_URL =
  process.env.NEXT_PUBLIC_WEBAPP_URL ||
  VERCEL_URL ||
  RAILWAY_STATIC_URL ||
  HEROKU_URL ||
  RENDER_URL ||
  "http://localhost:3000";

// OAuth needs to have HTTPS(which is not generally setup locally) and a valid tld(*.local isn't a valid tld)
// So for development purpose, we would stick to localhost only
export const WEBAPP_URL_FOR_OAUTH = IS_PRODUCTION ? WEBAPP_URL : "http://localhost:3000";

/** @deprecated use `WEBAPP_URL` */
export const BASE_URL = WEBAPP_URL;
export const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "https://app.beenthere.tech";
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Beenthere.tech";
export const SUPPORT_MAIL_ADDRESS = process.env.NEXT_PUBLIC_SUPPORT_MAIL_ADDRESS || "help@beenthere.tech";
export const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "Beenthere.tech, Inc.";
export const SENDER_ID = process.env.NEXT_PUBLIC_SENDER_ID || "Beenthere";
export const SENDER_NAME = process.env.NEXT_PUBLIC_SENDGRID_SENDER_NAME || "Beenthere.tech";

// This is the URL from which all Beenthere Links and their assets are served.
// Use website URL to make links shorter(app.beenthere.tech and not app.app.beenthere.tech)
// As website isn't setup for preview environments, use the webapp url instead
export const CAL_URL = new URL(WEBAPP_URL).hostname.endsWith(".vercel.app") ? WEBAPP_URL : WEBSITE_URL;

export const IS_CALCOM =
  WEBAPP_URL &&
  (new URL(WEBAPP_URL).hostname.endsWith("beenthere.tech") ||
    new URL(WEBAPP_URL).hostname.endsWith("beenthere.dev") ||
    new URL(WEBAPP_URL).hostname.endsWith("beenthere.qa") ||
    new URL(WEBAPP_URL).hostname.endsWith("beenthere-staging.com"));

export const CONSOLE_URL =
  new URL(WEBAPP_URL).hostname.endsWith(".beenthere.dev") ||
  new URL(WEBAPP_URL).hostname.endsWith(".beenthere.qa") ||
  new URL(WEBAPP_URL).hostname.endsWith(".beenthere-staging.com") ||
  process.env.NODE_ENV !== "production"
    ? `https://console.beenthere.dev`
    : `https://console.app.beenthere.tech`;
export const IS_SELF_HOSTED = !(
  new URL(WEBAPP_URL).hostname.endsWith(".beenthere.dev") ||
  new URL(WEBAPP_URL).hostname.endsWith(".app.beenthere.tech")
);
export const EMBED_LIB_URL = process.env.NEXT_PUBLIC_EMBED_LIB_URL || `${WEBAPP_URL}/embed/embed.js`;
export const TRIAL_LIMIT_DAYS = 14;

export const HOSTED_CAL_FEATURES = process.env.NEXT_PUBLIC_HOSTED_CAL_FEATURES || !IS_SELF_HOSTED;

/** @deprecated use `WEBAPP_URL` */
export const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_WEBAPP_URL || `https://${process.env.VERCEL_URL}`;
export const LOGO = "/beenthere-logo-white-word.svg";
export const LOGO_ICON = "/cal-com-icon-white.svg";
export const AVATAR_FALLBACK = "/avatar.svg";
export const FAVICON_16 = "/favicon-16x16.png";
export const FAVICON_32 = "/favicon-32x32.png";
export const APPLE_TOUCH_ICON = "/apple-touch-icon.png";
export const MSTILE_ICON = "/mstile-150x150.png";
export const ANDROID_CHROME_ICON_192 = "/android-chrome-192x192.png";
export const ANDROID_CHROME_ICON_256 = "/android-chrome-256x256.png";
export const ROADMAP = "https://app.beenthere.tech/roadmap";
export const DESKTOP_APP_LINK = "https://app.beenthere.tech/download";
export const JOIN_DISCORD = "https://go.app.beenthere.tech/discord";
export const POWERED_BY_URL = `${WEBSITE_URL}/?utm_source=embed&utm_medium=powered-by-button`;
export const DOCS_URL = "https://app.beenthere.tech/docs";
export const DEVELOPER_DOCS = "https://developer.app.beenthere.tech";
export const SEO_IMG_DEFAULT = `${WEBSITE_URL}/og-image.png`;
// The Dynamic OG Image is passed through Next's Image API to further optimize it.
// This results in a 80% smaller image 🤯. It is however important that for the query
// parameters you pass to the /api/social/og/image endpoint, you wrap them in encodeURIComponent
// as well, otherwise the URL won't be valid.
export const SEO_IMG_OGIMG = `${CAL_URL}/_next/image?w=1200&q=100&url=${encodeURIComponent(
  "/api/social/og/image"
)}`;
export const SEO_IMG_OGIMG_VIDEO = `${WEBSITE_URL}/video-og-image.png`;
export const IS_STRIPE_ENABLED = !!(
  process.env.STRIPE_CLIENT_ID &&
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY &&
  process.env.STRIPE_PRIVATE_KEY
);
/** Self hosted shouldn't checkout when creating teams unless required */
export const IS_TEAM_BILLING_ENABLED = IS_STRIPE_ENABLED && (!IS_SELF_HOSTED || HOSTED_CAL_FEATURES);
export const FULL_NAME_LENGTH_MAX_LIMIT = 50;
export const MINUTES_TO_BOOK = process.env.NEXT_PUBLIC_MINUTES_TO_BOOK || "5";

// Needed for orgs
export const ALLOWED_HOSTNAMES = JSON.parse(`[${process.env.ALLOWED_HOSTNAMES || ""}]`) as string[];
export const RESERVED_SUBDOMAINS = JSON.parse(`[${process.env.RESERVED_SUBDOMAINS || ""}]`) as string[];

export const ORGANIZATION_MIN_SEATS = 30;

// Needed for emails in E2E
export const IS_MAILHOG_ENABLED = process.env.E2E_TEST_MAILHOG_ENABLED === "1";
export const CALCOM_VERSION = process.env.NEXT_PUBLIC_CALCOM_VERSION as string;
