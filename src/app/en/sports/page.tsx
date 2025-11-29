import { HeaderNavigation } from "@/components/sections/header-navigation";
import SportsBettingInterface from "@/components/sections/sports-betting-interface";
import Footer from "@/components/sections/footer";

export default function SportsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const page = (searchParams?.page as string) || undefined;
  const sportId = (searchParams?.sportId as string) || undefined;

  return (
    <div className="min-h-screen bg-background">
      <HeaderNavigation />
      <SportsBettingInterface initialQuery={{ page, sportId }} />
      <Footer />
    </div>
  );
}