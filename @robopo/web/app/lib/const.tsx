import {
  ArrowRightEndOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowUpCircleIcon,
  ArrowUturnLeftIcon,
  Cog6ToothIcon,
  HomeIcon,
  PlayIcon,
  UserCircleIcon,
  UserIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline"
import type { Route } from "next"
import type { JSX } from "react"

export const BASE_URL: string = process.env.VERCEL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.CI === "true"
    ? (process.env.DEPLOY_PRIME_URL as string)
    : process.env.URL || "http://localhost:3000"

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
  label: "サインイン",
  href: "/signIn",
  icon: <ArrowRightEndOnRectangleIcon className="size-6" />,
}

export const SIGN_OUT_CONST: NavItem = {
  label: "サインアウト",
  href: "/signOut" as Route,
  icon: <ArrowRightStartOnRectangleIcon className="size-6" />,
}

export const COMPETITION_MANAGEMENT_LIST: NavItem[] = [
  {
    label: "コース作成",
    href: "/course",
    icon: <WrenchIcon className="size-6" />,
  },
  {
    label: "選手登録",
    href: "/player",
    icon: <UserIcon className="size-6" />,
  },
  {
    label: "採点者登録",
    href: "/umpire",
    icon: <UserCircleIcon className="size-6" />,
  },
  {
    label: "大会設定",
    href: "/config",
    icon: <Cog6ToothIcon className="size-6" />,
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
      {BACK_CONST.label}
      {BACK_CONST.icon}
    </>
  )
}

export function SendIcon(): JSX.Element {
  return <ArrowUpCircleIcon className="size-6" />
}
