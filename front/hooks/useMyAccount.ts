import { useCallback, useEffect, useState } from "react";
import { getMyAccount } from "../services/account.service";
import type { Account } from "../types/account.types";

export function useMyAccount() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setAccount(await getMyAccount());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar tu cuenta");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { account, setAccount, loading, error, refetch };
}
