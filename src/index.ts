import fetch from "node-fetch";

const TEAM_ID = "AggressiveBot"; // Thay bằng Team ID thật của mày
const OAUTH_TOKEN = process.env.OAUTH_TOKEN;

if (!OAUTH_TOKEN) {
  throw new Error("OAUTH_TOKEN chưa được set. Vào GitHub Secrets tạo OAUTH_TOKEN.");
}

const ARENA_INTERVAL_HOURS = 1;
const DAYS_IN_ADVANCE = 1;

function nextEvenUtcHour(from: Date): Date {
  const d = new Date(from);
  const h = d.getUTCHours();
  const nextEven = Math.floor(h / 2) * 2 + 2;
  d.setUTCHours(nextEven, 0, 0, 0);
  return d;
}

async function createArena(startDate: Date, prevLink?: string) {
  const body = new URLSearchParams({
    name: "Hourly Ultrabullet",
    description: `Next: ${prevLink ?? "tba"}`,
    clockTime: "0.25",
    clockIncrement: "0",
    minutes: "60",
    rated: "true",
    variant: "standard",
    teamId: TEAM_ID,
    teamTournament: "true",
    startDate: startDate.toISOString(),
  });

  console.log("Creating arena with body:", Object.fromEntries(body));

  const res = await fetch("https://lichess.org/api/tournament", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OAUTH_TOKEN}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Arena creation failed:", res.status, err);
    return null;
  }

  const data = await res.json();
  const url = data.id ? `https://lichess.org/tournament/${data.id}` : null;
  console.log("Arena created:", url);
  return url;
}

async function main() {
  const now = new Date();
  const firstStart = nextEvenUtcHour(now);

  const arenasPerDay = Math.floor(24 / ARENA_INTERVAL_HOURS);
  const totalArenas = arenasPerDay * DAYS_IN_ADVANCE;

  console.log(`Creating ${totalArenas} arenas for team ${TEAM_ID}`);

  let prevUrl: string | undefined;

  for (let i = 0; i < totalArenas; i++) {
    if (i > 0) await new Promise(res => setTimeout(res, 5000)); // tránh rate limit

    const startDate = new Date(firstStart.getTime() + i * ARENA_INTERVAL_HOURS * 60 * 60 * 1000);
    const arenaUrl = await createArena(startDate, prevUrl);
    if (arenaUrl) prevUrl = arenaUrl;
  }
}

main().catch(console.error);
