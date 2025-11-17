/**
 * Role-Based Access Control (RBAC) Service
 * Provides: User roles, permissions, access control, team management
 */

export type Permission =
  // Incident permissions
  | 'incident:view'
  | 'incident:create'
  | 'incident:edit'
  | 'incident:delete'
  | 'incident:assign'
  | 'incident:resolve'
  | 'incident:escalate'
  // Graph permissions
  | 'graph:view'
  | 'graph:analyze'
  | 'graph:export'
  | 'graph:share'
  // Runbook permissions
  | 'runbook:view'
  | 'runbook:create'
  | 'runbook:edit'
  | 'runbook:delete'
  | 'runbook:execute'
  | 'runbook:approve'
  // Analytics permissions
  | 'analytics:view'
  | 'analytics:export'
  | 'analytics:advanced'
  // Collaboration permissions
  | 'collaboration:comment'
  | 'collaboration:annotate'
  | 'collaboration:resolve'
  | 'collaboration:delete-own'
  | 'collaboration:delete-any'
  // Admin permissions
  | 'admin:users'
  | 'admin:roles'
  | 'admin:teams'
  | 'admin:settings'
  | 'admin:integrations'
  | 'admin:audit-logs'
  // Webhook permissions
  | 'webhook:view'
  | 'webhook:create'
  | 'webhook:edit'
  | 'webhook:delete'
  | 'webhook:test';

export type RoleName = 'super-admin' | 'admin' | 'incident-manager' | 'engineer' | 'viewer' | 'guest';

export interface Role {
  id: string;
  name: RoleName | string;
  displayName: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean; // System roles cannot be deleted
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  roleId: string;
  teamIds: string[];
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  lastLoginAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
  leaderId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessContext {
  userId: string;
  resourceType: 'incident' | 'runbook' | 'webhook' | 'team' | 'user';
  resourceId?: string;
  action: string;
}

export class RBACService {
  private static roles: Map<string, Role> = new Map();
  private static users: Map<string, User> = new Map();
  private static teams: Map<string, Team> = new Map();

  /**
   * Initialize default system roles
   */
  static initialize(): void {
    // Super Admin - Full system access
    this.createRole({
      name: 'super-admin',
      displayName: 'Super Administrator',
      description: 'Full system access with all permissions',
      permissions: [
        'incident:view',
        'incident:create',
        'incident:edit',
        'incident:delete',
        'incident:assign',
        'incident:resolve',
        'incident:escalate',
        'graph:view',
        'graph:analyze',
        'graph:export',
        'graph:share',
        'runbook:view',
        'runbook:create',
        'runbook:edit',
        'runbook:delete',
        'runbook:execute',
        'runbook:approve',
        'analytics:view',
        'analytics:export',
        'analytics:advanced',
        'collaboration:comment',
        'collaboration:annotate',
        'collaboration:resolve',
        'collaboration:delete-own',
        'collaboration:delete-any',
        'admin:users',
        'admin:roles',
        'admin:teams',
        'admin:settings',
        'admin:integrations',
        'admin:audit-logs',
        'webhook:view',
        'webhook:create',
        'webhook:edit',
        'webhook:delete',
        'webhook:test',
      ],
      isSystem: true,
    });

    // Admin - Most permissions except super admin actions
    this.createRole({
      name: 'admin',
      displayName: 'Administrator',
      description: 'Administrative access with user and team management',
      permissions: [
        'incident:view',
        'incident:create',
        'incident:edit',
        'incident:assign',
        'incident:resolve',
        'incident:escalate',
        'graph:view',
        'graph:analyze',
        'graph:export',
        'graph:share',
        'runbook:view',
        'runbook:create',
        'runbook:edit',
        'runbook:execute',
        'runbook:approve',
        'analytics:view',
        'analytics:export',
        'analytics:advanced',
        'collaboration:comment',
        'collaboration:annotate',
        'collaboration:resolve',
        'collaboration:delete-own',
        'collaboration:delete-any',
        'admin:users',
        'admin:teams',
        'admin:integrations',
        'webhook:view',
        'webhook:create',
        'webhook:edit',
        'webhook:test',
      ],
      isSystem: true,
    });

    // Incident Manager - Manages incidents and runbooks
    this.createRole({
      name: 'incident-manager',
      displayName: 'Incident Manager',
      description: 'Manages incidents, runbooks, and team coordination',
      permissions: [
        'incident:view',
        'incident:create',
        'incident:edit',
        'incident:assign',
        'incident:resolve',
        'incident:escalate',
        'graph:view',
        'graph:analyze',
        'graph:export',
        'graph:share',
        'runbook:view',
        'runbook:create',
        'runbook:edit',
        'runbook:execute',
        'analytics:view',
        'analytics:export',
        'collaboration:comment',
        'collaboration:annotate',
        'collaboration:resolve',
        'collaboration:delete-own',
        'webhook:view',
        'webhook:test',
      ],
      isSystem: true,
    });

    // Engineer - Day-to-day incident response
    this.createRole({
      name: 'engineer',
      displayName: 'Engineer',
      description: 'Engineers can view, analyze, and comment on incidents',
      permissions: [
        'incident:view',
        'incident:create',
        'incident:edit',
        'graph:view',
        'graph:analyze',
        'graph:export',
        'runbook:view',
        'runbook:execute',
        'analytics:view',
        'collaboration:comment',
        'collaboration:annotate',
        'collaboration:delete-own',
      ],
      isSystem: true,
    });

    // Viewer - Read-only access
    this.createRole({
      name: 'viewer',
      displayName: 'Viewer',
      description: 'Read-only access to incidents and analytics',
      permissions: [
        'incident:view',
        'graph:view',
        'runbook:view',
        'analytics:view',
        'collaboration:comment',
      ],
      isSystem: true,
    });

    // Guest - Minimal access
    this.createRole({
      name: 'guest',
      displayName: 'Guest',
      description: 'Limited guest access for external stakeholders',
      permissions: ['incident:view', 'graph:view'],
      isSystem: true,
    });

    console.log('[RBAC] Initialized with 6 system roles');
  }

  /**
   * Create a new role
   */
  static createRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Role {
    const id = `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newRole: Role = {
      ...role,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.roles.set(id, newRole);
    console.log(`[RBAC] Created role: ${newRole.displayName} (${id})`);
    return newRole;
  }

  /**
   * Update an existing role
   */
  static updateRole(id: string, updates: Partial<Omit<Role, 'id' | 'isSystem' | 'createdAt'>>): Role | null {
    const role = this.roles.get(id);
    if (!role) {
      return null;
    }

    if (role.isSystem) {
      console.warn(`[RBAC] Cannot modify system role: ${role.name}`);
      return null;
    }

    const updatedRole: Role = {
      ...role,
      ...updates,
      updatedAt: new Date(),
    };
    this.roles.set(id, updatedRole);
    console.log(`[RBAC] Updated role: ${id}`);
    return updatedRole;
  }

  /**
   * Delete a role
   */
  static deleteRole(id: string): boolean {
    const role = this.roles.get(id);
    if (!role) {
      return false;
    }

    if (role.isSystem) {
      console.warn(`[RBAC] Cannot delete system role: ${role.name}`);
      return false;
    }

    // Check if any users have this role
    const usersWithRole = Array.from(this.users.values()).filter(u => u.roleId === id);
    if (usersWithRole.length > 0) {
      console.warn(`[RBAC] Cannot delete role ${id}: ${usersWithRole.length} users assigned`);
      return false;
    }

    this.roles.delete(id);
    console.log(`[RBAC] Deleted role: ${id}`);
    return true;
  }

  /**
   * Get all roles
   */
  static getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  /**
   * Get role by ID
   */
  static getRole(id: string): Role | undefined {
    return this.roles.get(id);
  }

  /**
   * Get role by name
   */
  static getRoleByName(name: string): Role | undefined {
    return Array.from(this.roles.values()).find(r => r.name === name);
  }

  /**
   * Create a new user
   */
  static createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, newUser);
    console.log(`[RBAC] Created user: ${newUser.email} (${id})`);
    return newUser;
  }

  /**
   * Update a user
   */
  static updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
    const user = this.users.get(id);
    if (!user) {
      return null;
    }

    const updatedUser: User = {
      ...user,
      ...updates,
    };
    this.users.set(id, updatedUser);
    console.log(`[RBAC] Updated user: ${id}`);
    return updatedUser;
  }

  /**
   * Delete a user
   */
  static deleteUser(id: string): boolean {
    const result = this.users.delete(id);
    if (result) {
      // Remove user from all teams
      this.teams.forEach(team => {
        team.memberIds = team.memberIds.filter(memberId => memberId !== id);
        if (team.leaderId === id) {
          team.leaderId = undefined;
        }
      });
      console.log(`[RBAC] Deleted user: ${id}`);
    }
    return result;
  }

  /**
   * Get all users
   */
  static getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  /**
   * Get user by ID
   */
  static getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  /**
   * Get user by email
   */
  static getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  /**
   * Check if a user has a specific permission
   */
  static hasPermission(userId: string, permission: Permission): boolean {
    const user = this.users.get(userId);
    if (!user || user.status !== 'active') {
      return false;
    }

    const role = this.roles.get(user.roleId);
    if (!role) {
      return false;
    }

    return role.permissions.includes(permission);
  }

  /**
   * Check if a user has any of the specified permissions
   */
  static hasAnyPermission(userId: string, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(userId, permission));
  }

  /**
   * Check if a user has all of the specified permissions
   */
  static hasAllPermissions(userId: string, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(userId, permission));
  }

  /**
   * Get all permissions for a user
   */
  static getUserPermissions(userId: string): Permission[] {
    const user = this.users.get(userId);
    if (!user || user.status !== 'active') {
      return [];
    }

    const role = this.roles.get(user.roleId);
    if (!role) {
      return [];
    }

    return [...role.permissions];
  }

  /**
   * Create a new team
   */
  static createTeam(team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Team {
    const id = `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTeam: Team = {
      ...team,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.teams.set(id, newTeam);
    console.log(`[RBAC] Created team: ${newTeam.name} (${id})`);
    return newTeam;
  }

  /**
   * Update a team
   */
  static updateTeam(id: string, updates: Partial<Omit<Team, 'id' | 'createdAt'>>): Team | null {
    const team = this.teams.get(id);
    if (!team) {
      return null;
    }

    const updatedTeam: Team = {
      ...team,
      ...updates,
      updatedAt: new Date(),
    };
    this.teams.set(id, updatedTeam);
    console.log(`[RBAC] Updated team: ${id}`);
    return updatedTeam;
  }

  /**
   * Delete a team
   */
  static deleteTeam(id: string): boolean {
    const result = this.teams.delete(id);
    if (result) {
      // Remove team from all users
      this.users.forEach(user => {
        user.teamIds = user.teamIds.filter(teamId => teamId !== id);
      });
      console.log(`[RBAC] Deleted team: ${id}`);
    }
    return result;
  }

  /**
   * Get all teams
   */
  static getAllTeams(): Team[] {
    return Array.from(this.teams.values());
  }

  /**
   * Get team by ID
   */
  static getTeam(id: string): Team | undefined {
    return this.teams.get(id);
  }

  /**
   * Get teams for a user
   */
  static getUserTeams(userId: string): Team[] {
    const user = this.users.get(userId);
    if (!user) {
      return [];
    }

    return user.teamIds.map(teamId => this.teams.get(teamId)).filter((team): team is Team => team !== undefined);
  }

  /**
   * Add user to team
   */
  static addUserToTeam(userId: string, teamId: string): boolean {
    const user = this.users.get(userId);
    const team = this.teams.get(teamId);

    if (!user || !team) {
      return false;
    }

    if (!user.teamIds.includes(teamId)) {
      user.teamIds.push(teamId);
    }

    if (!team.memberIds.includes(userId)) {
      team.memberIds.push(userId);
      team.updatedAt = new Date();
    }

    console.log(`[RBAC] Added user ${userId} to team ${teamId}`);
    return true;
  }

  /**
   * Remove user from team
   */
  static removeUserFromTeam(userId: string, teamId: string): boolean {
    const user = this.users.get(userId);
    const team = this.teams.get(teamId);

    if (!user || !team) {
      return false;
    }

    user.teamIds = user.teamIds.filter(id => id !== teamId);
    team.memberIds = team.memberIds.filter(id => id !== userId);
    team.updatedAt = new Date();

    if (team.leaderId === userId) {
      team.leaderId = undefined;
    }

    console.log(`[RBAC] Removed user ${userId} from team ${teamId}`);
    return true;
  }

  /**
   * Set team leader
   */
  static setTeamLeader(teamId: string, userId: string): boolean {
    const team = this.teams.get(teamId);
    const user = this.users.get(userId);

    if (!team || !user) {
      return false;
    }

    if (!team.memberIds.includes(userId)) {
      this.addUserToTeam(userId, teamId);
    }

    team.leaderId = userId;
    team.updatedAt = new Date();

    console.log(`[RBAC] Set user ${userId} as leader of team ${teamId}`);
    return true;
  }

  /**
   * Check if user is team leader
   */
  static isTeamLeader(userId: string, teamId: string): boolean {
    const team = this.teams.get(teamId);
    return team?.leaderId === userId;
  }

  /**
   * Get team members
   */
  static getTeamMembers(teamId: string): User[] {
    const team = this.teams.get(teamId);
    if (!team) {
      return [];
    }

    return team.memberIds.map(memberId => this.users.get(memberId)).filter((user): user is User => user !== undefined);
  }

  /**
   * Check resource-level access (for future fine-grained control)
   */
  static canAccess(context: AccessContext): boolean {
    const user = this.users.get(context.userId);
    if (!user || user.status !== 'active') {
      return false;
    }

    // For now, just check permission
    // In future, can add resource ownership, team membership, etc.
    const permission = `${context.resourceType}:${context.action}` as Permission;
    return this.hasPermission(context.userId, permission);
  }
}

// Initialize default roles
RBACService.initialize();

// Create demo users for testing
if (typeof window !== 'undefined') {
  const superAdminRole = RBACService.getRoleByName('super-admin');
  const engineerRole = RBACService.getRoleByName('engineer');
  const viewerRole = RBACService.getRoleByName('viewer');

  if (superAdminRole && engineerRole && viewerRole) {
    const admin = RBACService.createUser({
      email: 'admin@example.com',
      name: 'Alice Admin',
      roleId: superAdminRole.id,
      teamIds: [],
      status: 'active',
    });

    const engineer1 = RBACService.createUser({
      email: 'bob@example.com',
      name: 'Bob Engineer',
      roleId: engineerRole.id,
      teamIds: [],
      status: 'active',
    });

    const engineer2 = RBACService.createUser({
      email: 'charlie@example.com',
      name: 'Charlie Engineer',
      roleId: engineerRole.id,
      teamIds: [],
      status: 'active',
    });

    const viewer = RBACService.createUser({
      email: 'viewer@example.com',
      name: 'David Viewer',
      roleId: viewerRole.id,
      teamIds: [],
      status: 'active',
    });

    // Create demo teams
    const opsTeam = RBACService.createTeam({
      name: 'Operations',
      description: 'Site Reliability Engineering team',
      memberIds: [],
      tags: ['ops', 'sre'],
    });

    const devTeam = RBACService.createTeam({
      name: 'Development',
      description: 'Product development team',
      memberIds: [],
      tags: ['dev', 'engineering'],
    });

    // Add users to teams
    RBACService.addUserToTeam(engineer1.id, opsTeam.id);
    RBACService.addUserToTeam(engineer2.id, opsTeam.id);
    RBACService.setTeamLeader(opsTeam.id, engineer1.id);

    RBACService.addUserToTeam(admin.id, devTeam.id);
    RBACService.setTeamLeader(devTeam.id, admin.id);

    console.log('[RBAC] Created demo users and teams');
  }
}
