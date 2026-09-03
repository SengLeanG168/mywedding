import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; guestId: string }> }
) {
  const { slug, guestId } = await params;
  const host = request.headers.get('host') || 'localhost:3000';
  const webcalUrl = `webcal://${host}/api/invite/${slug}/guest/${guestId}/calendar.ics`;

  return NextResponse.redirect(webcalUrl, 307);
}
