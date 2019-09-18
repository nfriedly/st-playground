const assert = require("assert");

const monkeyRiver = (stones, maxJump) => {
  let position = -1;
  let timeRequired = 0;
  const safeZone = stones.length - maxJump;
  while (position < safeZone) {
    const stonesToEvaluate = stones.slice(position + 1, position + 1 + maxJump);
    //console.log({ stonesToEvaluate });
    const nextStoneTime = stonesToEvaluate
      .filter(stoneTime => stoneTime > -1)
      .reduce((lowest, cur) => Math.min(lowest, cur));
    const nextPosition = stones.indexOf(nextStoneTime);
    assert(nextPosition > position, `${nextPosition} > ${position}`);
    position = nextPosition;
    timeRequired = Math.max(timeRequired, nextStoneTime);
    //console.log({ position, timeRequired });
  }
  return timeRequired;
};

test.each([
  // stones, maxJump, expected
  [[-1], 2, 0],
  [[3, 2, 1], 1, 3],
  [[-1, 1, -1], 2, 1],
  [[-1, 6, -1, 5, -1, 4], 2, 6],
  [[-1, 4, -1, 5, -1, 6], 2, 6],
  [[-1, 4, -1, 5, 6, -1], 2, 6],
  [[-1, 4, -1, 5, -1], 2, 5],
  [[-1, 3, 4, -1, -1, 2], 3, 4],
  [[7, 3, 10, 2, 4, 5, 9, 8, 6, 1], 1, 10],
  [[7, 3, 10, 2, 4, 5, 9, 8, 6, 1], 2, 8],
  [[7, 3, 10, 2, 4, 5, 9, 8, 6, 1], 3, 6],
  [[7, 3, 10, 2, 4, 5, 9, 8, 6, 1], 4, 5],
  [[7, 3, 10, 2, 4, 5, 9, 8, 6, 1], 5, 4],
  [[7, 3, 10, 2, 4, 5, 9, 8, 6, 1], 6, 2]
])("Stones: %p maxJump: %i expected: %i", (stones, maxJump, expected) => {
  const actual = monkeyRiver(stones, maxJump);
  expect(actual).toBe(expected);
});
