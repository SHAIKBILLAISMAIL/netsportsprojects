"use client";

import { useState, useEffect } from "react";
import { HeaderNavigation } from "@/components/sections/header-navigation";
import Footer from "@/components/sections/footer";
import { MobileBottomNav } from "@/components/sections/mobile-bottom-nav";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Promotion {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  buttonText: string;
  buttonLink: string | null;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/promotions");
      
      if (!res.ok) {
        throw new Error("Failed to load promotions");
      }
      
      const data = await res.json();
      setPromotions(data.promotions || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load promotions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HeaderNavigation />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Promotion</h1>
          <p className="text-muted-foreground">
            Check out our latest bonuses and special offers
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && promotions.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/60 bg-card/50 p-12 text-center">
            <p className="text-muted-foreground">No active promotions at the moment</p>
          </div>
        )}

        {!loading && !error && promotions.length > 0 && (
          <div className="space-y-4">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="rounded-lg border border-border bg-card overflow-hidden transition-all hover:border-primary/50"
              >
                <div className="relative aspect-[16/7] w-full overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/20">
                  {promo.imageUrl.startsWith('http') ? (
                    <Image
                      src={promo.imageUrl}
                      alt={promo.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary mb-2">
                          {promo.title}
                        </div>
                        {promo.description && (
                          <div className="text-sm text-muted-foreground px-4">
                            {promo.description}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 md:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold mb-2 text-[#ffd700]">
                        {promo.title}
                      </h2>
                      {promo.description && (
                        <p className="text-sm text-muted-foreground">
                          {promo.description}
                        </p>
                      )}
                    </div>
                    
                    {promo.buttonLink ? (
                      <Link
                        href={promo.buttonLink}
                        className="rounded-md bg-[#ff8c00] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#ff8c00]/90 whitespace-nowrap"
                      >
                        {promo.buttonText}
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="rounded-md bg-muted px-6 py-2 text-sm font-semibold text-muted-foreground whitespace-nowrap cursor-not-allowed"
                      >
                        {promo.buttonText}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
      <div className="h-20 md:hidden" />
    </div>
  );
}