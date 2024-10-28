// Path: src/app/api/stripe/route.ts
export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(null, { status: 410 }); // Gone
}