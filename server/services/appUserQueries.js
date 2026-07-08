import { isDatabaseReady, query } from "../databaseConnection.js";
import { assertSchemaTable } from "./schemaVerification.js";

export async function ensureAppUsersTable() {
  return assertSchemaTable("app_users");
}

export async function findAppUserIdentity({ email, phone }) {
  if (!isDatabaseReady()) return null;
  await ensureAppUsersTable();

  const result = await query(
    `select *
     from app_users
     where ($1::text is not null and lower(email) = lower($1::text))
        or ($2::text is not null and phone = $2::text)
     limit 1`,
    [email || null, phone || null]
  );
  return result.rows[0] || null;
}
