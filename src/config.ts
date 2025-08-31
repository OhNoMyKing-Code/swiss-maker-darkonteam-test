export const config = {
  server: "https://lichess.org",
  team: "AggressiveBot",           // Team-ID từ URL Lichess
  oauthToken: process.env.OAUTH_TOKEN!, // Token GitHub Secret
  daysInAdvance: 1,                // số ngày tạo arena trước
  dryRun: false,                   

  arena: {
    name: () => "Hourly Ultrabullet",
    description: (nextLink?: string) =>
      `Next: ${nextLink ?? "coming soon"}`,
    clockTime: 0.25,        // phút
    clockIncrement: 0,      
    minutes: 60,            
    rated: true,            
    variant: "standard",    
    intervalHours: 1,       // cứ 1h tạo 1 giải
  },
};
