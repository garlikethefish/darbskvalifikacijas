import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function addMoreQuizzes() {
  const dbPromise = db.promise();

  try {
    // Get an admin user or any user
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

    // Quiz 1: Game of Thrones
    const [quizResult1] = await dbPromise.query(
      'INSERT INTO quizzes (title, description, icon_emoji, created_by) VALUES (?, ?, ?, ?)',
      ['Game of Thrones Legends', 'Test your knowledge of the epic fantasy series', '👑', adminUserId]
    );

    const quizId1 = quizResult1.insertId;
    const questions1 = [
      {
        question_text: 'How many seasons did Game of Thrones have?',
        option_a: '6 seasons',
        option_b: '7 seasons',
        option_c: '8 seasons',
        option_d: '10 seasons',
        correct_answer: 'C',
        explanation: 'Game of Thrones ran for 8 seasons from 2011 to 2019.'
      },
      {
        question_text: 'What is the motto of House Stark?',
        option_a: 'Fire and Blood',
        option_b: 'Winter is Coming',
        option_c: 'Ours is the Fury',
        option_d: 'Hear Me Roar',
        correct_answer: 'B',
        explanation: 'House Stark\'s motto is "Winter is Coming".'
      },
      {
        question_text: 'Who sits on the Iron Throne at the end of the series?',
        option_a: 'Daenerys Targaryen',
        option_b: 'Jon Snow',
        option_c: 'Bran Stark',
        option_d: 'Sansa Stark',
        correct_answer: 'C',
        explanation: 'Bran Stark becomes king at the end of the series.'
      },
      {
        question_text: 'What is the name of Jon Snow\'s sword?',
        option_a: 'Catspaw',
        option_b: 'Valyrian Steel',
        option_c: 'Longclaw',
        option_d: 'Oathkeeper',
        correct_answer: 'C',
        explanation: 'Jon Snow wields a sword called Longclaw.'
      }
    ];

    for (const q of questions1) {
      await dbPromise.query(
        'INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [quizId1, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation]
      );
    }
    console.log(`✓ Created "Game of Thrones Legends" quiz with 4 questions`);

    // Quiz 2: The Witcher
    const [quizResult2] = await dbPromise.query(
      'INSERT INTO quizzes (title, description, icon_emoji, created_by) VALUES (?, ?, ?, ?)',
      ['The Witcher Challenge', 'Prove you\'re a true witcher fan', '⚔️', adminUserId]
    );

    const quizId2 = quizResult2.insertId;
    const questions2 = [
      {
        question_text: 'What is Geralt of Rivia also known as?',
        option_a: 'The Demon Slayer',
        option_b: 'The White Wolf',
        option_c: 'The Monster Hunter',
        option_d: 'The Silver Sword Wielder',
        correct_answer: 'B',
        explanation: 'Geralt is known as "The White Wolf".'
      },
      {
        question_text: 'What color are witchers\' eyes?',
        option_a: 'Ice blue',
        option_b: 'Golden yellow',
        option_c: 'Red',
        option_d: 'Black',
        correct_answer: 'B',
        explanation: 'Witchers have distinctive golden-yellow cat-like eyes.'
      },
      {
        question_text: 'Who is Yennefer\'s connection to the magical world?',
        option_a: 'A mage',
        option_b: 'A sorceress',
        option_c: 'A shaman',
        option_d: 'An elf',
        correct_answer: 'B',
        explanation: 'Yennefer is a powerful sorceress.'
      },
      {
        question_text: 'What medallion does Geralt wear?',
        option_a: 'A wolf medallion',
        option_b: 'A cat medallion',
        option_c: 'A dragon medallion',
        option_d: 'A shield medallion',
        correct_answer: 'A',
        explanation: 'Geralt wears a distinctive wolf medallion.'
      },
      {
        question_text: 'How many seasons of The Witcher have aired so far?',
        option_a: '2 seasons',
        option_b: '3 seasons',
        option_c: '4 seasons',
        option_d: '5 seasons',
        correct_answer: 'B',
        explanation: 'The Witcher has aired 3 seasons as of 2024.'
      }
    ];

    for (const q of questions2) {
      await dbPromise.query(
        'INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [quizId2, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation]
      );
    }
    console.log(`✓ Created "The Witcher Challenge" quiz with 5 questions`);

    // Quiz 3: Stranger Things
    const [quizResult3] = await dbPromise.query(
      'INSERT INTO quizzes (title, description, icon_emoji, created_by) VALUES (?, ?, ?, ?)',
      ['Stranger Things Expert', 'Navigate the Upside Down with this quiz', '🔺', adminUserId]
    );

    const quizId3 = quizResult3.insertId;
    const questions3 = [
      {
        question_text: 'In what year does Stranger Things begin?',
        option_a: '1981',
        option_b: '1983',
        option_c: '1985',
        option_d: '1987',
        correct_answer: 'B',
        explanation: 'The first season begins in 1983.'
      },
      {
        question_text: 'What is the name of the parallel dimension?',
        option_a: 'The Shadowside',
        option_b: 'The Netherworld',
        option_c: 'The Upside Down',
        option_d: 'The Mirror World',
        correct_answer: 'C',
        explanation: 'The parallel dimension is called "The Upside Down".'
      },
      {
        question_text: 'Who is Eleven searching for?',
        option_a: 'Her sister',
        option_b: 'Her mother',
        option_c: 'Her father',
        option_d: 'Her sister',
        correct_answer: 'B',
        explanation: 'Eleven is searching for her mother, Terry Ives.'
      },
      {
        question_text: 'What is the name of the villain from the Upside Down?',
        option_a: 'The Mindflayer',
        option_b: 'The Demogorgon',
        option_c: 'The Stranger',
        option_d: 'The Shadow',
        correct_answer: 'A',
        explanation: 'The primary villain is called "The Mindflayer" or Vecna in later seasons.'
      }
    ];

    for (const q of questions3) {
      await dbPromise.query(
        'INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [quizId3, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation]
      );
    }
    console.log(`✓ Created "Stranger Things Expert" quiz with 4 questions`);

    // Quiz 4: The Crown
    const [quizResult4] = await dbPromise.query(
      'INSERT INTO quizzes (title, description, icon_emoji, created_by) VALUES (?, ?, ?, ?)',
      ['The Crown Royalty', 'Test your knowledge of the British Royal Family saga', '👸', adminUserId]
    );

    const quizId4 = quizResult4.insertId;
    const questions4 = [
      {
        question_text: 'Who portrays Queen Elizabeth II in the first seasons?',
        option_a: 'Claire Foy',
        option_b: 'Olivia Colman',
        option_c: 'Gillian Anderson',
        option_d: 'Emma Corrin',
        correct_answer: 'A',
        explanation: 'Claire Foy plays Queen Elizabeth II in seasons 1-2.'
      },
      {
        question_text: 'In which season does Olivia Colman take over as Queen Elizabeth?',
        option_a: 'Season 2',
        option_b: 'Season 3',
        option_c: 'Season 4',
        option_d: 'Season 5',
        correct_answer: 'B',
        explanation: 'Olivia Colman takes over the role from season 3 onwards.'
      },
      {
        question_text: 'How many seasons of The Crown are planned?',
        option_a: '4 seasons',
        option_b: '5 seasons',
        option_c: '6 seasons',
        option_d: '7 seasons',
        correct_answer: 'B',
        explanation: 'The Crown is planned for 5 seasons total.'
      }
    ];

    for (const q of questions4) {
      await dbPromise.query(
        'INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [quizId4, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation]
      );
    }
    console.log(`✓ Created "The Crown Royalty" quiz with 3 questions`);

    // Quiz 5: The Mandalorian
    const [quizResult5] = await dbPromise.query(
      'INSERT INTO quizzes (title, description, icon_emoji, created_by) VALUES (?, ?, ?, ?)',
      ['The Mandalorian Bounty', 'Test your Star Wars knowledge', '🤖', adminUserId]
    );

    const quizId5 = quizResult5.insertId;
    const questions5 = [
      {
        question_text: 'What is the name of the main character?',
        option_a: 'The Solider',
        option_b: 'The Mandalorian',
        option_c: 'The Bounty Hunter',
        option_d: 'Din Djarin',
        correct_answer: 'B',
        explanation: 'He is known as "The Mandalorian" or Din Djarin.'
      },
      {
        question_text: 'What species is Grogu (Baby Yoda)?',
        option_a: 'Unknown alien',
        option_b: 'Same as Yoda',
        option_c: 'Jedi species',
        option_d: 'Force-sensitive species',
        correct_answer: 'A',
        explanation: 'Grogu\'s exact species is still unknown.'
      },
      {
        question_text: 'In which universe does The Mandalorian take place?',
        option_a: 'The Marvel Universe',
        option_b: 'The Star Wars Universe',
        option_c: 'The DC Universe',
        option_d: 'An original universe',
        correct_answer: 'B',
        explanation: 'The Mandalorian is set in the Star Wars universe.'
      },
      {
        question_text: 'What is the famous catchphrase associated with Grogu?',
        option_a: 'This is the way',
        option_b: 'May the Force be with you',
        option_c: 'Help me Obi-Wan Kenobi',
        option_d: 'I am Grogu',
        correct_answer: 'A',
        explanation: '"This is the way" is often said by Mandalorians in the show.'
      }
    ];

    for (const q of questions5) {
      await dbPromise.query(
        'INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [quizId5, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation]
      );
    }
    console.log(`✓ Created "The Mandalorian Bounty" quiz with 4 questions`);

    // Quiz 6: Breaking Bad Advanced
    const [quizResult6] = await dbPromise.query(
      'INSERT INTO quizzes (title, description, icon_emoji, created_by) VALUES (?, ?, ?, ?)',
      ['Breaking Bad Advanced', 'For the true Breaking Bad fanatics only', '⚗️', adminUserId]
    );

    const quizId6 = quizResult6.insertId;
    const questions6 = [
      {
        question_text: 'What pseudonym does Walt give to his car wash?',
        option_a: 'A1A Car Wash',
        option_b: 'Breaking Bad Car Wash',
        option_c: 'Heisenberg\'s Clean',
        option_d: 'Suds & Bubbles',
        correct_answer: 'A',
        explanation: 'The car wash is called A1A Car Wash.'
      },
      {
        question_text: 'How many bags of money does Walt hide?',
        option_a: '4 barrels',
        option_b: '5 barrels',
        option_c: '7 barrels',
        option_d: '10 barrels',
        correct_answer: 'B',
        explanation: 'Walt hides 5 barrels of money in the desert.'
      },
      {
        question_text: 'What is the name of the fastener company?',
        option_a: 'Davis & Associates',
        option_b: 'Saul & Co.',
        option_c: 'Los Pollos Hermanos',
        option_d: 'Madrigal Electromotive',
        correct_answer: 'D',
        explanation: 'The company is called Madrigal Electromotive GmbH.'
      },
      {
        question_text: 'What disease does Walt have?',
        option_a: 'Lung cancer',
        option_b: 'Brain cancer',
        option_c: 'Leukemia',
        option_d: 'Heart disease',
        correct_answer: 'A',
        explanation: 'Walt is diagnosed with terminal lung cancer.'
      }
    ];

    for (const q of questions6) {
      await dbPromise.query(
        'INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [quizId6, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation]
      );
    }
    console.log(`✓ Created "Breaking Bad Advanced" quiz with 4 questions`);

    // Quiz 7: Inception-style - Mindhunter
    const [quizResult7] = await dbPromise.query(
      'INSERT INTO quizzes (title, description, icon_emoji, created_by) VALUES (?, ?, ?, ?)',
      ['Mindhunter Mystery', 'Profile the criminal minds', '🧠', adminUserId]
    );

    const quizId7 = quizResult7.insertId;
    const questions7 = [
      {
        question_text: 'Who are the two main FBI agents in Mindhunter?',
        option_a: 'Holden Ford and Bill Tench',
        option_b: 'Holden Forest and Bill Lynch',
        option_c: 'Harold Ford and Tom Bench',
        option_d: 'Henry Fox and Bill Touch',
        correct_answer: 'A',
        explanation: 'The main characters are Holden Ford and Bill Tench.'
      },
      {
        question_text: 'What innovative technique do they develop?',
        option_a: 'Crime scene recreation',
        option_b: 'Criminal profiling',
        option_c: 'Psychological testing',
        option_d: 'Lie detection',
        correct_answer: 'B',
        explanation: 'They pioneered criminal profiling techniques.'
      },
      {
        question_text: 'What university do they recruit Dr. Wendy Carr from?',
        option_a: 'Harvard',
        option_b: 'Berkeley',
        option_c: 'Stanford',
        option_d: 'Yale',
        correct_answer: 'B',
        explanation: 'Dr. Wendy Carr is recruited from Berkeley.'
      }
    ];

    for (const q of questions7) {
      await dbPromise.query(
        'INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [quizId7, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation]
      );
    }
    console.log(`✓ Created "Mindhunter Mystery" quiz with 3 questions`);

    // Quiz 8: Ozark
    const [quizResult8] = await dbPromise.query(
      'INSERT INTO quizzes (title, description, icon_emoji, created_by) VALUES (?, ?, ?, ?)',
      ['Ozark Money Trail', 'Navigate the criminal underworld of Ozark', '💰', adminUserId]
    );

    const quizId8 = quizResult8.insertId;
    const questions8 = [
      {
        question_text: 'What is the main character\'s name in Ozark?',
        option_a: 'Marty Byrd',
        option_b: 'Marty Bird',
        option_c: 'Martin Byrde',
        option_d: 'Mark Byrd',
        correct_answer: 'C',
        explanation: 'The main character is Marty Byrde.'
      },
      {
        question_text: 'Where are the events of Ozark primarily set?',
        option_a: 'Miami, Florida',
        option_b: 'Ozark, Missouri',
        option_c: 'New Orleans, Louisiana',
        option_d: 'Nashville, Tennessee',
        correct_answer: 'B',
        explanation: 'The events take place in Ozark, Missouri.'
      },
      {
        question_text: 'What is Marty\'s original profession?',
        option_a: 'Lawyer',
        option_b: 'Financial advisor',
        option_c: 'Accountant',
        option_d: 'Banker',
        correct_answer: 'B',
        explanation: 'Marty is a financial advisor.'
      },
      {
        question_text: 'How many seasons did Ozark have?',
        option_a: '3 seasons',
        option_b: '4 seasons',
        option_c: '5 seasons',
        option_d: '6 seasons',
        correct_answer: 'B',
        explanation: 'Ozark ran for 4 seasons.'
      }
    ];

    for (const q of questions8) {
      await dbPromise.query(
        'INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [quizId8, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation]
      );
    }
    console.log(`✓ Created "Ozark Money Trail" quiz with 4 questions`);

    // Quiz 9: Chernobyl
    const [quizResult9] = await dbPromise.query(
      'INSERT INTO quizzes (title, description, icon_emoji, created_by) VALUES (?, ?, ?, ?)',
      ['Chernobyl Facts', 'Test your knowledge of the nuclear disaster miniseries', '☢️', adminUserId]
    );

    const quizId9 = quizResult9.insertId;
    const questions9 = [
      {
        question_text: 'In what year did the Chernobyl disaster occur?',
        option_a: '1984',
        option_b: '1985',
        option_c: '1986',
        option_d: '1987',
        correct_answer: 'C',
        explanation: 'The Chernobyl disaster occurred in 1986.'
      },
      {
        question_text: 'How many people died immediately in the Chernobyl explosion?',
        option_a: '2 people',
        option_b: '3 people',
        option_c: '5 people',
        option_d: '10 people',
        correct_answer: 'A',
        explanation: 'Two people died immediately in the explosion.'
      },
      {
        question_text: 'What country was Chernobyl located in?',
        option_a: 'Romania',
        option_b: 'Ukraine (Soviet Union)',
        option_c: 'Russia',
        option_d: 'Poland',
        correct_answer: 'B',
        explanation: 'Chernobyl was in Ukraine, then part of the Soviet Union.'
      }
    ];

    for (const q of questions9) {
      await dbPromise.query(
        'INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [quizId9, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation]
      );
    }
    console.log(`✓ Created "Chernobyl Facts" quiz with 3 questions`);

    // Quiz 10: The Last of Us
    const [quizResult10] = await dbPromise.query(
      'INSERT INTO quizzes (title, description, icon_emoji, created_by) VALUES (?, ?, ?, ?)',
      ['The Last of Us Survival', 'Test your knowledge of the post-apocalyptic series', '🧟', adminUserId]
    );

    const quizId10 = quizResult10.insertId;
    const questions10 = [
      {
        question_text: 'What is the main character\'s name?',
        option_a: 'Joe Miller',
        option_b: 'Joel Miller',
        option_c: 'Jonathan Miller',
        option_d: 'Jacob Miller',
        correct_answer: 'B',
        explanation: 'The main character is Joel Miller.'
      },
      {
        question_text: 'Who is Joel\'s companion throughout the series?',
        option_a: 'Ellie',
        option_b: 'Emma',
        option_c: 'Evelyn',
        option_d: 'Elena',
        correct_answer: 'A',
        explanation: 'Ellie is Joel\'s companion and love interest.'
      },
      {
        question_text: 'What caused the post-apocalyptic world?',
        option_a: 'Nuclear war',
        option_b: 'Fungal infection',
        option_c: 'Plague',
        option_d: 'Climate disaster',
        correct_answer: 'B',
        explanation: 'A devastating fungal infection caused the apocalypse.'
      },
      {
        question_text: 'In what year does The Last of Us begin?',
        option_a: '2010',
        option_b: '2013',
        option_c: '2015',
        option_d: '2020',
        correct_answer: 'B',
        explanation: 'The series begins in 2013.'
      }
    ];

    for (const q of questions10) {
      await dbPromise.query(
        'INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [quizId10, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation]
      );
    }
    console.log(`✓ Created "The Last of Us Survival" quiz with 4 questions`);

    // Quiz 11: Succession
    const [quizResult11] = await dbPromise.query(
      'INSERT INTO quizzes (title, description, icon_emoji, created_by) VALUES (?, ?, ?, ?)',
      ['Succession Power Games', 'Test your knowledge of corporate warfare', '🏢', adminUserId]
    );

    const quizId11 = quizResult11.insertId;
    const questions11 = [
      {
        question_text: 'What is the name of the media company in Succession?',
        option_a: 'Waystar Royco',
        option_b: 'Waypoint Royal',
        option_c: 'Wayland Royalty',
        option_d: 'Weststar Royale',
        correct_answer: 'A',
        explanation: 'The company is called Waystar Royco.'
      },
      {
        question_text: 'Who is the patriarch trying to succeed?',
        option_a: 'Logan Royale',
        option_b: 'Logan Roy',
        option_c: 'Logan Royal',
        option_d: 'Logan Romans',
        correct_answer: 'B',
        explanation: 'Logan Roy is the aging media mogul.'
      },
      {
        question_text: 'How many children does Logan have?',
        option_a: '2 children',
        option_b: '3 children',
        option_c: '4 children',
        option_d: '5 children',
        correct_answer: 'C',
        explanation: 'Logan Roy has 4 children.'
      }
    ];

    for (const q of questions11) {
      await dbPromise.query(
        'INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [quizId11, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation]
      );
    }
    console.log(`✓ Created "Succession Power Games" quiz with 3 questions`);

    // Quiz 12: Severance
    const [quizResult12] = await dbPromise.query(
      'INSERT INTO quizzes (title, description, icon_emoji, created_by) VALUES (?, ?, ?, ?)',
      ['Severance Secrets', 'Uncover the mysteries of Lumon Industries', '🧩', adminUserId]
    );

    const quizId12 = quizResult12.insertId;
    const questions12 = [
      {
        question_text: 'What is the main character\'s name in Severance?',
        option_a: 'Mark Scout',
        option_b: 'Mark Scott',
        option_c: 'Marcus Snow',
        option_d: 'Martin Scott',
        correct_answer: 'A',
        explanation: 'The protagonist is Mark Scout.'
      },
      {
        question_text: 'What procedure is at the center of the show?',
        option_a: 'Memory extraction',
        option_b: 'Neural implant',
        option_c: 'Surgical separation of work and life memories',
        option_d: 'Genetic modification',
        correct_answer: 'C',
        explanation: 'Severance is a surgical procedure that separates work and personal memories.'
      },
      {
        question_text: 'What is the name of the mysterious company?',
        option_a: 'Lumon Industries',
        option_b: 'Luminary Industries',
        option_c: 'Luminescence Corp',
        option_d: 'Lunar Tech',
        correct_answer: 'A',
        explanation: 'The company is called Lumon Industries.'
      }
    ];

    for (const q of questions12) {
      await dbPromise.query(
        'INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [quizId12, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation]
      );
    }
    console.log(`✓ Created "Severance Secrets" quiz with 3 questions`);

    console.log('\n✅ All new quizzes added successfully!');
    db.end();
  } catch (error) {
    console.error('Error adding quizzes:', error);
    db.end();
  }
}

addMoreQuizzes();
