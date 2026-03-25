import { FriendActivityList } from '../components/home/FriendActivityList';
import { HOME_FRIENDS_MOCK, HOME_RECENT_SESSIONS_MOCK } from '../components/home/homeMockData';
import { HomeWelcomeCard } from '../components/home/HomeWelcomeCard';
import { RecentSessionsSection } from '../components/home/RecentSessionsSection';
import {
  StudyStatBuddiesCard,
  StudyStatStreakCard,
  StudyStatWeekCard,
} from '../components/home/StudyStatCards';

/**
 * Home dashboard: welcome hero, stats, friends activity, and recent sessions (Figma reference).
 */
export function HomePage() {
  return (
    <div className="space-y-8 pb-24 md:pb-8">
      <HomeWelcomeCard />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StudyStatWeekCard />
        <StudyStatStreakCard />
        <StudyStatBuddiesCard />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FriendActivityList friends={HOME_FRIENDS_MOCK} />
        <RecentSessionsSection sessions={HOME_RECENT_SESSIONS_MOCK} />
      </div>
    </div>
  );
}
