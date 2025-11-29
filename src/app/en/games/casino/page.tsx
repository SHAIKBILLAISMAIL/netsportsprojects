import { GameLauncher } from "@/components/sections/game-launcher";

export default function CasinoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-10">
        <h1 className="text-3xl font-bold">Casino</h1>
        <p className="text-muted-foreground mt-2">
          Explore classic and modern casino games. This is a placeholder page.
        </p>
        <div className="mt-6">
          <GameLauncher title="Casino Game Launcher" />
        </div>
      </div>
    </div>
  );
}