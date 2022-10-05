import { pull } from './sync';

export async function syncStories(type: Parameters<typeof pull>[0]): Promise<number[]> {
  return pull(type);
}
