import { useEffect, useState } from "react";
import { MAP_URLS } from "@/constants";

type MapStyles = unknown;

interface UseGetMapStylesResult {
  data: MapStyles | null;
  isLoading: boolean;
  error: Error | null;
}

export const useGetMapStyles = (): UseGetMapStylesResult => {
  const [data, setData] = useState<MapStyles | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMapStyles = async () => {
      try {
        const response = await fetch(MAP_URLS.styles, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapStyles();
  }, []);

  return { data, isLoading, error };
};
