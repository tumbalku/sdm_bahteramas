-- RBAC single-role normalization.
-- User.role is the only source of truth; UserRole was only needed for multi-role.
DROP TABLE IF EXISTS "UserRole";

CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");
