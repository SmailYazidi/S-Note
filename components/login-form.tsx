import { signIn } from "next-auth/react"

export default function LoginForm() {
  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/" })
  }

  return (
    <button onClick={handleGoogleLogin}>Login with Google</button>
  )
}
