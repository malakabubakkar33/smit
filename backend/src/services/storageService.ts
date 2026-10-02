import fs from 'fs';
import path from 'path';
import { getSupabase } from '../config/supabase.js';
import { ENV } from '../config/env.js';

export class StorageService {
  /**
   * Upload file to Supabase Storage or fallback to local uploads server
   */
  public static async uploadFile(
    bucket: 'avatars' | 'course-thumbnails' | 'course-videos',
    localFilePath: string,
    destinationPath: string,
    mimeType: string
  ): Promise<{ url: string; storagePath: string }> {
    const supabase = getSupabase();

    if (supabase) {
      try {
        const fileBuffer = fs.readFileSync(localFilePath);
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(destinationPath, fileBuffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (error) {
          console.warn(`[StorageService] Supabase upload failed for ${destinationPath}:`, error.message);
          // Fall back to local path
        } else if (data) {
          const { data: publicUrlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(destinationPath);

          return {
            url: publicUrlData.publicUrl,
            storagePath: `${bucket}/${destinationPath}`,
          };
        }
      } catch (err) {
        console.error('[StorageService] Error during Supabase upload:', err);
      }
    }

    // Local fallback URL served via Express static
    const fileName = path.basename(localFilePath);
    let sub = 'thumbnails';
    if (bucket === 'course-videos') sub = 'videos';
    if (bucket === 'avatars') sub = 'avatars';

    const localUrl = `http://localhost:${ENV.PORT}/uploads/${sub}/${fileName}`;
    return {
      url: localUrl,
      storagePath: `local/${bucket}/${fileName}`,
    };
  }
}
