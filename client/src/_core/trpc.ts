import { createTRPCReact } from "@trpc/react-query";
import { TRPCClientError, type TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import type { AppRouter } from "../../../server/routers";
import { demoCall, DemoError } from "./demo-api";

// Typed tRPC client. `AppRouter` is a TYPE-ONLY import from the server, so the
// whole API is end-to-end typed without shipping server code to the browser.
export const trpc = createTRPCReact<AppRouter>();

// DEMO MODE: instead of httpBatchLink -> /trpc, every call is answered by the
// in-browser store in ./demo-api (localStorage). No backend or database needed.
// To use the real server again, swap this link back to:
//   httpBatchLink({ url: "/trpc", transformer: superjson })
const demoLink: TRPCLink<AppRouter> = () =>
  ({ op }) =>
    observable((observer) => {
      let cancelled = false;
      demoCall(op.path, op.input)
        .then((data) => {
          if (cancelled) return;
          observer.next({ result: { data } });
          observer.complete();
        })
        .catch((e: unknown) => {
          if (cancelled) return;
          const code = e instanceof DemoError ? e.code : "INTERNAL_SERVER_ERROR";
          const message = e instanceof Error ? e.message : "Something went wrong.";
          observer.error(
            new TRPCClientError(message, {
              result: { error: { message, code: -32600, data: { code, httpStatus: 400, path: op.path } } } as never,
            }),
          );
        });
      return () => {
        cancelled = true;
      };
    });

export function makeTrpcClient() {
  return trpc.createClient({ links: [demoLink] });
}
