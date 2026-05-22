"use client";

import { useState } from "react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <section className="mt-16 md:mt-20 py-12 md:py-16 px-4 md:px-8 bg-emerald-700">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Subscribe to Our Newsletter
        </h2>
        <p className="text-emerald-100 text-sm md:text-base mb-6">
          Get the latest updates on new arrivals and exclusive offers.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 md:px-5 py-3 rounded-full text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-white"
            required
          />
          <button
            type="submit"
            className="px-6 md:px-8 py-3 bg-white text-emerald-700 font-semibold rounded-full hover:bg-emerald-50 transition-colors text-sm md:text-base"
          >
            Subscribe
          </button>
        </form>
        {subscribed && (
          <p className="text-green-200 text-sm mt-4">
            Thanks for subscribing! 🎉
          </p>
        )}
      </div>
    </section>
  );
}
