import Link from "@docusaurus/Link"
import useBaseUrl from "@docusaurus/useBaseUrl"

// ROBOPO のあるGitHubリポジトリのURL
const robopoGithubUrl = "https://github.com/openup-labtakizawa/robopo/"

interface GithubLinkProps {
  filePath: string
}

type Position = "left" | "right" | "l" | "r"

export function GithubLink({ filePath }: GithubLinkProps) {
  return (
    <Link
      to={`${robopoGithubUrl}blob/main/${filePath}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {filePath}
    </Link>
  )
}

export function TwoColumnLayout({
  text,
  imgSrc,
  alt,
  position = "left",
}: {
  text: string
  imgSrc: string
  alt: string
  position: Position
}) {
  // "l" を "left" に、"r" を "right" に正規化
  const normalized =
    position === "l" ? "left" : position === "r" ? "right" : position
  const clear: React.CSSProperties["clear"] =
    normalized === "left" ? "both" : "right"
  const style = {
    width: "45%",
    float: normalized,
    clear: clear,
  }
  return (
    <div style={style}>
      <br />
      {text}
      {/** biome-ignore lint/performance/noImgElement: DocusaurusはNext.js環境ではないので、img要素を使用する */}
      <img src={useBaseUrl(imgSrc)} alt={alt} width="600" />
    </div>
  )
}

export function TwoColumnList({
  items,
}: {
  items: { id: string; text: string; imgSrc: string; alt: string }[]
}) {
  return (
    <>
      {items.map((item, index) => (
        <TwoColumnLayout
          key={item.id}
          {...item}
          position={index % 2 === 0 ? "left" : "right"}
        />
      ))}
    </>
  )
}
