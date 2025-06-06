import clsx from "clsx"
import type { ReactNode } from "react"
import React from "react"
import styles from "./styles.module.css"

type FeatureItem = {
  description: string
  src: string
}

const FeatureList: FeatureItem[] = [
  {
    description: "①採点する選手を選択",
    src: require("@site/static/img/screen/01_playername.webp").default,
  },
  {
    description: "②確認画面",
    src: require("@site/static/img/screen/02_confirm.webp").default,
  },
  {
    description: "③パネルをタップ(クリック)でロボットが進行。点が更新。",
    src: require("@site/static/img/screen/03_challenge_resize.webp").default,
  },
  {
    description: "④結果送信。",
    src: require("@site/static/img/screen/05_succsess.webp").default,
  },
]

const DetailFeatureList: FeatureItem[] = [
  {
    description:
      "①選手一覧の中から採点する選手をタップして選択。確認へボタンをタップ。",
    src: require("@site/static/img/screen/01_playername.webp").default,
  },
  {
    description:
      "②コースと選手を確認して、合っていればスタート、誤りがあれば選手選択に戻る。",
    src: require("@site/static/img/screen/02_confirm.webp").default,
  },
  {
    description:
      "③パネル(どこでも良い)をタップするとロボットが次のミッションへ動く。点とミッションが更新される。間違って進んだ場合は1つ戻るボタンを押す。",
    src: require("@site/static/img/screen/03_challenge_resize.webp").default,
  },
  {
    description:
      "④ゴールまで進んだら結果送信ボタンを押す。間違った場合はチャレンジに戻る。",
    src: require("@site/static/img/screen/05_succsess.webp").default,
  },
  {
    description:
      "⑤チャレンジ中、コースから脱落などの場合は失敗ボタンを押す。1回目の場合、2回目のチャレンジを選択できる。2回目の場合は結果を送信して終わる。",
    src: require("@site/static/img/screen/04_failure.webp").default,
  },
]

const DetailFeatureListIpponBashi: FeatureItem[] = [
  {
    description:
      "①パネル(どこでも良い)をタップするとロボットが次のマスへ動く。点が更新される。間違って進んだ場合は1つ戻るボタンを押す。",
    src: require("@site/static/img/screen/15_ipponbashi01.webp").default,
  },
  {
    description:
      "②ロボットがコースアウトした時にはコースアウトを押す。1回目の場合、2回目のチャレンジの選択肢が出る。1回目で終了する時は結果を送信して終わる。",
    src: require("@site/static/img/screen/15_ipponbashi02.webp").default,
  },
  {
    description:
      "③コースアウトしなければロボットが止まった所の点を獲得できるので、1回目の場合、結果を保存しておいて、2回目のチャレンジをすることができる。その時は再挑戦ボタン押す。",
    src: require("@site/static/img/screen/15_ipponbashi03.webp").default,
  },
  {
    description:
      "④結果送信ボタンを押すと結果を送信する。1回目のチャレンジの場合、ここからでも2回目のチャレンジを選択できる。",
    src: require("@site/static/img/screen/15_ipponbashi04.webp").default,
  },
]

const DetailFeatureListSensor: FeatureItem[] = [
  {
    description:
      "①開始時の状態。\nやり直しボタンを押すと1回目の得点を保存して、2回目のチャレンジになる。",
    src: require("@site/static/img/screen/16_sensor01.webp").default,
  },
  {
    description:
      "②トンネル停止クリアで「トンネルで停止」又は「10P」をタップする。チェックと現在ポイントが更新される。",
    src: require("@site/static/img/screen/16_sensor02.webp").default,
  },
  {
    description:
      "③ギリギリ停止クリアで停止ゾーンのポイントをタップする。チェックと現在ポイントが更新される。",
    src: require("@site/static/img/screen/16_sensor04.webp").default,
  },
  {
    description:
      "④壁にぶつかると「-5P」をタップする。チェックと現在ポイントが更新される。",
    src: require("@site/static/img/screen/16_sensor03.webp").default,
  },
  {
    description:
      "⑤1回目のチャレンジ時に結果送信ボタンを押すと結果送信か2回目のチャレンジをするか聞かれる。そのまま1回だけで終わるなら上、2回目をするなら下を選ぶ。",
    src: require("@site/static/img/screen/16_sensor05.webp").default,
  },
  {
    description:
      "⑥2回目のチャレンジ時に結果送信ボタンを押すと1回目と2回目の結果を両方送信する。",
    src: require("@site/static/img/screen/16_sensor06.webp").default,
  },
]

function Feature({ description, src }: FeatureItem) {
  return (
    <div className={clsx("col col--6", styles.featureCol)}>
      <p>
        {description.split("\n").map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index !== description.split("\n").length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
      <div className={clsx("text--center", styles.featureImg)}>
        <img src={src} role="img" className={clsx(styles.featureImg)} />
      </div>
      <hr />
    </div>
  )
}

// Mobile viewとそれより幅広画面で表示の段組みを変えて、高さを揃える。
function FeatureCol({ items }: { items: FeatureItem[] }) {
  return (
    <>
      {items
        .reduce((acc, _, index, array) => {
          if (index % 2 === 0) {
            acc.push(array.slice(index, index + 2))
          }
          return acc
        }, [] as FeatureItem[][])
        .map((pair, rowIndex) => (
          <div className="row container" key={rowIndex}>
            {pair.map((item, colIndex) => (
              <Feature key={colIndex} {...item} />
            ))}
            <hr />
          </div>
        ))}
    </>
  )
}

export default function CourseCount({
  index,
}: Readonly<{ index: number }>): ReactNode {
  return (
    <section className={styles.features}>
      <div className="row">
        {index === 1 ? (
          <FeatureCol items={DetailFeatureList} />
        ) : index === 2 ? (
          <FeatureCol items={DetailFeatureListIpponBashi} />
        ) : index === 3 ? (
          <FeatureCol items={DetailFeatureListSensor} />
        ) : (
          <FeatureCol items={FeatureList} />
        )}
      </div>
    </section>
  )
}
