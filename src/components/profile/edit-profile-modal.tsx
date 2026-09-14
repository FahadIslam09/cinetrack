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
  CheckCircle2,
  UploadCloud,
  AlertCircle,
  Film,
} from "lucide-react";
import {
  updateProfile,
  checkUsernameAvailability,
  uploadProfileImage,
} from "@/actions/profile";
import { useScrollLock } from "@/hooks/use-scroll-lock";

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

  type UsernameStatus =
    | "idle"
    | "checking"
    | "available"
    | "taken"
    | "invalid"
    | "reserved"
    | "error";

  const [displayName, setDisplayName] = useState(initialData.displayName || "");
  const [username, setUsername] = useState(initialData.username || "");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("available");
  const [usernameMessage, setUsernameMessage] = useState<string>("");
  const usernameDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const [bio, setBio] = useState(initialData.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl || "");
  const [backdropUrl, setBackdropUrl] = useState(initialData.backdropUrl || "");

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lock background scroll when modal is open
  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setDisplayName(initialData.displayName || "");
      const initU = initialData.username || "";
      setUsername(initU);
      setUsernameStatus(initU ? "available" : "idle");
      setUsernameMessage(initU ? "Current username" : "");
      setBio(initialData.bio || "");
      setAvatarUrl(initialData.avatarUrl || "");
      setBackdropUrl(initialData.backdropUrl || "");
      setError(null);
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    return () => {
      if (usernameDebounceRef.current) {
        clearTimeout(usernameDebounceRef.current);
      }
    };
  }, []);

  const handleUsernameChange = (val: string) => {
    const raw = val.toLowerCase().replace(/^@/, "").replace(/[^a-z0-9_]/g, "").slice(0, 20);
    setUsername(raw);

    if (usernameDebounceRef.current) {
      clearTimeout(usernameDebounceRef.current);
    }

    const initialClean = (initialData.username || "").toLowerCase().replace(/^@/, "");

    if (!raw) {
      setUsernameStatus("invalid");
      setUsernameMessage("Username is required");
      return;
    }

    if (raw.length < 3) {
      setUsernameStatus("invalid");
      setUsernameMessage("Must be at least 3 characters");
      return;
    }

    if (raw === initialClean) {
      setUsernameStatus("available");
      setUsernameMessage("Current username");
      return;
    }

    setUsernameStatus("checking");
    setUsernameMessage("Checking availability...");

    usernameDebounceRef.current = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailability(raw);
        if (result.available) {
          setUsernameStatus("available");
          setUsernameMessage(`@${raw} is available`);
        } else {
          if (result.error?.includes("taken") || result.error?.includes("already taken")) {
            setUsernameStatus("taken");
            setUsernameMessage("Username already taken");
          } else if (result.error?.includes("reserved")) {
            setUsernameStatus("reserved");
            setUsernameMessage(result.error);
          } else {
            setUsernameStatus("invalid");
            setUsernameMessage(result.error || "Invalid username");
          }
        }
      } catch {
        setUsernameStatus("error");
        setUsernameMessage("Unable to verify username right now");
      }
    }, 300);
  };

  useScrollLock(isOpen);

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

      const res = await uploadProfileImage(formData);

      if (res.success && res.url) {
        if (target === "avatar") {
          setAvatarUrl(res.url);
        } else {
          setBackdropUrl(res.url);
        }
      } else {
        setError(res.error || "Failed to upload image.");
      }
    } catch (uploadErr) {
      console.error("Image upload error:", uploadErr);
      setError("Failed to upload image. Please check your internet connection.");
    } finally {
      if (target === "avatar") setIsUploadingImage(false);
      else setIsUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (usernameStatus === "checking") {
      setError("Please wait while username is being verified.");
      return;
    }

    if (usernameStatus !== "available" && usernameStatus !== "idle") {
      setError(usernameMessage || "Please enter a valid, available username.");
      return;
    }

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

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-lenis-prevent="true"
      aria-labelledby="edit-profile-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving && !isUploadingImage && !isUploadingCover) {
          onClose();
        }
      }}
    >
      <div className="bg-[#151C27] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden max-w-lg w-full text-white flex flex-col max-h-[90dvh] md:max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] shrink-0">
          <h3 id="edit-profile-title" className="font-bold text-base sm:text-lg text-[#F5F7FA]">
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
        <form
          onSubmit={handleSubmit}
          data-modal-scroll="true"
          data-lenis-prevent="true"
          className="p-5 flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto overscroll-contain modal-scrollbar"
        >
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
              <span className="text-[10px] text-[#6F7886]">Recommended: 1200×400</span>
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
              <span className="text-[10px] font-semibold text-[#6F7886]">
                Presets:
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
                    referrerPolicy="no-referrer"
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
                JPG, PNG or WebP
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#A8B0BD] flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5 text-[#3B9EFF]" />
                <span>Username Handle</span>
              </label>
              {usernameStatus !== "idle" && usernameMessage && (
                <span
                  className={`text-[11px] font-medium flex items-center gap-1 transition-colors ${
                    usernameStatus === "available"
                      ? "text-[#22C55E]"
                      : usernameStatus === "checking"
                      ? "text-[#A8B0BD]"
                      : "text-rose-400"
                  }`}
                >
                  {usernameMessage}
                </span>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#6F7886] pointer-events-none">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="fahadislam905"
                maxLength={20}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className={`w-full h-10 pl-7 pr-10 rounded-xl bg-[#1D2734] border text-sm text-[#F5F7FA] placeholder-[#6F7886] font-mono transition-all outline-none ${
                  usernameStatus === "available"
                    ? "border-emerald-500/40 focus:border-emerald-500 ring-1 ring-emerald-500/10"
                    : usernameStatus === "checking"
                    ? "border-white/[0.08] focus:border-[#3B9EFF]"
                    : usernameStatus === "idle"
                    ? "border-white/[0.08] focus:border-[#3B9EFF]"
                    : "border-rose-500/50 focus:border-rose-500 ring-1 ring-rose-500/10"
                }`}
              />

              {/* Real-time Status Icon */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                {usernameStatus === "checking" && (
                  <Loader2 className="w-4 h-4 animate-spin text-[#3B9EFF]" />
                )}
                {usernameStatus === "available" && (
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                )}
                {(usernameStatus === "taken" ||
                  usernameStatus === "invalid" ||
                  usernameStatus === "reserved" ||
                  usernameStatus === "error") && (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
              </div>
            </div>

            <p className="text-[11px] text-[#6F7886]">
              Your public URL:{" "}
              <span className="text-[#3B9EFF]">
                cinetrack.com/{username || "username"}
              </span>
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
              disabled={
                isSaving ||
                isUploadingImage ||
                isUploadingCover ||
                usernameStatus === "checking" ||
                usernameStatus === "taken" ||
                usernameStatus === "invalid" ||
                usernameStatus === "reserved" ||
                usernameStatus === "error"
              }
              className="px-4 py-2 rounded-xl bg-[#3B9EFF] hover:bg-[#5AAFFF] disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-md shadow-[#3B9EFF]/20 cursor-pointer disabled:cursor-not-allowed"
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
