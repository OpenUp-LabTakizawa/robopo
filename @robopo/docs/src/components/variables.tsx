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

export function BaseImage({
  src,
  alt,
  width = 600,
}: {
  src: string
  alt: string
  width?: number
}) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <img src={useBaseUrl(src)} alt={alt} width={width} />
    </div>
  )
}

export function TwoColumnLayout({
  text,
  src,
  alt,
  position = "left",
}: {
  text: string
  src: string
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
      <img src={useBaseUrl(src)} alt={alt} width="600" />
    </div>
  )
}

export function TwoColumnList({
  items,
}: {
  items: { id: string; text: string; src: string; alt: string }[]
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
