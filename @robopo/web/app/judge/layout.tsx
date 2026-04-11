export default function Layout(props: LayoutProps<"/judge">) {
  return (
    <>
      {props.children}
      {props.modal}
    </>
  )
}
