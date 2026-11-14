import {hostedProxy} from '@/lib/hosted-proxy';
import { NextRequest } from 'next/server';
import { runtime } from '@/lib/runtime';
import { localRequest, failure } from '@/lib/http';

export async function GET(req: NextRequest) {
  try {
    const remote = await hostedProxy(req);
    if (remote) return remote;
    localRequest(req);
    const id = req.nextUrl.searchParams.get('id') ?? '';
    const engagement = req.nextUrl.searchParams.get('engagement');
    const artifact = runtime().store.getArtifact(id);
    if (!artifact || artifact.state !== 'delivered' || artifact.engagementId !== engagement) {
      throw new Error('Artifact is not delivered to this engagement');
    }
    const json = req.nextUrl.searchParams.get('format') === 'json';
    return new Response(json ? JSON.stringify(artifact.workflow, null, 2) : artifact.bundle, {
      headers: {
        'Content-Type': json ? 'application/json; charset=utf-8' : 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${artifact.engagementId}-${json ? 'approval-workflow.json' : 'approval-app.html'}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return failure(error);
  }
}
