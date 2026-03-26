import { NextResponse } from 'next/server'

export function successResponse<T>(data: T, source: string, headers?: Record<string, string>) {
  const response = NextResponse.json({
    data,
    source,
    lastUpdated: new Date().toISOString(),
  })

  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      response.headers.set(key, value)
    }
  }

  return response
}

export function errorResponse(message: string, code: string, status = 500, details?: unknown) {
  return NextResponse.json(
    { error: message, code, details },
    { status }
  )
}

export function cacheHeaders(maxAge: number, staleWhileRevalidate: number) {
  return {
    'Cache-Control': `s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
  }
}
