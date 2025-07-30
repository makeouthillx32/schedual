// app/api/documents/make-public/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { folderId, publicSlug } = await request.json();

    if (!folderId || !publicSlug) {
      return NextResponse.json(
        { error: 'Folder ID and public slug are required' },
        { status: 400 }
      );
    }

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if slug already exists
    const { data: existingFolder, error: slugCheckError } = await supabase
      .from('documents')
      .select('id')
      .eq('public_slug', publicSlug)
      .eq('type', 'folder')
      .neq('id', folderId)
      .single();

    if (slugCheckError && slugCheckError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is what we want
      return NextResponse.json(
        { error: 'Database error checking slug uniqueness' },
        { status: 500 }
      );
    }

    if (existingFolder) {
      return NextResponse.json(
        { error: 'Public slug already exists. Please choose a different one.' },
        { status: 409 }
      );
    }

    // Get the folder to verify ownership
    const { data: folder, error: folderError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', folderId)
      .eq('type', 'folder')
      .single();

    if (folderError || !folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    // Update folder to make it public
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        is_public_folder: true,
        public_slug: publicSlug,
        updated_at: new Date().toISOString()
      })
      .eq('id', folderId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update folder' },
        { status: 500 }
      );
    }

    // Get all files in this folder path and make them public
    const { data: folderFiles, error: filesError } = await supabase
      .from('documents')
      .select('id')
      .eq('type', 'file')
      .like('path', `${folder.path}%`)
      .ilike('mime_type', 'image/%'); // Only make images public

    if (filesError) {
      console.error('Error getting folder files:', filesError);
      // Don't fail the request, just log the error
    } else if (folderFiles && folderFiles.length > 0) {
      // Update all images in folder to be public
      const { error: updateFilesError } = await supabase
        .from('documents')
        .update({
          is_public: true,
          updated_at: new Date().toISOString()
        })
        .in('id', folderFiles.map(f => f.id));

      if (updateFilesError) {
        console.error('Error updating folder files:', updateFilesError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Folder made public successfully',
      publicSlug,
      publicUrl: `${request.nextUrl.origin}/api/public/assets/${publicSlug}/`
    });

  } catch (error) {
    console.error('Make folder public error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}