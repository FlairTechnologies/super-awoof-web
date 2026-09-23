"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureAttribution } from "@/lib/attribution";

/**
 * Parks the ad network's txid/pubid the moment a paid visitor lands, on
 * whichever page they land on.
 *
 * Reads window.location.search rather than useSearchParams: this mounts in the
 * root layout, and useSearchParams would force a Suspense boundary around every
 * statically rendered page or fail the production build.
 */
export const AttributionCapture = () => {
  const pathname = usePathname();

  useEffect(() => {
    captureAttribution();
  }, [pathname]);

  return null;
};
