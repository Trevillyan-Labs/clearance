export type Engagement = 'beacon' | 'crest';
export type Clearance = 0 | 1 | 2 | 3;
export const CLASS_NAMES = ['Public', 'Internal', 'Confidential', 'Restricted'] as const;
export interface BrainDocument {
  id: string; engagementId: Engagement; title: string; classification: Clearance;
  contentVersion: string; policyVersion: number; body: string; bodyHash?: string; path?: string;
}
export interface Run {
  id: string; engagementId: Engagement; clearance: Clearance;
  status: 'active' | 'completed' | 'retired' | 'interrupted'; createdAt: string;
}
export interface ObservedInput {
  id: string; runId: string; docId: string; engagementId: Engagement;
  contentVersion: string; policyVersion: number; classAtRead: Clearance; admittedAt: string;
}
export interface Grant {
  id: string; runId: string; docId: string; engagementId: Engagement;
  contentVersion: string; policyVersion: number;
  status: 'pending' | 'approved' | 'consumed' | 'expired' | 'denied';
  expiresAt: string; createdAt: string; consumedAt?: string;
}
export interface Workflow {
  title: string; currency: 'USD'; thresholdCents: number;
  belowApprovers: string[]; atOrAboveApprovers: string[];
}
export interface CheckResult { name: string; passed: boolean; expected?: string[]; actual?: string[] }
export interface Artifact {
  id: string; runId: string; engagementId: Engagement; inheritedClass: Clearance;
  workflow: Workflow; checks: CheckResult[]; bundle: string;
  state: 'ready' | 'failed' | 'delivered'; createdAt: string; deliveredAt?: string;
}
export interface StoreEvent {
  id: string; type: string; runId?: string; docId?: string; artifactId?: string;
  message?: string; timestamp: string;
}
export interface StoreState {
  docs: BrainDocument[]; runs: Run[]; grants: Grant[]; artifacts: Artifact[];
  inputs: ObservedInput[]; events: StoreEvent[];
}
