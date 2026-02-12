import { AnalysisResult, Conversation } from '../types/database';

// Get total score with DB fallback to analysis_result
export const getTotalScore = (conversation: Conversation): number => {
  // Primary: Use DB total_score if available
  if (conversation.total_score != null) {
    return conversation.total_score;
  }
  
  // Fallback: Extract from analysis_result
  return getTotalScoreFromAnalysis(conversation.analysis_result);
};

// Get status with DB fallback to analysis_result
export const getStatus = (conversation: Conversation): string => {
  // Primary: Use DB status if available
  if (conversation.status) {
    return conversation.status;
  }
  
  // Fallback: Extract from analysis_result
  return getStatusFromAnalysis(conversation.analysis_result);
};

// Extract total score from analysis_result
export const getTotalScoreFromAnalysis = (analysisResult: AnalysisResult): number => {
  // Castrol schema - overall_rating.score_0_to_100
  if (analysisResult.overall_rating?.score_0_to_100) {
    return analysisResult.overall_rating.score_0_to_100;
  }
  
  // SBI schema - score.total
  if (analysisResult.score?.total) {
    return analysisResult.score.total;
  }
  
  // Legacy fallback
  if (analysisResult.total_score) {
    return analysisResult.total_score;
  }
  
  return 0;
};

// Extract status from analysis_result
export const getStatusFromAnalysis = (analysisResult: AnalysisResult): string => {
  // Direct status field
  if (analysisResult.status) {
    return analysisResult.status;
  }
  
  // Compliance status (Castrol schema)
  if (analysisResult.compliance?.status) {
    return analysisResult.compliance.status;
  }
  
  // SBI schema - derive from grade
  if (analysisResult.score?.grade) {
    return analysisResult.score.grade;
  }
  
  return 'unknown';
};
