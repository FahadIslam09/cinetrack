"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Loader2,
  User,
  AtSign,
  Camera,
  AlignLeft,
  Check,
  UploadCloud,
  AlertCircle,
  Film,
  Sparkles,
} from "lucide-react";
import { updateProfile } from "@/actions/profile";

const IMGBB_API_KEY = "991f94ae55c7ee215507ec80b51bfa5b";

const COVER_PRESETS = [
  {
    title: "Interstellar",
    url: "https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
  },
  {
    title: "Dune 2",
    url: "https://image.tmdb.org/t/p/w1280/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
  },
  {
    title: "Blade Runner",
    url: "https://image.tmdb.org/t/p/w1280/jXJxMcVoAnnhscQIviJw9dHsq8q.jpg",
  },
  {
    title: "Oppenheimer",
    url: "https://image.tmdb.org/t/p/w1280/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg",
  },
];

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    displayName?: string | null;
    username?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    backdropUrl?: string | null;
  };
  onSuccess: (updated: {
    displayName?: string | null;
    username?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    backdropUrl?: string | null;
  }) => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: EditProfileModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(initialData.displayName || "");
  const [username, setUsername] = useState(initialData.username || "");
  const [bio, setBio] = useState(initialData.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl || "");
  const [backdropUrl, setBackdropUrl] = useState(initialData.backdropUrl || "");

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDisplayName(initialData.displayName || "");
      setUsername(initialData.username || "");
      setBio(initialData.bio || "");
      setAvatarUrl(initialData.avatarUrl || "");
      setBackdropUrl(initialData.backdropUrl || "");
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleImageUpload = async (
    file: File,
    target: "avatar" | "cover"
  ) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, WEBP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB.");
      return;
    }

    if (target === "avatar") setIsUploadingImage(true);
    else setIsUploadingCover(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (json.success && json.data) {
        const uploadedUrl = json.data.display_url || json.data.url;
        if (target === "avatar") {
          setAvatarUrl(uploadedUrl);
        } else {
          setBackdropUrl(uploadedUrl);
        }
      } else {
        setError(json.error?.message || "Failed to upload image to ImgBB.");
      }
    } catch (uploadErr) {
      console.error("ImgBB upload error:", uploadErr);
      setError("Failed to upload image. Please check your internet connection.");
    } finally {
      if (target === "avatar") setIsUploadingImage(false);
      else setIsUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const cleanUsername = username.trim().toLowerCase().replace(/^@/, "");

    const res = await updateProfile({
      displayName,
      username: cleanUsername,
      bio,
      avatarUrl,
      backdropUrl,
    });

    setIsSaving(false);

    if (res.error) {
      setError(res.error);
    } else {
      const updatedUsername = res.updated?.username || cleanUsername;
      const usernameChanged =
        initialData.username && cleanUsername !== initialData.username.toLowerCase();

      onSuccess({
        displayName: displayName.trim() || null,
        username: updatedUsername,
        bio: bio.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
        backdropUrl: backdropUrl.trim() || null,
      });

      onClose();

      if (usernameChanged) {
        router.push(`/${updatedUsername}`);
        router.refresh();
      }
    }
  };

  const bioLength = bio.length;
  const isNearLimit = bioLength > 140;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving && !isUploadingImage && !isUploadingCover) {
          onClose();
        }
      }}
    >
      <div className="bg-[#151C27] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden max-w-lg w-full text-white my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          <h3 className="font-bold text-base sm:text-lg text-[#F5F7FA]">
            Edit Profile
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving || isUploadingImage || isUploadingCover}
            className="p-1 rounded-lg text-[#A8B0BD] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Cinematic Cover Backdrop Section */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#A8B0BD] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-[#3B9EFF]" />
                <span>Cinematic Cover Backdrop</span>
              </span>
              <span className="text-[10px] text-[#6F7886]">Uploaded to ImgBB</span>
            </label>

            {/* Cover Preview & Trigger */}
            <div className="relative aspect-[3/1] w-full rounded-xl overflow-hidden bg-[#1D2734] border border-white/[0.08] group">
              {backdropUrl ? (
                <img
                  src={backdropUrl}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#6F7886] gap-1 bg-gradient-to-br from-[#1A2332] to-[#0F172A]">
                  <Film className="w-6 h-6 opacity-40" />
                  <span className="text-[11px]">No cover set</span>
                </div>
              )}

              {/* Dimmed hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={isUploadingCover}
                  className="px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white text-xs font-semibold inline-flex items-center gap-1.5 backdrop-blur-sm border border-white/20 cursor-pointer"
                >
                  {isUploadingCover ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3B9EFF]" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5" />
                      <span>Change Movie Poster/Cover</span>
                    </>
                  )}
                </button>
              </div>

              {isUploadingCover && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white">
                  <Loader2 className="w-6 h-6 animate-spin text-[#3B9EFF]" />
                </div>
              )}
            </div>

            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImageUpload(f, "cover");
              }}
              className="hidden"
            />

            {/* Quick Movie Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] font-semibold text-[#6F7886] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#3B9EFF]" /> Presets:
              </span>
              {COVER_PRESETS.map((p) => (
                <button
                  key={p.title}
                  type="button"
                  onClick={() => setBackdropUrl(p.url)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer border ${
                    backdropUrl === p.url
                      ? "bg-[#3B9EFF]/20 border-[#3B9EFF] text-[#3B9EFF]"
                      : "bg-[#1D2734] hover:bg-[#253244] border-white/[0.06] text-[#A8B0BD]"
                  }`}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Avatar Section */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-[#1D2734] border border-white/[0.06]">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3B9EFF] to-blue-700 p-0.5 shadow-md overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar Preview"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#0F141D] flex items-center justify-center text-xl font-bold text-white uppercase">
                    {displayName ? displayName[0] : username ? username[0] : "C"}
                  </div>
                )}
              </div>

              {isUploadingImage && (
                <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center text-white">
                  <Loader2 className="w-5 h-5 animate-spin text-[#3B9EFF]" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#F5F7FA]">Profile Picture</p>
              <p className="text-[11px] text-[#A8B0BD] mt-0.5">
                Stored permanently on ImgBB.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageUpload(f, "avatar");
                }}
                className="hidden"
              />
              <button
                type="button"
                disabled={isUploadingImage || isSaving}
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 px-3 py-1.5 rounded-lg bg-[#3B9EFF]/15 hover:bg-[#3B9EFF]/25 border border-[#3B9EFF]/30 text-[#3B9EFF] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 3. Display Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#A8B0BD] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#3B9EFF]" />
              <span>Display Name</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value.slice(0, 50))}
              placeholder="e.g. Fahad Islam"
              maxLength={50}
              className="w-full h-10 px-3 rounded-xl bg-[#1D2734] border border-white/[0.08] text-sm text-[#F5F7FA] placeholder-[#6F7886] focus:border-[#3B9EFF] focus:outline-none transition-colors"
            />
          </div>

          {/* 4. Username Handle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#A8B0BD] flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5 text-[#3B9EFF]" />
              <span>Username Handle</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#6F7886]">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20)
                  )
                }
                placeholder="fahadislam905"
                maxLength={20}
                className="w-full h-10 pl-7 pr-3 rounded-xl bg-[#1D2734] border border-white/[0.08] text-sm text-[#F5F7FA] placeholder-[#6F7886] focus:border-[#3B9EFF] focus:outline-none transition-colors font-mono"
              />
            </div>
            <p className="text-[11px] text-[#6F7886]">
              Your public URL: <span className="text-[#3B9EFF]">cinetrack.com/{username || "username"}</span>
            </p>
          </div>

          {/* 5. Bio */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#A8B0BD] flex items-center gap-1.5">
                <AlignLeft className="w-3.5 h-3.5 text-[#3B9EFF]" />
                <span>Bio (160 characters max)</span>
              </label>
              <span
                className={`text-[11px] font-mono ${
                  isNearLimit ? "text-amber-400 font-bold" : "text-[#6F7886]"
                }`}
              >
                {bioLength}/160
              </span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 160))}
              placeholder="Tell fellow cinephiles about your taste in films..."
              rows={3}
              maxLength={160}
              className="w-full p-3 rounded-xl bg-[#1D2734] border border-white/[0.08] text-sm text-[#F5F7FA] placeholder-[#6F7886] focus:border-[#3B9EFF] focus:outline-none transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08] mt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving || isUploadingImage || isUploadingCover}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A8B0BD] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploadingImage || isUploadingCover}
              className="px-4 py-2 rounded-xl bg-[#3B9EFF] hover:bg-[#5AAFFF] disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-md shadow-[#3B9EFF]/20 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
