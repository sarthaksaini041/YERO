import {
  CheckListIcon,
  StickyNote01Icon,
  Notification03Icon,
  UserAccountIcon,
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
];
