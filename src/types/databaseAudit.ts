import type { DatabaseDomainId, DatabaseHealthStatusId } from "../constants/databaseAudit";

export type DatabaseTableRecord = {
  id: string;
  tableName: string;
  migrationRef: string;
  domainIds: DatabaseDomainId[];
  inRequiredSchema: boolean;
  health: DatabaseHealthStatusId;
  indexes: string[];
  constraints: string[];
  note: string | null;
};

export type LocalStorageDependency = {
  id: string;
  storageKey: string;
  domainId: DatabaseDomainId;
  engine: string;
  health: DatabaseHealthStatusId;
  expectedTable: string | null;
  note: string | null;
};

export type MigrationGap = {
  id: string;
  domainId: DatabaseDomainId;
  title: string;
  summary: string;
  status: DatabaseHealthStatusId;
  localStorageKeys: string[];
  expectedTables: string[];
};

export type DatabaseRecommendation = {
  id: string;
  title: string;
  summary: string;
  priority: "high" | "medium" | "low";
  domainId: DatabaseDomainId | null;
};

export type DatabaseHealthMetric = {
  status: DatabaseHealthStatusId;
  count: number;
};

export type DatabaseAuditReport = {
  generatedAt: string;
  tables: DatabaseTableRecord[];
  dependencies: LocalStorageDependency[];
  migrationGaps: MigrationGap[];
  recommendations: DatabaseRecommendation[];
  duplicateTables: DatabaseTableRecord[];
  unusedTables: DatabaseTableRecord[];
  missingTables: DatabaseTableRecord[];
  metrics: DatabaseHealthMetric[];
  totalTables: number;
};
