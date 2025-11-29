"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Gift, UserPlus, Trophy, User } from "lucide-react";

export const MobileBottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      label: "Promotion",
      href: "/en/promotions",
      icon: Gift,
    },
    {
      label: "Invite",
      href: "/en/invite",
      icon: UserPlus,
    },
    {
      label: "Reward",
      href: "/en/wallet",
      icon: Trophy,
    },
    {
      label: "Profile",
      href: "/en/account",
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-border md:hidden">
      <div className="flex items-center justify-around h-20 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-2"
            >
              <Icon
                size={24}
                className={isActive ? "text-[#ff8c00]" : "text-gray-400"}
                strokeWidth={2}
              />
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-[#ff8c00]" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};