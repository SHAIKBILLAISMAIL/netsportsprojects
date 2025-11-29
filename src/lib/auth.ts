import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { NextRequest } from 'next/server';
import { headers } from "next/headers"
import { db } from "@/db";
import { userBalances } from "@/db/schema";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
	}),
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 6, // Reduced from default 8
		maxPasswordLength: 128,
	},
	plugins: [bearer()],
	trustedOrigins: process.env.NODE_ENV === 'development'
		? ["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.1.4:3000", "http://10.214.240.189:3000"]
		: [process.env.BETTER_AUTH_URL || "http://localhost:3000"]
});

// Session validation helper
export async function getCurrentUser(request: NextRequest) {
	const session = await auth.api.getSession({ headers: await headers() });
	return session?.user || null;
}