useEffect(() => {
  if (isLoading) return;

  // Só resolver página UMA VEZ
  if (!pageResolved) {
    if (currentUser) {
      if (hasAppAccess(currentUser.role)) {
        setCurrentPage('social-hub');
      } else {
        setCurrentPage('index');
      }
    } else {
      setCurrentPage('home');
    }

    setPageResolved(true);
  }
}, [isLoading, currentUser, pageResolved]);

