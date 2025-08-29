import { AudioProvider } from "@/app/challenge/[competitionId]/[courseId]/[playerId]/audioContext"

export default function Layout(
  props: LayoutProps<"/challenge/[competitionId]/[courseId]/[playerId]">,
) {
  return (
    <AudioProvider>
      {props.children}
      {props.modal}
    </AudioProvider>
  )
}
