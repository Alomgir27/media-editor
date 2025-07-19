import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Read the JSON file from the public directory
    const filePath = path.join(process.cwd(), 'public', 'api', 'voice-clone', `${params.id}.json`)
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Voice clone data not found' },
        { status: 404 }
      )
    }

    const data = fs.readFileSync(filePath, 'utf-8')
    const jsonData = JSON.parse(data)

    return NextResponse.json(jsonData)
  } catch (error) {
    console.error('Error reading voice clone data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 