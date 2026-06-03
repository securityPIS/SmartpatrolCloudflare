import { IMAGES_STORE, idbDelete, idbGet, idbPut } from "../../../shared/lib/idb";

const PREFIX = "idb://";

/** Persist a captured blob locally; returns an `idb://<id>` reference. */
export async function putImage(blob: Blob): Promise<string> {
  const id = crypto.randomUUID();
  await idbPut(IMAGES_STORE, id, blob);
  return `${PREFIX}${id}`;
}

export function isIdbUrl(url: string): boolean {
  return url.startsWith(PREFIX);
}

/** Resolve an `idb://` reference to a blob (or null if missing/not idb). */
export async function getImageBlob(url: string): Promise<Blob | null> {
  if (!isIdbUrl(url)) return null;
  const id = url.slice(PREFIX.length);
  return (await idbGet<Blob>(IMAGES_STORE, id)) ?? null;
}

export async function deleteImage(url: string): Promise<void> {
  if (!isIdbUrl(url)) return;
  await idbDelete(IMAGES_STORE, url.slice(PREFIX.length));
}
