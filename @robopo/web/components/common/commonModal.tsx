"use client"

import { useRouter } from "next/navigation"
import { BackButton } from "@/components/parts/buttons"

export function ModalBackdrop() {
  const router = useRouter()
  return (
    <form
      method="dialog"
      className="modal-backdrop"
      onClick={() => router.back()}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          router.back()
        }
      }}
    >
      <button type="button" className="cursor-default">
        close
      </button>
    </form>
  )
}

export function ModalBackButton() {
  const router = useRouter()
  return <BackButton onClick={() => router.back()} fullWidth />
}
