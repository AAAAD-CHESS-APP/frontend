import { useState, useEffect, memo } from 'react';

const StockfishStatus = memo(() => {
  const [status, setStatus] = useState({
    isRunning: false,
    enginePath: '',
    engineVersion: '',
    timestamp: '',
    error: null
  });
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStockfishStatus = async (isInitial = false, withDelay = false) => {
    try {
      if (isInitial) {
        setIsInitialLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      // Add artificial delay when refreshing if requested
      if (withDelay && !isInitial) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      }
      
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_ENGINE_API_URL}status`);
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        isRunning: false,
        error: error.message
      }));
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStockfishStatus(true);
    
    // Refresh status every 30 seconds
    const interval = setInterval(() => fetchStockfishStatus(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefreshClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    fetchStockfishStatus(false, true); // Add true to enable delay
  };

  // Element that shows status with refresh indicator overlay
  const StatusIndicator = ({ isRunning }) => (
    <div className="relative flex items-center">
      <span className="font-medium mr-2">Status:</span>
      {isRunning ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <span className="h-2 w-2 mr-1 bg-green-400 rounded-full"></span>
          Online
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <span className="h-2 w-2 mr-1 bg-red-400 rounded-full"></span>
          Offline
        </span>
      )}
      
      {isRefreshing && (
        <span className="ml-2 inline-flex items-center">
          <span className="animate-spin h-3 w-3 border-b-2 border-blue-500 rounded-full"></span>
        </span>
      )}
    </div>
  );

  if (isInitialLoading) {
    return (
      <div className="bg-white text-gray-900 p-4 rounded-lg shadow-md max-w-md">
        <h2 className="text-xl font-bold mb-4">Stockfish Engine Status</h2>
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2">Checking status...</span>
        </div>
      </div>
    );
  }

  const formatVersionString = (versionString) => {
    if (!versionString) return '';
    
    // Split by space and take first two parts
    const parts = versionString.split(' ');
    return parts.slice(0, 2).join(' ');
  };

  return (
    <div className="bg-white text-gray-900 p-4 rounded-lg shadow-md max-w-md">
      <h2 className="text-xl font-bold mb-4">Stockfish Engine Status</h2>
      
      <div className="space-y-2">
        <StatusIndicator isRunning={status.isRunning} />
        
        <div className={isRefreshing ? "opacity-50 transition-opacity duration-200" : ""}>
          {status.engineVersion && (
            <div>
              <span className="font-medium">Version:</span> {formatVersionString(status.engineVersion)}
            </div>
          )}
          
          {status.enginePath && (
            <div>
              <span className="font-medium">Path:</span> 
              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{status.enginePath}</code>
            </div>
          )}
          
          {status.timestamp && (
            <div className="text-gray-500 text-sm">
              Last checked: {new Date(status.timestamp).toLocaleString()}
            </div>
          )}
          
          {status.error && (
            <div className="text-red-500 mt-2">
              <span className="font-medium">Error:</span> {status.error}
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              isRefreshing 
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-black hover:bg-[#101010] text-white'
            }`}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
          </button>
          
          {isRefreshing && (
            <div className="mt-2 text-sm text-black animate-pulse">
              Loading data ...
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default StockfishStatus;