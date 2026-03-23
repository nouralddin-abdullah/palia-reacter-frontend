import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { useAuth } from './AuthContext';

const VoteContext = createContext(null);

export function VoteProvider({ children }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({ total_purchased: 0, total_gifted: 0, total_sent: 0, total_refunded: 0 });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [voteData, userOrders] = await Promise.all([
        api.getVoteBalance(),
        api.getOrders(),
      ]);
      setBalance(voteData.balance);
      setStats(voteData.stats || { total_purchased: 0, total_gifted: 0, total_sent: 0, total_refunded: 0 });
      setOrders(userOrders);
    } catch (err) {
      console.error('Failed to load vote data', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const createOrder = async (packageId) => {
    const res = await api.createOrder(packageId);
    await refreshData();
    return res;
  };

  const send = async (targetName, amount, reactionType) => {
    const res = await api.sendVotes(targetName, amount, reactionType);
    await refreshData();
    return res;
  };

  const redeem = async (code) => {
    const res = await api.redeemCode(code);
    await refreshData();
    return res;
  };

  return (
    <VoteContext.Provider value={{ balance, stats, orders, loading, createOrder, send, redeem, refreshData }}>
      {children}
    </VoteContext.Provider>
  );
}

export function useVotes() {
  const ctx = useContext(VoteContext);
  if (!ctx) throw new Error('useVotes must be used within VoteProvider');
  return ctx;
}
