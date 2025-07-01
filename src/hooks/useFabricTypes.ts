import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export const useFabricTypes = () => {
  const [fabricTypes, setFabricTypes] = useState<{ id: string; name: string }[]>([]);
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
        .select('id, name')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      setFabricTypes(data || []);
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

  const updateFabricType = async (id: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('fabric_types')
        .update({ name: newName })
        .eq('id', id);

      if (error) {
        throw error;
      }

      await fetchFabricTypes();
    } catch (error: unknown) {
      toast({
        title: 'Error updating fabric type',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const deleteFabricType = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fabric_types')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setFabricTypes((prev) => prev.filter((ft) => ft.id !== id));
    } catch (error: unknown) {
      toast({
        title: 'Error deleting fabric type',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  return { fabricTypes, loading, addFabricType, updateFabricType, deleteFabricType, refetch: fetchFabricTypes };
};
