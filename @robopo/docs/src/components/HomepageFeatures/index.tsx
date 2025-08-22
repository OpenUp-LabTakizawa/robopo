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
    src: require("@site/static/img/screen/03_challenge_resize.webp").default,
    url: "/robopo/docs/category/採点",
    description: <>競技の採点ができます。</>,
  },
  {
    title: "集計結果表示",
    src: require("@site/static/img/screen/07_pointlist_mosaic_resize.webp")
      .default,
    url: "/robopo/docs/category/集計結果",
    description: <>競技の結果を一覧で表示します。</>,
  },
  {
    title: "大会運営",
    src: require("@site/static/img/screen/09_toppage_resize.webp").default,
    url: "/robopo/docs/category/大会管理",
    description: <>ロボサバコースの入力や選手登録の機能を提供します。</>,
  },
]

function Feature({ title, src, url, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <a href={url}>
        <div className="text--center">
          {/** biome-ignore lint/performance/noImgElement: ここでのimgは妥当。 */}
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
