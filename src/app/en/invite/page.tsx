"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HeaderNavigation } from "@/components/sections/header-navigation";
import { MobileBottomNav } from "@/components/sections/mobile-bottom-nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Copy,
  Check,
  Share2,
  Users,
  TrendingUp,
  DollarSign,
  Gift,
  MessageCircle,
  Mail,
  QrCode,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

export default function InvitePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [referralCode, setReferralCode] = useState("GK222ABC123");
  const [referralLink, setReferralLink] = useState("");
  const [stats, setStats] = useState({
    totalInvited: 0,
    successfulSignups: 0,
    totalEarnings: 0,
    conversionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/en/invite");
      return;
    }

    if (session?.user) {
      // Set referral link based on current domain
      const baseUrl = window.location.origin;
      setReferralLink(`${baseUrl}/register?ref=${referralCode}`);
      setIsLoading(false);
    }
  }, [session, isPending, router, referralCode]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setLinkCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = (platform: string) => {
    const shareText = `Join me on GK222 and earn ৳1000 bonus! Use my referral code: ${referralCode}`;
    const encodedText = encodeURIComponent(shareText);
    const encodedLink = encodeURIComponent(referralLink);

    let shareUrl = "";

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedLink}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${encodedLink}&text=${encodedText}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=Join GK222&body=${encodedText}%20${encodedLink}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff8c00]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderNavigation />
      
      <main className="container mx-auto px-4 py-8 pb-32 md:pb-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <Gift className="w-16 h-16 text-[#ff8c00] mx-auto" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Invite Friends & Earn Together
          </h1>
          <p className="text-gray-400 text-lg">
            Share your code and get ৳1000 for each friend who joins!
          </p>
        </div>

        {/* Referral Code Section */}
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-[#ff8c00]/30 p-6 mb-6 shadow-lg shadow-[#ff8c00]/10">
          <div className="text-center mb-4">
            <p className="text-gray-400 text-sm mb-2">Your Referral Code</p>
            <div className="bg-black/50 rounded-lg p-4 mb-4 border border-[#ff8c00]/50 shadow-[0_0_15px_rgba(255,140,0,0.3)]">
              <p className="text-3xl font-bold text-[#ff8c00] tracking-wider font-mono">
                {referralCode}
              </p>
            </div>
            <Button
              onClick={handleCopyCode}
              className="w-full md:w-auto bg-[#ff8c00] hover:bg-[#ff8c00]/90 text-white font-semibold"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </>
              )}
            </Button>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <p className="text-gray-400 text-sm mb-2">Referral Link</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="border-[#ff8c00] text-[#ff8c00] hover:bg-[#ff8c00] hover:text-white"
              >
                {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </Card>

        {/* Share Buttons */}
        <div className="mb-8">
          <p className="text-center text-gray-400 mb-4">Share via</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={() => handleShare("whatsapp")}
              className="bg-[#25D366] hover:bg-[#25D366]/90 text-white"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp
            </Button>
            <Button
              onClick={() => handleShare("telegram")}
              className="bg-[#0088cc] hover:bg-[#0088cc]/90 text-white"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Telegram
            </Button>
            <Button
              onClick={() => handleShare("facebook")}
              className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Facebook
            </Button>
            <Button
              onClick={() => handleShare("email")}
              className="bg-gray-700 hover:bg-gray-600 text-white"
            >
              <Mail className="w-5 h-5 mr-2" />
              Email
            </Button>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#1a1a1a] border-gray-800 p-4 text-center">
            <Users className="w-8 h-8 text-[#ff8c00] mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalInvited}</p>
            <p className="text-gray-400 text-sm">Total Invited</p>
          </Card>
          <Card className="bg-[#1a1a1a] border-gray-800 p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.successfulSignups}</p>
            <p className="text-gray-400 text-sm">Successful</p>
          </Card>
          <Card className="bg-[#1a1a1a] border-gray-800 p-4 text-center">
            <DollarSign className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">৳{stats.totalEarnings}</p>
            <p className="text-gray-400 text-sm">Total Earned</p>
          </Card>
          <Card className="bg-[#1a1a1a] border-gray-800 p-4 text-center">
            <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.conversionRate}%</p>
            <p className="text-gray-400 text-sm">Conversion</p>
          </Card>
        </div>

        {/* Rewards Structure */}
        <Card className="bg-[#1a1a1a] border-[#ff8c00]/30 p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            Rewards Structure
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-[#ff8c00]/20 to-transparent rounded-lg border border-[#ff8c00]/30">
              <Gift className="w-12 h-12 text-[#ff8c00] mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">You Earn</h3>
              <p className="text-3xl font-bold text-[#ff8c00] mb-2">৳1000</p>
              <p className="text-gray-400 text-sm">
                For each friend who registers and makes first deposit
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-transparent rounded-lg border border-green-500/30">
              <Users className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Friend Gets</h3>
              <p className="text-3xl font-bold text-green-500 mb-2">৳500</p>
              <p className="text-gray-400 text-sm">
                Welcome bonus on successful registration
              </p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-500 text-center font-semibold">
              🎁 Bonus: Earn extra ৳100 for every 5 successful referrals!
            </p>
          </div>
        </Card>

        {/* How It Works */}
        <Card className="bg-[#1a1a1a] border-gray-800 p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff8c00] rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-black">
                1
              </div>
              <h3 className="font-bold text-white mb-2">Copy Code</h3>
              <p className="text-gray-400 text-sm">
                Copy your unique referral code or link
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff8c00] rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-black">
                2
              </div>
              <h3 className="font-bold text-white mb-2">Share</h3>
              <p className="text-gray-400 text-sm">
                Share with friends via WhatsApp, Telegram, or social media
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff8c00] rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-black">
                3
              </div>
              <h3 className="font-bold text-white mb-2">Friend Signs Up</h3>
              <p className="text-gray-400 text-sm">
                They register using your code and make first deposit
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff8c00] rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-black">
                4
              </div>
              <h3 className="font-bold text-white mb-2">Earn Rewards</h3>
              <p className="text-gray-400 text-sm">
                Both of you receive instant rewards!
              </p>
            </div>
          </div>
        </Card>

        {/* Terms & Conditions */}
        <Card className="bg-[#1a1a1a] border-gray-800 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Terms & Conditions</h2>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="flex items-start">
              <span className="text-[#ff8c00] mr-2">•</span>
              <span>Referral rewards are credited after the referred user completes their first deposit (minimum ৳500)</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#ff8c00] mr-2">•</span>
              <span>Self-referrals and fraudulent activities are strictly prohibited</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#ff8c00] mr-2">•</span>
              <span>Each user can only use one referral code during registration</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#ff8c00] mr-2">•</span>
              <span>Rewards are subject to verification and may take 24-48 hours to process</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#ff8c00] mr-2">•</span>
              <span>GK222 reserves the right to modify or terminate the referral program at any time</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#ff8c00] mr-2">•</span>
              <span>Maximum referral limit: 50 users per month</span>
            </li>
          </ul>
        </Card>
      </main>

      <MobileBottomNav />
    </div>
  );
}
