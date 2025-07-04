import Link from "@docusaurus/Link"

// ROBOPO のあるGitHubリポジトリのURL
const robopoGithubUrl = "https://github.com/openup-labtakizawa/robopo/"

interface GithubLinkProps {
  filePath: string
}

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
