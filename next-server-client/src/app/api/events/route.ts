import { createSseStream } from "@/server/sse";

export const GET = () => {
  const stream = createSseStream();
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
};
