export default function Layout(props: LayoutProps<"/player">) {
  return (
    <>
      {props.children}
      {props.modal}
    </>
  )
}
