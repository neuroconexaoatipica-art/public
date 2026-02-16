function AppContent() {
  const { user: currentUser, isLoading } = useProfileContext();

  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [pageResolved, setPageResolved] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    setPageResolved(true);
  }, [isLoading]);

  
