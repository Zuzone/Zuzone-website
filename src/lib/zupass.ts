/**
 * Zupass sign-in via the Z API app connector (https://pod.org/z-api).
 *
 * connect() mounts a hidden iframe pointed at zupass.org inside `element`; the user
 * approves the Zapp's permissions in a modal. We only ask for two permissions:
 *   READ_PUBLIC_IDENTIFIERS — the user's EdDSA public key (their Zupass identity)
 *   SIGN_POD                — sign a small POD proving they authorised an action
 *
 * The connector is loaded lazily so the home bundle stays small.
 */
import type { JSONPOD } from "@pcd/pod";

export const ZUPASS_URL = "https://zupass.org";

export interface ZupassSession {
  /** EdDSA public key of the Zupass identity (base64). */
  publicKey: string;
  /** Sign a POD with the given string/int entries; returns the JSON form for transport. */
  sign: (entries: Record<string, string | number>) => Promise<JSONPOD>;
}

export async function connectZupass(element: HTMLElement): Promise<ZupassSession> {
  const [{ connect }, { POD }] = await Promise.all([import("@parcnet-js/app-connector"), import("@pcd/pod")]);
  const z = await connect(
    {
      name: "Zuzone",
      permissions: {
        READ_PUBLIC_IDENTIFIERS: {},
        SIGN_POD: {},
      },
    },
    element,
    ZUPASS_URL,
  );
  const publicKey = await z.identity.getPublicKey();
  return {
    publicKey,
    sign: async (entries) => {
      const podEntries = Object.fromEntries(
        Object.entries(entries).map(([k, v]) =>
          typeof v === "number" ? [k, { type: "int" as const, value: BigInt(v) }] : [k, { type: "string" as const, value: v }],
        ),
      );
      const signed = await z.pod.sign(podEntries);
      return POD.load(signed.entries, signed.signature, signed.signerPublicKey).toJSON();
    },
  };
}
