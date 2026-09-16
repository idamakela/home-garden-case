import { Kysely } from 'kysely';
import { Database } from '../types';

async function up(db: Kysely<Database>) {
  await db.schema.alterTable('garden').addColumn('minHumidity', 'real').execute();
  await db.schema.alterTable('garden').addColumn('maxHumidity', 'real').execute();
}

async function down(db: Kysely<Database>) {
  await db.schema.alterTable('garden').dropColumn('minHumidity').execute();
  await db.schema.alterTable('garden').dropColumn('maxHumidity').execute();
}

export const migration002 = {
  up,
  down,
};
