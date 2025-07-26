import { PositionsArray } from "@/config/position";
import {
  ActionFull,
  CommunityCard,
  HandFull,
  HandPlayerCards,
  HandPlayerFull,
} from "@/server/serverRequests/hand";
import { FaHandPaper, FaUserAlt } from "react-icons/fa";
import MiniPokerCard from "./MiniPokerCard";
import { CommunityCardAction } from "@/app/review/[id]/page";
import { moneyToBB } from "@/config/action";
import { ReplayAction } from "@/server/getReplayActionsFromHand";

function getChipsUIPosition(
  middleOfTheTable: { x: number; y: number },
  playerUIPosition: { x: number; y: number }
) {
  const dirVecX = playerUIPosition.x - middleOfTheTable.x;
  const dirVecY = playerUIPosition.y - middleOfTheTable.y;
  const length = Math.sqrt(dirVecX * dirVecX + dirVecY * dirVecY);
  const normalizedDirVecX = dirVecX / length;
  const normalizedDirVecY = dirVecY / length;

  return {
    x: playerUIPosition.x - normalizedDirVecX * Math.max(0.3 * length, 15),
    y: playerUIPosition.y - normalizedDirVecY * Math.max(0.6 * length, 15),
  };
}

function getRelativeSeat(seat: number, heroSeat: number) {
  return (seat - heroSeat + 9) % 9;
}

export default function PokerTable({
  handFull,
  replayActions,
}: {
  handFull: HandFull;
  replayActions: ReplayAction[];
}) {
  const middleOfTheTable = { x: 60, y: 32 };
  const hero = handFull.players.find((player) => player.isHero)!;
  const players = [...handFull.players].sort(
    (a, b) =>
      (a.position
        ? PositionsArray.indexOf(a.position)
        : PositionsArray.length) -
      (b.position ? PositionsArray.indexOf(b.position) : PositionsArray.length)
  );
  const dealerSeat = handFull.dealerSeat;

  const playerUIPositions = [
    { x: 60, y: 64, nameOnTop: false, dealerBtnPosition: { x: 68, y: 55 } },
    { x: 5, y: 55, nameOnTop: false, dealerBtnPosition: { x: 15, y: 50 } },
    { x: -10, y: 28, nameOnTop: false, dealerBtnPosition: { x: 0, y: 30 } },
    { x: 15, y: -5, nameOnTop: true, dealerBtnPosition: { x: 25, y: 5 } },
    { x: 60, y: -10, nameOnTop: true, dealerBtnPosition: { x: 70, y: 2 } },
    { x: 105, y: -5, nameOnTop: true, dealerBtnPosition: { x: 88, y: 3 } },
    { x: 126, y: 25, nameOnTop: false, dealerBtnPosition: { x: 110, y: 18 } },
    { x: 120, y: 55, nameOnTop: false, dealerBtnPosition: { x: 108, y: 45 } },
    { x: 100, y: 65, nameOnTop: false, dealerBtnPosition: { x: 85, y: 55 } },
  ];

  const lastAction = [...replayActions].reverse()[0];

  const lastPlayerAction = [...replayActions]
    .reverse()
    .find((action) => action.action !== null);

  const lastStreet =
    lastPlayerAction?.action?.street === "pre"
      ? "preflop"
      : lastPlayerAction?.action?.street;

  const lastStreetActions = replayActions.filter((action) => {
    return (
      action.action?.street === lastStreet ||
      (action.action?.street === "pre" && lastStreet === "preflop")
    );
  });

  const pot = moneyToBB(
    replayActions
      .filter((action) => action.action !== null)
      .reduce((acc, action) => {
        if (
          [
            "Bet",
            "Call",
            "BetAndAllIn",
            "CallAndAllIn",
            "PostSmallBlind",
            "PostBigBlind",
          ].includes(action.action.name) &&
          action.action.amount !== null
        ) {
          return acc + action.action.amount;
        }

        if (
          ["Raise", "RaiseAndAllIn"].includes(action.action.name) &&
          action.action.amount2 !== null
        ) {
          return acc + action.action.amount2;
        }

        return acc;
      }, 0),
    handFull.smallBlind
  );

  const flop = replayActions.find(
    (action) =>
      action.communityCard !== null &&
      "flop1" in action.communityCard &&
      "flop2" in action.communityCard &&
      "flop3" in action.communityCard
  );

  const turn = replayActions.find(
    (action) => action.communityCard !== null && "turn" in action.communityCard
  );

  const river = replayActions.find(
    (action) => action.communityCard !== null && "river" in action.communityCard
  );

  const communityCards: CommunityCard | null = {
    handId: handFull.id,
    flop1:
      flop?.communityCard && "flop1" in flop.communityCard
        ? flop.communityCard.flop1
        : null,
    flop2:
      flop?.communityCard && "flop2" in flop.communityCard
        ? flop.communityCard.flop2
        : null,
    flop3:
      flop?.communityCard && "flop3" in flop.communityCard
        ? flop.communityCard.flop3
        : null,
    turn:
      turn?.communityCard && "turn" in turn.communityCard
        ? turn.communityCard.turn
        : null,
    river:
      river?.communityCard && "river" in river.communityCard
        ? river.communityCard.river
        : null,
  };

  return (
    <div className="p-4 pt-20 pr-20">
      <div className="w-120 h-64 bg-secondary rounded-full relative">
        {players.map((player) => (
          <PokerPlayer
            key={`player-${player.seat}`}
            player={player}
            heroSeat={hero.seat}
            playerUIPositions={playerUIPositions}
            isHighlighted={lastAction.action?.player.id === player.id}
            isFolded={
              replayActions
                .slice(0, replayActions.length - 1)
                .filter(
                  (action) =>
                    action.action?.player.id === player.id &&
                    action.action?.name === "Fold"
                ).length !== 0
            }
          />
        ))}
        {players.map((player) => {
          const showsCards =
            replayActions.filter((action) => {
              return (
                action.action?.player.id === player.id &&
                ["Shows", "Muck"].includes(action.action?.name)
              );
            }).length !== 0;

          const isFolded =
            replayActions.filter((action) => {
              return (
                action.action?.player.id === player.id &&
                action.action?.name === "Fold"
              );
            }).length !== 0;

          return (
            <div key={`player-cards-${player.seat}`}>
              {(player.isHero || showsCards) && !isFolded && (
                <PokerPlayerCards
                  playerCards={player.cards}
                  playerUIPosition={
                    playerUIPositions[getRelativeSeat(player.seat, hero.seat)]
                  }
                />
              )}
            </div>
          );
        })}
        {communityCards && <CommunityCards communityCards={communityCards} />}
        <PokerDealerButton
          seat={dealerSeat}
          heroSeat={hero.seat}
          playerUIPositions={playerUIPositions}
        />

        {pot !== null && <PokerPot pot={pot} />}
        {players.map((player) => {
          if (lastAction.communityCard !== null) {
            return null;
          }
          const amount = lastStreetActions
            .filter((action) => action.action?.player.id === player.id)
            .reduce((acc, action) => {
              const somebodyCollected =
                lastStreetActions.filter(
                  (action) => action.action?.name === "Collected"
                ).length !== 0;

              if (action.action?.name === "Collected") {
                return acc + action.action!.amount!;
              }

              if (action.action?.name === "UncalledBet") {
                return acc + action.action!.amount!;
              }

              if (somebodyCollected) {
                return acc;
              }

              if (action.action?.name === "Bet") {
                return acc + action.action!.amount!;
              }
              if (action.action?.name === "Raise") {
                return acc + action.action!.amount2!;
              }
              if (action.action?.name === "Call") {
                return acc + action.action!.amount!;
              }
              if (action.action?.name === "BetAndAllIn") {
                return acc + action.action!.amount!;
              }
              if (action.action?.name === "CallAndAllIn") {
                return acc + action.action!.amount!;
              }
              if (action.action?.name === "RaiseAndAllIn") {
                return acc + action.action!.amount2!;
              }
              if (action.action?.name === "PostSmallBlind") {
                return acc + action.action!.amount!;
              }
              if (action.action?.name === "PostBigBlind") {
                return acc + action.action!.amount!;
              }

              return acc;
            }, 0);

          const relativeSeat = getRelativeSeat(player.seat, hero.seat);
          const { x, y } = getChipsUIPosition(
            middleOfTheTable,
            playerUIPositions[relativeSeat]
          );

          if (!amount) {
            if (
              [
                ...lastStreetActions.filter(
                  (x) =>
                    x.action &&
                    x.action.name &&
                    x.action.player.id === player.id
                ),
              ].reverse()[0]?.action?.name === "Check"
            ) {
              return (
                <PokerCheckIcon key={`check-${player.seat}`} x={x} y={y} />
              );
            }
            return null;
          }

          return (
            <PokerChips
              key={`chips-${player.seat}`}
              x={x}
              y={y}
              amount={amount}
              smallBlind={handFull.smallBlind}
            />
          );
        })}
      </div>
    </div>
  );
}

function PokerPlayer({
  player,
  heroSeat,
  playerUIPositions,
  isFolded,
  isHighlighted,
}: {
  player: HandPlayerFull;
  heroSeat: number;
  playerUIPositions: { x: number; y: number; nameOnTop: boolean }[];
  isFolded: boolean;
  isHighlighted: boolean;
}) {
  const { name, position, isSittingOut, seat } = player;
  const relativeSeat = getRelativeSeat(seat, heroSeat);
  const { x, y, nameOnTop } = playerUIPositions[relativeSeat];

  return (
    <div
      className="absolute"
      style={{ top: y * 4, left: x * 4, transform: "translate(-50%, -50%)" }}
    >
      <div className="flex flex-col items-center gap-5">
        {nameOnTop && (
          <div className="flex flex-col items-center justify-center gap-1 text-sm text-foreground">
            <span>{name}</span>
            {position && <span>({position})</span>}
            {isSittingOut && <span>Sitting out</span>}
          </div>
        )}
        <FaUserAlt
          size={50}
          className={
            isFolded || isSittingOut
              ? "text-gray-500"
              : isHighlighted
              ? "text-blue-500"
              : "text-amber-500"
          }
        />
        {!nameOnTop && (
          <div className="flex flex-col items-center justify-center gap-1 text-sm text-foreground">
            <span>{name}</span>
            {position && <span>({position})</span>}
            {isSittingOut && <span>Sitting out</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function PokerDealerButton({
  seat,
  heroSeat,
  playerUIPositions,
}: {
  seat: number;
  heroSeat: number;
  playerUIPositions: {
    x: number;
    y: number;
    nameOnTop: boolean;
    dealerBtnPosition: { x: number; y: number };
  }[];
}) {
  const { x, y } =
    playerUIPositions[getRelativeSeat(seat, heroSeat)].dealerBtnPosition;

  return (
    <div className="absolute" style={{ top: y * 4, left: x * 4 }}>
      <div className="bg-primary text-[8px] text-secondary p-1 rounded-full">
        BTN
      </div>
    </div>
  );
}

function PokerChips({
  x,
  y,
  amount,
  showAmount = true,
  smallBlind,
}: {
  x: number;
  y: number;
  amount: number;
  showAmount?: boolean;
  smallBlind: number;
}) {
  const chips = [
    { color: "red", value: 0.5 },
    { color: "green", value: 5 },
    { color: "blue", value: 10 },
    { color: "amber", value: 25 },
    { color: "purple", value: 50 },
  ];
  const calculateChips = (amount: number) => {
    return [
      {
        color: "red",
        count: 1,
      },
    ];
    const chipCounts = chips
      .sort((a, b) => b.value - a.value)
      .map((chip) => {
        const count = Math.floor(amount / chip.value);
        amount = Number((amount % chip.value).toFixed(2));
        return { color: chip.color, count };
      });
    return chipCounts;
  };

  const chipCounts = calculateChips(amount);

  return (
    <div className="absolute" style={{ top: y * 4, left: x * 4 }}>
      {chipCounts.map(({ color, count }, i) => {
        return (
          <div key={i}>
            {count > 0 &&
              Array.from({ length: count }).map((_, j) => {
                const index = i * chipCounts.length + j;
                const towerHeight = 5; // Number of chips per tower
                const maxTowersInRow = 4;
                const towerIndex = Math.floor(index / towerHeight);
                const chipPositionInTower = index % towerHeight;
                return (
                  <div
                    key={index}
                    className={`absolute bg-${color}-500 text-secondary w-4 h-4 rounded-full shadow-lg border-1 border-dashed border-foreground`}
                    style={{
                      top:
                        -chipPositionInTower * 1.5 +
                        Math.floor(towerIndex / maxTowersInRow) * 23,
                      left:
                        (towerIndex % maxTowersInRow) * 18 +
                        chipPositionInTower * 1.5,
                    }}
                  ></div>
                );
              })}
          </div>
        );
      })}
      {showAmount && (
        <div className="absolute top-[-10px] right-[0] text-xs text-foreground translate-x-1/2 -translate-y-1/2">
          {moneyToBB(amount, smallBlind)}BB
        </div>
      )}
    </div>
  );
}

function PokerCheckIcon({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute" style={{ top: y * 4, left: x * 4 }}>
      <FaHandPaper size={20} className="text-orange-500" />
    </div>
  );
}

function PokerPlayerCards({
  playerCards,
  playerUIPosition,
}: {
  playerCards: HandPlayerCards | null;
  playerUIPosition: { x: number; y: number; nameOnTop: boolean };
}) {
  return (
    <div
      className={`absolute -translate-x-1/2 h-min`}
      style={{
        top: playerUIPosition.nameOnTop
          ? (playerUIPosition.y + 11) * 4
          : (playerUIPosition.y - 5) * 4,
        left: playerUIPosition.x * 4,
      }}
    >
      <div className="flex flex-row items-center justify-center gap-0">
        <MiniPokerCard card={playerCards?.card1 || null} sizeName="md" />
        <MiniPokerCard card={playerCards?.card2 || null} sizeName="md" />
      </div>
    </div>
  );
}

function CommunityCards({ communityCards }: { communityCards: CommunityCard }) {
  return (
    <div className="absolute top-[35%] left-[30%]  -translate-y-1/2 flex flex-row gap-2">
      {communityCards?.flop1 && (
        <MiniPokerCard card={communityCards.flop1} sizeName="lg" />
      )}
      {communityCards?.flop2 && (
        <MiniPokerCard card={communityCards.flop2} sizeName="lg" />
      )}
      {communityCards?.flop3 && (
        <MiniPokerCard card={communityCards.flop3} sizeName="lg" />
      )}
      {communityCards?.turn && (
        <MiniPokerCard card={communityCards.turn} sizeName="lg" />
      )}
      {communityCards?.river && (
        <MiniPokerCard card={communityCards.river} sizeName="lg" />
      )}
    </div>
  );
}

function PokerPot({ pot }: { pot: number }) {
  return (
    <div className="absolute top-[45%] left-[45%] text-xs text-foreground ">
      Pot: {pot}BB
    </div>
  );
}
