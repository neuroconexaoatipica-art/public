useEffect(() => {
  if (isLoading) return;
  setPageResolved(true);
}, [isLoading]);

