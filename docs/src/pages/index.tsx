import type { ReactNode } from "react"
import clsx from "clsx"
import Link from "@docusaurus/Link"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import Layout from "@theme/Layout"
import HomepageFeatures from "@site/src/components/HomepageFeatures"
import Heading from "@theme/Heading"
import styles from "./index.module.css"

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs/intro">
            マニュアルトップへ
          </Link>
        </div>
        <br />
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="https://robopo.vercel.app/"
            style={{ display: "flex", alignItems: "center" }}>
            <img role="img" src="img/logo.svg" alt="ROBOPOアプリへ" width="30" height="30" />
            ROBOPOアプリへ
          </Link>
        </div>
        <br />
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="https://github.com/openup-labtakizawa/robopo/tree/docusaurus">
            <img role="img" src="img/github-mark.png" alt="ROBOPO Githubへ" width="20" height="20" />
            ROBOPO Githubへ
          </Link>
        </div>
      </div>
    </header>
  )
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout
      title={`${siteConfig.title}へようこそ`}
      description="このサイトはロボサバ採点集計アプリについての手引書です。This site is a manual for the scoring aggregation app using in competitions of the ROBOT SURVIVAL PROJECT.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  )
}
