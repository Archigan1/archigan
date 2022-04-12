import { IUser, Users } from "./database";
import { error } from "./index";

export async function searchUsers(query: string) {
  const regex = new RegExp(query, "gi");

  let accounts: IUser[] = [];
  await Users.find({}, (err, users) => {
    if (err) {
      error(err.toString());
      return;
    }
    accounts = users;
  });
  
  let results: Result[] = [];
  for (const account of accounts) {
    const username = account.username.toLowerCase();
    if (username.includes(query.toLowerCase())) {
      results.push({
        username: account.username,
        relevance: username.match(regex)!.length
      });
    }
  }
  results.sort((a, b) => b.relevance - a.relevance);
  let finalResults: IUser[] = [];
  for (const result of results) {
    await Users.findOne({ username: result.username }, (err, user) => {
      if (err) {
        error(err.toString());
        return;
      }
      finalResults.push(user);
    });
  }

  return finalResults;
}

interface Result {
  username: string;
  relevance: number;
}