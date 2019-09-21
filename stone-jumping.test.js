const assert = require("assert");

const MAX_STONE_TIME = 100000;

const bruteForce = (stones, maxJump) => {
  for (let time = 0; time <= MAX_STONE_TIME; time++) {
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
  return -1;
};

// go from -1 to N in with lowest values in between
// can jump up to D values
// only positive values count
// there are no duplicate positive values
// if not possible, it should return -1

// faster than rememberCur, but also known to be wrong on some inputs (!)
// const badFirstPass = (A, D) => {
//   let curPos = -1;
//   for (let time = 0; time <= stones.length; time++) {
//     // on each tick, test the stones within jumping range
//     for (
//       let stonePos = curPos + 1;
//       stonePos < A.length && stonePos <= curPos + D;
//       stonePos++
//     ) {
//       const aboveWaterTime = A[stonePos];
//       const aboveWater = aboveWaterTime !== -1 && aboveWaterTime <= time;
//       if (aboveWater) {
//         curPos = stonePos;
//       }
//     }
//     if (curPos + D >= A.length) {
//       return time;
//     }
//   }
//   return -1;
// };

// faster than rememberCur, but also known to be wrong on some inputs (!)
const fixedFirstPass = (A, D) => {
  let curPos = -1;
  for (let time = 0; time <= MAX_STONE_TIME; time++) {
    // on each tick, test the stones within jumping range
    for (
      let stonePos = curPos + 1;
      stonePos < A.length && stonePos <= curPos + D;
      stonePos++
    ) {
      const aboveWaterTime = A[stonePos];
      const aboveWater = aboveWaterTime !== -1 && aboveWaterTime <= time;
      if (aboveWater) {
        curPos = stonePos;
      }
    }
    if (curPos + D >= A.length) {
      return time;
    }
  }
  return -1;
};

// previous fastest overall, but slow when a stone has a very high surface time
const rememberCur = (stones, maxJump) => {
  let cur = -1;
  for (let time = 0; time <= MAX_STONE_TIME; time++) {
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
  return -1;
};

const optimized2 = (stones, maxJump) => {
  let cur = -1;
  for (let time = 0; time <= MAX_STONE_TIME; time++) {
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
  return -1;
};

const optimized3 = (stones, maxJump) => {
  let cur = -1;
  const endZone = stones.length - maxJump;
  for (let time = 0; time <= MAX_STONE_TIME; time++) {
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
  return -1;
};

const tooClever = (stones, maxJump) => {
  let position = -1;
  let timeRequired = 0;
  const endZone = stones.length - maxJump;
  while (position < endZone) {
    const stonesToEvaluate = stones
      .slice(position + 1, position + 1 + maxJump)
      .filter(stoneTime => stoneTime > -1);
    //console.log({ stonesToEvaluate });
    if (!stonesToEvaluate.length) {
      return -1;
    }
    const nextStoneTime = stonesToEvaluate.reduce((lowest, cur) =>
      Math.min(lowest, cur)
    );
    const nextPosition = stones.indexOf(nextStoneTime);
    assert(nextPosition > position, `${nextPosition} > ${position}`);
    position = nextPosition;
    timeRequired = Math.max(timeRequired, nextStoneTime);
  }
  return timeRequired;
};

const lowestReducer = (lowest, cur) => Math.min(lowest, cur);
const noLambda = (stones, maxJump) => {
  let position = -1;
  let timeRequired = 0;
  const endZone = stones.length - maxJump;
  while (position < endZone) {
    const stonesToEvaluate = stones
      .slice(position + 1, position + 1 + maxJump)
      .filter(stoneTime => stoneTime > -1);
    //console.log({ stonesToEvaluate });
    if (!stonesToEvaluate.length) {
      return -1;
    }
    const nextStoneTime = stonesToEvaluate.reduce(lowestReducer);
    const nextPosition = stones.indexOf(nextStoneTime);
    assert(nextPosition > position, `${nextPosition} > ${position}`);
    position = nextPosition;
    timeRequired = Math.max(timeRequired, nextStoneTime);
    //console.log({ position, timeRequired });
  }
  return timeRequired;
};

// new fastest overall
const lessClever = (A, D) => {
  let position = -1;
  let timeRequired = 0;
  const endZone = A.length - D;
  while (position < endZone) {
    let nextStone = -1;
    let nextStoneTime = Infinity;
    const curFarthestReachableStone = position + D;
    // for the stones within jumping distance, find the one that will surface first
    for (let i = position + 1; i <= curFarthestReachableStone; i++) {
      const stoneTime = A[i];
      if (stoneTime > -1 && stoneTime <= nextStoneTime) {
        nextStoneTime = stoneTime;
        nextStone = i;
      }
    }
    if (nextStone === -1) {
      // no stone within jumping distance will ever surface
      return -1;
    }
    // jump to that stone and increase the time required if necessary
    position = nextStone;
    timeRequired = Math.max(timeRequired, nextStoneTime);
  }
  return timeRequired;
};

const stones = require("./10k-stones.json");
describe.each([
  //["brute force", bruteForce],
  //["bad first pass", badFirstPass],
  ["fixed first pass", fixedFirstPass],
  //["rememberCur", rememberCur],
  // ["optimized2", optimized2],
  // ["optimized3", optimized3],
  //["too clever", tooClever],
  //["noLambda", noLambda],
  ["less clever", lessClever]
])("%s", (name, calcTime) => {
  test.each([
    // stones, maxJump, expected
    // [[-1], 2, 0],
    // [[-1, -1, -1, -1], 1, -1],
    // [[-1, -1, -1, -1], 2, -1],
    // [[-1, -1, -1, -1], 3, -1],
    // [[-1, -1, -1, -1], 4, -1],
    // [[-1, -1, -1, -1], 5, 0],
    [[100000], 1, 100000],
    [[-1, 100000, -1], 2, 100000]
    // ,[[3, 2, 1], 1, 3],
    // [[-1, 1, -1], 2, 1],
    // [[-1, 6, -1, 5, -1, 4], 2, 6],
    // [[-1, 4, -1, 5, -1, 6], 2, 6],
    // [[-1, 4, -1, 5, 6, -1], 2, 6],
    // [[-1, 4, -1, 5, -1], 2, 5],
    // [[-1, 3, 4, -1, -1, 2], 3, 4],
    // [[7, 3, 10, 2, 4, 5, 9, 8, 6, 1], 1, 10],
    // [[7, 3, 10, 2, 4, 5, 9, 8, 6, 1], 2, 8],
    // [[7, 3, 10, 2, 4, 5, 9, 8, 6, 1], 3, 6],
    // [[7, 3, 10, 2, 4, 5, 9, 8, 6, 1], 4, 5],
    // [[7, 3, 10, 2, 4, 5, 9, 8, 6, 1], 5, 4],
    // [[7, 3, 10, 2, 4, 5, 9, 8, 6, 1], 6, 2]
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

  test("100k array, 100k+1 jump", () => {
    const arr = new Array(100000);
    arr.fill(-1);
    const jumpLength = arr.length + 1;
    expect(calcTime(arr, jumpLength)).toBe(0);
  });

  test("100k array, 100k-1 jump", () => {
    const arr = new Array(100000);
    arr.fill(-1);
    const jumpLength = arr.length - 1;
    expect(calcTime(arr, jumpLength)).toBe(-1);
  });
});
