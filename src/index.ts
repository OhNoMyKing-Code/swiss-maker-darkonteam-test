import fetch from "node-fetch";
import { config } from "./config";

function assertEnv() {
  console.log("Debug: Token length:", config.oauthToken.length);
  console.log("Debug: Team ID:", config.team);
  if (!config.oauthToken) throw new Error("OAUTH_TOKEN missing!");
}

function nextEvenUtcHour(from: Date): Date {
  const d = new Date(from);
  const h = d.getUTCHours();
  const nextEven = Math.floor(h / config.arena.intervalHours) * config.arena.intervalHours + config.arena.intervalHours;
  d.setUTCHours(nextEven, 0, 0, 0);
  return d;
}

async function createArena(startDate: Date, nextLink: string) {
  const body = {
    name: config.arena.name(),
    description: config.arena.description(nextLink),
    clockTime: config.arena.clockTime,
    clockIncrement: config.arena.clockIncrement,
    minutes: config.arena.minutes,
    rated: config.arena.rated,
    variant: config.arena.variant,
    teamId: config.team,
    teamTournament: true,
    startDate: startDate.toISOString()
  };

  console.log("Creating arena with body:", body);

  if (config.dryRun) return "dry-run";

  const res = await fetch(`${config.server}/api/tournament`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.oauthToken}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Arena creation failed:", res.status, errText);
    return null;
  }

  const data = await res.json();
  const url = data.id ? `${config.server}/tournament/${data.id}` : null;
  console.log("Arena created:", url);
  return url;
}

async function main() {
  assertEnv();

  const now = new Date();
  const firstStart = nextEvenUtcHour(now);

  const arenasPerDay = Math.floor(24 / config.arena.intervalHours);
  const totalArenas = arenasPerDay * config.daysInAdvance;
  console.log(`Creating ${totalArenas} arenas for team ${config.team}`);

  let prevUrl: string | null = null;

  for (let i = 0; i < totalArenas; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 60000)); // 1 phút delay tránh rate limit

    const startDate = new Date(firstStart.getTime() + i * config.arena.intervalHours * 60 * 60 * 1000);
    const arenaUrl = await createArena(startDate, prevUrl ?? "tba");
    if (arenaUrl) prevUrl = arenaUrl;
  }
}

main().catch(console.error);
