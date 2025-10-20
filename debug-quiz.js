// Debug script to check quiz data in MongoDB
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Quiz schema - matching your model
const quizSchema = new mongoose.Schema(
  {
    quiz_name: { type: String, required: true },
    questions_and_answers: [
      {
        question: { type: String, required: true },
        answer: { type: String },
        options: { type: [String] },
        correct_answer: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const Quiz = mongoose.model('Quiz', quizSchema, 'questions');

async function debugQuizzes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');

    console.log('\n=== Checking database collections ===');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    console.log('\n=== Checking questions collection ===');
    const quizCount = await Quiz.countDocuments();
    console.log(`Total quizzes found in questions collection: ${quizCount}`);

    if (quizCount > 0) {
      console.log('\n=== Sample quiz data ===');
      const sampleQuiz = await Quiz.findOne().lean();
      console.log('Sample quiz structure:', JSON.stringify(sampleQuiz, null, 2));

      console.log('\n=== All quiz names ===');
      const allQuizzes = await Quiz.find({}, { quiz_name: 1, _id: 1 }).lean();
      allQuizzes.forEach((quiz, index) => {
        console.log(`${index + 1}. ${quiz.quiz_name} (ID: ${quiz._id})`);
      });
    } else {
      console.log('\nNo quizzes found. Checking raw collection...');
      
      // Check raw collection with different possible names
      const possibleNames = ['quizzes', 'quiz', 'Quiz', 'questions'];
      for (const collectionName of possibleNames) {
        try {
          const rawCount = await mongoose.connection.db.collection(collectionName).countDocuments();
          console.log(`Collection '${collectionName}': ${rawCount} documents`);
          
          if (rawCount > 0) {
            const sample = await mongoose.connection.db.collection(collectionName).findOne();
            console.log(`Sample from '${collectionName}':`, JSON.stringify(sample, null, 2));
          }
        } catch (err) {
          console.log(`Collection '${collectionName}' does not exist or error:`, err.message);
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

debugQuizzes();