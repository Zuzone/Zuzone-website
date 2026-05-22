import { ReactNode } from 'react';

interface PortoProviderProps {
  children: ReactNode;
}

export const PortoProvider = ({ children }: PortoProviderProps) => {
  return <>{children}</>;
};
