import Heading from "@theme/Heading"
import clsx from "clsx"
import type { ReactNode } from "react"
import styles from "./styles.module.css"

type FeatureItem = {
  title: string
  src: string
  url: string
  description: ReactNode
}

const FeatureList: FeatureItem[] = [
  {
    title: "採点機能",
    src: require("@site/static/screens/04-scoring/scoring-basic.webp").default,
    url: "/docs/category/採点者向け",
    description: <>タブレットやスマホで競技の採点をリアルタイムに行えます。</>,
  },
  {
    title: "集計結果表示",
    src: require("@site/static/screens/05-results/summary.webp").default,
    url: "/docs/category/集計・印刷",
    description: <>選手・採点者・コース別に結果を一覧表示、PDF出力できます。</>,
  },
  {
    title: "大会運営",
    src: require("@site/static/screens/03-admin/dashboard.webp").default,
    url: "/docs/category/管理者向け",
    description: <>大会・コース・選手の登録と運営をまとめて行えます。</>,
  },
]

function Feature({ title, src, url, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <a href={url}>
        <div className="text--center">
          <img src={src} alt={title} className={styles.featureImg} />
        </div>
        <div className="padding-horiz--md text--center">
          <Heading as="h3">{title}</Heading>
        </div>
      </a>
      <p className="padding-horiz--md text--center">{description}</p>
    </div>
  )
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props) => (
            <Feature key={props.title} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
