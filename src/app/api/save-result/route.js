import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const filePath = path.join(process.cwd(), "data", "results.json")

export async function POST(req) {
  try {
    const body = await req.json()

    // Read existing data
    const fileData = fs.readFileSync(filePath, "utf8")
    const results = JSON.parse(fileData)

    // Add new result
    results.push(body)

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2))

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}