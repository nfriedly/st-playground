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
  ["enahced", enhanced],
  ["enhanced2", enhanced2],
  ["enhanced25", enhanced25],
  ["sortedSummer", enhanced3]
])("%s", (name, lowHigh) => {
  test.each([
    // temps, expected
    [[-1, 1], 1],
    [[1, 2, 3, 4, 5, 6], 1],
    [[6, 5, 4, 3, 2, 1, 7], 6]
  ])("Temps: %p expected: %i", (temps, expected) => {
    const actual = lowHigh(temps);
    expect(actual).toBe(expected);
  });

  test("10k array", () => {
    const actual = lowHigh(bigTemps);
    expect(actual).toBe(5000);
  });
});
