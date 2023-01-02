import Link from "next/link";
import { useEffect, useState } from "react";

import { COMPANY_NAME } from "@calcom/lib/constants";
import pkg from "@calcom/web/package.json";

export default function Credits() {
  const CalComVersion = `v.${pkg.version}-${
    process.env.NEXT_PUBLIC_WEBSITE_URL === "https://cal.com" ? "h" : "sh"
  }-${process.env.CALCOM_LICENSE_KEY === "" ? "ee" : "ce"}`;

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <small className="mx-3 mt-1 mb-2 hidden text-[0.5rem] opacity-50 lg:block">
      &copy; {new Date().getFullYear()} {COMPANY_NAME}{" "}
      {hasMounted && (
        <Link href="https://go.cal.com/releases">
          <a target="_blank" className="hover:underline">
            {CalComVersion}
          </a>
        </Link>
      )}
    </small>
  );
}
