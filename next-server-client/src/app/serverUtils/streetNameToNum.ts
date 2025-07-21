export default function streetNameToNum(streetName: string) {
  switch (streetName) {
    case "pre":
      return 0;
    case "preflop":
      return 1;
    case "flop":
      return 2;
    case "turn":
      return 3;
    case "river":
      return 4;
    case "showdown":
      return 5;
    default:
      throw new Error(`Invalid street name: ${streetName}`);
  }
}
