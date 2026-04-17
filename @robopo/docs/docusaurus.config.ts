import type * as Preset from "@docusaurus/preset-classic"
import type { Config } from "@docusaurus/types"
import { themes as prismThemes } from "prism-react-renderer"

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "ROBOPOマニュアル",
  tagline: "-ロボサバ採点集計アプリ手引書-",
  favicon: "favicon.ico",

  // Set the production url of your site here
  url: "https://openup-labtakizawa.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/robopo/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "openup-labtakizawa", // Usually your GitHub org/user name.
  projectName: "robopo", // Usually your repo name.

  onBrokenLinks: "throw",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "ja",
    locales: ["ja"],
    localeConfigs: {
      ja: {
        label: "日本語",
        direction: "ltr",
      },
    },
  },

  future: {
    faster: true,
    v4: true,
  },

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
      onBrokenMarkdownImages: "throw",
    },
    mermaid: true,
    remarkRehypeOptions: {
      footnoteLabel: "脚注",
    },
  },

  themes: ["@docusaurus/theme-mermaid"],

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/OpenUp-LabTakizawa/robopo/tree/main/@robopo/docs",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    // Replace with your project's social card
    // image: "docusaurus-social-card.jpg",
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    navbar: {
      title: "ROBOPOマニュアル",
      logo: {
        alt: "ROBOPO Logo",
        src: "logo.svg",
      },
      items: [
        {
          to: "/docs/",
          label: "はじめに",
          position: "left",
          activeBaseRegex: "^/robopo/docs/?$",
        },
        {
          type: "dropdown",
          label: "管理者向け",
          position: "left",
          items: [
            { label: "ダッシュボード", to: "/docs/admin/dashboard" },
            { label: "大会の作成・編集", to: "/docs/admin/competition" },
            { label: "コース作成", to: "/docs/admin/course" },
            { label: "選手の登録", to: "/docs/admin/player" },
            { label: "採点者の登録", to: "/docs/admin/judge" },
            { label: "管理者アカウント管理", to: "/docs/admin/admin-users" },
          ],
        },
        {
          type: "dropdown",
          label: "採点者向け",
          position: "left",
          items: [
            { label: "採点の開始", to: "/docs/scoring/challenge-start" },
            { label: "採点の仕方", to: "/docs/scoring/scoring" },
            {
              label: "リトライ・コースアウト",
              to: "/docs/scoring/retry-courseout",
            },
          ],
        },
        {
          type: "dropdown",
          label: "集計・印刷",
          position: "left",
          items: [
            { label: "集計結果の見方", to: "/docs/results/summary" },
            { label: "個人成績シート", to: "/docs/results/score-sheet" },
            { label: "PDF出力", to: "/docs/results/print" },
          ],
        },
        {
          type: "dropdown",
          label: "観戦ページ",
          position: "left",
          items: [
            {
              label: "ライブランキングの見方",
              to: "/docs/spectator/spectator",
            },
            { label: "マスク機能について", to: "/docs/spectator/mask" },
          ],
        },
        {
          type: "dropdown",
          label: "技術情報",
          position: "left",
          items: [
            { label: "インフラ構成", to: "/docs/technical/infrastructure" },
            { label: "使用技術", to: "/docs/technical/tech-stack" },
            { label: "データ構造", to: "/docs/technical/database" },
          ],
        },
        {
          href: "https://robopo.caravan-kidstec.com",
          label: "ROBOPOアプリ",
          position: "right",
        },
        {
          href: "https://github.com/openup-labtakizawa/robopo",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "ドキュメント",
          items: [
            { label: "はじめに", to: "/docs/" },
            { label: "使い始める前に", to: "/docs/category/使い始める前に" },
            { label: "管理者向け", to: "/docs/category/管理者向け" },
            { label: "採点者向け", to: "/docs/category/採点者向け" },
          ],
        },
        {
          title: "機能",
          items: [
            { label: "集計・印刷", to: "/docs/category/集計印刷" },
            { label: "観戦ページ", to: "/docs/category/観戦ページ" },
            { label: "技術情報", to: "/docs/category/技術情報" },
          ],
        },
        {
          title: "リンク",
          items: [
            {
              label: "ROBOPOアプリ",
              href: "https://robopo.caravan-kidstec.com",
            },
            {
              label: "GitHub",
              href: "https://github.com/openup-labtakizawa/robopo",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} OpenUp Lab Takizawa. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
}

export default config
