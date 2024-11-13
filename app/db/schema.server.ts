import { sql } from 'drizzle-orm'
import {
  sqliteTable as table,
  AnySQLiteColumn,
  primaryKey,
} from 'drizzle-orm/sqlite-core'
import * as t from 'drizzle-orm/sqlite-core'

const timestamps = {
  createdAt: t
    .text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: t.text('updated_at').$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}

export const user = table('users', {
  id: t.int('id').primaryKey({ autoIncrement: true }),
  email: t.text('email').notNull().unique(),
  passwordHash: t.text('password_hash').notNull(),
  ...timestamps,
})

export const note = table(
  'notes',
  {
    id: t.int('id').primaryKey({ autoIncrement: true }),
    userId: t.int('user_id').references((): AnySQLiteColumn => user.id),
    title: t.text('title').notNull(),
    content: t.text('content').notNull(),
    archived: t.int('archived', { mode: 'boolean' }).default(false).notNull(),
    ...timestamps,
  },
  (table) => {
    return {
      titleIndex: t.index('title_index').on(table.title),
      userIdIndex: t.index('user_id_index').on(table.userId),
    }
  },
)

export const tag = table('tags', {
  id: t.int('id').primaryKey({ autoIncrement: true }),
  name: t.text('name').unique().notNull(),
  ...timestamps,
})

export const noteTag = table(
  'note_tags',
  {
    noteId: t.int('note_id').references(() => note.id),
    tagId: t.int('tag_id').references(() => tag.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.noteId, table.tagId] }),
    }
  },
)
