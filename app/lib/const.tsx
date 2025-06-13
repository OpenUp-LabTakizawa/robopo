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
  WrenchIcon
} from "@heroicons/react/24/outline"
import type { JSX } from "react"

export const BASE_URL: string =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  "http://localhost:3000"

export interface NavItem {
  label: string
  href: string
  icon: JSX.Element
}

export const HOME_CONST: NavItem = {
  label: "ホーム",
  href: "/",
  icon: <HomeIcon className="w-6 h-6" />
}

export const SIGN_IN_CONST: NavItem = {
  label: "サインイン",
  href: "/signIn",
  icon: <ArrowRightEndOnRectangleIcon className="w-6 h-6" />
}

export const SIGN_OUT_CONST = {
  label: "サインアウト",
  href: "/signOut",
  icon: <ArrowRightStartOnRectangleIcon className="w-6 h-6" />
}

export const COMPETITION_MANAGEMENT_LIST = [
  { label: "コース作成", href: "/course", icon: <WrenchIcon className="w-6 h-6" /> },
  { label: "選手登録", href: "/player", icon: <UserIcon className="w-6 h-6" /> },
  { label: "採点者登録", href: "/umpire", icon: <UserCircleIcon className="w-6 h-6" /> },
  { label: "大会設定", href: "/config", icon: <Cog6ToothIcon className="w-6 h-6" /> },
]

export const RETRY_CONST = {
  label: "2回目のチャレンジへ",
  icon: <PlayIcon className="w-6 h-6" />
}

const BACK_CONST = {
  label: "戻る",
  icon: <ArrowUturnLeftIcon className="w-6 h-6" />
}

export const BackLabelWithIcon = (): JSX.Element => {
  return (
    <>{BACK_CONST.label}{BACK_CONST.icon}</>
  )
}

export const SendIcon = (): JSX.Element => {
  return (
    <ArrowUpCircleIcon className="w-6 h-6" />
  )
}