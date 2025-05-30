import type { ReactNode } from "react"
import clsx from "clsx"
import Heading from "@theme/Heading"
import styles from "./styles.module.css"

type FeatureItem = {
  title: string
  src: string
  description: ReactNode
}

const FeatureList: FeatureItem[] = [
  {
    title: "採点機能",
    src: require("@site/static/img/screen/03_challenge_resize.webp").default,
    description: <>競技の採点ができます。</>,
  },
  {
    title: "集計結果表示",
    src: require("@site/static/img/screen/07_pointlist_mosaic_resize.webp").default,
    description: <>競技の結果を一覧で表示します。</>,
  },
  {
    title: "大会運営",
    src: require("@site/static/img/screen/09_toppage_resize.webp").default,
    description: <>ロボサバコースを入力したり、選手登録の機能を提供します。</>,
  },
]

function Feature({ title, src, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <img src={src} role="img" className={styles.featureImg} />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
