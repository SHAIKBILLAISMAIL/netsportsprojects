import { NextResponse } from "next/server";

// Mock users - mirrors AdminDashboard's initial mock structure
const mockUsers = [
  { id: 1, name: "John K", email: "john@example.com", role: "user", status: "active" },
  { id: 2, name: "Mary P", email: "mary@example.com", role: "admin", status: "active" },
  { id: 3, name: "Alex T", email: "alex@example.com", role: "agent", status: "pending" },
  { id: 4, name: "Dina R", email: "dina@example.com", role: "user", status: "active" },
  { id: 5, name: "Sam W", email: "sam@example.com", role: "user", status: "pending" },
];

// Use a mutable in-memory array for mock CRUD
let users = [...mockUsers];

export async function GET() {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 300));
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  await new Promise((r) => setTimeout(r, 250));
  const body = await req.json().catch(() => ({}));
  const { name, email, role = "user", status = "active" } = body || {};
  const id = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
  const user = { id, name: name || `User ${id}`, email: email || `user${id}@example.com`, role, status };
  users.push(user);
  return NextResponse.json({ user });
}

export async function PUT(req: Request) {
  await new Promise((r) => setTimeout(r, 250));
  const body = await req.json().catch(() => ({}));
  const { id, ...updates } = body || {};
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return NextResponse.json({ error: "User not found" }, { status: 404 });
  users[idx] = { ...users[idx], ...updates };
  return NextResponse.json({ user: users[idx] });
}

export async function DELETE(req: Request) {
  await new Promise((r) => setTimeout(r, 250));
  const body = await req.json().catch(() => ({}));
  const { id } = body || {};
  const before = users.length;
  users = users.filter((u) => u.id !== id);
  const removed = users.length < before;
  return NextResponse.json({ ok: removed });
}