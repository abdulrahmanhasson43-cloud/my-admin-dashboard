/**
 * Profile fixtures.
 *
 * The canonical default values now live in the domain layer
 * (`@/types/profile`) so that the UI never has to reach into services/mock.
 * They are re-exported here purely for backward compatibility with the
 * MockProfileRepository seed arguments.
 */
export {
  defaultUserProfile,
  defaultStoreBranding,
  defaultSubscription,
} from '@/types/profile';
