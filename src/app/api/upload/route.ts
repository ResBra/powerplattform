import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname /*, clientPayload */) => {
        // Hier könntest du prüfen, ob der User eingeloggt ist
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          tokenPayload: JSON.stringify({
            // Zusätzliche Daten, die im Token landen sollen
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Wird aufgerufen, wenn der Upload fertig ist (Server-Side Callback)
        console.log('Blob upload completed', blob, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
