import { GET as exportHandler } from '@/app/api/admin/events/[eventId]/guests/gifts/export/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return exportHandler(request, { params: Promise.resolve({ eventId: id }) });
}
