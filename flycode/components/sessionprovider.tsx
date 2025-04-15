// components/SessionContextProvider.tsx
'use client';

import { Session } from '@supabase/supabase-js';
import { createContext, useContext } from 'react';

interface SessionContextProps {
     session: Session | null;
}

const SessionContext = createContext<SessionContextProps>({ session: null });

export const SessionContextProvider = ({
     children,
     session,
}: {
     children: React.ReactNode;
     session: Session | null;
}) => {
     return (
          <SessionContext.Provider value={{ session }}>
               {children}
          </SessionContext.Provider>
     );
};

export const useSession = () => useContext(SessionContext);