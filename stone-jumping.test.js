const assert = require("assert");

const bruteForce = (stones, maxJump) => {
  for (let time = 0; time <= stones.length; time++) {
    let cur = -1;
    for (let i = 0; i < stones.length; i++) {
      const stoneTime = stones[i];
      const isReachable = stoneTime > -1 && stoneTime <= time;
      if (cur + maxJump < i) {
        break;
      }
      if (isReachable) {
        cur = i;
      }
    }
    if (cur + maxJump >= stones.length) {
      return time;
    }
  }
};

// fastest
const rememberCur = (stones, maxJump) => {
  let cur = -1;
  for (let time = 0; time <= stones.length; time++) {
    for (let i = cur; i < stones.length; i++) {
      if (cur + maxJump < i) {
        break;
      }
      const stoneTime = stones[i];
      if (stoneTime > -1 && stoneTime <= time) {
        cur = i;
      }
    }
    if (cur + maxJump >= stones.length) {
      return time;
    }
  }
};

const optimized2 = (stones, maxJump) => {
  let cur = -1;
  for (let time = 0; time <= stones.length; time++) {
    for (let i = cur; cur + maxJump >= i && i < stones.length; i++) {
      const stoneTime = stones[i];
      if (stoneTime > -1 && stoneTime <= time) {
        cur = i;
      }
    }
    if (cur + maxJump >= stones.length) {
      return time;
    }
  }
};

const optimized3 = (stones, maxJump) => {
  let cur = -1;
  const endZone = stones.length - maxJump;
  for (let time = 0; time <= stones.length; time++) {
    for (let i = cur; cur + maxJump >= i && i < stones.length; i++) {
      const stoneTime = stones[i];
      if (stoneTime > -1 && stoneTime <= time) {
        cur = i;
      }
    }
    if (cur >= endZone) {
      return time;
    }
  }
};

const tooClever = (stones, maxJump) => {
  let position = -1;
  let timeRequired = 0;
  const endZone = stones.length - maxJump;
  while (position < endZone) {
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

const lowestReducer = (lowest, cur) => Math.min(lowest, cur);
const noLambda = (stones, maxJump) => {
  let position = -1;
  let timeRequired = 0;
  const endZone = stones.length - maxJump;
  while (position < endZone) {
    const stonesToEvaluate = stones.slice(position + 1, position + 1 + maxJump);
    //console.log({ stonesToEvaluate });
    const nextStoneTime = stonesToEvaluate
      .filter(stoneTime => stoneTime > -1)
      .reduce(lowestReducer);
    const nextPosition = stones.indexOf(nextStoneTime);
    assert(nextPosition > position, `${nextPosition} > ${position}`);
    position = nextPosition;
    timeRequired = Math.max(timeRequired, nextStoneTime);
    //console.log({ position, timeRequired });
  }
  return timeRequired;
};

// second fastest overall. Slightly on some inputs
const lessClever = (stones, maxJump) => {
  let position = -1;
  let timeRequired = 0;
  const endZone = stones.length - maxJump;
  while (position < endZone) {
    let nextStone = -1;
    let nextStoneTime = Infinity;
    const curFarthestReachableStone = position + 1 + maxJump;
    // for the stones within jumping distance, find the one that will surface first
    for (let i = position + 1; i < curFarthestReachableStone; i++) {
      const stoneTime = stones[i];
      if (stoneTime > -1 && stoneTime <= nextStoneTime) {
        nextStoneTime = stoneTime;
        nextStone = i;
      }
    }
    // jump to that stone and increase the time required if necessary
    position = nextStone;
    timeRequired = Math.max(timeRequired, nextStoneTime);
  }
  return timeRequired;
};

const stones = require("./10k-stones.json");
describe.each([
  ["brute force", bruteForce],
  ["rememberCur", rememberCur],
  ["optimized2", optimized2],
  ["optimized3", optimized3],
  ["too clever", tooClever],
  ["noLambda", noLambda],
  ["less clever", lessClever]
])("%s", (name, calcTime) => {
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
    const actual = calcTime(stones, maxJump);
    expect(actual).toBe(expected);
  });

  test.each([
    [1, 9999],
    [2, 9877],
    [3, 9532],
    [4, 9341],
    [5, 8985],
    [6, 8287],
    [7, 7510],
    [8, 7510],
    [9, 6227],
    [10, 5490],
    [100, 647],
    [1000, 68],
    [5000, 3],
    [10000, 0]
  ])("10k array, maxJump: %i; expected: %i", (maxJumps, expected) => {
    const actual = calcTime(stones, maxJumps);
    expect(actual).toBe(expected);
  });
});
