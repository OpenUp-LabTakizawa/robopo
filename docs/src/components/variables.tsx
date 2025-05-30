import React from "react"
import Link from "@docusaurus/Link"

// ROBOPO のあるGithubリポジトリのURL
const robopoGithubUrl = "https://github.com/kazutan1230/robopo/"

interface GithubLinkProps {
  filePath: string
}

export function GithubLink({ filePath }: GithubLinkProps) {
  return (
    <Link to={`${robopoGithubUrl}blob/main/${filePath}`} target="_blank" rel="noopener noreferrer">
      {filePath}
    </Link>
  )
}
