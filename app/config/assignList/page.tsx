import { SelectAssignList } from "@/app/lib/db/schema"
import { getAssignList } from "@/app/lib/db/queries/queries"
import { View } from "@/app/config/assignList/view"

export const revalidate = 0

export default async function AssignList() {
  const assignList: SelectAssignList[] = await getAssignList()

  return <View assignList={assignList} />
}
