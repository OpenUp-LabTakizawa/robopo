import { signOut } from "@/auth"

export default function SignOut() {
    return (
        <form action={async () => {
            "use server"
            await signOut({ redirect: true, redirectTo: "/" })
        }} className="btn btn-primary p-2 text-xl" >
            <button type="submit">Sign out</button>
        </form>
    )
}