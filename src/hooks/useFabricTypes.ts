import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export const useFabricTypes = () => {
  const [fabricTypes, setFabricTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFabricTypes = useCallback(async () => {
    if (!user) {
      setFabricTypes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fabric_types')
        .select('name')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      setFabricTypes(data.map((item) => item.name));
    } catch (error: unknown) {
      toast({
        title: 'Error fetching fabric types',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchFabricTypes();
  }, [fetchFabricTypes]);

  const addFabricType = async (name: string) => {
    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to add a fabric type.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('fabric_types')
        .insert([{ name, user_id: user.id }])
        .select();

      if (error) {
        throw error;
      }

      if (data) {
        await fetchFabricTypes(); // Refetch to update the list
      }
    } catch (error: unknown) {
      toast({
        title: 'Error adding fabric type',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  return { fabricTypes, loading, addFabricType, refetch: fetchFabricTypes };
};
