"use client";

import React from "react";
import { CreditCard, Check, Zap } from "lucide-react";

const PLANS = [
    {
        name: "Free",
        price: "$0",
        period: "forever",
        description: "Perfect for getting started",
        features: ["5 GB Storage", "Basic AI Tools", "720p Exports", "3 Social Accounts"],
        current: true,
        buttonText: "Current Plan",
        color: "bg-white/10"
    },
    {
        name: "Pro",
        price: "$29",
        period: "per month",
        description: "For creators and professionals",
        features: ["100 GB Storage", "Advanced AI Tools", "4K Exports", "Unlimited Social Accounts", "Priority Support"],
        current: false,
        buttonText: "Upgrade to Pro",
        color: "bg-purple-600",
        popular: true
    },
    {
        name: "Enterprise",
        price: "$99",
        period: "per month",
        description: "For teams and agencies",
        features: ["Unlimited Storage", "Custom AI Models", "API Access", "SSO & Security", "Dedicated Success Manager"],
        current: false,
        buttonText: "Contact Sales",
        color: "bg-blue-600"
    }
];

export default function BillingPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-blue-400" />
                Billing & Plans
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {PLANS.map((plan) => (
                    <div key={plan.name} className={`relative p-8 rounded-2xl border ${plan.popular ? 'border-purple-500 shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)]' : 'border-white/10'} bg-black/40 backdrop-blur-sm flex flex-col`}>
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                <Zap className="w-3 h-3" /> Most Popular
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white">{plan.price}</span>
                                <span className="text-gray-400 text-sm">/ {plan.period}</span>
                            </div>
                            <p className="text-gray-400 mt-2 text-sm">{plan.description}</p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                                    <div className="p-1 rounded-full bg-green-500/20 text-green-400">
                                        <Check className="w-3 h-3" />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            disabled={plan.current}
                            className={`w-full py-3 rounded-xl font-bold transition-all ${plan.current ? 'bg-white/10 text-gray-400 cursor-default' : 'bg-white text-black hover:bg-gray-200'} ${plan.popular && !plan.current ? 'bg-purple-600 text-white hover:bg-purple-500' : ''}`}
                        >
                            {plan.buttonText}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
