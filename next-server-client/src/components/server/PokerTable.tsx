import { PositionsArray } from "@/config/position";
import {
  CommunityCard,
  HandFull,
  HandPlayerCards,
  HandPlayerFull,
} from "@/server/serverRequests/hand";
import { FaUserAlt } from "react-icons/fa";
import MiniPokerCard from "./MiniPokerCard";

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
    y: -5 + playerUIPosition.y - normalizedDirVecY * Math.max(0.5 * length, 15),
  };
}

function getRelativeSeat(seat: number, heroSeat: number) {
  return (seat - heroSeat + 9) % 9;
}

export default function PokerTable({ handFull }: { handFull: HandFull }) {
  const middleOfTheTable = { x: 60, y: 32 };
  const hero = handFull.players.find((player) => player.isHero);
  const players = [...handFull.players].sort(
    (a, b) =>
      (a.position
        ? PositionsArray.indexOf(a.position)
        : PositionsArray.length) -
      (b.position ? PositionsArray.indexOf(b.position) : PositionsArray.length)
  );
  const dealerSeat = getRelativeSeat(
    players.findIndex((player) => player.position === "BTN"),
    hero?.seat!
  );

  const playerUIPositions = [
    { x: 60, y: 64, nameOnTop: false },
    { x: 5, y: 55, nameOnTop: false },
    { x: -10, y: 28, nameOnTop: false },
    { x: 15, y: -5, nameOnTop: true },
    { x: 60, y: -10, nameOnTop: true },
    { x: 105, y: -5, nameOnTop: true },
    { x: 126, y: 18, nameOnTop: false },
    { x: 126, y: 50, nameOnTop: false },
    { x: 100, y: 65, nameOnTop: false },
  ];
  const pot = 0;

  return (
    <div className="p-4 pt-20 pr-20">
      <div className="w-120 h-64 bg-secondary rounded-full relative">
        {players.map((player) => (
          <>
            <PokerPlayer
              key={player.seat}
              player={player}
              heroSeat={hero?.seat!}
              playerUIPositions={playerUIPositions}
            />
            {player?.cards && (
              <PokerPlayerCards
                key={player.seat}
                playerCards={player.cards}
                playerUIPosition={
                  playerUIPositions[getRelativeSeat(player.seat, hero?.seat!)]
                }
              />
            )}
          </>
        ))}
        {handFull.communityCards && (
          <CommunityCards communityCards={handFull.communityCards} />
        )}
        <PokerDealerButton seat={dealerSeat} />
        {pot !== null && <PokerPot pot={pot} />}
        {players.map((player) => (
          <PokerChips
            x={
              getChipsUIPosition(
                middleOfTheTable,
                playerUIPositions[player.seat - 1]
              ).x
            }
            y={
              getChipsUIPosition(
                middleOfTheTable,
                playerUIPositions[player.seat - 1]
              ).y
            }
            amount={1}
          />
        ))}
      </div>
    </div>
  );
}

function PokerPlayer({
  player,
  heroSeat,
  playerUIPositions,
}: {
  player: HandPlayerFull;
  heroSeat: number;
  playerUIPositions: { x: number; y: number; nameOnTop: boolean }[];
}) {
  const { name, position, isSittingOut, seat } = player;
  const relativeSeat = getRelativeSeat(seat, heroSeat);
  const { x, y, nameOnTop } = playerUIPositions[relativeSeat];

  return (
    <div
      className="absolute flex flex-col items-center gap-1"
      style={{ top: y * 4, left: x * 4, transform: "translate(-50%, -50%)" }}
    >
      {nameOnTop && (
        <div className="flex flex-col items-center justify-center gap-1 text-sm text-foreground">
          <span>{name}</span>
          <span>{position}</span>
        </div>
      )}
      <FaUserAlt size={50} className="text-amber-500" />
      {!nameOnTop && (
        <div className="flex flex-col items-center justify-center gap-1 text-sm text-foreground">
          <span>{name}</span>
          {position && <span>({position})</span>}
          {isSittingOut && <span>Sitting out</span>}
        </div>
      )}
    </div>
  );
}

function PokerDealerButton({ seat }: { seat: number }) {
  const dealerBtnPositions = [
    { x: 65, y: 50 },
    { x: 15, y: 45 },
    { x: 3, y: 30 },
    { x: 8, y: 10 },
    { x: 47, y: 2 },
    { x: 85, y: 3 },
    { x: 105, y: 15 },
    { x: 108, y: 30 },
    { x: 100, y: 40 },
  ];

  const { x, y } = dealerBtnPositions[seat - 1];

  return (
    <div className="absolute" style={{ top: y * 4, left: x * 4 }}>
      <div className="bg-primary text-[10px] text-secondary p-2 rounded-full">
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
}: {
  x: number;
  y: number;
  amount: number;
  showAmount?: boolean;
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
          {amount}BB
        </div>
      )}
    </div>
  );
}

function PokerPlayerCards({
  playerCards,
  playerUIPosition,
}: {
  playerCards: HandPlayerCards;
  playerUIPosition: { x: number; y: number; nameOnTop: boolean };
}) {
  return (
    <div
      className="absolute bottom-[-9em] flex flex-row items-center justify-center gap-1 -translate-x-1/2"
      style={{ top: playerUIPosition.y * 4, left: playerUIPosition.x * 4 }}
    >
      {playerCards?.card1 && (
        <MiniPokerCard card={playerCards.card1} sizeName="lg" />
      )}
      {playerCards?.card2 && (
        <MiniPokerCard card={playerCards.card2} sizeName="lg" />
      )}
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
