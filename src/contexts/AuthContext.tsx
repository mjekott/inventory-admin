"use client";

import { User } from '@/features/auth/types';
import ApiInstance from '@/lib/httpclient';
import { deleteTokenPair } from '@/lib/session';
import { ApiResponse } from '@/types/api';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext } from 'react';

interface AuthContextType {
  user: User | null;
  hasPermission: () => boolean;
  logout:()=>void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export function AuthProvider({ children }: { children: ReactNode }) {
 
  const router = useRouter()
  const query = useQuery({
    queryKey:["session"],
    queryFn:()=>ApiInstance.ApiPrivateApiInstance.get<ApiResponse<User>>("/auth/profile")
  })



  const logout = ()=>{
    deleteTokenPair()

    router.push("/")
  }



  const hasPermission = (): boolean => {
    return true
  };

  if(query.isLoading){
    return <div className="h-screen w-full flex justify-center items-center">
            <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </span>
    </div>
  }


  const user = query.data?.data.data ?? null

 


  return (
    <AuthContext.Provider
      value={{
        user,
        hasPermission,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
