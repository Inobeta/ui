import { Injectable } from "@angular/core";
import { of, timer } from "rxjs";
import { switchMap } from "rxjs/operators";

export interface IbUserExample {
  id: string;
  name: string;
  fruit: string;
  number: number;
  aDate?: Date;
  aDateString?: string;
  subscribed: boolean;
}

@Injectable()
export class UserService {
  static minDate = new Date().setMonth(new Date().getMonth() - 2);
  static maxDate = new Date().setMonth(new Date().getMonth() + 2);

  static fruits = [
    "blueberry",
    "lychee",
    "kiwi",
    "mango",
    "peach",
    "lime",
    "pomegranate",
    "pineapple",
    "banana",
    "apple",
    "pear",
    "orange",
  ];

  static names: string[] = [
    "Maia",
    "Asher",
    "Olivia",
    "Atticus",
    "Amelia",
    "Jack",
    "Charlotte",
    "Theodore",
    "Isla",
    "Oliver",
    "Isabella",
    "Jasper",
    "Cora",
    "Levi",
    "Violet",
    "Arthur",
    "Mia",
    "Thomas",
    "Elizabeth",
    "Alice",
  ];

  _getOrders() {
    return of(Array.from({ length: 1000 }, (_, k) => createNewUser(k + 1)));
  }

  getUserOrders() {
    return timer(1000).pipe(switchMap(() => this._getOrders()));
  }
}

export function createNewUser(
  id: number,
  names = UserService.names,
  fruits = UserService.fruits
): IbUserExample {
  const name =
    names[Math.round(Math.random() * (names.length - 1))] +
    " " +
    names[Math.round(Math.random() * (names.length - 1))].charAt(0) +
    ".";

  const min = Math.round(Math.random() * 10) + 1;
  const max = min + Math.round(Math.random() * 30);
  return {
    id: id.toString(),
    name,
    fruit: fruits[Math.round(Math.random() * (fruits.length - 1))],
    number: Math.round(Math.random() * max) + 1,
    aDate: getRandomDate(UserService.minDate, UserService.maxDate),
    aDateString: "2023-01-01T12:53:12.000Z",
    subscribed: Math.round(Math.random() * 10) % 2 === 0,
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
