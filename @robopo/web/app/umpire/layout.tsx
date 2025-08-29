export default function Layout(props: LayoutProps<"/umpire">) {
  return (
    <>
      {props.children}
      {props.modal}
    </>
  )
}
