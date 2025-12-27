/**
 * Multi-Tenancy Service
 * Provides: Tenant isolation, resource quotas, billing, tenant management
 */

import { logger } from '../utils/logger';

export interface TenantPlan {
  id: string;
  name: 'free' | 'starter' | 'professional' | 'enterprise';
  displayName: string;
  limits: {
    maxUsers: number;
    maxTeams: number;
    maxIncidents: number; // per month
    maxRunbooks: number;
    maxWebhooks: number;
    maxStorageGB: number;
    maxAPICallsPerDay: number;
    dataRetentionDays: number;
    auditLogRetentionDays: number;
  };
  features: {
    collaboration: boolean;
    aiInsights: boolean;
    automation: boolean;
    analytics: boolean;
    customReports: boolean;
    ssoSaml: boolean;
    advancedRBAC: boolean;
    prioritySupport: boolean;
    sla: boolean;
    customIntegrations: boolean;
  };
  pricing: {
    basePrice: number; // per month
    perUserPrice: number;
    currency: string;
  };
}

export interface Tenant {
  id: string;
  name: string;
  slug: string; // URL-friendly identifier (e.g., 'acme-corp')
  displayName: string;
  domain?: string; // Custom domain (e.g., 'acme.adapt-rca.com')
  planId: string;
  status: 'active' | 'suspended' | 'trial' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  trialEndsAt?: Date;
  subscriptionEndsAt?: Date;

  // Contact information
  owner: {
    name: string;
    email: string;
    phone?: string;
  };

  // Billing
  billing: {
    companyName: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      zip: string;
    };
    vatNumber?: string;
  };

  // Settings
  settings: {
    timezone: string;
    dateFormat: string;
    currency: string;
    language: string;
    logo?: string;
    primaryColor?: string;
    enableWhiteLabel: boolean;
  };

  // Usage tracking
  usage: {
    users: number;
    teams: number;
    incidents: number;
    runbooks: number;
    webhooks: number;
    storageGB: number;
    apiCalls: number;
    lastResetAt: Date;
  };

  metadata?: Record<string, unknown>;
}

export interface TenantInvitation {
  id: string;
  tenantId: string;
  email: string;
  roleId: string;
  invitedBy: string;
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
  token: string;
}

export class TenantService {
  private static tenants: Map<string, Tenant> = new Map();
  private static invitations: Map<string, TenantInvitation> = new Map();
  private static plans: Map<string, TenantPlan> = new Map();

  /**
   * Initialize default plans
   */
  static initialize(): void {
    // Free Plan
    this.plans.set('free', {
      id: 'free',
      name: 'free',
      displayName: 'Free',
      limits: {
        maxUsers: 3,
        maxTeams: 1,
        maxIncidents: 50,
        maxRunbooks: 5,
        maxWebhooks: 2,
        maxStorageGB: 1,
        maxAPICallsPerDay: 1000,
        dataRetentionDays: 30,
        auditLogRetentionDays: 7,
      },
      features: {
        collaboration: true,
        aiInsights: false,
        automation: false,
        analytics: true,
        customReports: false,
        ssoSaml: false,
        advancedRBAC: false,
        prioritySupport: false,
        sla: false,
        customIntegrations: false,
      },
      pricing: {
        basePrice: 0,
        perUserPrice: 0,
        currency: 'USD',
      },
    });

    // Starter Plan
    this.plans.set('starter', {
      id: 'starter',
      name: 'starter',
      displayName: 'Starter',
      limits: {
        maxUsers: 10,
        maxTeams: 3,
        maxIncidents: 500,
        maxRunbooks: 20,
        maxWebhooks: 10,
        maxStorageGB: 10,
        maxAPICallsPerDay: 10000,
        dataRetentionDays: 90,
        auditLogRetentionDays: 30,
      },
      features: {
        collaboration: true,
        aiInsights: true,
        automation: true,
        analytics: true,
        customReports: false,
        ssoSaml: false,
        advancedRBAC: false,
        prioritySupport: false,
        sla: false,
        customIntegrations: false,
      },
      pricing: {
        basePrice: 99,
        perUserPrice: 10,
        currency: 'USD',
      },
    });

    // Professional Plan
    this.plans.set('professional', {
      id: 'professional',
      name: 'professional',
      displayName: 'Professional',
      limits: {
        maxUsers: 50,
        maxTeams: 10,
        maxIncidents: 5000,
        maxRunbooks: 100,
        maxWebhooks: 50,
        maxStorageGB: 100,
        maxAPICallsPerDay: 100000,
        dataRetentionDays: 365,
        auditLogRetentionDays: 90,
      },
      features: {
        collaboration: true,
        aiInsights: true,
        automation: true,
        analytics: true,
        customReports: true,
        ssoSaml: true,
        advancedRBAC: true,
        prioritySupport: true,
        sla: false,
        customIntegrations: true,
      },
      pricing: {
        basePrice: 499,
        perUserPrice: 25,
        currency: 'USD',
      },
    });

    // Enterprise Plan
    this.plans.set('enterprise', {
      id: 'enterprise',
      name: 'enterprise',
      displayName: 'Enterprise',
      limits: {
        maxUsers: -1, // Unlimited
        maxTeams: -1,
        maxIncidents: -1,
        maxRunbooks: -1,
        maxWebhooks: -1,
        maxStorageGB: -1,
        maxAPICallsPerDay: -1,
        dataRetentionDays: -1,
        auditLogRetentionDays: -1,
      },
      features: {
        collaboration: true,
        aiInsights: true,
        automation: true,
        analytics: true,
        customReports: true,
        ssoSaml: true,
        advancedRBAC: true,
        prioritySupport: true,
        sla: true,
        customIntegrations: true,
      },
      pricing: {
        basePrice: 1999,
        perUserPrice: 50,
        currency: 'USD',
      },
    });

    logger.info('Tenant service initialized', {
      component: 'TenantService',
      action: 'init',
      planCount: 4
    });
  }

  /**
   * Create a new tenant
   */
  static createTenant(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt' | 'usage'>): Tenant {
    const id = `tenant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Validate plan exists
    const plan = this.plans.get(tenant.planId);
    if (!plan) {
      throw new Error(`Plan ${tenant.planId} not found`);
    }

    const newTenant: Tenant = {
      ...tenant,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      usage: {
        users: 0,
        teams: 0,
        incidents: 0,
        runbooks: 0,
        webhooks: 0,
        storageGB: 0,
        apiCalls: 0,
        lastResetAt: new Date(),
      },
    };

    this.tenants.set(id, newTenant);
    logger.info('Tenant created', {
      component: 'TenantService',
      action: 'createTenant',
      tenantId: id,
      tenantName: newTenant.name,
      planId: plan.id
    });
    return newTenant;
  }

  /**
   * Update tenant
   */
  static updateTenant(id: string, updates: Partial<Omit<Tenant, 'id' | 'createdAt' | 'usage'>>): Tenant | null {
    const tenant = this.tenants.get(id);
    if (!tenant) {
      return null;
    }

    const updatedTenant: Tenant = {
      ...tenant,
      ...updates,
      updatedAt: new Date(),
    };

    this.tenants.set(id, updatedTenant);
    logger.info('Tenant updated', {
      component: 'TenantService',
      action: 'updateTenant',
      tenantId: id
    });
    return updatedTenant;
  }

  /**
   * Delete tenant
   */
  static deleteTenant(id: string): boolean {
    const result = this.tenants.delete(id);
    if (result) {
      logger.info('Tenant deleted', {
        component: 'TenantService',
        action: 'deleteTenant',
        tenantId: id
      });
    }
    return result;
  }

  /**
   * Get tenant by ID
   */
  static getTenant(id: string): Tenant | undefined {
    return this.tenants.get(id);
  }

  /**
   * Get tenant by slug
   */
  static getTenantBySlug(slug: string): Tenant | undefined {
    return Array.from(this.tenants.values()).find(t => t.slug === slug);
  }

  /**
   * Get all tenants
   */
  static getAllTenants(): Tenant[] {
    return Array.from(this.tenants.values());
  }

  /**
   * Get plan by ID
   */
  static getPlan(id: string): TenantPlan | undefined {
    return this.plans.get(id);
  }

  /**
   * Get all plans
   */
  static getAllPlans(): TenantPlan[] {
    return Array.from(this.plans.values());
  }

  /**
   * Check if tenant has reached limit
   */
  static checkLimit(tenantId: string, limitType: keyof TenantPlan['limits']): {
    allowed: boolean;
    current: number;
    limit: number;
    percentage: number;
  } {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return { allowed: false, current: 0, limit: 0, percentage: 0 };
    }

    const plan = this.plans.get(tenant.planId);
    if (!plan) {
      return { allowed: false, current: 0, limit: 0, percentage: 0 };
    }

    const limit = plan.limits[limitType];
    const usageKey = limitType.replace('max', '').replace(/([A-Z])/g, (m) => m.toLowerCase());
    const current = tenant.usage[usageKey as keyof Tenant['usage']] as number || 0;

    // -1 means unlimited
    if (limit === -1) {
      return { allowed: true, current, limit, percentage: 0 };
    }

    const allowed = current < limit;
    const percentage = (current / limit) * 100;

    return { allowed, current, limit, percentage };
  }

  /**
   * Check if tenant has feature enabled
   */
  static hasFeature(tenantId: string, feature: keyof TenantPlan['features']): boolean {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return false;
    }

    const plan = this.plans.get(tenant.planId);
    if (!plan) {
      return false;
    }

    return plan.features[feature];
  }

  /**
   * Increment usage counter
   */
  static incrementUsage(tenantId: string, metric: keyof Tenant['usage'], amount: number = 1): void {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return;
    }

    tenant.usage[metric] = (tenant.usage[metric] as number) + amount;
    logger.info('Tenant usage incremented', {
      component: 'TenantService',
      action: 'incrementUsage',
      tenantId,
      metric,
      newValue: tenant.usage[metric]
    });
  }

  /**
   * Reset monthly usage counters
   */
  static resetMonthlyUsage(tenantId: string): void {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return;
    }

    tenant.usage.incidents = 0;
    tenant.usage.apiCalls = 0;
    tenant.usage.lastResetAt = new Date();

    logger.info('Tenant monthly usage reset', {
      component: 'TenantService',
      action: 'resetMonthlyUsage',
      tenantId
    });
  }

  /**
   * Create tenant invitation
   */
  static createInvitation(
    tenantId: string,
    email: string,
    roleId: string,
    invitedBy: string
  ): TenantInvitation {
    const id = `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const token = `${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invitation: TenantInvitation = {
      id,
      tenantId,
      email,
      roleId,
      invitedBy,
      createdAt: new Date(),
      expiresAt,
      token,
    };

    this.invitations.set(id, invitation);
    logger.info('Tenant invitation created', {
      component: 'TenantService',
      action: 'createInvitation',
      tenantId,
      email
    });

    // In production, send email with invitation link
    this.sendInvitationEmail(invitation);

    return invitation;
  }

  /**
   * Accept invitation
   */
  static acceptInvitation(token: string): TenantInvitation | null {
    const invitation = Array.from(this.invitations.values()).find(i => i.token === token);

    if (!invitation) {
      return null;
    }

    if (invitation.acceptedAt) {
      logger.warn('Invitation already accepted', {
        component: 'TenantService',
        action: 'acceptInvitation',
        invitationId: invitation.id
      });
      return null;
    }

    if (new Date() > invitation.expiresAt) {
      logger.warn('Invitation expired', {
        component: 'TenantService',
        action: 'acceptInvitation',
        invitationId: invitation.id
      });
      return null;
    }

    invitation.acceptedAt = new Date();
    logger.info('Invitation accepted', {
      component: 'TenantService',
      action: 'acceptInvitation',
      invitationId: invitation.id,
      tenantId: invitation.tenantId
    });

    return invitation;
  }

  /**
   * Get tenant invitations
   */
  static getTenantInvitations(tenantId: string): TenantInvitation[] {
    return Array.from(this.invitations.values()).filter(i => i.tenantId === tenantId);
  }

  /**
   * Calculate monthly bill
   */
  static calculateBill(tenantId: string): {
    basePrice: number;
    userPrice: number;
    totalUsers: number;
    overageCharges: number;
    total: number;
    currency: string;
    breakdown: { item: string; amount: number }[];
  } {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const plan = this.plans.get(tenant.planId);
    if (!plan) {
      throw new Error(`Plan ${tenant.planId} not found`);
    }

    const breakdown: { item: string; amount: number }[] = [];

    // Base price
    const basePrice = plan.pricing.basePrice;
    breakdown.push({ item: 'Base subscription', amount: basePrice });

    // User charges
    const totalUsers = tenant.usage.users;
    const userPrice = totalUsers * plan.pricing.perUserPrice;
    breakdown.push({ item: `${totalUsers} users × $${plan.pricing.perUserPrice}`, amount: userPrice });

    // Overage charges (if any)
    let overageCharges = 0;

    // Storage overage
    if (plan.limits.maxStorageGB > 0 && tenant.usage.storageGB > plan.limits.maxStorageGB) {
      const overageGB = tenant.usage.storageGB - plan.limits.maxStorageGB;
      const storageOverage = overageGB * 0.10; // $0.10 per GB
      overageCharges += storageOverage;
      breakdown.push({ item: `${overageGB}GB storage overage × $0.10`, amount: storageOverage });
    }

    // API call overage
    if (plan.limits.maxAPICallsPerDay > 0 && tenant.usage.apiCalls > plan.limits.maxAPICallsPerDay * 30) {
      const overageCalls = tenant.usage.apiCalls - (plan.limits.maxAPICallsPerDay * 30);
      const apiOverage = (overageCalls / 1000) * 0.01; // $0.01 per 1000 calls
      overageCharges += apiOverage;
      breakdown.push({ item: `${overageCalls.toLocaleString()} API call overage × $0.01/1k`, amount: apiOverage });
    }

    const total = basePrice + userPrice + overageCharges;

    return {
      basePrice,
      userPrice,
      totalUsers,
      overageCharges,
      total,
      currency: plan.pricing.currency,
      breakdown,
    };
  }

  /**
   * Get tenant usage report
   */
  static getUsageReport(tenantId: string): {
    tenant: Tenant;
    plan: TenantPlan;
    limits: {
      metric: string;
      current: number;
      limit: number;
      percentage: number;
      status: 'ok' | 'warning' | 'critical';
    }[];
  } {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const plan = this.plans.get(tenant.planId);
    if (!plan) {
      throw new Error(`Plan ${tenant.planId} not found`);
    }

    const limits = [
      { key: 'maxUsers', usage: 'users' },
      { key: 'maxTeams', usage: 'teams' },
      { key: 'maxIncidents', usage: 'incidents' },
      { key: 'maxRunbooks', usage: 'runbooks' },
      { key: 'maxWebhooks', usage: 'webhooks' },
      { key: 'maxStorageGB', usage: 'storageGB' },
    ].map(({ key, usage }) => {
      const limit = plan.limits[key as keyof TenantPlan['limits']];
      const current = tenant.usage[usage as keyof Tenant['usage']] as number;
      const percentage = limit === -1 ? 0 : (current / limit) * 100;

      let status: 'ok' | 'warning' | 'critical' = 'ok';
      if (percentage >= 90) status = 'critical';
      else if (percentage >= 75) status = 'warning';

      return {
        metric: key.replace('max', ''),
        current,
        limit,
        percentage,
        status,
      };
    });

    return { tenant, plan, limits };
  }

  private static sendInvitationEmail(invitation: TenantInvitation): void {
    // In production, integrate with email service
    logger.info('Sending invitation email', {
      component: 'TenantService',
      action: 'sendInvitationEmail',
      email: invitation.email,
      invitationLink: `/accept-invite?token=${invitation.token}`
    });
  }
}

// Initialize default plans
TenantService.initialize();

// Create demo tenant
if (typeof window !== 'undefined') {
  const demoTenant = TenantService.createTenant({
    name: 'Acme Corporation',
    slug: 'acme-corp',
    displayName: 'Acme Corp',
    planId: 'professional',
    status: 'active',
    owner: {
      name: 'John Doe',
      email: 'john@acme.com',
    },
    billing: {
      companyName: 'Acme Corporation Inc.',
      address: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zip: '94105',
      },
    },
    settings: {
      timezone: 'America/Los_Angeles',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      language: 'en',
      enableWhiteLabel: false,
    },
  });

  // Simulate some usage
  TenantService.incrementUsage(demoTenant.id, 'users', 15);
  TenantService.incrementUsage(demoTenant.id, 'teams', 3);
  TenantService.incrementUsage(demoTenant.id, 'incidents', 247);
  TenantService.incrementUsage(demoTenant.id, 'runbooks', 12);
  TenantService.incrementUsage(demoTenant.id, 'webhooks', 8);
  TenantService.incrementUsage(demoTenant.id, 'storageGB', 35);
  TenantService.incrementUsage(demoTenant.id, 'apiCalls', 45000);

  logger.info('Demo tenant created', {
    component: 'TenantService',
    action: 'createDemoTenant',
    tenantName: 'Acme Corporation'
  });
}
