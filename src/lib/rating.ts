export type RatingCategory = "poor" | "average" | "good" | "great" | "masterpiece";

export interface RatingDefinition {
  id: RatingCategory;
  label: string;
  order: number;
  textColor: string;
  bgColor: string;
  borderColor: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;
  badgeClass: string;
  dotColor: string;
}

export const RATING_CONFIG: Record<RatingCategory, RatingDefinition> = {
  poor: {
    id: "poor",
    label: "Poor",
    order: 1,
    textColor: "text-[#F43F5E]",
    bgColor: "bg-[#F43F5E]/10",
    borderColor: "border-[#F43F5E]/30",
    activeBg: "bg-[#F43F5E]/15",
    activeBorder: "border-[#F43F5E]",
    activeText: "text-[#F43F5E]",
    badgeClass: "bg-[#F43F5E]/15 text-[#F43F5E] border-[#F43F5E]/30",
    dotColor: "bg-[#F43F5E]",
  },
  average: {
    id: "average",
    label: "Average",
    order: 2,
    textColor: "text-[#F59E0B]",
    bgColor: "bg-[#F59E0B]/10",
    borderColor: "border-[#F59E0B]/30",
    activeBg: "bg-[#F59E0B]/15",
    activeBorder: "border-[#F59E0B]",
    activeText: "text-[#F59E0B]",
    badgeClass: "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30",
    dotColor: "bg-[#F59E0B]",
  },
  good: {
    id: "good",
    label: "Good",
    order: 3,
    textColor: "text-[#3B9EFF]",
    bgColor: "bg-[#3B9EFF]/10",
    borderColor: "border-[#3B9EFF]/30",
    activeBg: "bg-[#3B9EFF]/15",
    activeBorder: "border-[#3B9EFF]",
    activeText: "text-[#3B9EFF]",
    badgeClass: "bg-[#3B9EFF]/15 text-[#3B9EFF] border-[#3B9EFF]/30",
    dotColor: "bg-[#3B9EFF]",
  },
  great: {
    id: "great",
    label: "Great",
    order: 4,
    textColor: "text-[#10B981]",
    bgColor: "bg-[#10B981]/10",
    borderColor: "border-[#10B981]/30",
    activeBg: "bg-[#10B981]/15",
    activeBorder: "border-[#10B981]",
    activeText: "text-[#10B981]",
    badgeClass: "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30",
    dotColor: "bg-[#10B981]",
  },
  masterpiece: {
    id: "masterpiece",
    label: "Masterpiece",
    order: 5,
    textColor: "text-[#F5C84B]",
    bgColor: "bg-[#F5C84B]/10",
    borderColor: "border-[#F5C84B]/30",
    activeBg: "bg-[#F5C84B]/15",
    activeBorder: "border-[#F5C84B]",
    activeText: "text-[#F5C84B]",
    badgeClass: "bg-[#F5C84B]/15 text-[#F5C84B] border-[#F5C84B]/30",
    dotColor: "bg-[#F5C84B]",
  },
};

export const RATING_CATEGORIES: RatingCategory[] = [
  "poor",
  "average",
  "good",
  "great",
  "masterpiece",
];

export function isValidRating(val: unknown): val is RatingCategory {
  return (
    typeof val === "string" &&
    RATING_CATEGORIES.includes(val.toLowerCase() as RatingCategory)
  );
}

export function parseRating(val: unknown): RatingCategory | null {
  if (!val) return null;
  const str = String(val).toLowerCase().trim();
  if (isValidRating(str)) return str as RatingCategory;
  return null;
}

export function getRatingConfig(val: unknown): RatingDefinition | null {
  const cat = parseRating(val);
  return cat ? RATING_CONFIG[cat] : null;
}

export function getRatingRank(val: unknown): number {
  const cat = parseRating(val);
  return cat ? RATING_CONFIG[cat].order : 0;
}

export function getConsensusRating(
  ratings: Array<unknown>
): RatingCategory | null {
  const counts: Record<RatingCategory, number> = {
    poor: 0,
    average: 0,
    good: 0,
    great: 0,
    masterpiece: 0,
  };
  let hasValid = false;

  for (const r of ratings) {
    const parsed = parseRating(r);
    if (parsed) {
      counts[parsed]++;
      hasValid = true;
    }
  }

  if (!hasValid) return null;

  let bestCategory: RatingCategory | null = null;
  let maxCount = -1;
  let maxOrder = -1;

  for (const cat of RATING_CATEGORIES) {
    const count = counts[cat];
    const order = RATING_CONFIG[cat].order;
    if (count > maxCount || (count === maxCount && order > maxOrder)) {
      maxCount = count;
      maxOrder = order;
      bestCategory = cat;
    }
  }

  return maxCount > 0 ? bestCategory : null;
}
