import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 })
    }

    // Use OpenStreetMap Nominatim API server-side to avoid CORS issues
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`, {
      headers: {
        'User-Agent': 'PMU-Pro/1.0 (https://thepmuguide.com)'
      }
    })

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (data && data.length > 0) {
      return NextResponse.json({
        success: true,
        coordinates: {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        },
        address: data[0].display_name
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Address not found'
      })
    }

  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to geocode address',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
