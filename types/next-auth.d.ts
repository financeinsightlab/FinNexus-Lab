import type { DefaultSession } from 'next-auth';
import 'next-auth';
import type { SubscriptionStatus, UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      role: UserRole;
      subscriptionStatus: SubscriptionStatus;
      // Stripe plan name isn't attached to the session in this repo.
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: UserRole;
    subscriptionStatus?: SubscriptionStatus;
  }
}

