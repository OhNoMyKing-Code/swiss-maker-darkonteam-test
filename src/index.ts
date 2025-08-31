import fetch from "node-fetch";

const OAUTH_TOKEN = process.env.OAUTH_TOKEN!;
const TEAM_ID = "AggressiveBot"; // Thay bằng team ID của mày

if (!OAUTH_TOKEN) throw new Error("OAUTH_TOKEN chưa được set!");

const ARENA_CONFIG = {
  name: "Hourly Ultrabullet",
  description: "Next: tba",
  clockTime: 0.25,
  clockIncrement: 0,
  minutes: 60,
  rated: true,
  variant: "standard",
};

async function createArena() {
  const body = new URLSearchParams({
    name: ARENA_CONFIG.name,
    description: ARENA_CONFIG.description,
    clockTime: String(ARENA_CONFIG.clockTime),
    clockIncrement: String(ARENA_CONFIG.clockIncrement),
    minutes: String(ARENA_CONFIG.minutes),
    rated: ARENA_CONFIG.rated ? "true" : "false",
    variant: ARENA_CONFIG.variant,
    teamId: TEAM_ID,
    teamTournament: "true",
  });

  const res = await fetch("https://lichess.org/api/tournament", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OAUTH_TOKEN}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = await res.json();
  console.log("Arena created:", data);
}

createArena().catch(console.error);
