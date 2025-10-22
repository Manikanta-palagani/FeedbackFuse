import React from 'react';

const Analytics = ({ responses, questions }) => {
  // Calculate average rating for rating questions
  const calculateAverageRating = (questionId) => {
    const ratings = responses
      .flatMap(response => response.answers)
      .filter(answer => answer.questionId === questionId && !isNaN(answer.answer))
      .map(answer => parseInt(answer.answer));
    
    if (ratings.length === 0) return 0;
    return (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(2);
  };

  // Count responses for multiple choice questions
  const countOptions = (questionId) => {
    const optionCounts = {};
    
    responses.forEach(response => {
      response.answers.forEach(answer => {
        if (answer.questionId === questionId) {
          optionCounts[answer.answer] = (optionCounts[answer.answer] || 0) + 1;
        }
      });
    });
    
    return optionCounts;
  };

  return (
    <div className="analytics-dashboard">
      <h3>Response Analytics</h3>
      
      {questions.map((question, index) => (
        <div key={question._id || index} className="question-analytics">
          <h4>{question.questionText}</h4>
          
          {question.questionType === 'rating' && (
            <div>
              <p>Average Rating: {calculateAverageRating(question._id || index)} / {question.maxRating}</p>
            </div>
          )}
          
          {question.questionType === 'multipleChoice' && (
            <div>
              <p>Response Distribution:</p>
              <ul>
                {Object.entries(countOptions(question._id || index)).map(([option, count]) => (
                  <li key={option}>
                    {option}: {count} {count === 1 ? 'response' : 'responses'} 
                    ({((count / responses.length) * 100).toFixed(1)}%)
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {question.questionType === 'text' && (
            <div>
              <p>{responses.length} text responses collected</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Analytics;