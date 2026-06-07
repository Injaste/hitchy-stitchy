import { useMutation } from "@/lib/query/useMutation";

import { subscribeUser } from "./api";
import type { SubscribePayload } from "./types";

export function useSubscribeMutation() {
  return useMutation((payload: SubscribePayload) => subscribeUser(payload), {
    silent: true,
  });
}
