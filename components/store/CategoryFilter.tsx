"use client";

const categories = [
  "All",
  "Sneakers",
  "Running",
  "Casual",
  "Basketball",
  "Sport",
];

type CategoryFilterProps = {
  active: string;
  onChange: (category: string) => void;
};

export function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="px-4 md:px-6 mt-4 md:mt-6">
      <div className="flex flex-wrap gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={`px-3 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
              active === category
                ? "bg-emerald-700 text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
