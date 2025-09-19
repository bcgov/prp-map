import { useEffect, useState } from "react";

type MapStyles = unknown;

interface UseGetMapStylesResult {
  data: MapStyles | null;
  isLoading: boolean;
  error: Error | null;
}

export const useGetMapStyles = (styleUrl: string): UseGetMapStylesResult => {
  const [data, setData] = useState<MapStyles | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMapStyles = async () => {
      try {
        const response = await fetch(styleUrl);

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
  }, [styleUrl]);

  return { data, isLoading, error };
};
