import {
  BarChart3,
  House,
  LogIn,
  LogOut,
  Play,
  Route as RouteIcon,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react"
import type { Route } from "next"
import type { JSX } from "react"

export interface NavItem {
  label: string
  href: Route
  icon: JSX.Element
}

export const HOME_CONST: NavItem = {
  label: "ホーム",
  href: "/",
  icon: <House className="size-6" />,
}

export const SIGN_IN_CONST: NavItem = {
  label: "ログイン",
  href: "/signIn",
  icon: <LogIn className="size-6" />,
}

export const SIGN_OUT_CONST: NavItem = {
  label: "ログアウト",
  href: "/signOut" as Route,
  icon: <LogOut className="size-6" />,
}

export const COMPETITION_MANAGEMENT_LIST: NavItem[] = [
  {
    label: "大会一覧",
    href: "/competition",
    icon: <Trophy className="size-6" />,
  },
  {
    label: "コース一覧",
    href: "/course",
    icon: <RouteIcon className="size-6" />,
  },
  {
    label: "選手一覧",
    href: "/player",
    icon: <Users className="size-6" />,
  },
  {
    label: "採点者一覧",
    href: "/judge",
    icon: <UserCheck className="size-6" />,
  },
  {
    label: "集計結果",
    href: "/summary" as Route,
    icon: <BarChart3 className="size-6" />,
  },
]

export const NAVIGATION_GENERAL_LIST: NavItem[] = [
  {
    label: "ホーム",
    href: "/",
    icon: <House className="size-6" />,
  },
]

export const RETRY_CONST = {
  label: "2回目のチャレンジへ",
  icon: <Play className="size-6" />,
}
