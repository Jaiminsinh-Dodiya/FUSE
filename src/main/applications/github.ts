import type { AppDefinition } from "./AppDefinition";
import type { AppSecurityConfig } from "../security/SecurityPolicy";

export const githubAppDefinition: AppDefinition = {
  id: "github",
  name: "GitHub",
  url: "https://github.com",
  category: "development",
};

// Mirrors docs/applications/github.md — keep both in sync. The host
// list here is the unverified hypothesis flagged in that doc; treat
// any navigation block you see in practice as a signal to update
// BOTH this file and the doc, not just silently work around it.
export const githubSecurityConfig: AppSecurityConfig = {
  allowedNavigationHosts: [
    "github.com",
    "githubassets.com",
    "githubusercontent.com",
  ],
  grantedPermissions: [],
};