/**
 * Quiz Scoring Utilities
 * Handles scoring for different question types (MCQ vs Text)
 */

export class QuizScoring {
  /**
   * Calculate score for a question based on type
   * @param {Object} questionData - The question data
   * @param {string} userAnswer - User's answer
   * @param {number} timeToAnswer - Time taken to answer (seconds)
   * @param {number} timeLimit - Time limit for the question (seconds)
   * @returns {Object} Scoring result
   */
  static calculateQuestionScore(questionData, userAnswer, timeToAnswer, timeLimit) {
    const basePoints = 100;
    const timeBonus = 50; // Maximum time bonus points
    
    let isCorrect = false;
    let points = 0;
    let method = '';
    let confidence = 'none';
    
    if (questionData.options && questionData.correct_answer) {
      // Multiple Choice Question
      isCorrect = userAnswer === questionData.correct_answer;
      method = 'multiple_choice';
      confidence = isCorrect ? 'exact' : 'none';
      
      if (isCorrect) {
        // Base points + time bonus (faster answers get more bonus)
        const timePercentage = Math.max(0, (timeLimit - timeToAnswer) / timeLimit);
        const timeBonusPoints = Math.round(timeBonus * timePercentage);
        points = basePoints + timeBonusPoints;
      }
    } else {
      // All questions are now MCQ from 3-stage pipeline - this should not occur
      console.warn('Non-MCQ question detected - all questions should be multiple choice');
      isCorrect = false;
      method = 'text_fallback';
      confidence = 'none';
    }
    
    return {
      isCorrect,
      points,
      method,
      confidence,
      timeToAnswer,
      breakdown: {
        basePoints: isCorrect ? basePoints : 0,
        timeBonus: points - (isCorrect ? basePoints : 0),
        total: points
      }
    };
  }
  
  /**
   * Get display text for match method
   */
  static getMatchMethodDisplay(method) {
    const methodMap = {
      'multiple_choice': 'Selected',
      'text_fallback': 'Text Answer'
    };
    
    return methodMap[method] || 'Answer';
  }
  
  /**
   * Get confidence display with emoji
   */
  static getConfidenceDisplay(confidence) {
    const confidenceMap = {
      'exact': '🎯 Perfect',
      'high': '✨ Excellent', 
      'medium': '⚡ Good',
      'low': '👍 Fair',
      'none': '❌ Incorrect'
    };
    
    return confidenceMap[confidence] || confidence;
  }
  
  /**
   * Calculate leaderboard with additional stats
   */
  static calculateLeaderboard(players) {
    return players
      .map(player => {
        const correctAnswers = player.answers?.filter(a => a.isCorrect).length || 0;
        const totalAnswers = player.answers?.length || 0;
        const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
        const averageTime = totalAnswers > 0 
          ? player.answers.reduce((sum, a) => sum + (a.timeToAnswer || 0), 0) / totalAnswers
          : 0;
        
        return {
          ...player,
          correctAnswers,
          totalAnswers,
          accuracy: Math.round(accuracy),
          averageTime: Math.round(averageTime * 10) / 10 // Round to 1 decimal
        };
      })
      .sort((a, b) => {
        // Primary sort: Score
        if (b.score !== a.score) return b.score - a.score;
        // Tiebreaker 1: Accuracy
        if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
        // Tiebreaker 2: Average time (faster is better)
        return a.averageTime - b.averageTime;
      })
      .map((player, index) => ({
        ...player,
        position: index + 1
      }));
  }
}

export default QuizScoring;