import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')?.trim() ?? ''

  if (!address) {
    return NextResponse.json(
      { error: 'address required' },
      { status: 400 }
    )
  }

  // TODO: replace with actual logic:
  // - query your backend DB, or
  // - call thirdweb read contract endpoint via server SDK
  const status = Math.random() > 0.5
    ? 'Active: will trigger on condition'
    : 'No switch found'

  const mock = {
    address,
    status,
  }

  return NextResponse.json(mock, { status: 200 })
}
