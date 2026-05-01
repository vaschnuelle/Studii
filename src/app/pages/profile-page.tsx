import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/contexts/auth-context";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { getReadableErrorMessage } from "@/lib/auth/auth-error";
import {
  getOwnProfile,
  normalizeUsername,
  saveOwnProfile,
  uploadProfileAvatar,
  validateProfileInput,
  validateAvatarFile,
  type ProfileRecord,
} from "@/lib/profile/profile-service";

interface ProfileFormValues {
  fullName: string;
  username: string;
}

const INITIAL_PROFILE_FORM_VALUES: ProfileFormValues = {
  fullName: "",
  username: "",
};
const DEFAULT_PROFILE_IMAGE = "https://images.unsplash.com/photo-1758270705518-b61b40527e76?w=200&h=200&fit=crop";

/**
 * Displays and updates the current user's profile using existing visual patterns.
 */
export default function ProfilePage() {
  const { currentUser, refreshCurrentProfile } = useAuth();
  const [profileRecord, setProfileRecord] = useState<ProfileRecord | null>(null);
  const [formValues, setFormValues] = useState<ProfileFormValues>(INITIAL_PROFILE_FORM_VALUES);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  /**
   * Updates one profile input field.
   */
  function updateFormField<FieldKey extends keyof ProfileFormValues>(
    fieldKey: FieldKey,
    fieldValue: ProfileFormValues[FieldKey]
  ): void {
    setFormValues((previousValues) => ({
      ...previousValues,
      [fieldKey]: fieldValue,
    }));
  }

  useEffect(() => {
    if (!currentUser || !isSupabaseConfigured()) {
      return;
    }

    let cancelled = false;

    /**
     * Loads the current user's profile data for initial edit/create state.
     */
    async function loadProfile(): Promise<void> {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const supabase = getSupabaseClient();
        const loadedProfile = await getOwnProfile(supabase, currentUser.id);
        if (!cancelled) {
          setProfileRecord(loadedProfile);
          setFormValues({
            fullName: loadedProfile?.full_name ?? "",
            username: loadedProfile?.username ?? "",
          });
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to load profile");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  /**
   * Selects a profile picture file and prepares a local preview.
   */
  function handleAvatarSelection(event: React.ChangeEvent<HTMLInputElement>): void {
    const selectedFile = event.target.files?.[0] ?? null;
    setStatusMessage(null);
    if (!selectedFile) {
      setSelectedAvatarFile(null);
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
      setAvatarPreviewUrl(null);
      return;
    }

    const avatarValidation = validateAvatarFile(selectedFile);
    if (!avatarValidation.isValid) {
      setErrorMessage(avatarValidation.errorMessage);
      setSelectedAvatarFile(null);
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
      setAvatarPreviewUrl(null);
      return;
    }

    setErrorMessage(null);
    setSelectedAvatarFile(selectedFile);
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    setAvatarPreviewUrl(URL.createObjectURL(selectedFile));
  }

  /**
   * Validates and persists profile form values for the authenticated user.
   */
  async function submitProfile(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!currentUser || !isSupabaseConfigured()) {
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);
    const validation = validateProfileInput({
      fullName: formValues.fullName,
      username: normalizeUsername(formValues.username),
    });

    if (!validation.isValid) {
      setErrorMessage(validation.errorMessage);
      return;
    }

    try {
      setIsSaving(true);
      const supabase = getSupabaseClient();
      const avatarUrl = selectedAvatarFile
        ? await uploadProfileAvatar(supabase, currentUser.id, selectedAvatarFile)
        : profileRecord?.avatar_url ?? null;
      const updatedProfile = await saveOwnProfile(supabase, currentUser.id, {
        fullName: formValues.fullName,
        username: normalizeUsername(formValues.username),
        avatarUrl,
      });
      setProfileRecord(updatedProfile);
      setFormValues({
        fullName: updatedProfile.full_name,
        username: updatedProfile.username ?? "",
      });
      await refreshCurrentProfile();
      setSelectedAvatarFile(null);
      setAvatarPreviewUrl(null);
      setStatusMessage(profileRecord ? "Profile updated successfully." : "Profile created successfully.");
    } catch (error) {
      const maybeMessage = getReadableErrorMessage(error, "Failed to save profile");
      const normalizedMessage = maybeMessage.toLowerCase();
      setErrorMessage(
        normalizedMessage.includes("profiles_username_key")
          ? "That username is already taken. Try another one."
          : normalizedMessage.includes("row-level security")
            ? "Profile picture upload is blocked by storage permissions. Please verify avatar storage policies."
          : maybeMessage
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="bg-white/85 backdrop-blur-md rounded-[2rem] p-8 border-2 border-white/90 shadow-xl">
          <h1 className="text-3xl font-black text-[#22223B]">Profile</h1>
          <p className="text-[#22223B]/65 mt-2 font-medium">Sign in to create and edit your profile.</p>
          <Link
            to="/signin"
            className="inline-flex mt-6 rounded-xl bg-gradient-to-r from-[#508CA4] to-[#5ea4bf] px-5 py-2.5 text-white font-bold shadow-lg"
          >
            Go to Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="bg-white/85 backdrop-blur-md rounded-[2rem] p-8 border-2 border-white/90 shadow-xl">
        <h1 className="text-3xl font-black text-[#22223B]">Your Profile</h1>
        <p className="text-[#22223B]/65 mt-2 font-medium">
          Keep your profile updated so friends can find you quickly.
        </p>

        {isLoading ? (
          <p className="mt-4 text-sm font-semibold text-[#22223B]/70">Loading profile...</p>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={(event) => void submitProfile(event)}>
          <div>
            <label className="block text-sm font-bold text-[#22223B]/80">Profile Picture</label>
            <div className="mt-2 flex items-center gap-4">
              <img
                src={avatarPreviewUrl ?? profileRecord?.avatar_url ?? DEFAULT_PROFILE_IMAGE}
                alt="Profile preview"
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#508CA4]/25"
              />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarSelection}
                className="block w-full text-sm text-[#22223B]/70 file:mr-3 file:rounded-xl file:border-0 file:bg-[#508CA4]/15 file:px-3 file:py-2 file:font-semibold file:text-[#508CA4] hover:file:bg-[#508CA4]/25"
              />
            </div>
            <p className="mt-1 text-xs text-[#22223B]/55 font-medium">JPG, PNG, WEBP, or GIF up to 3MB.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#22223B]/80">Full Name</label>
            <input
              value={formValues.fullName}
              onChange={(event) => updateFormField("fullName", event.target.value)}
              className="mt-1 w-full rounded-xl border border-[#508CA4]/30 bg-white px-3 py-2 font-medium text-[#22223B] focus:outline-none focus:border-[#508CA4]"
              placeholder="Veronica Wong"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#22223B]/80">Username</label>
            <input
              value={formValues.username}
              onChange={(event) => updateFormField("username", event.target.value)}
              className="mt-1 w-full rounded-xl border border-[#508CA4]/30 bg-white px-3 py-2 font-medium text-[#22223B] focus:outline-none focus:border-[#508CA4]"
              placeholder="veronica_w"
            />
            <p className="mt-1 text-xs text-[#22223B]/55 font-medium">
              Use 3-32 chars: lowercase letters, numbers, underscores.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving || !isSupabaseConfigured()}
            className="w-full rounded-xl bg-gradient-to-r from-[#508CA4] to-[#5ea4bf] py-3 text-white font-bold shadow-lg disabled:opacity-60"
          >
            {isSaving ? "Saving..." : profileRecord ? "Save Profile" : "Create Profile"}
          </button>
        </form>

        {errorMessage ? <p className="mt-3 text-sm font-semibold text-rose-700">{errorMessage}</p> : null}
        {statusMessage ? <p className="mt-3 text-sm font-semibold text-emerald-700">{statusMessage}</p> : null}

        <p className="mt-5 text-sm text-[#22223B]/70">
          Ready to connect?{" "}
          <Link to="/friends" className="font-bold text-[#508CA4]">
            Open Friends
          </Link>
        </p>
      </div>
    </div>
  );
}
