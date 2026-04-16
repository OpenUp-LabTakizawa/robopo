import { AdminView } from "@/components/admin/view"
import { getAdminList } from "@/server/db"

export default async function Admin() {
  const initialAdminList = await getAdminList()

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden px-4 py-6 sm:px-10 lg:px-16">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl text-base-content tracking-tight">
            管理者一覧
          </h1>
          <p className="mt-1 text-base-content/60 text-sm">
            管理者の登録・編集・削除を行います
          </p>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-base-300 bg-base-100 shadow-sm">
        <AdminView initialAdminList={initialAdminList} />
      </div>
    </div>
  )
}
