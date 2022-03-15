import appStore from ".";

export function getAppRegistry() {
  return [
    ...Object.values(appStore).map((app) => app.metadata),
    {
      name: "Google Meet",
      slug: "google-meet",
      category: "video",
      description:
        "Google Meet is Google's web-based video conferencing platform, designed to compete with major conferencing platforms.",
      logo: "https://cdn.iconscout.com/icon/free/png-256/google-meet-2923654-2416657.png",
      rating: 4.4,
      trending: true,
      reviews: 69,
    },
    {
      name: "Stripe",
      slug: "stripe_payment",
      category: "payment",
      description: "Stripe is the world's leading payment provider. Start charging for your bookings today.",
      logo: "/apps/stripe.svg",
      rating: 4.6,
      trending: true,
      reviews: 69,
    },
    {
      name: "Google Calendar",
      slug: "google-calendar",
      category: "calendar",
      description:
        "Google Calendar is the most popular calendar platform for personal and business calendars.",
      logo: "/apps/google-calendar.svg",
      rating: 4.9,
      reviews: 69,
    },
    {
      name: "CalDAV",
      slug: "caldav",
      category: "calendar",
      description: "CalDAV is an open calendar standard which connects to virtually every calendar.",
      logo: "/apps/caldav.svg",
      rating: 3.6,
      reviews: 69,
    },
    {
      name: "iCloud Calendar",
      slug: "icloud-calendar",
      category: "calendar",
      description:
        "iCloud Calendar is Apple's calendar platform for users of iCloud, and is used in the Apple Calendar app on iOS and macOS.",
      logo: "/apps/apple-calendar.svg",
      rating: 3.8,
      reviews: 69,
    },
  ];
}
