import { NextResponse } from "next/server";

export async function GET() {
  await new Promise((r) => setTimeout(r, 250));
  return NextResponse.json({
    ggr24h: 12430,
    ggrDelta: 4.3,
    bets24h: 8922,
    betsDelta: 1.8,
    activeUsers: 1204,
    payoutRatio: 92.4,
    payoutDelta: -0.6,
    topSports: [
      { name: "Football", share: 62 },
      { name: "Basketball", share: 14 },
      { name: "Tennis", share: 11 },
      { name: "Cricket", share: 7 },
      { name: "Others", share: 6 },
    ],
  });
}