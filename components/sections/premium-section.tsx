"use client"

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Crown, CheckCircle, Star, Zap, Shield } from "lucide-react";

export function PremiumSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleUpgradeToPremium = async () => {
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
        setIsRedirecting(true);
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
      }
    } catch (error) {
      console.error("Premium upgrade error:", error);
      toast({ 
        title: "Error", 
        description: "Failed to start payment. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Unlimited Listings",
      description: "List as many properties as you want"
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: "Priority Support",
      description: "Get faster response times"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Advanced Analytics",
      description: "Detailed insights and reports"
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: "Premium Badge",
      description: "Stand out with premium status"
    }
  ];

  return (
    <section className="w-full py-16 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 flex flex-col items-center">
      <div className="max-w-4xl w-full px-4 text-center">
        <Card className="shadow-xl border-2 border-yellow-300 dark:border-yellow-600 bg-white/80 dark:bg-gray-900/80 p-8">
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-8 w-8 text-yellow-600 mr-2" />
            <h2 className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">
              Unlock Unlimited Listings with <span className="text-yellow-600 dark:text-yellow-300">Premium</span>
            </h2>
          </div>
          
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            List up to <span className="font-semibold text-yellow-800 dark:text-yellow-300">10 properties for free</span>. 
            Need more? Upgrade to <span className="font-semibold text-yellow-800 dark:text-yellow-300">Premium</span> for 
            unlimited listings, priority support, and exclusive features to boost your rental business.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-yellow-600 dark:text-yellow-400 mt-0.5">
                  {feature.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-6 rounded-lg mb-6">
            <div className="text-4xl font-bold text-yellow-800 dark:text-yellow-300 mb-2">
              100,000 ETB
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              One-time payment • Lifetime access
            </p>
          </div>

          <Button 
            size="lg" 
            onClick={handleUpgradeToPremium}
            disabled={isLoading || isRedirecting || user?.premium}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-lg px-8 py-3 rounded-full shadow-md transition disabled:opacity-50"
          >
            {user?.premium ? (
              <>
                <Crown className="h-5 w-5 mr-2" />
                Already Premium
              </>
            ) : !user ? (
              <>
                <Crown className="h-5 w-5 mr-2" />
                Login to Upgrade
              </>
            ) : isLoading || isRedirecting ? (
              "Redirecting to Payment..."
            ) : (
              <>
                <Crown className="h-5 w-5 mr-2" />
                Upgrade to Premium
              </>
            )}
          </Button>

          {user?.premium && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-4">
              ✓ You are already a premium user!
            </p>
          )}
          
          {!user && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-4">
              💡 Create an account or log in to upgrade to premium
            </p>
          )}
        </Card>
      </div>
    </section>
  );
} 