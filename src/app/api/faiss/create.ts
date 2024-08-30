//C:\AI_src\Companion_UI\SaaS-AI-Companion\src\app\api\faiss\create.ts

import { NextRequest, NextResponse } from 'next/server';
import { createFaissIndex } from '../../../lib/faissservice';

export async function POST(req: NextRequest) {
  try {
    const { texts, metadata } = await req.json();
    await createFaissIndex(texts, metadata);
    return NextResponse.json({ message: 'Index created successfully' });
  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: 'Failed to create index', details: errorMessage }, { status: 500 });
  }
}
