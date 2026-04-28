import React, { useEffect, useState, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlass,
  X,
  CircleNotch,
  UserPlus,
  UserCircle,
  CheckCircle
} from '@phosphor-icons/react';
import { findAllies, initiateFriendRequest } from '../api';
import { useAuth } from '../context/AuthContext';

function FriendSearchModal({ open, onClose }) {
  const { userId: currentUserId } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const inputRef = useRef(null);

  // Focus on open
  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); }
    else { setQuery(''); setResults([]); setSuccessMsg(null); }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || !currentUserId) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const users = await findAllies(currentUserId, query);
        setResults(users.slice(0, 8));
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [query, currentUserId]);

  const handleAddAlly = async (receiverId) => {
    if (!currentUserId) return;
    setRequesting(receiverId);
    try {
      await initiateFriendRequest({ sender_id: currentUserId, receiver_id: receiverId });
      setSuccessMsg(`Request sent to user #${receiverId}`);
      // Remove from results or mark as pending
      setResults(results.map(u => u.userId === receiverId ? { ...u, pending: true } : u));
    } catch (err) {
      alert(err.message || "Failed to send request");
    } finally {
      setRequesting(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
          />

          <div className="fixed inset-0 z-[110] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
            <Motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="pointer-events-auto w-full max-w-lg bg-[#0D0D0D] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
                {loading ? <CircleNotch size={20} className="animate-spin text-[#DD0426]" /> : <MagnifyingGlass size={20} className="text-[#AAAAAA]" />}
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Find allies by username..."
                  className="flex-1 bg-transparent border-none outline-none text-[#F5EBE0] font-accent uppercase tracking-widest text-sm"
                />
                <button onClick={onClose} className="text-[#AAAAAA] hover:text-white transition-colors">
                  <X size={20} weight="bold" />
                </button>
              </div>

              <div className="max-h-[50vh] overflow-y-auto p-4 space-y-2">
                {results.length > 0 ? (
                  results.map(user => (
                    <div key={user.userId} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                        {user.profilePicture ? (
                          <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle size={24} className="text-[#333] group-hover:text-[#DD0426] transition-colors" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="font-accent text-[#F5EBE0] uppercase tracking-wider">{user.userName}</p>
                        <p className="text-[10px] font-accent text-[#AAAAAA] opacity-60">ID: SS-USR-{user.userId}</p>
                      </div>
                      {user.pending ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#DD0426]/10 rounded-lg border border-[#DD0426]/20">
                          <CheckCircle size={14} className="text-[#DD0426]" />
                          <span className="text-[10px] font-accent text-[#DD0426] uppercase">Pending</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddAlly(user.userId)}
                          disabled={requesting === user.userId}
                          className="flex items-center gap-2 px-4 py-2 bg-[#DD0426] hover:bg-[#FF052D] disabled:opacity-50 transition-all rounded-xl text-[10px] font-accent text-white uppercase tracking-widest"
                        >
                          {requesting === user.userId ? <CircleNotch size={14} className="animate-spin" /> : <UserPlus size={14} weight="bold" />}
                          Add Ally
                        </button>
                      )}
                    </div>
                  ))
                ) : query && !loading ? (
                  <div className="py-12 text-center opacity-40">
                    <p className="font-hand text-2xl">No allies found with that name...</p>
                  </div>
                ) : (
                  <div className="py-12 text-center opacity-40">
                    <p className="font-hand text-2xl">Enter a name to start searching...</p>
                  </div>
                )}
              </div>

              {successMsg && (
                <div className="p-4 bg-[#DD0426]/10 border-t border-[#DD0426]/20 text-center">
                  <p className="text-[10px] font-accent text-[#DD0426] uppercase tracking-widest">{successMsg}</p>
                </div>
              )}
            </Motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default FriendSearchModal;
