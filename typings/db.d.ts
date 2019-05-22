export let version: 1;

export let continets: {
  [x: string]: {
    name: string,
    countries: string[]
  }
};

export let countries: {
  [x: string]: {
    name: string,
    continent: string
  }
};