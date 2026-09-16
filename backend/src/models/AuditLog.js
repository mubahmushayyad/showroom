const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Section 9/24 of the guide: AuditLog { userId, action, entity, entityId,
// metadata, createdAt }. `user` additionally stores a display-name
// snapshot (performedBy) so the Audit Log page can render a name even
// for actors who aren't a User row (e.g. "System").
const AuditLog = sequelize.define(
  'AuditLog',
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    userId: { type: DataTypes.STRING, allowNull: true },
    user: { type: DataTypes.STRING, allowNull: true },
    action: { type: DataTypes.STRING, allowNull: false },
    entity: { type: DataTypes.STRING, allowNull: false },
    entityId: { type: DataTypes.STRING, allowNull: true },
    details: { type: DataTypes.STRING, allowNull: true },
    metadata: { type: DataTypes.JSONB, allowNull: true },
  },
  { tableName: 'audit_logs', updatedAt: false }
);

module.exports = AuditLog;
