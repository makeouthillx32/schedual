// app/auth/session.ts
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export const getServerSession = () => {
  return createServerComponentClient({ cookies });
};
