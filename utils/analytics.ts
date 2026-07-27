export async function getNonBotUserIds(supabase: any): Promise<string[]> {
  const { data, error } = await supabase
    .from('analytics_users')
    .select('id')
    .eq('is_bot', false);
  if (error) {
    console.error('Failed to fetch user ids', error);
    return [];
  }
  return data?.map((u: { id: string }) => u.id) || [];
}
