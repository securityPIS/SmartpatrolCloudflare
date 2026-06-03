import { ServerTimeResponse } from "@smartpatrol/contracts";
import { apiGet } from "../../../shared/api/client";

/** Fetch + validate the trusted server time from the Worker. */
export async function fetchServerTime(): Promise<ServerTimeResponse> {
  const data = await apiGet("/server-time");
  return ServerTimeResponse.parse(data);
}
