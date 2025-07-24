import Card from "@/components/server/Card";
import { Streets } from "@/config/action";
import getSessionOrRedirect from "@/server/getSessionOrRedirect";
import { getHandById } from "@/server/serverRequests/hand";
import { PageNotFoundError } from "next/dist/shared/lib/utils";
import { notFound } from "next/navigation";

export default async function ReviewIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const session = await getSessionOrRedirect();
    const { id } = await params;
    const hand = await getHandById(id, session.userId);

    if (!hand) {
      return notFound();
    }

    return (
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold">
          Review hand #{hand.pokerClientHandId}
        </h1>
        <Card>
          {hand.actions.map((action) => {
            return (
              <div key={action.id}>
                {action.sequence === 0 && action.street === Streets.Flop && (
                  <div>
                    <div>
                      Flop: {hand.communityCards?.flop1},{" "}
                      {hand.communityCards?.flop2}, {hand.communityCards?.flop3}
                    </div>
                  </div>
                )}
                {action.sequence === 0 && action.street === Streets.Turn && (
                  <div>
                    <div>Turn: {hand.communityCards?.turn}</div>
                  </div>
                )}
                {action.sequence === 0 && action.street === Streets.River && (
                  <div>
                    <div>River: {hand.communityCards?.river}</div>
                  </div>
                )}
                <div>
                  {action.player.name} ({action.player.position}) {action.name}{" "}
                  {action.amount ? `$${action.amount}` : ""}{" "}
                  {action.amount2 ? `to $${action.amount2}` : ""}
                  {action.card1 ? `${action.card1} ` : ""}
                  {action.card2 ? `${action.card2} ` : ""}
                  {action.text ? `(${action.text})` : ""}
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    );
  } catch (error) {
    if (error instanceof PageNotFoundError) {
      return notFound();
    }
    return (
      <div>
        Error: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }
}
