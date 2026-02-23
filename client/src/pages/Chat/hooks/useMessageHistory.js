import { useState, useRef, useEffect } from "react";
import useFetch from "../../../hooks/useFetch";
import useApi from "../../../hooks/useApi";

export const useMessageHistory = (room, user) => {
  const [messages, setMessages] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const { execute: fetchMore } = useApi();

  const { performFetch: fetchMessages } = useFetch(
    `/messages/${room}`,
    (data) => {
      setMessages(data.result);
      setIsLoadingHistory(false);
    },
    (err) => {
      console.error("Failed to load history:", err);
      setIsLoadingHistory(false);
    },
  );

  useEffect(() => {
    if (!room || !user) return;
    setIsLoadingHistory(true);
    fetchMessages();
  }, [room, user]);

  const handleScroll = async () => {
    if (!containerRef.current || isFetchingMore || !hasMore) return;
    if (containerRef.current.scrollTop === 0) {
      setIsFetchingMore(true);
      const oldestMessageTime = messages[0]?.createdAt;
      try {
        const data = await fetchMore(
          `/messages/${room}?before=${oldestMessageTime}`,
          { method: "GET" },
        );
        if (data.result.length === 0) {
          setHasMore(false);
        } else {
          setMessages((prev) => [...data.result, ...prev]);
        }
      } catch (err) {
        console.error("Failed to load more messages:", err);
      } finally {
        setIsFetchingMore(false);
      }
    }
  };

  useEffect(() => {
    if (!isFetchingMore) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isFetchingMore]);

  return {
    messages,
    setMessages,
    isLoadingHistory,
    hasMore,
    isFetchingMore,
    containerRef,
    messagesEndRef,
    handleScroll,
  };
};
