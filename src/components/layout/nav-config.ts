import {
  CheckListIcon,
  GitBranchIcon,
  SourceCodeIcon,
  StickyNote01Icon,
  Notification03Icon,
  UserAccountIcon,
  Settings03Icon,
} from "@hugeicons/core-free-icons";

export interface NavItemConfig {
  href: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  exact?: boolean;
  isNotification?: boolean;
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    href: "/",
    label: "Tasks",
    icon: CheckListIcon,
    exact: true,
  },
  {
    href: "/developer",
    label: "Developer",
    icon: GitBranchIcon,
    exact: false,
  },
  {
    href: "/coding",
    label: "Coding",
    icon: SourceCodeIcon,
    exact: false,
  },
  {
    href: "/notes",
    label: "Notes",
    icon: StickyNote01Icon,
    exact: false,
  },
  {
    href: "/notifications",
    label: "Notifications",
    icon: Notification03Icon,
    exact: false,
    isNotification: true,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: UserAccountIcon,
    exact: false,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings03Icon,
    exact: false,
  },
];

/**
 * Navigation items specifically for mobile bottom navigation.
 * Settings is accessed directly from the Profile header on mobile devices.
 */
export const MOBILE_NAV_ITEMS: NavItemConfig[] = NAV_ITEMS.filter(
  (item) => item.href !== "/settings"
);
