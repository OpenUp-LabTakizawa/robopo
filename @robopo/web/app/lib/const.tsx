import {
  ArrowRightEndOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowUpCircleIcon,
  ArrowUturnLeftIcon,
  CalculatorIcon,
  HomeIcon,
  PlayIcon,
  TrophyIcon,
  UserCircleIcon,
  UserIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline"
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
  icon: <HomeIcon className="size-6" />,
}

export const SIGN_IN_CONST: NavItem = {
  label: "ログイン",
  href: "/signIn",
  icon: <ArrowRightEndOnRectangleIcon className="size-6" />,
}

export const SIGN_OUT_CONST: NavItem = {
  label: "ログアウト",
  href: "/signOut" as Route,
  icon: <ArrowRightStartOnRectangleIcon className="size-6" />,
}

export const COMPETITION_MANAGEMENT_LIST: NavItem[] = [
  {
    label: "大会一覧",
    href: "/competition",
    icon: <TrophyIcon className="size-6" />,
  },
  {
    label: "コース一覧",
    href: "/course",
    icon: <WrenchIcon className="size-6" />,
  },
  {
    label: "選手一覧",
    href: "/player",
    icon: <UserIcon className="size-6" />,
  },
  {
    label: "採点者一覧",
    href: "/judge",
    icon: <UserCircleIcon className="size-6" />,
  },
  {
    label: "集計結果",
    href: "/summary" as Route,
    icon: <CalculatorIcon className="size-6" />,
  },
]

export const NAVIGATION_GENERAL_LIST: NavItem[] = [
  {
    label: "ホーム",
    href: "/",
    icon: <HomeIcon className="size-6" />,
  },
]

export const RETRY_CONST = {
  label: "2回目のチャレンジへ",
  icon: <PlayIcon className="size-6" />,
}

const BACK_CONST = {
  label: "戻る",
  icon: <ArrowUturnLeftIcon className="size-6" />,
}

export function BackLabelWithIcon(): JSX.Element {
  return (
    <>
      {BACK_CONST.icon}
      {BACK_CONST.label}
    </>
  )
}

export function SendIcon(): JSX.Element {
  return <ArrowUpCircleIcon className="size-6" />
}
