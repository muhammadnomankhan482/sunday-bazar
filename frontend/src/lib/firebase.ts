/**
 * firebase.ts — STUB FILE
 * Firebase ab is project mein use nahi ho raha.
 * Authentication aur data storage ab JWT-based backend se ho raha hai.
 * Yeh file sirf compatibility ke liye rakhi gayi hai.
 */

// No-op stubs — koi bhi import kare toh error na aaye
export const auth = {
  onAuthStateChanged: (_cb: any) => () => {},
  currentUser: null,
};

export const db = {};

export const isFirebaseConfigured = (): boolean => false;

export async function saveUserProfileToFirestore(_user: any): Promise<void> {
  // No-op — Firebase removed
}

export async function saveProductToFirestore(_product: any): Promise<void> {
  // No-op — Firebase removed
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: object;
}

export function handleFirestoreError(_error: unknown, _operationType: OperationType, _path: string | null): void {
  // No-op
}
