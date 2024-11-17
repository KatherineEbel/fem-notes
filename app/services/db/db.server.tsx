import { relations, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import {
  sqliteTable as table,
  AnySQLiteColumn,
  primaryKey,
} from 'drizzle-orm/sqlite-core'
import * as t from 'drizzle-orm/sqlite-core'

const createdAt = t
  .text('created_at')
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`)
const updatedAt = t.text('updated_at').$onUpdate(() => sql`CURRENT_TIMESTAMP`)

const timestamps = {
  createdAt,
  updatedAt,
}

export const users = table('users', {
  id: t.int('id').primaryKey({ autoIncrement: true }),
  email: t.text('email').notNull().unique(),
  passwordHash: t.text('password_hash'),
  ...timestamps,
})

export const notes = table(
  'notes',
  {
    id: t.int('id').primaryKey({ autoIncrement: true }),
    userId: t.int('user_id').references((): AnySQLiteColumn => users.id),
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

export const tags = table('tags', {
  id: t.int('id').primaryKey({ autoIncrement: true }),
  name: t.text('name').unique().notNull(),
  ...timestamps,
})

export const noteTags = table(
  'note_tags',
  {
    noteId: t.int('note_id').references(() => notes.id),
    tagId: t.int('tag_id').references(() => tags.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.noteId, table.tagId] }),
    }
  },
)

export const usersRelation = relations(users, ({ many }) => ({
  notes: many(notes),
}))

export const notesRelation = relations(notes, ({ one, many }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
  tags: many(tags),
}))

export const notesToTagsRelations = relations(noteTags, ({ one }) => ({
  note: one(notes, {
    fields: [noteTags.noteId],
    references: [notes.id],
  }),
  tag: one(tags, {
    fields: [noteTags.tagId],
    references: [tags.id],
  }),
}))

export type SelectUser = typeof users.$inferSelect
export type InsertUser = typeof users.$inferInsert

export type SelectNote = typeof notes.$inferSelect
export type InsertNote = typeof notes.$inferInsert

export type InsertTag = typeof tags.$inferInsert
export type SelectTag = typeof tags.$inferSelect

export type Database = ReturnType<typeof database>
export const database = (d1: D1Database) => {
  return drizzle(d1, {
    casing: 'snake_case',
    schema: {
      users,
      usersRelation,
      notes,
      notesRelation,
      tags,
      noteTags,
      notesToTagsRelations,
    },
  })
}
