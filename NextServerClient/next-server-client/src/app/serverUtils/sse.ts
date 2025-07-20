const subscribers = new Set<(data: string) => void>();

export type HandNotification = {
  type: "new-hand" | "connected";
};

export function notifyNewHand() {
  const data = JSON.stringify({ type: "new-hand" });
  const subscribersToRemove = new Set<(data: string) => void>();

  for (const send of subscribers) {
    try {
      send(data);
    } catch (error) {
      // If the controller is closed, remove this subscriber
      if (
        error instanceof Error &&
        error.message.includes("Controller is already closed")
      ) {
        subscribersToRemove.add(send);
      } else {
        console.error("Error sending SSE data:", error);
      }
    }
  }

  // Remove closed subscribers
  for (const send of subscribersToRemove) {
    subscribers.delete(send);
  }
}

export function createSseStream() {
  return new ReadableStream({
    start(controller) {
      const send = (data: string) => {
        try {
          controller.enqueue(`data: ${data}\n\n`);
        } catch (error) {
          // If controller is closed, remove from subscribers
          subscribers.delete(send);
          throw error;
        }
      };

      subscribers.add(send);
      send(JSON.stringify({ type: "connected" }));
    },
    cancel() {
      // Clean up when stream is cancelled
      for (const send of subscribers) {
        subscribers.delete(send);
      }
    },
  });
}
