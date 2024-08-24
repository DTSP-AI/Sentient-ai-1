//C:\AI_src\Companion_UI\SaaS-AI-Companion\src\app\api\faiss\search.ts

import { NextRequest, NextResponse } from 'next/server';
import { searchFaissIndex } from '../../../lib/faissservice';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') as string;
    const k = parseInt(searchParams.get('k') as string, 10);

    const result = await searchFaissIndex(query, k);
    return NextResponse.json(result);
  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: 'Failed to search index', details: errorMessage }, { status: 500 });
  }
}
