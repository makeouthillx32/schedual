// types/monitors.ts
// Hall Monitor types for role-based access control and conditional rendering

// Base user interface that works with your existing schema
export interface MonitorUser {
  id: string;
  email?: string;
  role: string; // ✅ RESOLVED: The actual role NAME (admin, jobcoach, client, user) not the role ID
  specializations?: UserSpecialization[];
}

// User specialization from your existing tables
export interface UserSpecialization {
  id: string;
  name: string;
  description?: string;
  role_id: string; // References roles.id
  role_name: string; // The actual role name from roles.role
  assigned_at: string;
  assigned_by?: string;
}

// Access check result
export interface AccessResult {
  hasAccess: boolean;
  reason?: string;
  context?: Record<string, any>;
}

// Content configuration for conditional rendering
export interface ContentConfig {
  // Dashboard layout type
  dashboardLayout: 'admin-content' | 'admin-users' | 'admin-system' | 
                   'jobcoach-counselor' | 'jobcoach-trainer' | 'jobcoach-specialist' |
                   'client-seeker' | 'client-builder' | 'client-changer' |
                   'user-basic';
  
  // Available features/actions
  availableFeatures: string[];
  primaryActions: string[];
  secondaryActions: string[];
  
  // Navigation items
  navigationItems: NavigationItem[];
  
  // UI customization
  hiddenSections: string[];
  customFields: Record<string, any>;
  
  // Component visibility
  visibleComponents: string[];
  
  // Permissions list
  permissions: string[];
}

// Navigation item for role-based menus
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  children?: NavigationItem[];
  requiresAccess?: {
    resource: string;
    action: string;
  };
}

// Hall monitor interface that each role monitor implements
export interface HallMonitor {
  role: string;
  
  // Core access control
  checkAccess(
    userId: string, 
    resource: string, 
    action: string, 
    context?: Record<string, any>
  ): Promise<AccessResult>;
  
  // Get user's full content configuration
  getContentConfig(userId: string): Promise<ContentConfig>;
  
  // Get user's specializations for this role
  getSpecializations(userId: string): Promise<UserSpecialization[]>;
  
  // Check if user has specific specialization
  hasSpecialization(userId: string, specializationName: string): Promise<boolean>;
  
  // Get permissions list
  getPermissions(userId: string): Promise<string[]>;
  
  // Feature availability checks
  canAccessFeature(userId: string, feature: string): Promise<boolean>;
  
  // Navigation generation
  getNavigationItems(userId: string): Promise<NavigationItem[]>;
}

// Resource and action constants for consistency
export const RESOURCES = {
  // Admin resources
  USERS: 'users',
  CONTENT: 'content',
  SYSTEM: 'system',
  SPECIALIZATIONS: 'specializations',
  ANALYTICS: 'analytics',
  
  // Job coach resources
  CLIENTS: 'clients',
  SESSIONS: 'sessions',
  TRAINING: 'training',
  
  // Client resources
  PROFILE: 'profile',
  APPLICATIONS: 'applications',
  RESOURCES: 'resources',
  COURSES: 'courses',
  
  // General resources
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications',
  DASHBOARD: 'dashboard'
} as const;

export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  ASSIGN: 'assign',
  APPROVE: 'approve',
  PUBLISH: 'publish',
  SCHEDULE: 'schedule',
  BOOK: 'book',
  ENROLL: 'enroll',
  MANAGE: 'manage'
} as const;

// Specialization-based features for each role
export const ADMIN_SPECIALIZATIONS = {
  CONTENT_MANAGER: 'Content Manager',
  USER_MANAGER: 'User Manager',
  SYSTEM_ADMIN: 'System Admin'
} as const;

export const JOBCOACH_SPECIALIZATIONS = {
  CAREER_COUNSELOR: 'Career Counselor',
  SKILLS_TRAINER: 'Skills Trainer',
  EMPLOYMENT_SPECIALIST: 'Employment Specialist'
} as const;

export const CLIENT_SPECIALIZATIONS = {
  JOB_SEEKER: 'Job Seeker',
  SKILL_BUILDER: 'Skill Builder',
  CAREER_CHANGER: 'Career Changer'
} as const;

// Role constants that match your database
export const ROLES = {
  ADMIN: 'admin',
  JOBCOACH: 'jobcoach',
  CLIENT: 'client',
  USER: 'user'
} as const;

// Features available to different specializations
export const FEATURES = {
  // Admin features
  USER_MANAGEMENT: 'user-management',
  CONTENT_EDITOR: 'content-editor',
  SYSTEM_SETTINGS: 'system-settings',
  ROLE_ASSIGNMENT: 'role-assignment',
  ANALYTICS_DASHBOARD: 'analytics-dashboard',
  
  // Job coach features
  CLIENT_PROFILES: 'client-profiles',
  SESSION_SCHEDULER: 'session-scheduler',
  TRAINING_CONTENT: 'training-content',
  PROGRESS_TRACKING: 'progress-tracking',
  
  // Client features
  PROFILE_EDITOR: 'profile-editor',
  JOB_APPLICATIONS: 'job-applications',
  SKILL_ASSESSMENTS: 'skill-assessments',
  COURSE_CATALOG: 'course-catalog',
  SESSION_BOOKING: 'session-booking',
  
  // Universal features
  MESSAGING: 'messaging',
  NOTIFICATIONS: 'notifications',
  PROFILE_VIEW: 'profile-view'
} as const;

// Context types for access checking
export interface AccessContext {
  targetUserId?: string;
  resourceId?: string;
  organizationId?: string;
  clientId?: string;
  sessionId?: string;
  contentId?: string;
  metadata?: Record<string, any>;
}

// Error types for hall monitor operations
export class HallMonitorError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'HallMonitorError';
  }
}

// Factory options for creating monitors
export interface HallMonitorFactoryOptions {
  supabaseClient?: any;
  cacheEnabled?: boolean;
  cacheTTL?: number;
  debug?: boolean;
}

// Hook return types
export interface UseHallMonitorResult {
  monitor: HallMonitor | null;
  user: MonitorUser | null;
  contentConfig: ContentConfig | null;
  isLoading: boolean;
  error: string | null;
  
  // Convenience methods
  canAccess: (resource: string, action: string, context?: AccessContext) => Promise<boolean>;
  hasFeature: (feature: string) => boolean;
  hasSpecialization: (specialization: string) => boolean;
  refreshConfig: () => Promise<void>;
}

// Component protection props
export interface ProtectionRule {
  roles?: string[];
  specializations?: string[];
  features?: string[];
  permissions?: string[];
  requireAll?: boolean;
  customCheck?: (user: MonitorUser) => boolean | Promise<boolean>;
}

// Export type helpers
export type ResourceType = typeof RESOURCES[keyof typeof RESOURCES];
export type ActionType = typeof ACTIONS[keyof typeof ACTIONS];
export type RoleType = typeof ROLES[keyof typeof ROLES];
export type FeatureType = typeof FEATURES[keyof typeof FEATURES];
export type AdminSpecializationType = typeof ADMIN_SPECIALIZATIONS[keyof typeof ADMIN_SPECIALIZATIONS];
export type JobCoachSpecializationType = typeof JOBCOACH_SPECIALIZATIONS[keyof typeof JOBCOACH_SPECIALIZATIONS];
export type ClientSpecializationType = typeof CLIENT_SPECIALIZATIONS[keyof typeof CLIENT_SPECIALIZATIONS];