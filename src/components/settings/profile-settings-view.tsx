"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, AtSign, AlignLeft, Pencil, ExternalLink, Image as ImageIcon, LogOut, Loader2 } from "lucide-react";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";
import { createClient } from "@/lib/supabase/client";

interface ProfileSettingsViewProps {
  initialProfile: {
    id: string;
    username: string;
    fullName?: string | null;
    avatarUrl?: string | null;
    backdropUrl?: string | null;
    bio?: string | null;
  };
}

export function ProfileSettingsView({ initialProfile }: ProfileSettingsViewProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setIsSigningOut(false);
    }
  };

  const initials = (profile.fullName || profile.username || "U").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA] tracking-tight">
            Profile Settings
          </h2>
          <p className="text-xs sm:text-sm text-[#A8B0BD] mt-1 leading-relaxed">
            Manage your public identity, display name, and avatar.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          className="h-10 px-5 rounded-xl bg-[#3B9EFF] hover:bg-[#5AAFFF] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98 shrink-0"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Identity Card */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#151C27] border border-white/[0.08] p-5 sm:p-7 shadow-sm space-y-6">
        {/* Cover Preview + Avatar */}
        <div className="relative rounded-2xl overflow-hidden bg-[#0F141D] border border-white/[0.06] h-32 sm:h-40">
          {profile.backdropUrl ? (
            <img
              src={profile.backdropUrl}
              alt="Profile Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40" />
          )}

          {/* Avatar overlay */}
          <div className="absolute left-5 bottom-3 flex items-end gap-3.5">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.username}
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-[#151C27] bg-[#1A2332] shadow-xl"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] ring-4 ring-[#151C27] flex items-center justify-center text-xl font-bold text-[#3B9EFF] shadow-xl">
                {initials}
              </div>
            )}
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Display Name */}
          <div className="p-4 rounded-xl bg-[#0F141D] border border-white/[0.06] space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#6F7886] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#3B9EFF]" />
              Display Name
            </span>
            <p className="text-sm font-semibold text-[#F5F7FA]">
              {profile.fullName || profile.username}
            </p>
          </div>

          {/* Username Handle */}
          <div className="p-4 rounded-xl bg-[#0F141D] border border-white/[0.06] space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#6F7886] flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5 text-[#3B9EFF]" />
              Username
            </span>
            <p className="text-sm font-mono font-semibold text-[#3B9EFF]">
              @{profile.username}
            </p>
          </div>
        </div>

        {/* Bio */}
        <div className="p-4 rounded-xl bg-[#0F141D] border border-white/[0.06] space-y-1.5">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#6F7886] flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-[#3B9EFF]" />
            Bio
          </span>
          <p className="text-sm text-[#A8B0BD] leading-relaxed">
            {profile.bio || (
              <span className="italic text-[#6F7886]">No bio written yet. Click "Edit Profile" to add one.</span>
            )}
          </p>
        </div>

        {/* Footer: Link to public profile */}
        <div className="pt-2 flex items-center justify-between border-t border-white/[0.06] text-xs">
          <span className="text-[#6F7886]">Public Profile URL</span>
          <Link
            href={`/${profile.username}`}
            className="inline-flex items-center gap-1 text-[#3B9EFF] hover:text-[#5AAFFF] font-semibold transition-colors"
          >
            <span>View Public Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Account Session Card */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#151C27] border border-white/[0.08] p-5 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#F5F7FA]">
            Account Session
          </h3>
          <p className="text-xs text-[#A8B0BD] mt-0.5">
            Signed in as <span className="text-[#F5F7FA] font-medium font-mono">@{profile.username}</span>. Sign out of CineTrack anytime on this device.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="h-10 px-4 rounded-xl border border-rose-500/30 hover:border-rose-500/60 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98 shrink-0 disabled:opacity-50"
        >
          {isSigningOut ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
        </button>
      </div>

      {/* Edit Profile Modal Integration */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={{
          displayName: profile.fullName,
          username: profile.username,
          bio: profile.bio,
          avatarUrl: profile.avatarUrl,
          backdropUrl: profile.backdropUrl,
        }}
        onSuccess={(updated) => {
          setProfile((prev) => ({
            ...prev,
            fullName: updated.displayName ?? prev.fullName,
            username: updated.username ?? prev.username,
            bio: updated.bio ?? prev.bio,
            avatarUrl: updated.avatarUrl ?? prev.avatarUrl,
            backdropUrl: updated.backdropUrl ?? prev.backdropUrl,
          }));
        }}
      />
    </div>
  );
}
