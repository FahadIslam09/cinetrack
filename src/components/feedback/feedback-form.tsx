"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Lightbulb,
  Bug,
  MessageSquare,
  Send,
  CheckCircle2,
  Mail,
  Copy,
  Check,
  ArrowLeft,
} from "lucide-react";
import { submitFeatureRequest } from "@/actions/admin";

type FeedbackCategory = "feature" | "bug" | "general";

interface FeedbackFormProps {
  initialUserEmail?: string | null;
}

export function FeedbackForm({ initialUserEmail }: FeedbackFormProps) {
  const [category, setCategory] = useState<FeedbackCategory>("feature");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState(initialUserEmail || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const categories = [
    {
      id: "feature" as FeedbackCategory,
      label: "Feature Request",
      icon: Lightbulb,
      activeColor: "border-[#3B9EFF] bg-[#3B9EFF]/10 text-[#3B9EFF]",
      badge: "Idea",
    },
    {
      id: "bug" as FeedbackCategory,
      label: "Bug Report",
      icon: Bug,
      activeColor: "border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444]",
      badge: "Fix",
    },
    {
      id: "general" as FeedbackCategory,
      label: "General Feedback",
      icon: MessageSquare,
      activeColor: "border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E]",
      badge: "Note",
    },
  ];

  const getTitlePlaceholder = () => {
    switch (category) {
      case "feature":
        return "e.g. Add custom tags or shelves to personal library";
      case "bug":
        return "e.g. Trailer player modal does not close on mobile";
      case "general":
        return "e.g. Thoughts on discovery algorithm or review formatting";
    }
  };

  const getDescPlaceholder = () => {
    switch (category) {
      case "feature":
        return "What feature would you like to see? What problem does it solve for you when tracking or finding movies?";
      case "bug":
        return "What went wrong? Please include steps to reproduce, what you expected to happen, and your device or browser if relevant.";
      case "general":
        return "Share your thoughts, recommendations, or questions about CineTrack.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    try {
      const existing = JSON.parse(
        localStorage.getItem("cinetrack_feedback_log") || "[]"
      );
      existing.push({
        id: Date.now().toString(),
        category,
        title: title.trim(),
        description: description.trim(),
        email: email.trim() || "anonymous",
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("cinetrack_feedback_log", JSON.stringify(existing));
    } catch {
      // ignore storage errors
    }

    try {
      await submitFeatureRequest({
        category,
        title,
        description,
        email,
      });
    } catch {
      // persisting is best-effort; the local log is still recorded
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const formattedSubject = encodeURIComponent(
    `[CineTrack ${category.toUpperCase()}] ${title}`
  );
  const formattedBody = encodeURIComponent(
    `Category: ${category}\nSummary: ${title}\nFrom: ${
      email || "anonymous"
    }\n\nDetails:\n${description}`
  );
  const mailtoUrl = `mailto:fahadislam.fir@gmail.com?subject=${formattedSubject}&body=${formattedBody}`;

  const handleCopyText = () => {
    const text = `Category: ${category}\nSummary: ${title}\nFrom: ${
      email || "anonymous"
    }\n\nDetails:\n${description}`;
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setIsSubmitted(false);
    setHasCopied(false);
  };

  if (isSubmitted) {
    return (
      <div className="p-8 sm:p-10 rounded-3xl bg-[#151C27] border border-white/[0.08] shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-14 h-14 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center text-[#22C55E] mb-5">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA]">
          Thank you for the feedback!
        </h2>
        <p className="text-sm text-[#A8B0BD] mt-2.5 max-w-md leading-relaxed">
          Your note has been recorded. Direct community feedback is what guides
          upcoming updates and bug fixes for CineTrack.
        </p>

        <div className="w-full max-w-md p-4 rounded-2xl bg-[#0F141D] border border-white/[0.06] text-left mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6F7886]">
            <span className="font-semibold uppercase tracking-wider text-[#3B9EFF]">
              {category}
            </span>
            <span>Recorded</span>
          </div>
          <p className="text-sm font-semibold text-[#F5F7FA] line-clamp-1">
            {title}
          </p>
          <p className="text-xs text-[#A8B0BD] line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 w-full max-w-md">
          <a
            href={mailtoUrl}
            className="w-full sm:flex-1 h-10 rounded-xl bg-[#3B9EFF] hover:bg-[#5AAFFF] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Send Copy via Email</span>
          </a>

          <button
            type="button"
            onClick={handleCopyText}
            className="w-full sm:w-auto h-10 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-[#A8B0BD] hover:text-[#F5F7FA] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            {hasCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                <span className="text-[#22C55E]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Text</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.06] w-full flex items-center justify-between text-xs text-[#A8B0BD]">
          <button
            type="button"
            onClick={handleReset}
            className="hover:text-[#3B9EFF] transition-colors cursor-pointer"
          >
            Submit another report or request
          </button>
          <Link
            href="/discover"
            className="hover:text-white transition-colors cursor-pointer"
          >
            Back to Discover →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-8 rounded-3xl bg-[#151C27] border border-white/[0.08] shadow-2xl flex flex-col gap-6"
    >
      {/* Category Picker */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-[#A8B0BD] tracking-wider uppercase block">
          1. Select Category
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? cat.activeColor
                    : "border-white/[0.06] bg-[#0F141D]/60 hover:bg-[#0F141D] text-[#A8B0BD] hover:text-[#F5F7FA]"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Icon className="w-4 h-4" />
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? "border-current bg-white/10"
                        : "border-white/10 bg-white/[0.02] text-[#6F7886]"
                    }`}
                  >
                    {cat.badge}
                  </span>
                </div>
                <span className="text-xs font-semibold tracking-tight">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Title / Summary */}
      <div className="space-y-2">
        <label
          htmlFor="feedback-title"
          className="text-xs font-semibold text-[#A8B0BD] tracking-wider uppercase block"
        >
          2. Summary
        </label>
        <input
          id="feedback-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={getTitlePlaceholder()}
          required
          maxLength={140}
          className="w-full h-11 px-4 rounded-xl bg-[#0F141D] border border-white/[0.08] focus:border-[#3B9EFF]/50 text-sm text-[#F5F7FA] placeholder-[#6F7886] outline-none focus:ring-1 focus:ring-[#3B9EFF]/40 transition-all font-sans"
        />
      </div>

      {/* Details */}
      <div className="space-y-2">
        <label
          htmlFor="feedback-description"
          className="text-xs font-semibold text-[#A8B0BD] tracking-wider uppercase block"
        >
          3. Details
        </label>
        <textarea
          id="feedback-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={getDescPlaceholder()}
          rows={5}
          required
          className="w-full p-4 rounded-xl bg-[#0F141D] border border-white/[0.08] focus:border-[#3B9EFF]/50 text-sm text-[#F5F7FA] placeholder-[#6F7886] resize-none outline-none focus:ring-1 focus:ring-[#3B9EFF]/40 transition-all font-sans leading-relaxed"
        />
      </div>

      {/* Optional Contact Email */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="feedback-email"
            className="text-xs font-semibold text-[#A8B0BD] tracking-wider uppercase block"
          >
            4. Your Email
          </label>
          <span className="text-[11px] text-[#6F7886]">Optional</span>
        </div>
        <input
          id="feedback-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com (only if you want a response)"
          className="w-full h-11 px-4 rounded-xl bg-[#0F141D] border border-white/[0.08] focus:border-[#3B9EFF]/50 text-sm text-[#F5F7FA] placeholder-[#6F7886] outline-none focus:ring-1 focus:ring-[#3B9EFF]/40 transition-all font-sans"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[#6F7886] text-center sm:text-left">
          Submitted notes help prioritize fixes and upcoming feature releases.
        </p>

        <button
          type="submit"
          disabled={isSubmitting || !title.trim() || !description.trim()}
          className="w-full sm:w-auto px-6 h-11 rounded-xl bg-[#3B9EFF] hover:bg-[#5AAFFF] disabled:opacity-40 disabled:hover:bg-[#3B9EFF] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isSubmitting ? "Submitting..." : "Submit Feedback"}</span>
        </button>
      </div>
    </form>
  );
}
