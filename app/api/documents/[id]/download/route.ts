// app/api/documents/[id]/download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get document information
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select(`
        id,
        name,
        type,
        mime_type,
        size_bytes,
        storage_path,
        bucket_name,
        uploaded_by
      `)
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Don't allow downloading folders
    if (document.type === "folder") {
      return NextResponse.json({ error: "Cannot download folders" }, { status: 400 });
    }

    // Check if file exists in storage
    if (!document.storage_path) {
      return NextResponse.json({ error: "File not found in storage" }, { status: 404 });
    }

    // Get the file from Supabase Storage
    const { data: fileData, error: storageError } = await supabase.storage
      .from(document.bucket_name || "documents")
      .download(document.storage_path);

    if (storageError || !fileData) {
      console.error("Storage download error:", storageError);
      return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
    }

    // Log download activity
    await supabase
      .from("document_activity")
      .insert([{
        document_id: id,
        user_id: user.id,
        activity_type: "downloaded",
        ip_address: req.headers.get("x-forwarded-for")?.split(',')[0] || 
                   req.headers.get("x-real-ip") || null,
        user_agent: req.headers.get("user-agent") || ""
      }]);

    // Convert Blob to ArrayBuffer
    const arrayBuffer = await fileData.arrayBuffer();

    // Set appropriate headers
    const headers = new Headers();
    headers.set("Content-Type", document.mime_type || "application/octet-stream");
    headers.set("Content-Length", document.size_bytes?.toString() || "0");
    headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(document.name)}"`);
    headers.set("Cache-Control", "private, max-age=0");

    console.log(`📥 Downloaded file: ${document.name} (${document.size_bytes} bytes)`);
    
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error("Download API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}