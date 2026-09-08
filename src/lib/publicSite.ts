/** Canonical public origin served by the edge worker (see worker/). */
export const PUBLIC_SITE_URL = "https://zuzone.boogaav.workers.dev";
export const CALENDAR_FEED_URL = `${PUBLIC_SITE_URL}/calendar.ics`;
export const CALENDAR_WEBCAL_URL = CALENDAR_FEED_URL.replace(/^https?:/, "webcal:");
export const GOOGLE_CALENDAR_SUBSCRIBE_URL = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(CALENDAR_WEBCAL_URL)}`;
