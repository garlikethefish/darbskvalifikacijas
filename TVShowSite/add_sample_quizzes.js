import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function addSampleQuizzes() {
  const dbPromise = db.promise();

  try {
    // First, get an admin user or any user
    const [users] = await dbPromise.query('SELECT id FROM users WHERE role = "admin" LIMIT 1');
    
    if (users.length === 0) {
      console.log('No admin user found. Getting any user...');
      const [anyUsers] = await dbPromise.query('SELECT id FROM users LIMIT 1');
      if (anyUsers.length === 0) {
        console.log('No users found in database. Please create a user first.');
        db.end();
        return;
      }
    }

    const adminUserId = users.length > 0 ? users[0].id : 1;

    // Sample Quiz 1: Breaking Bad
    const [quizResult1] = await dbPromise.query(
      'INSERT INTO quizzes (title, description, icon_emoji, created_by) VALUES (?, ?, ?, ?)',
      [
        'Breaking Bad Basics',
        'Test your knowledge of the iconic series Breaking Bad',
        '🧪',
        adminUserId
      ]
    );

    const quizId1 = quizResult1.insertId;

    const questions1 = [
      {
        question_text: 'What is Walter White\'s alias in the drug trade?',
        option_a: 'Mr. Majestic',
        option_b: 'Heisenberg',
        option_c: 'The Cook',
        option_d: 'The Professor',
        correct_answer: 'B',
        explanation: 'Walter White goes by the alias "Heisenberg" when dealing in methamphetamine.'
      },
      {
        question_text: 'What is Jesse Pinkman\'s street name?',
        option_a: 'Captain Cook',
        option_b: 'The Genius',
        option_c: 'Captain Cook',
        option_d: 'Mr. White\'s Partner',
        correct_answer: 'A',
        explanation: 'Jesse goes by "Captain Cook" among his associates.'
      },
      {
        question_text: 'In how many seasons did Breaking Bad air?',
        option_a: '4 seasons',
        option_b: '5 seasons',
        option_c: '6 seasons',
        option_d: '7 seasons',
        correct_answer: 'B',
        explanation: 'Breaking Bad aired for 5 seasons from 2008 to 2013.'
      },
      {
        question_text: 'What substance does Walter cook?',
        option_a: 'Cocaine',
        option_b: 'Heroin',
        option_c: 'Methamphetamine',
        option_d: 'LSD',
        correct_answer: 'C',
        explanation: 'Walter White manufactures methamphetamine in the series.'
      },
      {
        question_text: 'What is Hank Schrader\'s profession?',
        option_a: 'Detective',
        option_b: 'DEA Agent',
        option_c: 'Police Officer',
        option_d: 'FBI Agent',
        correct_answer: 'B',
        explanation: 'Hank Schrader works as a DEA (Drug Enforcement Administration) agent.'
      }
    ];

    for (const q of questions1) {
      await dbPromise.query(
        'INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [quizId1, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation]
      );
    }

    console.log(`✓ Created "Breaking Bad Basics" quiz with 5 questions`);

    // Sample Quiz 2: Stranger Things
    const [quizResult2] = await dbPromise.query(
      'INSERT INTO quizzes (title, description, icon_emoji, created_by) VALUES (?, ?, ?, ?)',
      [
        'Stranger Things Trivia',
        'How well do you know the Upside Down?',
        '🔺',
        adminUserId
      ]
    );

    const quizId2 = quizResult2.insertId;

    const questions2 = [
      {
        question_text: 'What year does Stranger Things begin?',
        option_a: '1983',
        option_b: '1985',
        option_c: '1986',
        option_d: '1984',
        correct_answer: 'A',
        explanation: 'Stranger Things Season 1 takes place in 1983.'
      },
      {
        question_text: 'What is the Upside Down?',
        option_a: 'A parallel dimension',
        option_b: 'An underground city',
        option_c: 'A psychological disorder',
        option_d: 'A nightclub',
        correct_answer: 'A',
        explanation: 'The Upside Down is a parallel dimension discovered in the series.'
      },
      {
        question_text: 'Who is the main villain in Season 1?',
        option_a: 'The Mind Flayer',
        option_b: 'Hawkins Lab',
        option_c: 'Demogorgon',
        option_d: 'Eleven\'s Father',
        correct_answer: 'C',
        explanation: 'The Demogorgon is the primary antagonist of Season 1.'
      }
    ];

    for (const q of questions2) {
      await dbPromise.query(
        'INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [quizId2, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation]
      );
    }

    console.log(`✓ Created "Stranger Things Trivia" quiz with 3 questions`);

    // Sample Quiz 3: The Office
    const [quizResult3] = await dbPromise.query(
      'INSERT INTO quizzes (title, description, icon_emoji, created_by) VALUES (?, ?, ?, ?)',
      [
        'The Office Fan Challenge',
        'Are you a true Dunder Mifflin fan?',
        '📎',
        adminUserId
      ]
    );

    const quizId3 = quizResult3.insertId;

    const questions3 = [
      {
        question_text: 'What is the name of the paper company?',
        option_a: 'Dunder Mifflin',
        option_b: 'Sabre',
        option_c: 'Wernham Hogg',
        option_d: 'Paper Plus',
        correct_answer: 'A',
        explanation: 'Dunder Mifflin is the main paper company in The Office.'
      },
      {
        question_text: 'Who is the regional manager?',
        option_a: 'Dwight Schrute',
        option_b: 'Michael Scott',
        option_c: 'Jim Halpert',
        option_d: 'Ryan Howard',
        correct_answer: 'B',
        explanation: 'Michael Scott is the regional manager of the Scranton branch.'
      },
      {
        question_text: 'What is Dwight\'s farm called?',
        option_a: 'Schrute Farms',
        option_b: 'Beets Farm',
        option_c: 'Dunder Farm',
        option_d: 'Pennsyl Farm',
        correct_answer: 'A',
        explanation: 'Dwight\'s family farm is called Schrute Farms.'
      },
      {
        question_text: 'What is Jim\'s main job at Dunder Mifflin?',
        option_a: 'Receptionist',
        option_b: 'Salesman',
        option_c: 'Warehouse Manager',
        option_d: 'Regional Manager',
        correct_answer: 'B',
        explanation: 'Jim Halpert works as a salesman at Dunder Mifflin.'
      }
    ];

    for (const q of questions3) {
      await dbPromise.query(
        'INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [quizId3, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation]
      );
    }

    console.log(`✓ Created "The Office Fan Challenge" quiz with 4 questions`);

    console.log('\n✅ All sample quizzes added successfully!');
    console.log('Head to /quizzes to see them in action.');

    db.end();
  } catch (err) {
    console.error('Error adding sample quizzes:', err);
    db.end();
  }
}

addSampleQuizzes();
