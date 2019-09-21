const baseline = temps => {
  for (let summerStart = 1; summerStart < temps.length; summerStart++) {
    const winter = temps.slice(0, summerStart);
    const summer = temps.slice(summerStart);
    const warmestDayInWinter = winter.reduce((warmest, temp) =>
      Math.max(warmest, temp)
    );
    const coldestDayInSummer = summer.reduce((coldest, temp) =>
      Math.min(coldest, temp)
    );
    if (
      winter.every(temp => temp < coldestDayInSummer) &&
      summer.every(temp => temp > warmestDayInWinter)
    ) {
      return summerStart;
    }
  }
};

// any temp in winter must be lower than every temp in summer
// winter and summer must have at least one day each
// prefer the shortest winter if there are multiple potential options
// all inputs will be possible to process

// faster than fastest, but known to be incorrect on some (unknown) inputs (!)
// function badFirstPass(T) {
//   let warmestDayOfWinter = T[0];
//   for (let i = 0; i < T.length - 1; i++) {
//     const lastDay = T[i];
//     if (warmestDayOfWinter < lastDay) {
//       warmestDayOfWinter = lastDay;
//     }
//     // todo: can this be an else-if ?
//     if (isAnyDaysColder(T, warmestDayOfWinter, i + 1)) {
//       continue;
//     } else {
//       return i + 1; // arrays are 0-indexed, but partition isn't
//     }
//   }
// }
// function isAnyDaysColder(T, warmestDayOfWinter, startIndex) {
//   for (let i = startIndex; i < T.length; i++) {
//     if (T[i] < warmestDayOfWinter) {
//       return true;
//     }
//   }
//   return false;
// }

function fixedFirstPass(T) {
  let warmestDayOfWinter = T[0];
  for (let i = 0; i < T.length - 1; i++) {
    const lastDay = T[i];
    if (warmestDayOfWinter < lastDay) {
      warmestDayOfWinter = lastDay;
    }
    // todo: can this be an else-if ?
    if (isAnyDayColder(T, warmestDayOfWinter, i + 1)) {
      continue;
    } else {
      console.log({ T, warmestDayOfWinter, i, lastDay });
      return i + 1; // arrays are 0-indexed, but partition isn't
    }
  }
}

function isAnyDayColder(T, warmestDayOfWinter, startIndex) {
  for (let i = startIndex; i < T.length; i++) {
    if (T[i] <= warmestDayOfWinter) {
      return true;
    }
  }
  return false;
}

const enhanced = temps => {
  let warmestDayInWinter = -Infinity;
  let coldestDayInSummer = temps.reduce((coldest, temp) =>
    Math.min(coldest, temp)
  );
  for (let summerStart = 1; summerStart < temps.length; summerStart++) {
    const lastDayOfWinterTemp = temps[summerStart - 1];
    const firstDayOfSummerTemp = temps[summerStart];
    if (lastDayOfWinterTemp === coldestDayInSummer) {
      // the former coldest day in summer is now in winter. Find the new coldest day in summer
      coldestDayInSummer = temps
        .slice(summerStart)
        .reduce((coldest, temp) => Math.min(coldest, temp));
    }
    if (lastDayOfWinterTemp > warmestDayInWinter) {
      warmestDayInWinter = lastDayOfWinterTemp;
    }
    const winter = temps.slice(0, summerStart);
    const summer = temps.slice(summerStart);

    if (
      winter.every(temp => temp < coldestDayInSummer) &&
      summer.every(temp => temp > warmestDayInWinter)
    ) {
      return summerStart;
    }
  }
};

// second fastest
const enhanced2 = temps => {
  let warmestDayInWinter = -Infinity;
  let coldestDayInSummer = temps.reduce((coldest, temp) =>
    Math.min(coldest, temp)
  );
  for (let summerStart = 1; summerStart < temps.length; summerStart++) {
    const lastDayOfWinterTemp = temps[summerStart - 1];
    if (lastDayOfWinterTemp === coldestDayInSummer) {
      // the former coldest day in summer is now in winter. Find the new coldest day in summer
      // I can pre-sort these to avoid needing to run the reducer, but it's slower than the reducer
      coldestDayInSummer = temps
        .slice(summerStart)
        .reduce((coldest, temp) => Math.min(coldest, temp));
    }
    if (lastDayOfWinterTemp > warmestDayInWinter) {
      warmestDayInWinter = lastDayOfWinterTemp;
    }
    if (warmestDayInWinter < coldestDayInSummer) {
      return summerStart;
    }
  }
};

// fastest (slightly)
const coldestReducer = (coldest, temp) => Math.min(coldest, temp);
const enhanced25 = temps => {
  let warmestDayInWinter = -Infinity;
  let coldestDayInSummer = temps.reduce(coldestReducer);
  for (let summerStart = 1; summerStart < temps.length; summerStart++) {
    const lastDayOfWinterTemp = temps[summerStart - 1];
    if (lastDayOfWinterTemp === coldestDayInSummer) {
      // the former coldest day in summer is now in winter. Find the new coldest day in summer
      coldestDayInSummer = temps.slice(summerStart).reduce(coldestReducer);
    }
    if (lastDayOfWinterTemp > warmestDayInWinter) {
      warmestDayInWinter = lastDayOfWinterTemp;
    }
    if (warmestDayInWinter < coldestDayInSummer) {
      return summerStart;
    }
  }
};

// third fastest
const enhanced3 = temps => {
  let warmestTempInWinter = -Infinity;
  const summerSorted = temps.slice(1).sort((a, b) => a - b);
  let coldestTempInSummer = null;
  for (let summerStart = 1; summerStart < temps.length; summerStart++) {
    const lastDayOfWinterTemp = temps[summerStart - 1];
    if (
      lastDayOfWinterTemp === coldestTempInSummer ||
      coldestTempInSummer === null
    ) {
      // the former coldest day in summer is now in winter. Grab the next coldest day
      coldestTempInSummer = summerSorted.shift();
    } else {
      // remove lastDayOfWinterTemp from the summerSorted array
      summerSorted.splice(summerSorted.indexOf(lastDayOfWinterTemp), 1);
    }
    if (lastDayOfWinterTemp > warmestTempInWinter) {
      warmestTempInWinter = lastDayOfWinterTemp;
    }
    if (warmestTempInWinter < coldestTempInSummer) {
      return summerStart;
    }
  }
};

const bigTemps = require("./10k-low-high.json");
describe.each([
  ["baseline", baseline],
  //["bad first pass", badFirstPass],
  ["fixed first pass", fixedFirstPass],
  ["enahced", enhanced],
  ["enhanced2", enhanced2],
  ["enhanced25", enhanced25],
  ["sortedSummer", enhanced3]
])("%s", (name, lowHigh) => {
  test.each([
    // temps, expected
    [[-1, 1], 1],
    [[1, 2, 3, 4, 5, 6], 1],
    [[6, 5, 4, 3, 2, 1, 7], 6],
    [[5, -2, 3, 8, 6], 3],
    [[-5, -5, -5, -42, 6, 12], 4],
    [[-1, -2, -3, 4, 4, 5, 6, 7], 3],
    [[-1, -2, -3, -4, -4, 5, 6, 7], 5],
    [[-1, -2, -3, -4, -4, 0, 0, 5, 6, 7], 5],
    [[1, -1, -2, -3, -4, -4, 0, 0, 5, 6, 7], 8],
    [[1, -1, -2, -3, -4, -4, 1, 0, 0, 5, 6, 7], 9],
    [[1, -1, -2, -3, -4, -4, 0, 1, 0, 5, 6, 7], 9],
    [[1, -1, -2, -3, -4, -4, 0, 0, 1, 5, 6, 7], 9],
    [[1, -1, -2, -3, -4, -4, 0, 0, 5, 1, 6, 7], 10]
  ])("Temps: %p expected: %i", (temps, expected) => {
    const actual = lowHigh(temps);
    expect(actual).toBe(expected);
  });

  test("wide range arr", () => {
    const arr = [
      -665314,
      684474,
      -784923,
      901013,
      -639277,
      -30142,
      -347882,
      -20281,
      744893,
      -597364,
      891997,
      -344557,
      348086,
      -71397,
      -832775,
      -864368,
      962117,
      554614,
      630865,
      60867,
      44607,
      -821533,
      -702211,
      -299848,
      112870,
      -221012,
      -641345,
      953313,
      -323715,
      602358,
      264928,
      828031,
      790306,
      -93493,
      128130,
      -631510,
      -786558,
      897990,
      684424,
      740608,
      240419,
      -899633,
      -937864,
      -223075,
      -466123,
      728252,
      -805529,
      -672477,
      621246,
      -416025,
      498114,
      926639,
      988496,
      -297195,
      -512712,
      45125,
      -92085,
      -539169,
      -45998,
      185379,
      -13833,
      736882,
      30386,
      139940,
      1321,
      -405543,
      870304,
      757373,
      -262830,
      970245,
      -816690,
      -431284,
      832573,
      -310567,
      462969,
      694818,
      686145,
      -300317,
      -813610,
      -789655,
      -771660,
      479988,
      233133,
      -248232,
      -819075,
      -216584,
      598635,
      645017,
      549919,
      -504713,
      -369210,
      938255,
      -878690,
      -480403,
      -484428,
      334357,
      8238,
      -736020,
      -552777,
      -217014,
      999999
    ];
    const actual = lowHigh(arr);
    expect(actual).toBe(100);
  });

  test("meh", () => {
    const arr = [
      -55,
      -22,
      -95,
      -1,
      34,
      10,
      14,
      26,
      2,
      36,
      4,
      -47,
      -89,
      65,
      44,
      81,
      84,
      -82,
      23,
      -13,
      53,
      -95,
      89,
      -60,
      95,
      63,
      -3,
      -24,
      58,
      -10,
      24,
      63,
      -32,
      -90,
      22,
      47,
      -69,
      62,
      -45,
      8,
      98,
      63,
      -91,
      -8,
      -38,
      -55,
      -10,
      72,
      79,
      86,
      -22,
      56,
      30,
      36,
      -14,
      87,
      63,
      98,
      -51,
      -49,
      21,
      95,
      -78,
      78,
      83,
      89,
      66,
      7,
      -57,
      -48,
      -70,
      19,
      20,
      -26,
      -30,
      -32,
      76,
      -22,
      -28,
      97,
      -96,
      -69,
      -5,
      -91,
      57,
      90,
      12,
      -14,
      68,
      -39,
      44,
      -24,
      11,
      -3,
      -19,
      -4,
      55,
      93,
      9999
    ];
    const actual = lowHigh(arr);
    expect(actual).toBe(98);
  });

  test("10k array", () => {
    const actual = lowHigh(bigTemps);
    expect(actual).toBe(5000);
  });
});
