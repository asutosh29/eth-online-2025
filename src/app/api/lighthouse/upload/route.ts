import { NextResponse } from 'next/server';
import lighthouse from '@lighthouse-web3/sdk';

export async function POST(request: Request) {
  try {
    const { data } = await request.json();

    if (!data) {
      return NextResponse.json(
        { error: "No data provided for upload." },
        { status: 400 }
      );
    }

    const lighthouseApiKey = process.env.LIGHTHOUSE_API_KEY;

    if (!lighthouseApiKey) {
      return NextResponse.json(
        { error: "Lighthouse API key not configured." },
        { status: 500 }
      );
    }

    console.log("Uploading to Lighthouse...");

    const uploadResponse = await lighthouse.uploadText(
      data,
      lighthouseApiKey,
      "inheritance-switch-data"
    );

    const cid = uploadResponse.data.Hash;

    console.log("Upload successful! CID:", cid);

    return NextResponse.json({ cid: cid }, { status: 200 });

  } catch (error) {
    console.error("Error uploading to Lighthouse:", error);
    return NextResponse.json(
      { error: "Upload failed." },
      { status: 500 }
    );
  }
}
