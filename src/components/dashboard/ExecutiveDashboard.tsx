import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useConversations } from '../../hooks/useConversations';
import { useProducts } from '../../hooks/useProducts';
import { UniversalScoreDisplay } from '../analysis/UniversalScoreDisplay';

export function ExecutiveDashboard() {
  const { profile, signOut } = useAuth();
  const { products } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [transcriptModal, setTranscriptModal] = useState<{show: boolean, conversation: any}>({show: false, conversation: null});
  
  const { conversations, loading } = useConversations(
    selectedProductId || undefined,
    profile?.id
  );

  const accessibleProducts = useMemo(() => 
    products.filter(product => 
      profile?.domain === product.domain || profile?.role === 'admin'
    ), [products, profile?.domain, profile?.role]
  );

  // Memoized callbacks
  const handleProductChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProductId(e.target.value);
  }, []);

  const handleDateRangeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDateRange(e.target.value);
    if (e.target.value !== 'custom') {
      setCustomStartDate('');
      setCustomEndDate('');
    }
  }, []);

  // Filter conversations by date
  const filteredConversations = useMemo(() => {
    if (selectedDateRange === 'all') return conversations;
    
    const now = new Date();
    return conversations.filter(conv => {
      const convDate = new Date(conv.conversation_timestamp);
      
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
    });
  }, [conversations, selectedDateRange, customStartDate, customEndDate]);

  if (loading) return <div>Loading...</div>;

  if (loading) return <div>Loading...</div>;

  return (
    <div className="executive-dashboard">
      <header>
        <div className="header-content">
          <div>
            <h1>Executive Dashboard</h1>
            <p>Welcome, {profile?.email}</p>
          </div>
          <button onClick={signOut} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <div className="product-selector" style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '24px'
      }}>
        <select 
          value={selectedProductId} 
          onChange={handleProductChange}
          style={{ 
            minWidth: '150px',
            padding: '8px 12px',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          <option value="">All Products</option>
          {accessibleProducts.map(product => (
            <option key={product.id} value={product.id}>
              {product.product}
            </option>
          ))}
        </select>

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
          <>
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
            <span style={{ color: '#666', fontSize: '14px', alignSelf: 'center' }}>to</span>
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
          </>
        )}
      </div>

      <div className="conversations-grid">
        {filteredConversations.map(conversation => {
          const product = products.find(p => p.id === conversation.product_id);
          if (!product) return null;

          return (
            <div key={conversation.id} className="conversation-card">
              <div className="conversation-header">
                <h3>{product.product}</h3>
                <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="date" style={{ fontSize: '14px', color: '#666', whiteSpace: 'nowrap' }}>
                    {new Date(conversation.conversation_timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <UniversalScoreDisplay
                key={`${conversation.id}-${selectedProductId}`}
                analysisResult={conversation.analysis_result}
                schema={product.schema_definition}
                productName={product.product}
                complianceStatus={conversation.status || conversation.analysis_result?.compliance?.status}
              />

              {/* Transcript Button */}
              <div style={{ margin: '16px 0', textAlign: 'center' }}>
                <button
                  onClick={() => setTranscriptModal({show: true, conversation})}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    backgroundColor: '#5C6BC0',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  View Full Transcript
                </button>
              </div>

              {/* Evidence section - handle both schemas */}
              {(conversation.analysis_result.evidence_quotes || 
                conversation.analysis_result.dimension_ratings ||
                conversation.analysis_result.qa) && (
                <div className="evidence-section">
                  <h4>Key Evidence</h4>
                  {/* Legacy evidence quotes */}
                  {conversation.analysis_result.evidence_quotes?.slice(0, 3).map((quote, idx) => (
                    <div key={idx} className="evidence-quote">
                      <p>"{quote.quote}"</p>
                      {quote.timestamp && <span>@{quote.timestamp}</span>}
                    </div>
                  ))}
                  
                  {/* Castrol dimension evidence */}
                  {conversation.analysis_result.dimension_ratings && 
                    Object.entries(conversation.analysis_result.dimension_ratings)
                      .slice(0, 3)
                      .map(([dimension, data]) => (
                        <div key={dimension} className="evidence-quote">
                          <p><strong>{dimension.replace('_', ' ')}:</strong> {data.evidence_quotes?.[0]}</p>
                        </div>
                      ))
                  }
                  
                  {/* SBI Q&A evidence */}
                  {conversation.analysis_result.qa?.slice(0, 2).map((qa, idx) => (
                    <div key={idx} className="evidence-quote">
                      <p><strong>Q:</strong> {qa.question}</p>
                      <p><strong>Quality:</strong> {qa.answer_quality}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations section - handle both schemas */}
              {(conversation.analysis_result.recommendations || 
                conversation.analysis_result.coach ||
                conversation.analysis_result.what_went_well) && (
                <div className="recommendations-section">
                  <h4>Recommendations</h4>
                  <ul>
                    {/* Legacy recommendations */}
                    {conversation.analysis_result.recommendations?.slice(0, 3).map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                    
                    {/* SBI coaching */}
                    {conversation.analysis_result.coach?.slice(0, 3).map((coach, idx) => (
                      <li key={idx}>{coach}</li>
                    ))}
                    
                    {/* Castrol what went well */}
                    {conversation.analysis_result.what_went_well?.slice(0, 2).map((item, idx) => (
                      <li key={idx}><strong>✓</strong> {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredConversations.length === 0 && (
        <div className="empty-state">
          <p>No conversations found. Upload your first conversation from the mobile app!</p>
        </div>
      )}

      {/* Transcript Modal */}
      {transcriptModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '600px',
            maxHeight: '80vh',
            width: '90%',
            position: 'relative'
          }}>
            <button
              onClick={() => setTranscriptModal({show: false, conversation: null})}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Full Transcript</h3>
            <div style={{
              whiteSpace: 'pre-wrap',
              fontSize: '14px',
              lineHeight: '1.5',
              color: '#555',
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}>
              {(transcriptModal.conversation?.transcript || 'No transcript available').split('\n').map((line: string, idx: number) => {
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
        </div>
      )}
    </div>
  );
}
