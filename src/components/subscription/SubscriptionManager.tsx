import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { loadStripe } from "@stripe/stripe-js";
import {
  Crown,
  AlertCircle,
  CreditCard,
  CheckCircle,
  Calendar,
  Loader2,
  ArrowRight,
  Star,
  Check,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

interface UserSubscription {
  id: string;
  user_id: string;
  status: string;
  price_id: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  stripePriceId: string;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    interval: "month",
    stripePriceId: "price_1SCwyW2Lue5peqhPyGGcZSEt",
    features: [
      "До 100 резервации/месец",
      "Основно управление на календар",
      "Имейл известия",
      "Мобилна страница за резервации",
      "Основна аналитика",
      "Имейл поддръжка",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 79,
    interval: "month",
    stripePriceId: "price_1SCxAH2Lue5peqhPvG0J79fb",
    popular: true,
    features: [
      "Неограничени резервации",
      "Разширен календар с drag & drop",
      "SMS и имейл известия",
      "Персонализиран брандинг",
      "Разширена аналитика",
      "Управление на множество бизнеси",
      "AI чат интеграция",
      "Приоритетна поддръжка",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    interval: "month",
    stripePriceId: "price_1SCxAw2Lue5peqhPIRDfSixi",
    features: [
      "Всичко от Professional",
      "White-label решение",
      "API достъп и интеграции",
      "Разширен AI телефонен агент",
      "Персонализирани работни процеси",
      "Dedicated account manager",
      "SLA гаранция",
      "24/7 телефонна поддръжка",
    ],
  },
];

export function SubscriptionManager() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [managing, setManaging] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchSubscription();
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      setSubscription(data);
    } catch (err) {
      console.error("Error fetching subscription:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    if (!user) return;
    setManaging(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-billing-portal-session", {
        body: { userId: user.id, returnUrl: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
      window.location.href = data.url;
    } catch (err) {
      console.error("Error opening billing portal:", err);
      alert("Неуспешно зареждане на Stripe портала.");
    } finally {
      setManaging(false);
    }
  };

  const handleSubscribe = async (plan: Plan) => {
    if (!user) return;
    setUpgrading(plan.id);
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe не успя да се зареди");

      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          priceId: plan.stripePriceId,
          userId: user.id,
          userEmail: user.email,
          successUrl: `${window.location.origin}/dashboard?subscription=success`,
          cancelUrl: `${window.location.origin}/dashboard?subscription=canceled`,
        },
      });
      if (error) throw error;
      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    } catch (err) {
      console.error("Error creating subscription:", err);
      alert("Грешка при създаване на абонамент.");
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-gray-600">{t("subscription.loading") || "Зареждане..."}</p>
      </div>
    );
  }

  const currentPlan = plans.find((p) => p.stripePriceId === subscription?.price_id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t("subscription.title")}</h2>
        <p className="text-gray-600">
          Прегледайте и управлявайте вашия абонамент и плащания.
        </p>
      </div>

      {/* ✅ Current subscription summary */}
      {subscription ? (
        <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Crown className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Текущ план:{" "}
                  <span className="capitalize text-blue-600">
                    {currentPlan?.name || "Неизвестен"}
                  </span>
                </h3>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  Следващо плащане:{" "}
                  <span className="font-medium ml-1">
                    {new Date(subscription.current_period_end).toLocaleDateString("bg-BG")}
                  </span>
                </p>
                {subscription.cancel_at_period_end && (
                  <p className="text-sm text-orange-600 flex items-center mt-1">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Абонаментът ще приключи в края на текущия период
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleManageBilling}
                disabled={managing}
                className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {managing ? "Зареждане..." : "Stripe портал"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 border border-gray-200 rounded-2xl text-center">
          <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-700 mb-4">Нямате активен абонамент.</p>
          <button
            onClick={() => (window.location.href = "/dashboard?subscription=plans")}
            className="inline-flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Избери план
          </button>
        </div>
      )}

      {/* 💎 Switch / Upgrade Plans */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Надградете или сменете вашия план
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.stripePriceId === subscription?.price_id;
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl border p-6 ${
                  plan.popular ? "ring-2 ring-blue-500" : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full flex items-center space-x-1">
                    <Star size={12} />
                    <span>Най-популярен</span>
                  </div>
                )}
                <h4 className="text-xl font-bold text-gray-900 text-center mb-2">
                  {plan.name}
                </h4>
                <p className="text-center text-gray-600 mb-4">
                  {plan.price}лв / {plan.interval === "month" ? "месец" : "година"}
                </p>
                <ul className="space-y-2 mb-4 text-sm text-gray-700">
                  {plan.features.slice(0, 4).map((f, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <Check size={16} className="text-green-500" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrent || upgrading === plan.id}
                  className={`w-full py-2 rounded-lg font-medium transition-all ${
                    isCurrent
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isCurrent
                    ? "Текущ план"
                    : upgrading === plan.id
                    ? "Зареждане..."
                    : "Избери план"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
