"use client"

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Crown, CheckCircle, Star, Zap, Shield, Loader2 } from "lucide-react";

// The features array is cleaner and we'll render the icons inside the map.
const features = [
  { icon: Zap, title: "Unlimited Listings", description: "List as many properties as you want without restrictions." },
  { icon: Star, title: "Priority Support", description: "Get faster, dedicated support from our expert team." },
  { icon: Shield, title: "Advanced Analytics", description: "Access detailed insights and reports on your listings." },
  { icon: Crown, title: "Premium Badge", description: "Stand out from the crowd with an exclusive premium status." }
];

export function PremiumSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // The isRedirecting state is redundant if isLoading covers the entire async process.
  // We can simplify to just `isLoading`.

  const handleUpgradeToPremium = async () => {
    // ... (Your existing handleUpgradeToPremium logic remains the same)
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upgrade to premium.",
        variant: "destructive"
      });
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 2000);
      return;
    }

    if (user.premium) {
      toast({
        title: "Already Premium",
        description: "You are already a premium user!",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/payments/premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user.id, 
          email: user.email, 
          name: user.name || user.email?.split('@')[0] || 'User'
        })
      });
      
      const data = await res.json();
      
      if (res.ok && data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        if (data.error === "User not found") {
          toast({ 
            title: "Session Expired", 
            description: "Please log in again to continue.", 
            variant: "destructive" 
          });
          setTimeout(() => {
            window.location.href = "/auth/login";
          }, 2000);
        } else {
          toast({ 
            title: "Error", 
            description: data.error || "Failed to start payment.", 
            variant: "destructive" 
          });
        }
        setIsLoading(false); // Reset loading state on failure
      }
    } catch (error) {
      console.error("Premium upgrade error:", error);
      toast({ 
        title: "Error", 
        description: "Failed to start payment. Please try again.", 
        variant: "destructive" 
      });
      setIsLoading(false); // Reset loading state on error
    }
  };

  const getButtonContent = () => {
    if (user?.premium) {
      return <>✓ Already Premium</>;
    }
    if (isLoading) {
      return <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Redirecting...</>;
    }
    return <> <Crown className="mr-2 h-5 w-5" /> Upgrade to Premium</>;
  };

  return (
    <section className="relative overflow-hidden w-full bg-white dark:bg-slate-950 py-20 sm:py-24">
      {/* Aurora background for dark mode */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 hidden dark:block">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-slate-950 blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 lg:gap-16 items-center">
          
          {/* Left Column: Description and CTA */}
          <div className="text-center lg:text-left mb-12 lg:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Go Beyond the Limits. Go Premium.
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              List up to 10 properties for free. Upgrade to Premium for unlimited listings and unlock exclusive features to supercharge your rental business.
            </p>

            <div className="space-y-4 mb-10">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <span className="text-slate-700 dark:text-slate-300">Unlimited property listings</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <span className="text-slate-700 dark:text-slate-300">Priority customer support</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <span className="text-slate-700 dark:text-slate-300">Exclusive premium badge</span>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-5xl font-bold text-slate-900 dark:text-white">
                100,000 ETB
              </p>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                One-time payment for lifetime access
              </p>
            </div>
            
            <Button 
              size="lg" 
              onClick={handleUpgradeToPremium}
              disabled={isLoading || user?.premium}
              className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-lg px-8 py-6"
            >
              {getButtonContent()}
            </Button>
          </div>

          {/* Right Column: Features Card */}
          <Card className="bg-slate-50/80 dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              What You Get
            </h3>
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-slate-900 dark:bg-white">
                    <feature.icon className="h-6 w-6 text-white dark:text-slate-900" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-slate-900 dark:text-white">{feature.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </section>
  );
}
