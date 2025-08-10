import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // These are read on the server, not sent to the client
    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminUsername || !adminPassword) {
      console.error("Admin credentials are not set in environment variables.")
      return NextResponse.json({ success: false, error: "Server configuration error." }, { status: 500 })
    }

    if (username === adminUsername && password === adminPassword) {
      // The server confirms the credentials are correct
      return NextResponse.json({ success: true })
    } else {
      // The server reports a failure without revealing why
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 })
  }
}
