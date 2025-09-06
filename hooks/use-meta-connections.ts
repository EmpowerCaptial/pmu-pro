import { useState, useEffect } from 'react';
import { useDemoAuth } from '@/hooks/use-demo-auth';

interface MetaConnection {
  id: string;
  pageId: string;
  pageName: string;
  hasInstagram: boolean;
  igUsername?: string;
  expiresAt?: string;
  createdAt: string;
}

export function useMetaConnections() {
  const { currentUser, isAuthenticated } = useDemoAuth();
  const [connections, setConnections] = useState<MetaConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConnections = async () => {
    if (!isAuthenticated || !currentUser) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/meta/connections', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
      } else {
        setError('Failed to load Meta connections');
      }
    } catch (error) {
      console.error('Failed to load Meta connections:', error);
      setError('Failed to load Meta connections');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshConnections = () => {
    loadConnections();
  };

  useEffect(() => {
    loadConnections();
  }, [isAuthenticated, currentUser]);

  return {
    connections,
    isLoading,
    error,
    refreshConnections,
    hasConnections: connections.length > 0,
    isConnected: connections.length > 0
  };
}
