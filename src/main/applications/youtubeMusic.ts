import type { AppDefinition } from "./AppDefinition";
import type { AppSecurityConfig } from "../security/SecurityPolicy";

export const youtubeMusicAppDefinition: AppDefinition = {
  id: "youtube-music",
  name: "YouTube Music",
  url: "https://music.youtube.com",
  category: "entertainment",
};

// Unverified hypothesis, same status as github.ts originally was —
// needs real click-through testing before being trusted, per brief
// section 14. Google's login flow commonly redirects through
// accounts.google.com, so that's included pre-emptively but flagged.
export const youtubeMusicSecurityConfig: AppSecurityConfig = {
  allowedNavigationHosts: [
    "music.youtube.com",
    "youtube.com",
    "ytimg.com",
    "googleusercontent.com",
    "accounts.google.com",
  ],
  grantedPermissions: [],
};