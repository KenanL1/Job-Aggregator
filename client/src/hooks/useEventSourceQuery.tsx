import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Job, JobFilters } from "../types";

const useEventSourceQuery = (queryKey: [string, JobFilters], url: string) => {
  const queryClient = useQueryClient();
  const stableQueryKey = useRef(queryKey);

  // Update the stable reference only if the filters actually changed
  if (JSON.stringify(stableQueryKey.current) !== JSON.stringify(queryKey)) {
    stableQueryKey.current = queryKey;
  }

  useEffect(() => {
    // "http://localhost:5000/stream?channel=mychannel"
    const source = new EventSource(url);

    const handleMessage = (event: MessageEvent) => {
      const eventData = JSON.parse(event.data);
      queryClient.setQueryData(
        stableQueryKey.current,
        (oldData: Job[] = []) => [...eventData, ...oldData]
      );
    };

    source.addEventListener("message", handleMessage);

    // Cleanup on component unmount
    return () => {
      source.removeEventListener("message", handleMessage);
      source.close();
    };
  }, [url, queryClient]); // Remove queryKey from dependencies since we use the stable ref

  return useQuery<Job[]>({
    queryKey: stableQueryKey.current,
    queryFn: () => [], // Since data is managed by EventSource
    staleTime: Infinity, // Prevent automatic refetching
    gcTime: Infinity, // Keep the data cached (formerly cacheTime)
  });
};

export default useEventSourceQuery;
