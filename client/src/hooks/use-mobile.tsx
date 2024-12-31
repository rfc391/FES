import * as React from "react"

export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState<boolean>(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

export function useIsMobile() {
  return useMediaQuery(`(max-width: 767px)`);
}