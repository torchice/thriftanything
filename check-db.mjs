import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', url);
console.log('Key exists:', !!key);

const client = createClient(url, key);

async function check() {
  const { data, error, count } = await client
    .from('books')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Count:', count);
    console.log('Rows:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('First book:', data[0].title);
    }
  }
}

check();
