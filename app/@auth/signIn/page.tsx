"use client"

import { useActionState, useEffect } from "react"
import { ModalBackdrop, ModalBackButton } from "@/app/components/common/commonModal"
import { signInAction } from "@/app/components/server/auth"

export default function SignIn() {
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams()
    const callbackUrl = params.get("callbackUrl") || "/"
    const [state, action] = useActionState(signInAction, undefined)

    useEffect(() => {
        if (state?.success) {
            window.location.replace(callbackUrl)
        }
    }, [state?.success])

    return (
        <dialog id="signIn-modal" className="modal modal-open">
            <div className="modal-box">
                <form
                    action={action}>
                    <label className="flex" htmlFor="name">
                        <span className="label-text">ユーザー名</span>
                        <input
                            type="text"
                            name="username"
                            placeholder="ユーザー名"
                            className="input input-bordered w-full max-w-xs"
                            required
                        />
                    </label>
                    <br />
                    <label className="flex" htmlFor="password">
                        <span className="label-text">パスワード</span>
                        <input
                            type="password"
                            name="password"
                            placeholder="パスワード"
                            className="input input-bordered w-full max-w-xs"
                            required
                        />
                    </label>
                    <div className="flex flex-row">
                        <input className="flex btn btn-accent m-3 items-justify-center" type="submit" value={"サインイン"} />
                        <ModalBackButton />
                        <div className="flex m-3 text-red-500">{state?.message}</div>
                    </div>
                </form>
            </div>
            <ModalBackdrop />
        </dialog>
    )
}