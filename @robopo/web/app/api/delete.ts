import {
  deleteCourseById,
  deletePlayerById,
  deleteUmpireById,
} from "@/app/lib/db/queries/queries"

export async function deleteById(req: Request, mode: string) {
  const { id } = await req.json()

  try {
    if (Array.isArray(id)) {
      await Promise.all(
        id.map(async (cid) => {
          await deleteMode(mode, cid)
        }),
      )
    } else {
      await deleteMode(mode, id)
    }
    return Response.json(
      { success: true, message: `${mode} deleted successfully.` },
      { status: 200 },
    )
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: `An error occurred while deleting the ${mode}.`,
        error,
      },
      { status: 500 },
    )
  }

  async function deleteMode(mode: string, id: number) {
    switch (mode) {
      case "player":
        await deletePlayerById(id)
        break
      case "umpire":
        await deleteUmpireById(id)
        break
      case "course":
        await deleteCourseById(id)
        break
      default:
        throw new Error(`Invalid mode: ${mode}`)
    }
  }
}
