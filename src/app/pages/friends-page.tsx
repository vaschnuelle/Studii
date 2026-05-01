import { useEffect, useMemo, useState } from "react";
import { Loader2, MessageCircle, Search, TrendingUp, UserPlus, Users } from "lucide-react";
import { alignmentScoreFromOverlapHours } from "@studii/shared";
import { useAuth } from "@/contexts/auth-context";
import { useStudiiData } from "@/contexts/studii-data-context";
import { DEMO_FRIEND_NAMES } from "@/data/demo-phase2-data";
import {
  createFriendRequest,
  fetchFriendsForUser,
  normalizeFriendUsernameQuery,
  searchProfilesByUsername,
  type FriendSearchResult,
  type FriendViewModel,
} from "@/lib/friends/friends-service";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

const demoFriends: FriendViewModel[] = [
  {
    id: "demo-1",
    name: "Sarah Chen",
    image: "https://images.unsplash.com/photo-1758525861586-1c8c8e424dc8?w=200&h=200&fit=crop",
    status: "active",
    activity: "Studying Physics",
    username: "sarah",
  },
  {
    id: "demo-2",
    name: "Alex Kumar",
    image: "https://images.unsplash.com/photo-1770235622334-7b721261a230?w=200&h=200&fit=crop",
    status: "active",
    activity: "Studying Math",
    username: "alex",
  },
  {
    id: "demo-3",
    name: "Maya Johnson",
    image: "https://images.unsplash.com/photo-1758521540968-3af0cc2074a0?w=200&h=200&fit=crop",
    status: "inactive",
    activity: "Offline",
    username: "maya",
  },
];

/**
 * Renders friend activity using backend data for authenticated users, with demo fallback.
 */
export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [backendFriends, setBackendFriends] = useState<FriendViewModel[] | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [friendUsernameQuery, setFriendUsernameQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FriendSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [addFriendErrorMessage, setAddFriendErrorMessage] = useState<string | null>(null);
  const [addFriendStatusMessage, setAddFriendStatusMessage] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { stats, loading: statsLoading } = useStudiiData();

  const topBuddies =
    stats &&
    Object.entries(stats.friendOverlapCache)
      .sort((leftEntry, rightEntry) => rightEntry[1] - leftEntry[1])
      .slice(0, 3)
      .map(([friendId, overlapHours]) => ({
        id: friendId,
        name: DEMO_FRIEND_NAMES[friendId] ?? friendId,
        hours: overlapHours,
        alignment: alignmentScoreFromOverlapHours(overlapHours),
      }));

  const canLoadBackendFriends = Boolean(currentUser && isSupabaseConfigured());

  useEffect(() => {
    if (!canLoadBackendFriends || !currentUser) {
      setBackendFriends(null);
      setBackendError(null);
      setIsLoadingFriends(false);
      return;
    }

    let cancelled = false;

    /**
     * Loads friend relations and profile data for the authenticated user.
     */
    async function loadBackendFriends(): Promise<void> {
      try {
        setIsLoadingFriends(true);
        setBackendError(null);
        const supabase = getSupabaseClient();
        const loadedFriends = await fetchFriendsForUser(supabase, currentUser.id);
        if (!cancelled) {
          setBackendFriends(loadedFriends);
        }
      } catch (error) {
        if (!cancelled) {
          setBackendFriends([]);
          setBackendError(error instanceof Error ? error.message : "Failed to load friends");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingFriends(false);
        }
      }
    }

    void loadBackendFriends();

    return () => {
      cancelled = true;
    };
  }, [canLoadBackendFriends, currentUser]);

  /**
   * Searches discoverable profiles by username and displays match results.
   */
  async function handleFriendSearch(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!currentUser || !isSupabaseConfigured()) {
      return;
    }

    setAddFriendErrorMessage(null);
    setAddFriendStatusMessage(null);
    setSearchResults([]);

    const normalizedQuery = normalizeFriendUsernameQuery(friendUsernameQuery);
    if (normalizedQuery.length < 3) {
      setAddFriendErrorMessage("Enter at least 3 username characters.");
      return;
    }

    try {
      setIsSearching(true);
      const supabase = getSupabaseClient();
      const results = await searchProfilesByUsername(supabase, currentUser.id, normalizedQuery);
      setSearchResults(results);
      if (results.length === 0) {
        setAddFriendStatusMessage("No user found with that username.");
      }
    } catch (error) {
      setAddFriendErrorMessage(error instanceof Error ? error.message : "Failed to search users.");
    } finally {
      setIsSearching(false);
    }
  }

  /**
   * Sends a friend request to a selected username match.
   */
  async function handleSendFriendRequest(addresseeUserId: string): Promise<void> {
    if (!currentUser || !isSupabaseConfigured()) {
      return;
    }

    try {
      setIsSendingRequest(true);
      setAddFriendErrorMessage(null);
      setAddFriendStatusMessage(null);
      const supabase = getSupabaseClient();
      await createFriendRequest(supabase, currentUser.id, addresseeUserId);
      setAddFriendStatusMessage("Friend request sent.");
      setSearchResults([]);
      setFriendUsernameQuery("");
      const refreshedFriends = await fetchFriendsForUser(supabase, currentUser.id);
      setBackendFriends(refreshedFriends);
    } catch (error) {
      setAddFriendErrorMessage(error instanceof Error ? error.message : "Failed to send friend request.");
    } finally {
      setIsSendingRequest(false);
    }
  }

  const effectiveFriends = useMemo(
    () => (backendFriends !== null ? backendFriends : demoFriends),
    [backendFriends]
  );

  const activeFriends = effectiveFriends.filter((friendCard) => friendCard.status === "active");
  const inactiveFriends = effectiveFriends.filter((friendCard) => friendCard.status === "inactive");
  const pendingFriends = effectiveFriends.filter((friendCard) => friendCard.status === "pending");

  const filteredActiveFriends = activeFriends.filter((friendCard) =>
    friendCard.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredInactiveFriends = inactiveFriends.filter((friendCard) =>
    friendCard.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredPendingFriends = pendingFriends.filter((friendCard) =>
    friendCard.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 md:pb-8">
      <div className="bg-gradient-to-br from-[#508CA4] to-[#508CA4]/90 rounded-[2rem] p-8 shadow-xl shadow-[#508CA4]/40 text-white border-2 border-[#508CA4]/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Study Buddies</h1>
            <p className="text-white/90 font-medium text-lg">{activeFriends.length} friends studying now</p>
          </div>
          <button
            onClick={() => {
              setIsAddFriendOpen((wasOpen) => !wasOpen);
              setAddFriendErrorMessage(null);
              setAddFriendStatusMessage(null);
              setSearchResults([]);
            }}
            className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            aria-label="Add friend by username"
          >
            <UserPlus className="w-8 h-8" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-3xl font-bold">{effectiveFriends.length}</div>
            <div className="text-sm text-white/80 font-medium">Total Friends</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-3xl font-bold">{activeFriends.length}</div>
            <div className="text-sm text-white/80 font-medium">Active Now</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-3xl font-bold">{pendingFriends.length}</div>
            <div className="text-sm text-white/80 font-medium">Pending</div>
          </div>
        </div>
      </div>

      {isAddFriendOpen ? (
        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-lg border-2 border-white/80">
          <h2 className="text-xl font-bold text-[#22223B]">Add friend by username</h2>
          <p className="text-sm text-[#22223B]/60 font-medium mt-1">
            Search a username and send a friend request.
          </p>
          <form className="mt-4 flex flex-col md:flex-row gap-3" onSubmit={(event) => void handleFriendSearch(event)}>
            <input
              type="text"
              value={friendUsernameQuery}
              onChange={(event) => setFriendUsernameQuery(event.target.value)}
              placeholder="@username"
              className="flex-1 rounded-xl border border-[#508CA4]/30 bg-white px-4 py-3 font-medium text-[#22223B] focus:outline-none focus:border-[#508CA4]"
            />
            <button
              type="submit"
              disabled={isSearching || !currentUser}
              className="rounded-xl bg-gradient-to-r from-[#508CA4] to-[#5ea4bf] px-5 py-3 text-white font-bold shadow-lg disabled:opacity-60"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </form>

          {isSearching ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-[#22223B]/60 font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching usernames...
            </div>
          ) : null}

          {addFriendErrorMessage ? (
            <p className="mt-4 text-sm font-semibold text-rose-700">{addFriendErrorMessage}</p>
          ) : null}
          {addFriendStatusMessage ? (
            <p className="mt-4 text-sm font-semibold text-emerald-700">{addFriendStatusMessage}</p>
          ) : null}

          {searchResults.length > 0 ? (
            <div className="mt-4 space-y-3">
              {searchResults.map((resultCard) => (
                <div
                  key={resultCard.id}
                  className="flex items-center justify-between bg-amber-50/70 rounded-2xl border-2 border-white/80 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={resultCard.image}
                      alt={resultCard.fullName}
                      className="w-11 h-11 rounded-xl object-cover ring-2 ring-[#508CA4]/25"
                    />
                    <div>
                      <p className="font-bold text-[#22223B]">{resultCard.fullName}</p>
                      <p className="text-sm text-[#22223B]/60 font-medium">@{resultCard.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => void handleSendFriendRequest(resultCard.id)}
                    disabled={isSendingRequest}
                    className="rounded-xl bg-[#508CA4] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                  >
                    {isSendingRequest ? "Sending..." : "Add"}
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {backendError ? (
        <div className="bg-rose-100/90 border border-rose-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-rose-700">{backendError}</p>
        </div>
      ) : null}

      {canLoadBackendFriends && isLoadingFriends ? (
        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-lg border-2 border-white/80">
          <p className="text-sm text-[#22223B]/60 font-medium">Loading your friends…</p>
        </div>
      ) : null}

      <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-2 shadow-lg border-2 border-white/80">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#22223B]/40" />
          <input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full bg-transparent rounded-2xl pl-14 pr-6 py-4 text-lg font-medium text-[#22223B] placeholder:text-[#22223B]/40 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-lg border-2 border-[#508CA4]/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#508CA4]/15 flex items-center justify-center">
            <Users className="w-6 h-6 text-[#508CA4]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#22223B]">Top study buddies</h2>
            <p className="text-sm text-[#22223B]/60 font-medium">Overlap in the last 30 days</p>
          </div>
        </div>
        {statsLoading || !topBuddies ? (
          <p className="text-sm text-[#22223B]/50 font-medium">Loading overlap…</p>
        ) : (
          <ol className="space-y-3">
            {topBuddies.map((buddyEntry, index) => (
              <li
                key={buddyEntry.id}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 border-2 ${
                  index === 0 ? "border-[#508CA4] bg-[#508CA4]/10" : "border-white/80 bg-amber-50/50"
                }`}
              >
                <span className="font-bold text-[#22223B]">
                  #{index + 1} {buddyEntry.name}
                </span>
                <span className="text-sm font-semibold text-[#22223B]/70">
                  {buddyEntry.hours.toFixed(1)}h · {buddyEntry.alignment}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {canLoadBackendFriends && !isLoadingFriends && effectiveFriends.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-8 shadow-lg border-2 border-white/80">
          <h2 className="text-2xl font-bold text-[#22223B]">No friends yet</h2>
          <p className="text-[#22223B]/65 font-medium mt-2">
            Your account is ready. Add your first friend by searching for their username.
          </p>
        </div>
      ) : null}

      {filteredPendingFriends.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-amber-500 rounded-full" />
            <h2 className="text-2xl font-bold text-[#22223B]">Pending ({filteredPendingFriends.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPendingFriends.map((friendCard) => (
              <div
                key={friendCard.id}
                className="bg-white/70 backdrop-blur-md rounded-[2rem] p-6 shadow-lg border-2 border-amber-200/70"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={friendCard.image}
                    alt={friendCard.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-200"
                  />
                  <div>
                    <div className="font-bold text-[#22223B] text-lg">{friendCard.name}</div>
                    <div className="text-sm text-[#22223B]/60 font-medium">{friendCard.activity}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {filteredActiveFriends.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#508CA4] rounded-full animate-pulse shadow-lg shadow-[#508CA4]/40" />
            <h2 className="text-2xl font-bold text-[#22223B]">Active ({filteredActiveFriends.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActiveFriends.map((friendCard) => (
              <div
                key={friendCard.id}
                className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-lg border-2 border-white/80 hover:scale-[1.02] hover:shadow-xl transition-all group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={friendCard.image}
                      alt={friendCard.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#508CA4]/40"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#508CA4] rounded-full border-2 border-white shadow-lg animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[#22223B] text-lg mb-1">{friendCard.name}</div>
                    <div className="text-sm text-[#22223B]/60 font-medium">{friendCard.activity}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t-2 border-slate-200/50">
                  <div>
                    <div className="text-xs text-[#22223B]/60 font-medium">Username</div>
                    <div className="text-xl font-bold text-[#508CA4]">
                      {friendCard.username ? `@${friendCard.username}` : "—"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 bg-[#508CA4]/10 rounded-xl flex items-center justify-center hover:bg-[#508CA4]/20 transition-all">
                      <MessageCircle className="w-5 h-5 text-[#508CA4]" />
                    </button>
                    <button className="w-10 h-10 bg-[#508CA4]/10 rounded-xl flex items-center justify-center hover:bg-[#508CA4]/20 transition-all">
                      <TrendingUp className="w-5 h-5 text-[#508CA4]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {filteredInactiveFriends.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-gray-400 rounded-full" />
            <h2 className="text-2xl font-bold text-[#22223B]">Offline ({filteredInactiveFriends.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredInactiveFriends.map((friendCard) => (
              <div
                key={friendCard.id}
                className="bg-white/60 backdrop-blur-md rounded-[2rem] p-5 shadow-lg border-2 border-white/80 opacity-70 hover:opacity-100 transition-opacity"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    <img
                      src={friendCard.image}
                      alt={friendCard.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-300/40"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-300 rounded-full border-2 border-white" />
                  </div>
                  <div className="font-bold text-[#22223B] mb-1">{friendCard.name}</div>
                  <div className="text-xs text-[#22223B]/60 font-medium mb-3">{friendCard.activity}</div>
                  <div className="text-sm font-bold text-[#22223B]/70 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">
                    {friendCard.username ? `@${friendCard.username}` : "Offline"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {searchQuery &&
      filteredActiveFriends.length === 0 &&
      filteredInactiveFriends.length === 0 &&
      filteredPendingFriends.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-white/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Search className="w-10 h-10 text-[#22223B]/40" />
          </div>
          <p className="text-xl font-bold text-[#22223B]/60">No friends found</p>
          <p className="text-[#22223B]/40 font-medium">Try a different search term</p>
        </div>
      ) : null}
    </div>
  );
}
