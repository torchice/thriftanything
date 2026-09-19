import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const client = createClient(supabaseUrl, serviceRoleKey);

async function uploadPhotos() {
  const bucket = 'book-photos';
  const photosDir = path.join(__dirname, '../public/books');
  
  try {
    // Create bucket if doesn't exist (will fail silently if exists)
    await client.storage.createBucket(bucket, { public: true }).catch(() => {});
    
    const files = fs.readdirSync(photosDir).filter(f => f.endsWith('.webp'));
    console.log(`Uploading ${files.length} photos...`);
    
    for (const file of files) {
      const filePath = path.join(photosDir, file);
      const data = fs.readFileSync(filePath);
      
      const { error } = await client.storage
        .from(bucket)
        .upload(file, data, { upsert: true });
      
      if (error) {
        console.error(`✗ ${file}: ${error.message}`);
      } else {
        const size = (data.length / 1024).toFixed(1);
        console.log(`✓ ${file} (${size} KB)`);
      }
    }
    
    console.log('\n✓ All photos uploaded.');
  } catch (err) {
    console.error('Upload error:', err.message);
    process.exit(1);
  }
}

uploadPhotos();
