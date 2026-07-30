import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../services/api';
import { useAuth } from './AuthContext';

const VoteContext = createContext(null);

export function VoteProvider({ children }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({ total_purchased: 0, total_gifted: 0, total_sent: 0, total_refunded: 0 });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Bulk Queue State
  const [bulkQueue, setBulkQueue] = useState([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkCurrentIndex, setBulkCurrentIndex] = useState(-1);
  const [bulkResults, setBulkResults] = useState({ succeeded: 0, failed: 0 });
  const bulkCancelRef = useRef(false);

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

  const loadBulkQueue = useCallback((jsonArray) => {
    const validTypes = ['whimsical', 'amaze', 'cool', 'cute', 'love'];
    
    const parsed = jsonArray.map(item => {
        if (!item.ign || typeof item.ign !== 'string') throw new Error('Missing or invalid ign in array');
        if (!item.goal || typeof item.goal !== 'number') throw new Error('Missing or invalid goal in array');
        if (!validTypes.includes(item.reaction)) throw new Error(`Invalid reaction type: ${item.reaction}`);
        return {
            ign: item.ign,
            reaction: item.reaction,
            goal: item.goal,
            status: 'pending',
            result: null
        };
    });
    setBulkQueue(parsed);
    setBulkCurrentIndex(-1);
    setBulkResults({ succeeded: 0, failed: 0 });
    setBulkProcessing(false);
    bulkCancelRef.current = false;
  }, []);

  const startBulkQueue = useCallback(async () => {
    if (bulkQueue.length === 0 || bulkProcessing) return;
    
    const totalVotesNeeded = bulkQueue.reduce((sum, item) => sum + (item.goal || 0), 0);
    if (totalVotesNeeded > balance) {
        throw new Error('Insufficient vote balance for bulk queue');
    }

    setBulkProcessing(true);
    bulkCancelRef.current = false;
    
    let currentSucceeded = bulkResults.succeeded || 0;
    let currentFailed = bulkResults.failed || 0;

    const queueToProcess = [...bulkQueue];

    for (let i = 0; i < queueToProcess.length; i++) {
      if (bulkCancelRef.current) {
        break;
      }

      if (queueToProcess[i].status === 'completed' || queueToProcess[i].status === 'failed') {
          continue;
      }

      setBulkCurrentIndex(i);
      
      setBulkQueue(prev => {
        const next = [...prev];
        if (next[i]) next[i].status = 'processing';
        return next;
      });

      const item = queueToProcess[i];
      try {
        const res = await api.sendVotes(item.ign, item.goal, item.reaction);
        currentSucceeded += res.succeeded;
        currentFailed += res.failed;
        
        setBulkQueue(prev => {
          const next = [...prev];
          if (next[i]) {
              next[i].status = 'completed';
              next[i].result = { succeeded: res.succeeded, failed: res.failed };
          }
          return next;
        });
      } catch (err) {
        currentFailed += item.goal;
        setBulkQueue(prev => {
          const next = [...prev];
          if (next[i]) {
              next[i].status = 'failed';
              next[i].result = { error: err.message };
          }
          return next;
        });
      }

      setBulkResults({ succeeded: currentSucceeded, failed: currentFailed });
      await refreshData();
    }
    
    setBulkProcessing(false);
    return true;
  }, [bulkQueue, bulkProcessing, balance, bulkResults, refreshData]);

  const cancelBulkQueue = useCallback(() => {
    bulkCancelRef.current = true;
  }, []);

  const clearBulkQueue = useCallback(() => {
    setBulkQueue([]);
    setBulkProcessing(false);
    setBulkCurrentIndex(-1);
    setBulkResults({ succeeded: 0, failed: 0 });
    bulkCancelRef.current = false;
  }, []);

  return (
    <VoteContext.Provider value={{ 
      balance, stats, orders, loading, 
      createOrder, send, redeem, refreshData,
      bulkQueue, bulkProcessing, bulkCurrentIndex, bulkResults,
      loadBulkQueue, startBulkQueue, cancelBulkQueue, clearBulkQueue
    }}>
      {children}
    </VoteContext.Provider>
  );
}

export function useVotes() {
  const ctx = useContext(VoteContext);
  if (!ctx) throw new Error('useVotes must be used within VoteProvider');
  return ctx;
}
