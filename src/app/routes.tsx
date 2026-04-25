import { createBrowserRouter } from "react-router";
import Layout from "./layout";
import HomePage from "./pages/home-page";
import TimerPage from "./pages/timer-page";
import FriendsPage from "./pages/friends-page";
import AnalyticsPage from "./pages/analytics-page";
import WrappedPage from "./pages/wrapped-page";
import SignupPage from "./pages/signup-page";
import SigninPage from "./pages/signin-page";
import PomodoroPage from "./pages/pomodoro-page";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "timer", Component: TimerPage },
      { path: "pomodoro", Component: PomodoroPage },
      { path: "friends", Component: FriendsPage },
      { path: "analytics", Component: AnalyticsPage },
      { path: "wrapped", Component: WrappedPage },
      { path: "signup", Component: SignupPage },
      { path: "signin", Component: SigninPage },
    ],
  },
]);
