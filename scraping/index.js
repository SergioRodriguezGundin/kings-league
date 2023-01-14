import * as cheerio from "cheerio";
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
// import teams from "../db/teams.json" assert { type: "JSON" };

const DB_PATH = path.join(process.cwd(), "./db");
const TEAMS = await readFile(`${DB_PATH}/teams.json`, "utf-8").then(JSON.parse);

console.log("🚀 ~ file: index.js:9 ~ TEAMS", TEAMS);
const URLS = {
  leaderboard: "https://kingsleague.pro/estadisticas/clasificacion/",
};

const LEADERBOARD_SELECTORS_PREFIX = "table tbody tr";

const LEADERBOARD_SELECTORS = {
  team: { selector: ".fs-table-text_3", typeOf: "string" },
  wins: { selector: ".fs-table-text_4", typeOf: "number" },
  loses: { selector: ".fs-table-text_5", typeOf: "number" },
  scoredGoals: { selector: ".fs-table-text_6", typeOf: "number" },
  concededGoals: { selector: ".fs-table-text_7", typeOf: "number" },
  yellowCards: { selector: ".fs-table-text_8", typeOf: "number" },
  redCards: { selector: ".fs-table-text_9", typeOf: "number" },
};

async function scrape(url) {
  const res = await fetch(url);
  const html = await res.text();
  return cheerio.load(html);
}

const cleanText = (text) =>
  text
    .replace(/\t|\n|\s:/g, "")
    .replace(/.*:/g, " ")
    .trim();

const getTeamFrom = (teamName) => TEAMS.find((team) => team.name === teamName);

async function getLeaderBoard() {
  const $ = await scrape(URLS.leaderboard);
  const $rows = $(LEADERBOARD_SELECTORS_PREFIX);
  const leaderBoardSelectorEntries = Object.entries(LEADERBOARD_SELECTORS);

  let leaderBoard = [];

  $rows.each((index, el) => {
    const ledaerBoardEntries = leaderBoardSelectorEntries.map(
      ([key, { selector, typeOf }]) => {
        const rawValue = $(el).find(selector).text();
        const cleanedValue = cleanText(rawValue);
        const value = typeOf === "number" ? Number(cleanedValue) : cleanedValue;
        return [key, value];
      }
    );

    const { team: teamName, ...leaderBoardForTeam } =
      Object.fromEntries(ledaerBoardEntries);
    const team = getTeamFrom(teamName);

    leaderBoard.push({ ...leaderBoardForTeam, team });
  });

  return leaderBoard;
}

const leaderboard = await getLeaderBoard();

await writeFile(
  `${DB_PATH}/leaderboard.json`,
  JSON.stringify(leaderboard),
  null,
  2
);
