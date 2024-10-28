// Path: src/app/api/webhook/route.ts
export const dynamic = 'force-dynamic';

export async function POST() {
  return new Response(null, { status: 410 }); // Gone
}
