// src/components/LoginGuard.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authModel from '@/resources/models/Auth/AuthModel';

export default function LoginGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const {login,user } = authModel();

  useEffect(() => {
    if (!login?.login && user?.role?.title!=='admin') {
      router.push('/auth/auth2/login');
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthorized(true);
    }
  }, [login, user, router]);

  return authorized ? children : null;
}