// Test script to check the actual quiz structure from API
const axios = require('axios');

async function testQuizAPI() {
  try {
    console.log('Testing /api/quizzes endpoint...');
    
    const response = await axios.get('http://localhost:3000/api/quizzes');
    console.log('API Response status:', response.status);
    console.log('Number of quizzes:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('\nFirst quiz structure:');
      console.log(JSON.stringify(response.data[0], null, 2));
      
      console.log('\nQuiz field analysis:');
      const firstQuiz = response.data[0];
      console.log('- _id:', firstQuiz._id);
      console.log('- quiz_name:', firstQuiz.quiz_name);
      console.log('- questions_and_answers type:', typeof firstQuiz.questions_and_answers);
      console.log('- questions_and_answers length:', firstQuiz.questions_and_answers?.length);
      
      if (firstQuiz.questions_and_answers && firstQuiz.questions_and_answers.length > 0) {
        console.log('\nFirst question structure:');
        console.log(JSON.stringify(firstQuiz.questions_and_answers[0], null, 2));
      }
    } else {
      console.log('No quizzes returned from API');
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testQuizAPI();