export interface IbUserExample {
  id: string;
  name: string;
  fruit: string;
  number: number;
  aDate?: Date;
  aDateString?: string;
}

const FRUITS: string[] = [
  'blueberry',
  'lychee',
  'kiwi',
  'mango',
  'peach',
  'lime',
  'pomegranate',
  'pineapple',
  'banana',
  'apple',
  'pear',
  'orange',
];
const NAMES: string[] = [
  'Maia',
  'Asher',
  'Olivia',
  'Atticus',
  'Amelia',
  'Jack',
  'Charlotte',
  'Theodore',
  'Isla',
  'Oliver',
  'Isabella',
  'Jasper',
  'Cora',
  'Levi',
  'Violet',
  'Arthur',
  'Mia',
  'Thomas',
  'Elizabeth',
  'Alice'
];

const minDate = new Date().setMonth(new Date().getMonth() - 2)
const maxDate = new Date().setMonth(new Date().getMonth() + 2)
export function createNewUser(id: number): IbUserExample {
  const name =
    NAMES[Math.round(Math.random() * (NAMES.length - 1))] +
    ' ' +
    NAMES[Math.round(Math.random() * (NAMES.length - 1))].charAt(0) +
    '.';

  return {
    id: id.toString(),
    name,
    fruit: FRUITS[Math.round(Math.random() * (FRUITS.length - 1))],
    number: Math.round(Math.random() * 22) + 1,
    aDate: getRandomDate(minDate, maxDate),
    aDateString: '2023-01-01T12:53:12.000Z'
  };
}

function getRandomDate(startDate, endDate) {
  // Convert the start and end dates to milliseconds
  const startMs = startDate;
  const endMs = endDate;

  // Generate a random number between startMs and endMs
  const randomMs = Math.random() * (endMs - startMs) + startMs;

  // Create a new Date object using the random milliseconds
  const randomDate = new Date(randomMs);

  return randomDate;
}