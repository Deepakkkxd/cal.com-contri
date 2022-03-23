/**
 * @file
 * This module is supposed to instantiate the SDK with appropriate namespace
 * This isn't required to be shared with any other package.
 */
import { SdkEventManager } from "@calcom/embed-core/sdk-event-manager";

export let sdkEventManager: SdkEventManager | null = null;
if (typeof window !== "undefined") {
  sdkEventManager = new SdkEventManager(new URL(document.URL).searchParams.get("embed"));
}
