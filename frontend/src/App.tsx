import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from "axios"

const API = "http://localhost:8000"

function Dashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-2xl font-bold">Welcome back!</h1>
      <p className="text-muted-foreground">Logged in as <span className="font-medium text-foreground">{email}</span></p>
      <Button variant="outline" onClick={onLogout}>Logout</Button>
    </div>
  )
}

export function App() {
  const [view, setView] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(() => {
    // persist login across refresh if token exists
    return localStorage.getItem("user_email")
  })

  const reset = (nextView: "login" | "signup") => {
    setEmail("")
    setPassword("")
    setError("")
    setView(nextView)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user_email")
    setLoggedInEmail(null)
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await axios.post(`${API}/signup`, { email, password })
      reset("login")
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await axios.post(`${API}/login`, { email, password })
      localStorage.setItem("token", res.data.access_token)
      localStorage.setItem("user_email", email)
      setLoggedInEmail(email)
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Login failed")
    } finally {
      setLoading(false)
    }
  }

  if (loggedInEmail) {
    return <Dashboard email={loggedInEmail} onLogout={handleLogout} />
  }

  if (view === "signup") {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
          <CardAction>
            <Button variant="link" onClick={() => reset("login")}>Login</Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <CardFooter className="flex-col gap-2 px-0 pt-6">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing up..." : "Sign Up"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Button variant="link" onClick={() => reset("signup")}>Sign Up</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <CardFooter className="flex-col gap-2 px-0 pt-6">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
            <Button variant="outline" className="w-full" type="button">
              Login with Google
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
