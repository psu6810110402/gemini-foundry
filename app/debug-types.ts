import { Database } from '../types/supabase';

type DB = Database['public']['Tables'];
type ChatSessionTable = DB['chat_sessions'];
type InsertType = ChatSessionTable['Insert']; // Should be object
type RowType = ChatSessionTable['Row']; // Should be object

// Test assignment
const testInsert: InsertType = {
  user_id: '123',
  title: 'test',
  mode: 'investor'
};

// Check keys
type TableKeys = keyof DB;
const keyCheck: TableKeys = 'chat_sessions'; // Should work

// Check client usage
import { supabase } from '../lib/supabase';

async function testClient() {
  const result = await supabase.from('chat_sessions').insert(testInsert).select().single();
  const data = result.data; // Should be ChatSession row
}
