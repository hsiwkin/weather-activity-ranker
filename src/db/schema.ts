import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const cityLocations = sqliteTable('city_locations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
});

export type CityLocation = typeof cityLocations.$inferSelect;
export type NewCityLocation = typeof cityLocations.$inferInsert;
