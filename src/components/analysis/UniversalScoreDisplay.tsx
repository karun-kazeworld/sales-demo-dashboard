import React, { useState, useEffect } from 'react';
import { AnalysisResult, SchemaDefinition } from '../../types/database';

interface UniversalScoreDisplayProps {
  analysisResult: AnalysisResult;
  schema: SchemaDefinition;
  productName: string;
  complianceStatus?: string;
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

// Animated counter component
function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
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
}

// Animated progress bar
function AnimatedProgressBar({ value, maxValue, color, label }: { 
  value: number; 
  maxValue: number; 
  color: string; 
  label: string; 
}) {
  const [width, setWidth] = useState(0);
  const percentage = (value / maxValue) * 100;

  useEffect(() => {
    const timer = setTimeout(() => setWidth(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="animated-progress-container">
      <div className="progress-label">
        <span>{label}</span>
        <span className="progress-value">
          <AnimatedCounter value={value} />/{maxValue}
        </span>
      </div>
      <div className="animated-progress-bar">
        <div 
          className="animated-progress-fill"
          style={{ 
            width: `${width}%`,
            backgroundColor: color,
            transition: 'width 1.5s ease-out'
          }}
        />
      </div>
    </div>
  );
}

export function UniversalScoreDisplay({ analysisResult, schema, productName, complianceStatus }: UniversalScoreDisplayProps) {
  const [animateSubscores, setAnimateSubscores] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateSubscores(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (schema.score_structure === 'multi_dimension') {
    const dimensions = schema.dimensions || [];
    const totalScore = analysisResult.overall_rating?.score_0_to_100 || analysisResult.total_score || 0;
    const dimensionScores = analysisResult.dimension_ratings || {};
    
    return (
      <div className="score-display">
        <h3>{productName} - Performance Analysis</h3>
        <div className="total-score-highlight">
          <span className="score-label">Total Score:</span>
          <span className="animated-total-score">
            <AnimatedCounter value={totalScore} duration={1500} />
            /{schema.scale[1] === 5 ? 100 : schema.scale[1]}
          </span>
        </div>
        {complianceStatus && (
          <div style={{ marginTop: '12px', marginBottom: '16px' }}>
            <span 
              style={{ 
                fontWeight: 'bold', 
                padding: '6px 12px', 
                borderRadius: '4px', 
                backgroundColor: getStatusColor(complianceStatus),
                color: 'white',
                fontSize: '12px',
                whiteSpace: 'nowrap'
              }}
            >
              {complianceStatus.toUpperCase()}
            </span>
          </div>
        )}
        <div className="dimensions-grid">
          {dimensions.map(dimension => {
            const score = dimensionScores[dimension]?.score_0_to_5 || analysisResult.scores?.[dimension] || 0;
            return (
              <AnimatedProgressBar
                key={dimension}
                value={score}
                maxValue={schema.scale[1]}
                color={getScoreColor((score / schema.scale[1]) * 100)}
                label={dimension.replace('_', ' ').toUpperCase()}
              />
            );
          })}
        </div>
      </div>
    );
  }

  if (schema.score_structure === 'subscore') {
    const totalScore = analysisResult.score?.total || analysisResult.total_score || 0;
    const subscores = analysisResult.score?.subscores || analysisResult.subscores || {};
    
    return (
      <div className="score-display">
        <h3>{productName} - Compliance Analysis</h3>
        <div className="total-score-highlight">
          <span className="score-label">Overall Score:</span>
          <span className="animated-total-score">
            <AnimatedCounter value={totalScore} duration={1500} />%
          </span>
        </div>
        {complianceStatus && (
          <div style={{ marginTop: '12px', marginBottom: '16px' }}>
            <span 
              style={{ 
                fontWeight: 'bold', 
                padding: '6px 12px', 
                borderRadius: '4px', 
                backgroundColor: getStatusColor(complianceStatus),
                color: 'white',
                fontSize: '12px',
                whiteSpace: 'nowrap'
              }}
            >
              {complianceStatus.toUpperCase()}
            </span>
          </div>
        )}
        <div className="subscores">
          {schema.subscores?.map((subscore, index) => {
            const score = subscores[subscore] || 0;
            const maxValue = subscore === 'accuracy' ? 50 : subscore === 'qa_handling' ? 30 : 20;
            const percentage = (score / maxValue) * 100;
            
            return (
              <div key={subscore} className="subscore-item">
                <div className="subscore-header">
                  <span>{subscore.replace('_', ' ').toUpperCase()}</span>
                  <span className="subscore-percentage">
                    <AnimatedCounter value={score} />%
                  </span>
                </div>
                <div className="animated-score-bar">
                  <div 
                    className="animated-score-fill"
                    style={{ 
                      width: animateSubscores ? `${percentage}%` : '0%',
                      backgroundColor: getScoreColor(percentage),
                      transition: 'width 2s ease-out',
                      transitionDelay: `${index * 0.3}s`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <div>Unsupported schema structure</div>;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#26A69A'; // Kaze teal/green
  if (score >= 60) return '#FFA726'; // Kaze orange
  return '#FF4757'; // Kaze red
}
