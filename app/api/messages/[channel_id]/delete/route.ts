// app/api/messages/[channel_id]/delete/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { channel_id: string } }
) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  try {
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const channelId = params.channel_id;
    
    if (!channelId) {
      return NextResponse.json(
        { error: "Channel ID is required" },
        { status: 400 }
      );
    }
    
    console.log("Deleting conversation:", {
      channelId,
      userId: user.id
    });
    
    // Call the PostgreSQL function to delete the conversation
    const { data, error } = await supabase.rpc("delete_conversation", {
      p_channel_id: channelId,
      p_user_id: user.id
    });

    if (error) {
      console.error("Failed to delete conversation:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Check if the function returned success
    if (!data.success) {
      console.error("Function returned error:", data.error);
      return NextResponse.json({ error: data.error }, { status: 403 });
    }

    console.log("Conversation deleted successfully:", data);
    
    // Optional: Clean up storage files if we have attachment URLs
    if (data.message_ids && data.message_ids.length > 0) {
      try {
        // Get all attachment file URLs for cleanup
        const { data: attachments } = await supabase
          .from('message_attachments')
          .select('file_url')
          .in('message_id', data.message_ids);
        
        // Extract file paths from URLs and delete from storage
        if (attachments && attachments.length > 0) {
          const filePaths = attachments.map(att => {
            // Extract path from URL like: /storage/v1/object/public/attachments/filename.jpg
            const url = new URL(att.file_url);
            return url.pathname.replace('/storage/v1/object/public/attachments/', '');
          });
          
          if (filePaths.length > 0) {
            const { error: storageError } = await supabase.storage
              .from('attachments')
              .remove(filePaths);
            
            if (storageError) {
              console.error('Failed to delete some storage files:', storageError);
              // Don't fail the request, just log the warning
            } else {
              console.log(`Deleted ${filePaths.length} files from storage`);
            }
          }
        }
      } catch (storageErr) {
        console.error('Error during storage cleanup:', storageErr);
        // Don't fail the request, storage cleanup is optional
      }
    }
    
    return NextResponse.json({
      success: true,
      message: data.message,
      channelId: data.channel_id,
      channelName: data.channel_name
    });
    
  } catch (error: any) {
    console.error("Unexpected error in delete conversation route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}