import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useConversations } from '../../hooks/useConversations';
import { useProducts } from '../../hooks/useProducts';
import { UniversalScoreDisplay } from '../analysis/UniversalScoreDisplay';

// TypeScript interfaces
interface ExecutiveStats {
  id: string;
  email: string;
  conversations: number;
  totalScore: number;
  avgScore: number;
  passCount: number;
  passRate: number;
}

interface Analytics {
  totalConversations: number;
  avgScore: number;
  passRate: number;
  uniqueExecutives: number;
  executiveStats: ExecutiveStats[];
  allExecutives: { id: string; email: string }[];
}

interface ConversationCardProps {
  conversation: any; // TODO: Replace with proper Conversation type when available
  product: any; // TODO: Replace with proper Product type when available
  onClick: () => void;
}

// Memoized components for performance
const AnimatedCounter = React.memo(({ value, duration = 1000 }: { value: number; duration?: number }) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{count}</span>;
});
AnimatedCounter.displayName = 'AnimatedCounter';

const ExecutiveCard = React.memo(({ exec }: { exec: ExecutiveStats }) => (
  <div style={{
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px'
  }}>
    <div style={{
      fontSize: '14px',
      fontWeight: 'bold',
      marginBottom: '12px',
      wordBreak: 'break-word'
    }}>
      {exec.email}
    </div>
    
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      fontSize: '13px'
    }}>
      <div>
        <div style={{ color: '#666', marginBottom: '4px' }}>Conversations</div>
        <div style={{ fontWeight: 'bold' }}>{exec.conversations}</div>
      </div>
      
      <div>
        <div style={{ color: '#666', marginBottom: '4px' }}>Avg Score</div>
        <div style={{ fontWeight: 'bold' }}>{exec.avgScore.toFixed(1)}</div>
      </div>
      
      <div>
        <div style={{ color: '#666', marginBottom: '4px' }}>Pass Rate</div>
        <div style={{ fontWeight: 'bold' }}>{exec.passRate.toFixed(1)}%</div>
      </div>
      
      <div>
        <div style={{ color: '#666', marginBottom: '4px' }}>Status</div>
        <span style={{ 
          fontSize: '11px', 
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: exec.passRate >= 80 ? '#26A69A' : exec.passRate >= 60 ? '#FFA726' : '#FF4757',
          color: 'white'
        }}>
          {exec.passRate >= 80 ? 'Excellent' : 
           exec.passRate >= 60 ? 'Good' : 'Needs Improvement'}
        </span>
      </div>
    </div>
  </div>
));
ExecutiveCard.displayName = 'ExecutiveCard';

interface ConversationCardProps {
  conversation: any;
  product: any;
  onClick: () => void;
}

// Helper function to get status color
const getStatusColor = (status: string) => {
  const statusLower = status?.toLowerCase();
  switch (statusLower) {
    case 'pass':
    case 'good':
    case 'excellent':
      return '#26A69A'; // Green
    case 'fail':
    case 'poor':
    case 'bad':
      return '#FF4757'; // Red
    case 'needs_improvement':
    case 'needs improvement':
      return '#FF9800'; // Orange
    default:
      return '#9E9E9E'; // Gray
  }
};

const ConversationCard = React.memo(({ conversation, product, onClick }: ConversationCardProps) => {
  const [showTranscript, setShowTranscript] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  
  return (
  <>
    {/* Desktop Row Layout */}
    <div 
      className="desktop-conversation-row"
      onClick={onClick}
      style={{ 
        cursor: 'pointer',
        padding: '12px 16px',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: 'white',
        display: 'grid',
        gridTemplateColumns: '2fr 1.5fr 1fr 140px 60px',
        alignItems: 'center',
        gap: '16px',
        transition: 'background-color 0.2s ease'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
    >
      <div>
        <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
          {product?.product}
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {conversation.user_profiles?.email}
        </div>
      </div>
      
      <div style={{ fontSize: '12px', color: '#999' }}>
        {new Date(conversation.conversation_timestamp).toLocaleDateString()}
      </div>
      
      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
        {conversation.total_score || 'N/A'}
      </div>
      
      <span style={{
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 'bold',
        backgroundColor: getStatusColor(conversation.status),
        color: 'white',
        textAlign: 'center'
      }}>
        {conversation.status?.toUpperCase() || 'UNKNOWN'}
      </span>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowTranscript(!showTranscript);
        }}
        style={{
          padding: '4px 6px',
          fontSize: '11px',
          backgroundColor: showTranscript ? '#FF4757' : '#5C6BC0',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {showTranscript ? '−' : '+'}
      </button>
    </div>

    {/* Transcript Section */}
    {showTranscript && (
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '16px',
        marginBottom: '8px',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>Full Transcript</h4>
        <div style={{
          whiteSpace: 'pre-wrap',
          fontSize: '14px',
          lineHeight: '1.5',
          color: '#555',
          maxHeight: '300px',
          overflowY: 'auto',
          padding: '12px',
          backgroundColor: 'white',
          borderRadius: '4px',
          border: '1px solid #ddd'
        }}>
          {(conversation.transcript || 'No transcript available').split('\n').map((line: string, idx: number) => {
            const actorMatch = line.match(/^([^:]+):\s*(.*)/);
            if (actorMatch) {
              return (
                <div key={idx}>
                  <strong style={{ color: '#3F51B5' }}>{actorMatch[1]}:</strong> {actorMatch[2]}
                </div>
              );
            }
            return <div key={idx}>{line}</div>;
          })}
        </div>
      </div>
    )}

    {/* Mobile Card Layout */}
    <div 
      className="mobile-conversation-card"
      style={{ 
        cursor: 'pointer',
        padding: '16px',
        margin: '8px 0',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: 'white',
        display: 'none'
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <span style={{ 
          fontWeight: 'bold',
          fontSize: '16px',
          color: '#333'
        }}>{product?.product}</span>
        <span style={{
          fontSize: '14px',
          color: '#666'
        }}>{conversation.user_profiles?.email}</span>
        <span style={{
          fontSize: '12px',
          color: '#999'
        }}>{new Date(conversation.conversation_timestamp).toLocaleDateString()}</span>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <span style={{
          fontSize: '14px',
          fontWeight: 'bold'
        }}>Score: {conversation.total_score || 'N/A'}</span>
        <span 
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: getStatusColor(conversation.status),
            color: 'white'
          }}
        >
          {conversation.status?.toUpperCase() || 'UNKNOWN'}
        </span>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-start'
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Check if mobile view
            if (window.innerWidth <= 768) {
              setShowTranscriptModal(true);
            } else {
              setShowTranscript(!showTranscript);
            }
          }}
          style={{
            padding: '6px 12px',
            backgroundColor: 'transparent',
            color: '#666',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Transcript
        </button>
      </div>
    </div>

    {/* Transcript Modal for Mobile */}
    {showTranscriptModal && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Full Transcript</h3>
            <button
              onClick={() => setShowTranscriptModal(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
          </div>
          <div style={{
            padding: '16px',
            overflowY: 'auto',
            flex: 1
          }}>
            <div style={{
              whiteSpace: 'pre-wrap',
              fontSize: '14px',
              lineHeight: '1.5',
              color: '#555'
            }}>
              {(conversation.transcript || 'No transcript available').split('\n').map((line: string, idx: number) => {
                const actorMatch = line.match(/^([^:]+):\s*(.*)/);
                if (actorMatch) {
                  return (
                    <div key={idx} style={{ marginBottom: '8px' }}>
                      <strong style={{ color: '#3F51B5' }}>{actorMatch[1]}:</strong> {actorMatch[2]}
                    </div>
                  );
                }
                return <div key={idx} style={{ marginBottom: '4px' }}>{line}</div>;
              })}
            </div>
          </div>
        </div>
      </div>
    )}
  </>
)});
ConversationCard.displayName = 'ConversationCard';

export function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const { products } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedExecutiveId, setSelectedExecutiveId] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [selectedConversation, setSelectedConversation] = useState<any>(null); // TODO: Type with proper Conversation interface
  
  const { conversations, loading } = useConversations(selectedProductId || undefined);

  // Get unique domains for filter
  const availableDomains = useMemo(() => {
    const domains = Array.from(new Set(products.map(p => p.domain)));
    return domains.sort();
  }, [products]);

  // Filter products by selected domain
  const accessibleProducts = useMemo(() => {
    if (!selectedDomain) return products;
    return products.filter(product => product.domain === selectedDomain);
  }, [products, selectedDomain]);

  // Memoized callbacks
  const handleProductChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProductId(e.target.value);
  }, []);

  const handleExecutiveChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedExecutiveId(e.target.value);
  }, []);

  const handleDomainChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDomain(e.target.value);
  }, []);

  const handleDateRangeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDateRange(e.target.value);
    if (e.target.value !== 'custom') {
      setCustomStartDate('');
      setCustomEndDate('');
    }
  }, []);

  const handleConversationClick = useCallback((conversation: any) => { // TODO: Type with proper Conversation interface
    setSelectedConversation(conversation);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedConversation(null);
  }, []);

  // Analytics calculations
  const analytics: Analytics = useMemo(() => {
    // Create product lookup map for better performance
    const productMap = new Map(products.map(p => [p.id, p]));
    
    // Filter conversations by selected domain (admin can filter by domain)
    const domainConversations = selectedDomain 
      ? conversations.filter(conv => {
          const product = productMap.get(conv.product_id);
          return product?.domain === selectedDomain;
        })
      : conversations;

    // For stats - only filter by product and executive (no date filter)
    const statsFilteredConversations = domainConversations.filter(conv => {
      if (selectedProductId && conv.product_id !== selectedProductId) return false;
      if (selectedExecutiveId && conv.executive_id !== selectedExecutiveId) return false;
      return true;
    });

    const executiveStats = statsFilteredConversations.reduce((acc, conv) => {
      const executiveId = conv.executive_id;
      if (!acc[executiveId]) {
        acc[executiveId] = {
          email: conv.user_profiles?.email || 'Unknown',
          conversations: 0,
          totalScore: 0,
          passCount: 0,
          failCount: 0
        };
      }
      
      acc[executiveId].conversations++;
      acc[executiveId].totalScore += conv.total_score || 0;
      
      if (conv.status && ['pass', 'good', 'excellent'].includes(conv.status.toLowerCase())) acc[executiveId].passCount++;
      if (conv.status && ['fail', 'poor'].includes(conv.status.toLowerCase())) acc[executiveId].failCount++;
      
      return acc;
    }, {} as Record<string, any>);

    // Calculate averages
    Object.keys(executiveStats).forEach(id => {
      const stats = executiveStats[id];
      stats.avgScore = stats.conversations > 0 ? stats.totalScore / stats.conversations : 0;
      stats.passRate = stats.conversations > 0 ? (stats.passCount / stats.conversations) * 100 : 0;
    });

    return {
      totalConversations: statsFilteredConversations.length,
      avgScore: statsFilteredConversations.length > 0 
        ? statsFilteredConversations.reduce((sum, conv) => sum + (conv.total_score || 0), 0) / statsFilteredConversations.length 
        : 0,
      passRate: statsFilteredConversations.length > 0 
        ? (statsFilteredConversations.filter(conv => conv.status && ['pass', 'good', 'excellent'].includes(conv.status.toLowerCase())).length / statsFilteredConversations.length) * 100 
        : 0,
      uniqueExecutives: new Set(statsFilteredConversations.map(conv => conv.executive_id)).size,
      executiveStats: Object.entries(executiveStats).map(([id, stats]) => ({
        id,
        ...stats
      })),
      allExecutives: Array.from(
        new Set(domainConversations.map(conv => conv.executive_id))
      ).map(id => {
        const conv = domainConversations.find(c => c.executive_id === id);
        return {
          id,
          email: conv?.user_profiles?.email || 'Unknown'
        };
      })
    };
  }, [conversations, products, selectedDomain, selectedProductId, selectedExecutiveId]);

  // Admin sees ALL conversations but can filter by domain
  const filteredConversationsForList = useMemo(() => {
    // Create product lookup map for better performance
    const productMap = new Map(products.map(p => [p.id, p]));
    
    return conversations.filter(conv => {
      if (selectedDomain) {
        const product = productMap.get(conv.product_id);
        if (product?.domain !== selectedDomain) return false;
      }
      if (selectedProductId && conv.product_id !== selectedProductId) return false;
      if (selectedExecutiveId && conv.executive_id !== selectedExecutiveId) return false;
      
      // Date filter only for conversations list
      if (selectedDateRange !== 'all') {
        const convDate = new Date(conv.conversation_timestamp);
        const now = new Date();
        
        if (selectedDateRange === 'custom') {
          if (customStartDate || customEndDate) {
            if (customStartDate && customEndDate) {
              const startDate = new Date(customStartDate + 'T00:00:00');
              const endDate = new Date(customEndDate + 'T23:59:59');
              
              return convDate >= startDate && convDate <= endDate;
            } else if (customStartDate) {
              const startDate = new Date(customStartDate + 'T00:00:00');
              return convDate >= startDate;
            } else if (customEndDate) {
              const endDate = new Date(customEndDate + 'T23:59:59');
              return convDate <= endDate;
            }
          }
          return true;
        }
        
        const daysDiff = Math.floor((now.getTime() - convDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (selectedDateRange) {
          case '7days': return daysDiff <= 7;
          case '30days': return daysDiff <= 30;
          case '90days': return daysDiff <= 90;
          default: return true;
        }
      }
      
      return true;
    });
  }, [conversations, products, selectedDomain, selectedProductId, selectedExecutiveId, selectedDateRange, customStartDate, customEndDate]);

  if (loading) return <div>Loading...</div>;

  if (loading) return <div>Loading...</div>;

  return (
    <div className="supervisor-dashboard">
      <header>
        <div className="header-content">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome, {profile?.email}</p>
          </div>
          <button onClick={signOut} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <div className="controls">
        <select 
          value={selectedDomain} 
          onChange={handleDomainChange}
          style={{ minWidth: '150px' }}
        >
          <option value="">All Domains</option>
          {availableDomains.map(domain => (
            <option key={domain} value={domain}>
              {domain}
            </option>
          ))}
        </select>

        <select 
          value={selectedProductId} 
          onChange={handleProductChange}
          style={{ minWidth: '150px' }}
        >
          <option value="">All Products</option>
          {accessibleProducts.map(product => (
            <option key={product.id} value={product.id}>
              {product.product}
            </option>
          ))}
        </select>

        <select 
          value={selectedExecutiveId} 
          onChange={handleExecutiveChange}
          style={{ minWidth: '200px' }}
        >
          <option value="">All Executives</option>
          {analytics.allExecutives.map(exec => (
            <option key={exec.id} value={exec.id}>
              {exec.email}
            </option>
          ))}
        </select>
      </div>

      <div className="analytics-overview" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="metric-card">
          <div className="total-score-highlight">
            <span className="score-label">Total Conversations</span>
            <span className="animated-total-score">
              <AnimatedCounter value={analytics.totalConversations} />
            </span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="total-score-highlight">
            <span className="score-label">Active Executives</span>
            <span className="animated-total-score">
              <AnimatedCounter value={analytics.executiveStats.length} />
            </span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="total-score-highlight">
            <span className="score-label">Average Score</span>
            <span className="animated-total-score">
              <AnimatedCounter 
                value={analytics.executiveStats.length > 0 
                  ? Math.round(analytics.executiveStats.reduce((sum, exec) => sum + exec.avgScore, 0) / analytics.executiveStats.length * 10) / 10
                  : 0
                } 
              />
            </span>
          </div>
        </div>
      </div>

      <div className="executive-performance">
        <h2>Executive Performance</h2>
        
        {/* Desktop Table View */}
        <div className="performance-table" style={{
          overflowX: 'auto',
          marginBottom: '24px'
        }}>
          <table style={{
            width: '100%',
            minWidth: '700px',
            fontSize: '14px'
          }}>
            <thead>
              <tr>
                <th style={{ minWidth: '180px', textAlign: 'left', padding: '8px' }}>Executive</th>
                <th style={{ minWidth: '80px', textAlign: 'center', padding: '8px' }}>Talks</th>
                <th style={{ minWidth: '80px', textAlign: 'center', padding: '8px' }}>Avg Score</th>
                <th style={{ minWidth: '80px', textAlign: 'center', padding: '8px' }}>Pass Rate</th>
                <th style={{ minWidth: '120px', textAlign: 'center', padding: '8px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {analytics.executiveStats.map(exec => (
                <tr key={exec.id}>
                  <td style={{ 
                    wordBreak: 'break-word', 
                    padding: '8px',
                    fontSize: '12px'
                  }}>{exec.email}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>{exec.conversations}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>{exec.avgScore.toFixed(1)}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>{exec.passRate.toFixed(1)}%</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>
                    <span className={`status-indicator ${
                      exec.passRate >= 80 ? 'excellent' : 
                      exec.passRate >= 60 ? 'good' : 'needs-improvement'
                    }`} style={{ fontSize: '11px', padding: '2px 6px' }}>
                      {exec.passRate >= 80 ? 'Excellent' : 
                       exec.passRate >= 60 ? 'Good' : 'Needs Improvement'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="mobile-cards" style={{ display: 'none' }}>
          {analytics.executiveStats.map(exec => (
            <ExecutiveCard key={exec.id} exec={exec} />
          ))}
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 768px) {
              .performance-table {
                display: none !important;
              }
              .mobile-cards {
                display: block !important;
              }
              .desktop-conversation-header {
                display: none !important;
              }
              .desktop-conversation-row {
                display: none !important;
              }
              .mobile-conversation-card {
                display: block !important;
              }
              
              /* Mobile date filter improvements */
              .recent-conversations > div:first-child {
                flex-direction: column !important;
                align-items: stretch !important;
                gap: 16px !important;
              }
              
              .recent-conversations > div:first-child > div:last-child {
                align-items: stretch !important;
              }
              
              .recent-conversations select,
              .recent-conversations input[type="date"] {
                width: 100% !important;
                min-width: unset !important;
                padding: 12px !important;
                font-size: 16px !important;
              }
              
              /* Mobile typography and spacing improvements */
              h2 {
                font-size: 24px !important;
                margin-bottom: 20px !important;
              }
              
              select {
                font-size: 16px !important;
                padding: 12px !important;
                min-height: 48px !important;
              }
              
              .executive-performance .mobile-cards > div {
                padding: 20px !important;
                margin-bottom: 16px !important;
              }
              
              .executive-performance .mobile-cards > div > div:first-child {
                font-size: 16px !important;
                margin-bottom: 16px !important;
              }
              
              .executive-performance .mobile-cards > div > div:last-child > div {
                font-size: 15px !important;
              }
              
              .executive-performance .mobile-cards > div > div:last-child > div > div:first-child {
                font-size: 14px !important;
                margin-bottom: 6px !important;
              }
              
              .executive-performance .mobile-cards > div > div:last-child > div > div:last-child {
                font-size: 16px !important;
                font-weight: bold !important;
              }
              
              .conversations-list .mobile-conversation-card {
                padding: 20px !important;
                margin: 12px 0 !important;
              }
              
              .conversations-list .mobile-conversation-card > div:first-child > span:first-child {
                font-size: 18px !important;
              }
              
              .conversations-list .mobile-conversation-card > div:first-child > span:nth-child(2) {
                font-size: 16px !important;
              }
              
              .conversations-list .mobile-conversation-card > div:first-child > span:last-child {
                font-size: 14px !important;
              }
              
              .conversations-list .mobile-conversation-card > div:last-child > span:first-child {
                font-size: 16px !important;
              }
              
              .conversations-list .mobile-conversation-card > div:last-child > span:last-child {
                font-size: 14px !important;
                padding: 6px 12px !important;
              }
            }
          `
        }} />
      </div>

      <div className="recent-conversations">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <h2 style={{ margin: 0 }}>Conversations</h2>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'flex-end'
          }}>
            <select 
              value={selectedDateRange} 
              onChange={handleDateRangeChange}
              style={{ 
                minWidth: '140px',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
            
            {selectedDateRange === 'custom' && (
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  style={{ 
                    padding: '8px 12px', 
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    minWidth: '140px'
                  }}
                />
                <span style={{ color: '#666', fontSize: '14px' }}>to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  style={{ 
                    padding: '8px 12px', 
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    minWidth: '140px'
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <div className="conversations-list">
          {/* Desktop Header */}
          <div 
            className="desktop-conversation-header"
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.5fr 1fr 140px 60px',
              gap: '16px',
              padding: '12px 16px',
              backgroundColor: '#f8f9fa',
              borderBottom: '2px solid #e0e0e0',
              fontWeight: 'bold',
              fontSize: '12px',
              color: '#666',
              textTransform: 'uppercase'
            }}
          >
            <div>Product & Executive</div>
            <div>Date</div>
            <div>Score</div>
            <div>Status</div>
            <div style={{ textAlign: 'center' }}>Transcript</div>
          </div>

          {filteredConversationsForList.slice(0, 10).map(conversation => {
            const product = products.find(p => p.id === conversation.product_id);
            return (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                product={product}
                onClick={() => handleConversationClick(conversation)}
              />
            );
          })}
        </div>

        {filteredConversationsForList.length === 0 && (
          <div className="empty-state" style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#666'
          }}>
            <p>No conversations found for the selected filters.</p>
          </div>
        )}
      </div>

      {/* Conversation Detail Modal */}
      {selectedConversation && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                fontSize: '18px',
                cursor: 'pointer',
                zIndex: 1001,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              ×
            </button>
            
            <div className="modal-content" style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              width: '100%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative'
            }}>
            
            <div className="conversation-card">
              <div className="conversation-header">
                <h3>{products.find(p => p.id === selectedConversation.product_id)?.product}</h3>
                <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="date" style={{ fontSize: '14px', color: '#666', whiteSpace: 'nowrap' }}>
                    {new Date(selectedConversation.conversation_timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {(() => {
                const product = products.find(p => p.id === selectedConversation.product_id);
                if (!product) return null;
                
                return (
                  <UniversalScoreDisplay
                    analysisResult={selectedConversation.analysis_result}
                    schema={product.schema_definition}
                    productName={product.product}
                    complianceStatus={selectedConversation.status || selectedConversation.analysis_result?.compliance?.status}
                  />
                );
              })()}

              {/* Evidence section */}
              {(selectedConversation.analysis_result.evidence_quotes || 
                selectedConversation.analysis_result.dimension_ratings ||
                selectedConversation.analysis_result.qa) && (
                <div className="evidence-section">
                  <h4>Key Evidence</h4>
                  {selectedConversation.analysis_result.evidence_quotes?.slice(0, 3).map((quote: any, idx: number) => (
                    <div key={idx} className="evidence-quote">
                      <p>"{quote.quote}"</p>
                      {quote.timestamp && <span>@{quote.timestamp}</span>}
                    </div>
                  ))}
                  
                  {selectedConversation.analysis_result.dimension_ratings && 
                    Object.entries(selectedConversation.analysis_result.dimension_ratings)
                      .slice(0, 3)
                      .map(([dimension, data]: [string, any]) => (
                        <div key={dimension} className="evidence-quote">
                          <p><strong>{dimension.replace('_', ' ')}:</strong> {data.evidence_quotes?.[0]}</p>
                        </div>
                      ))
                  }
                  
                  {selectedConversation.analysis_result.qa?.slice(0, 2).map((qa: any, idx: number) => (
                    <div key={idx} className="evidence-quote">
                      <p><strong>Q:</strong> {qa.question}</p>
                      <p><strong>Quality:</strong> {qa.answer_quality}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations section */}
              {(selectedConversation.analysis_result.recommendations || 
                selectedConversation.analysis_result.coach ||
                selectedConversation.analysis_result.what_went_well) && (
                <div className="recommendations-section">
                  <h4>Recommendations</h4>
                  <ul>
                    {selectedConversation.analysis_result.recommendations?.slice(0, 3).map((rec: any, idx: number) => (
                      <li key={idx}>{rec}</li>
                    ))}
                    
                    {selectedConversation.analysis_result.coach?.slice(0, 3).map((coach: any, idx: number) => (
                      <li key={idx}>{coach}</li>
                    ))}
                    
                    {selectedConversation.analysis_result.what_went_well?.slice(0, 2).map((item: any, idx: number) => (
                      <li key={idx}><strong>✓</strong> {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
