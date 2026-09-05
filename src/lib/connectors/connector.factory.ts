import type { Platform, ConnectorService } from "./types";
import { leetcodeService } from "./leetcode/leetcode.service";
import { codechefService } from "./codechef/codechef.service";
import { codeforcesService } from "./codeforces/codeforces.service";

/** Registry of all available connector services, keyed by platform slug. */
const CONNECTOR_REGISTRY: Record<Platform, ConnectorService> = {
  leetcode: leetcodeService,
  codechef: codechefService,
  codeforces: codeforcesService,
};

/**
 * Returns the connector service for a given platform.
 * Throws if an unsupported platform is requested (compile-time guard via Platform type).
 */
export function getConnectorService(platform: Platform): ConnectorService {
  const service = CONNECTOR_REGISTRY[platform];
  if (!service) {
    throw new Error(`No connector service registered for platform: ${platform}`);
  }
  return service;
}

/** All supported platform slugs */
export const SUPPORTED_PLATFORMS: Platform[] = ["leetcode", "codechef", "codeforces"];

export { CONNECTOR_REGISTRY };
