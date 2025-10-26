import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { cid: string } }
) {
  try {
    const { cid } = params;

    if (!cid) {
      return NextResponse.json(
        { error: "No CID provided." },
        { status: 400 }
      );
    }

    const url = `https://gateway.lighthouse.storage/ipfs/${cid}`;

    console.log(`Fetching from Lighthouse gateway: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch from Lighthouse: ${response.statusText}`);
    }

    const data = await response.text();

    return NextResponse.json({ data: data }, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching from Lighthouse:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch file." },
      { status: 500 }
    );
  }
}
