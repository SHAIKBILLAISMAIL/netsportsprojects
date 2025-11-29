import { HeaderNavigation } from "@/components/sections/header-navigation";
import Footer from "@/components/sections/footer";
import { GameLauncher } from "@/components/sections/game-launcher";

export default function LivePage() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderNavigation />
      <main className="container py-10">
        <h1 className="text-2xl font-bold mb-2 text-foreground">Live</h1>
        <p className="text-muted-foreground">Live betting and in-play events will appear here. Coming soon.</p>
        <div className="mt-6">
          <GameLauncher title="Live In-Play Launcher" />
        </div>
      </main>
      <Footer />
    </div>
  );
}