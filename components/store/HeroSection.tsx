"use client";

import { Icon } from "@/components/ui/Icon";

export function HeroSection() {
  return (
    <section className="relative w-full h-[300px] md:h-[397px] overflow-hidden">
      <img
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQW-eI65ZbpQ0k7vk0k_YmpjtBHLlEQXiJU3IwuSrGx-s858k8sKPfpQrrKkUOBXsY8CA3VVQbRRbr7uKjpMfyOUkS2jg34IGRWGn1wP8-FcxykM9Rx_JizRoigoNSBOOadFoA9VsggOiWFPUdBjhU0AftlP81Oxfb8r4S25Ce0oWaegrLNSriiLz2jB5-d9k4uUiLQ890UI0710IG4_f_6KoJSSimRqgi3GRt4gBSHj9MRMHFCeQQgHKWG8EqXFxeT7Su7w-YGzI0"
        alt="Sneaker Hero"
        className="w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#f5fbf5] via-transparent to-transparent" />
      <div className="absolute bottom-8 md:bottom-12 left-4 md:left-8 right-4 md:right-8">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-lg">
          Step Into <br className="hidden sm:block" />
          The Future.
        </h1>
        <p className="text-sm md:text-base text-white/90 mt-2 drop-shadow">
          Exclusive drops. Kinetic style.
        </p>
        <button className="mt-4 px-6 py-2 md:px-8 md:py-3 bg-emerald-600 text-white text-sm md:text-base font-semibold rounded-full hover:bg-emerald-700 transition-colors shadow-lg">
          Shop Now
        </button>
      </div>
    </section>
  );
}
