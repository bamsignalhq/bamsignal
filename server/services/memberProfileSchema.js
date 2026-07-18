import { assertSchemaTable } from "./schemaVerification.js";

export async function ensureMemberProfilesTable() {
  return assertSchemaTable("app_member_profiles");
}
