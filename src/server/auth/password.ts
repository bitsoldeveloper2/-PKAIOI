import "server-only";
import { hash, verify } from "@node-rs/argon2";

/**
 * Argon2id with the OWASP-recommended baseline (19 MiB memory, 2 iterations,
 * 1 lane). Parameters are encoded in the hash, so they can be raised later
 * and old hashes will keep verifying.
 */
const ARGON2_OPTIONS = {
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password, ARGON2_OPTIONS);
  } catch {
    return false;
  }
}

/**
 * Constant-cost dummy verification used when the account does not exist, so
 * a login attempt against an unknown email takes as long as a real one.
 */
let dummyHash: string | undefined;
export async function burnPasswordCheck(password: string) {
  dummyHash ??= await hashPassword("pioai-timing-equalizer");
  await verifyPassword(dummyHash, password);
}
