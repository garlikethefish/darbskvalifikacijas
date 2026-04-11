<template>
  <div id="quizzes-page">
    <!-- Hero Section -->
    <header class="hero">
      <div class="hero-band">
        <div class="hero-inner">
          <h1>{{ t('quizzes') }}</h1>
          <p class="subtitle">{{ t('testYourKnowledge') }}</p>
        </div>
      </div>
    </header>

    <div class="quizzes-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-spinner">
        <div class="spinner"></div>
        <p>{{ t('loading') }}</p>
      </div>

      <!-- Quiz Taking Mode -->
      <div v-else-if="activeQuiz && !showResults" class="quiz-taker">
        <div class="quiz-header">
          <button type="button" class="back-btn" @click.stop="backToList">← {{ t('back') }}</button>
          <h2>{{ activeQuiz.title }} <span class="icon">{{ activeQuiz.icon_emoji }}</span></h2>
          <div class="progress-info">
            {{ currentQuestionIndex + 1 }} / {{ activeQuiz.questions.length }}
          </div>
        </div>

        <!-- Current Question -->
        <div class="question-container">
          <h3 class="question-text">{{ currentQuestion.question_text }}</h3>
          
          <div class="options">
            <label v-for="option in ['a', 'b', 'c', 'd']" :key="option" class="option-label">
              <input 
                type="radio" 
                :name="`question-${currentQuestion.id}`"
                :value="option.toUpperCase()"
                v-model="answers[currentQuestion.id]"
                class="option-input"
              />
              <span class="option-text">{{ currentQuestion[`option_${option}`] }}</span>
            </label>
          </div>

          <div class="question-nav">
            <button 
              type="button"
              class="nav-btn prev-btn" 
              @click.stop="previousQuestion" 
              :disabled="currentQuestionIndex === 0"
            >
              ← {{ t('previous') }}
            </button>

            <button 
              v-if="currentQuestionIndex < activeQuiz.questions.length - 1"
              type="button"
              class="nav-btn next-btn" 
              @click.stop="nextQuestion"
            >
              {{ t('next') }} →
            </button>

            <button 
              v-else
              type="button"
              class="submit-btn" 
              @click.stop="submitQuiz"
            >
              {{ t('submit') }}
            </button>
          </div>
        </div>

        <!-- Question Indicator -->
        <div class="question-indicator">
          <div 
            v-for="(q, idx) in activeQuiz.questions"
            :key="q.id"
            class="indicator-dot"
            :class="{ 
              active: idx === currentQuestionIndex,
              answered: answers[q.id]
            }"
            @click.stop="currentQuestionIndex = idx"
          ></div>
        </div>
      </div>

      <!-- Results Modal -->
      <div v-else-if="showResults && quizResult" class="modal-overlay" @click.self="handleResultsClose">
        <div class="modal-content results-modal">
          <div class="results-header">
            <h2>{{ t('quizResults') }}</h2>
          </div>

          <div class="results-body">
            <div class="score-display" :class="{ passed: quizResult.passed }">
              <div class="score-circle">
                <div class="score-text">{{ quizResult.score }}%</div>
              </div>
            </div>

            <div class="results-info">
              <p><strong>{{ t('correctAnswers') }}:</strong> {{ quizResult.correctAnswers }} / {{ quizResult.totalQuestions }}</p>
              <p v-if="quizResult.passed" class="pass-text">🎉 {{ t('youPassed') }}!</p>
              <p v-else class="fail-text">{{ t('keepTrying') }}</p>
            </div>

            <!-- Badge Notification -->
            <div v-if="quizResult.badgeAwarded" class="badge-notification">
              <div class="badge-icon">🏆</div>
              <p class="badge-text">{{ t('badgeEarned') }}!</p>
              <p class="badge-name">{{ activeQuiz.title }} {{ activeQuiz.icon_emoji }}</p>
            </div>

            <div class="results-actions">
              <button type="button" class="retry-btn" @click.stop="retakeQuiz">
                {{ t('retake') }}
              </button>
              <button type="button" class="close-btn" @click.stop="handleResultsClose">
                {{ t('close') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Cooldown Modal -->
      <div v-if="showCooldownModal && cooldownInfo" class="modal-overlay" @click.self="closeCooldownModal">
        <div class="modal-content cooldown-modal">
          <div class="cooldown-header">
            <h2>⏳ {{ t('quizLockedTitle') || 'Quiz Temporarily Locked' }}</h2>
          </div>

          <div class="cooldown-body">
            <p class="cooldown-message">{{ t('quizLockedMessage') || 'You failed this quiz. You can retake it after 24 hours.' }}</p>

            <div class="cooldown-timer" v-if="cooldownInfo.hoursRemaining">
              <div class="timer-display">
                <div class="timer-value">{{ Math.ceil(cooldownInfo.hoursRemaining) }}</div>
                <div class="timer-label">{{ t('hoursRemaining') || 'hours remaining' }}</div>
              </div>
            </div>

            <div class="cooldown-details" v-if="cooldownInfo.nextRetakeTime">
              <p><strong>{{ t('nextRetakeTime') || 'You can retake this quiz at:' }}</strong></p>
              <p class="retry-time">{{ new Date(cooldownInfo.nextRetakeTime).toLocaleString(this.currentLanguage === 'lv' ? 'lv-LV' : 'en-US') }}</p>
            </div>

            <div class="cooldown-actions">
              <button type="button" class="close-btn" @click.stop="closeCooldownModal">
                {{ t('close') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quizzes List View -->
      <div v-if="!activeQuiz" class="quizzes-grid">
        <div v-if="quizzes.length === 0" class="no-quizzes">
          <p>{{ t('noQuizzesAvailable') }}</p>
        </div>

        <div v-for="quiz in quizzes" :key="quiz.id" class="quiz-card" :class="{ 'locked': quizLockStatus[quiz.id] && !quizLockStatus[quiz.id].canRetake, 'completed': userBadges[quiz.id] }">
          <div v-if="userBadges[quiz.id]" class="completed-overlay">
            <div class="completed-badge">🏆</div>
            <p class="completed-text">{{ t('completed') || 'Completed' }}</p>
          </div>
          
          <div v-else-if="quizLockStatus[quiz.id] && !quizLockStatus[quiz.id].canRetake" class="lock-overlay">
            <div class="lock-icon">🔒</div>
            <p class="lock-text">{{ Math.ceil(quizLockStatus[quiz.id].hoursRemaining) }}h</p>
          </div>
          
          <div class="quiz-icon">{{ quiz.icon_emoji }}</div>
          <h3 class="quiz-title">{{ quiz.title }}</h3>
          <p class="quiz-description">{{ quiz.description }}</p>

          <div class="badge-status" v-if="userBadges[quiz.id]">
            <span class="earned-badge">✓ {{ t('earned') }}</span>
          </div>

          <button 
            type="button" 
            class="start-quiz-btn" 
            @click.stop="startQuiz(quiz)"
            :disabled="userBadges[quiz.id] || (quizLockStatus[quiz.id] && !quizLockStatus[quiz.id].canRetake)"
          >
            <span v-if="userBadges[quiz.id]">
              🏆 {{ t('completed') || 'Completed' }}
            </span>
            <span v-else-if="quizLockStatus[quiz.id] && !quizLockStatus[quiz.id].canRetake">
              🔒 {{ Math.ceil(quizLockStatus[quiz.id].hoursRemaining) }}h {{ t('remaining') || 'Remaining' }}
            </span>
            <span v-else>
              {{ t('takeQuiz') }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getTranslation, getCurrentLanguage } from '@/services/translations.js'

export default {
  data() {
    return {
      quizzes: [],
      activeQuiz: null,
      currentQuestionIndex: 0,
      answers: {},
      loading: true,
      showResults: false,
      quizResult: null,
      userBadges: {},
      quizLockStatus: {},
      currentLanguage: 'en',
      cooldownInfo: null,
      showCooldownModal: false
    };
  },
  computed: {
    currentQuestion() {
      if (!this.activeQuiz || !this.activeQuiz.questions) return {};
      return this.activeQuiz.questions[this.currentQuestionIndex] || {};
    }
  },
  methods: {
    t(key) {
      return getTranslation(key, this.currentLanguage);
    },
    async fetchQuizzes() {
      try {
        const res = await fetch('/api/quizzes');
        if (!res.ok) throw new Error('Failed to fetch quizzes');
        this.quizzes = await res.json();
        
        // Fetch user's earned badges and lock status
        const auth = JSON.parse(localStorage.getItem('auth'));
        if (auth?.user?.id) {
          await this.fetchUserBadges(auth.user.id);
          await this.fetchQuizLockStatus(auth.user.id);
        }
      } catch (err) {
        console.error('Error fetching quizzes:', err);
      } finally {
        this.loading = false;
      }
    },
    async fetchUserBadges(userId) {
      try {
        const res = await fetch(`/api/users/${userId}/badges`);
        if (!res.ok) throw new Error('Failed to fetch badges');
        const badges = await res.json();
        
        // Create a map of quiz_id -> true for quick lookup
        badges.forEach(badge => {
          this.userBadges[badge.id] = true;
        });
      } catch (err) {
        console.error('Error fetching user badges:', err);
      }
    },
    async fetchQuizLockStatus(userId) {
      try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        if (!auth?.user?.id) return;
        
        // Fetch lock status for all quizzes
        for (const quiz of this.quizzes) {
          const res = await fetch(`/api/quizzes/${quiz.id}/cooldown-status`, {
            headers: {
              'Authorization': userId.toString()
            }
          });
          
          if (res.ok) {
            const data = await res.json();
            this.quizLockStatus[quiz.id] = data;
          }
        }
      } catch (err) {
        console.error('Error fetching quiz lock status:', err);
      }
    },
    async checkQuizCooldown(quizId) {
      try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        if (!auth?.user?.id) return true; // Allow if not logged in
        
        const res = await fetch(`/api/quizzes/${quizId}/cooldown-status`, {
          headers: {
            'Authorization': auth.user.id.toString()
          }
        });
        
        if (!res.ok) throw new Error('Failed to check cooldown');
        const data = await res.json();
        
        if (!data.canRetake) {
          this.cooldownInfo = data;
          this.showCooldownModal = true;
          return false;
        }
        
        return true;
      } catch (err) {
        console.error('Error checking cooldown:', err);
        return true; // Allow on error
      }
    },
    async startQuiz(quiz) {
      try {
        // Check if quiz is already completed
        if (this.userBadges[quiz.id]) {
          return; // Don't allow starting completed quizzes
        }
        
        // Check if quiz is locked
        if (this.quizLockStatus[quiz.id] && !this.quizLockStatus[quiz.id].canRetake) {
          this.cooldownInfo = this.quizLockStatus[quiz.id];
          this.showCooldownModal = true;
          return;
        }
        
        const res = await fetch(`/api/quizzes/${quiz.id}`);
        if (!res.ok) throw new Error('Failed to fetch quiz details');
        
        this.activeQuiz = await res.json();
        this.currentQuestionIndex = 0;
        
        // Initialize answers object with all question IDs
        // In Vue 3, direct assignment works for reactivity
        this.answers = {};
        this.activeQuiz.questions.forEach(q => {
          this.answers[q.id] = '';
        });
        
        this.showResults = false;
        this.quizResult = null;
      } catch (err) {
        console.error('Error starting quiz:', err);
        alert('Failed to load quiz');
      }
    },
    nextQuestion() {
      if (this.currentQuestionIndex < this.activeQuiz.questions.length - 1) {
        this.currentQuestionIndex++;
      }
    },
    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
      }
    },
    async submitQuiz() {
      // Check if all questions are answered
      const answeredCount = Object.values(this.answers).filter(a => a && a.trim()).length;
      console.log('Answered questions:', answeredCount, 'Total questions:', this.activeQuiz.questions.length);
      
      if (answeredCount < this.activeQuiz.questions.length) {
        alert(this.t('pleaseAnswerAllQuestions'));
        return;
      }

      try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        console.log('Auth user ID:', auth?.user?.id);
        
        if (!auth?.user?.id) {
          alert('You must be logged in to submit a quiz');
          return;
        }

        const requestBody = { answers: this.answers };
        console.log('Submitting quiz with answers:', requestBody);

        const res = await fetch(`/api/quizzes/${this.activeQuiz.id}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth.user.id.toString()
          },
          body: JSON.stringify(requestBody)
        });

        console.log('Submit response status:', res.status);
        const responseData = await res.json();
        console.log('Submit response data:', responseData);

        if (!res.ok) {
          throw new Error(responseData.message || 'Failed to submit quiz');
        }
        
        // Set the quiz result
        this.quizResult = responseData;
        console.log('Quiz result set:', this.quizResult);
        
        // Update badge status if it was just earned
        if (this.quizResult.badgeAwarded) {
          this.userBadges[this.activeQuiz.id] = true;
          console.log('Badge awarded! Updated userBadges:', this.userBadges);
        }
        
        // Show results modal
        this.showResults = true;
        console.log('Results modal shown');
      } catch (err) {
        console.error('Error submitting quiz:', err);
        alert(err.message || 'Failed to submit quiz');
      }
    },
    retakeQuiz() {
      // Check cooldown before allowing retake
      if (!this.quizResult.passed) {
        // User failed the quiz, check if they can retake
        const auth = JSON.parse(localStorage.getItem('auth'));
        if (auth?.user?.id) {
          this.checkQuizCooldown(this.activeQuiz.id).then(canRetake => {
            if (canRetake) {
              // Reset and restart the quiz
              this.answers = {};
              this.currentQuestionIndex = 0;
              this.showResults = false;
              this.quizResult = null;
            }
          });
          return;
        }
      }
      
      // Reset and restart the quiz
      this.answers = {};
      this.currentQuestionIndex = 0;
      this.showResults = false;
      this.quizResult = null;
    },
    handleResultsClose() {
      this.backToList();
    },
    closeCooldownModal() {
      this.showCooldownModal = false;
      this.cooldownInfo = null;
    },
    backToList() {
      this.activeQuiz = null;
      this.answers = {};
      this.currentQuestionIndex = 0;
      this.showResults = false;
      this.quizResult = null;
    }
  },
  mounted() {
    this.currentLanguage = getCurrentLanguage();
    this.fetchQuizzes();

    window.addEventListener('languageChanged', (e) => {
      this.currentLanguage = e.detail.language;
    });
  },
  beforeUnmount() {
    window.removeEventListener('languageChanged', (e) => {
      this.currentLanguage = e.detail.language;
    });
  }
};
</script>

<style scoped>
/* Hero Section */
.hero {
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--medium-bg-color) 100%);
  color: var(--text-color);
  padding: 60px 20px;
  margin-bottom: 40px;
}

.hero-band {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-inner h1 {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
  color: var(--subtitle-color);
}

/* Main Container */
.quizzes-container {
  max-width: 1200px;
  margin: 0 auto 60px;
  padding: 0 20px;
}

/* Loading Spinner */
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Quizzes Grid */
.quizzes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.no-quizzes {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: var(--subtitle-color);
  font-size: 1.1rem;
}

/* Quiz Card */
.quiz-card {
  background: var(--dark-bg-color);
  border-radius: 16px;
  padding: 35px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  height: 100%;
  position: relative;
}

.quiz-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}

.quiz-card.locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.quiz-card.locked:hover {
  transform: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.quiz-card.completed {
  background: var(--dark-bg-color);
  border: 1px solid #a6e22e;
  cursor: not-allowed;
  box-shadow: 0 4px 20px rgba(166, 226, 46, 0.15);
}

.quiz-card.completed:hover {
  transform: none;
  box-shadow: 0 4px 20px rgba(166, 226, 46, 0.15);
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  z-index: 10;
}

.completed-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  z-index: 10;
}

.lock-icon {
  font-size: 3rem;
  display: inline-block;
  animation: pulse 1.5s ease-in-out infinite;
}

.completed-badge {
  font-size: 2.5rem;
  display: inline-block;
  animation: bounce 0.8s ease infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.lock-text {
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.completed-text {
  color: #a6e22e;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.quiz-icon {
  font-size: 3.5rem;
  text-align: center;
  line-height: 1;
}

.quiz-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-color);
  text-align: center;
}

.quiz-description {
  color: var(--subtitle-color);
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  flex-grow: 1;
  text-align: center;
}

.badge-status {
  text-align: center;
}

.earned-badge {
  display: inline-block;
  background: var(--accent-color);
  color: var(--text-color);
  padding: 10px 18px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 15px;
}

.start-quiz-btn {
  background: var(--accent-color);
  color: var(--text-color);
  border: none;
  padding: 14px 28px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 48px;
  margin-top: auto;
}

.start-quiz-btn:hover:not(:disabled) {
  background: var(--medium-bg-color);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(166, 226, 46, 0.3);
}

.start-quiz-btn:disabled {
  background: #666;
  color: #999;
  cursor: not-allowed;
  opacity: 0.7;
}

.quiz-card.completed .start-quiz-btn:disabled {
  background: #4a5d2f;
  color: #a6e22e;
  opacity: 1;
}

.start-quiz-btn:disabled:hover {
  background: #666;
  transform: none;
  box-shadow: none;
}

/* Quiz Taker */
.quiz-taker {
  background: var(--dark-bg-color);
  border-radius: 16px;
  padding: 50px;
  max-width: 900px;
  margin: 0 auto;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 50px;
  gap: 20px;
  padding-bottom: 25px;
  border-bottom: 3px solid var(--accent-color);
}

.back-btn {
  background: none;
  border: none;
  color: var(--accent-color);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  transition: color 0.3s ease;
  flex-shrink: 0;
}

.back-btn:hover {
  color: var(--medium-bg-color);
}

.quiz-header h2 {
  flex: 1;
  margin: 0;
  font-size: 2rem;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 15px;
  text-align: center;
  justify-content: center;
}

.icon {
  font-size: 2.5rem;
}

.progress-info {
  background: var(--medium-bg-color);
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 600;
  color: var(--accent-color);
  min-width: max-content;
  flex-shrink: 0;
}

/* Question Container */
.question-container {
  margin-bottom: 50px;
}

.question-text {
  font-size: 1.5rem;
  margin: 0 0 40px 0;
  color: var(--text-color);
  line-height: 1.6;
  font-weight: 600;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 50px;
}

.option-label {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  padding: 20px;
  background: var(--medium-bg-color);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid transparent;
}

.option-label:hover {
  background: var(--background-color);
  border-color: var(--accent-color);
  transform: translateX(5px);
}

.option-label input:checked ~ .option-text {
  color: var(--accent-color);
  font-weight: 600;
}

.option-input {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  cursor: pointer;
  margin-top: 2px;
  accent-color: var(--accent-color);
}

.option-text {
  flex: 1;
  color: var(--text-color);
  font-size: 1.05rem;
  line-height: 1.6;
  transition: color 0.3s ease;
}

/* Question Navigation */
.question-nav {
  display: flex;
  gap: 20px;
  justify-content: space-between;
  align-items: center;
}

.nav-btn, .submit-btn {
  flex: 1;
  padding: 16px 28px;
  border: 2px solid var(--accent-color);
  background: transparent;
  color: var(--accent-color);
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover:not(:disabled), .submit-btn:hover {
  background: var(--accent-color);
  color: var(--text-color);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(166, 226, 46, 0.3);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.submit-btn {
  background: var(--accent-color);
  color: var(--text-color);
  border-color: var(--accent-color);
  font-size: 1.1rem;
}

.submit-btn:hover {
  background: var(--medium-bg-color);
  border-color: var(--medium-bg-color);
}

/* Question Indicator */
.question-indicator {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 50px;
  padding-top: 30px;
  border-top: 2px solid var(--medium-bg-color);
}

.indicator-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--medium-bg-color);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.indicator-dot.answered {
  background: var(--accent-color);
  transform: scale(1.1);
}

.indicator-dot.active {
  width: 24px;
  border-radius: 50%;
  border-color: var(--accent-color);
  box-shadow: 0 0 10px rgba(166, 226, 46, 0.5);
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--dark-bg-color);
  border-radius: 16px;
  padding: 40px;
  max-width: 550px;
  width: 90%;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  overflow-y: auto;
}

.results-modal {
  text-align: center;
}

.results-header {
  border-bottom: 3px solid var(--accent-color);
  padding-bottom: 25px;
  margin-bottom: 35px;
}

.results-header h2 {
  font-size: 2rem;
  margin: 0;
  color: var(--text-color);
  font-weight: 700;
}

.results-body {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* Score Display */
.score-display {
  display: flex;
  justify-content: center;
  padding: 30px 0;
}

.score-circle {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: var(--medium-bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid var(--accent-color);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.score-display.passed .score-circle {
  background: rgba(166, 226, 46, 0.15);
  border-color: #a6e22e;
  box-shadow: 0 10px 30px rgba(166, 226, 46, 0.25);
}

.score-text {
  font-size: 3rem;
  font-weight: 800;
  color: var(--accent-color);
  line-height: 1;
}

.score-display.passed .score-text {
  color: #a6e22e;
}

/* Results Info */
.results-info {
  color: var(--text-color);
  padding: 25px;
  background: var(--medium-bg-color);
  border-radius: 12px;
}

.results-info p {
  margin: 15px 0;
  font-size: 1.15rem;
  line-height: 1.8;
}

.results-info p:first-child {
  margin-top: 0;
}

.results-info p:last-child {
  margin-bottom: 0;
}

.pass-text {
  color: #a6e22e;
  font-weight: 700;
  font-size: 1.4rem;
}

.fail-text {
  color: var(--subtitle-color);
  font-weight: 600;
  font-size: 1.2rem;
}

/* Badge Notification */
.badge-notification {
  background: linear-gradient(135deg, rgba(166, 226, 46, 0.15), rgba(166, 226, 46, 0.08));
  border: 2px solid #a6e22e;
  border-radius: 14px;
  padding: 30px;
  text-align: center;
  animation: slideIn 0.5s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.badge-icon {
  font-size: 4rem;
  margin-bottom: 15px;
  display: inline-block;
  animation: bounce 0.8s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.badge-text {
  font-size: 1.4rem;
  font-weight: 800;
  color: #a6e22e;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.badge-name {
  font-size: 1.1rem;
  color: var(--subtitle-color);
  margin: 0;
  font-weight: 600;
}

/* Results Actions */
.results-actions {
  display: flex;
  gap: 20px;
  margin-top: 30px;
}

.retry-btn, .close-btn {
  flex: 1;
  padding: 16px 28px;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.retry-btn {
  background: var(--accent-color);
  color: var(--text-color);
}

.retry-btn:hover {
  background: var(--medium-bg-color);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(166, 226, 46, 0.3);
}

.close-btn {
  background: var(--medium-bg-color);
  color: var(--text-color);
  border: 2px solid var(--accent-color);
}

.close-btn:hover {
  background: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(166, 226, 46, 0.2);
}

/* Cooldown Modal */
.cooldown-modal {
  text-align: center;
  border: 2px solid #ff6b6b;
}

.cooldown-header {
  border-bottom: 3px solid #ff6b6b;
  padding-bottom: 25px;
  margin-bottom: 30px;
}

.cooldown-header h2 {
  font-size: 1.8rem;
  margin: 0;
  color: #ff6b6b;
  font-weight: 700;
}

.cooldown-body {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.cooldown-message {
  color: var(--text-color);
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
}

.cooldown-timer {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.15), rgba(255, 107, 107, 0.08));
  border: 2px solid #ff6b6b;
  border-radius: 12px;
  padding: 30px;
  margin: 20px 0;
}

.timer-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.timer-value {
  font-size: 3.5rem;
  font-weight: 800;
  color: #ff6b6b;
  line-height: 1;
}

.timer-label {
  font-size: 1rem;
  color: var(--subtitle-color);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.cooldown-details {
  background: var(--medium-bg-color);
  border-radius: 10px;
  padding: 20px;
  color: var(--text-color);
}

.cooldown-details p {
  margin: 10px 0;
  font-size: 0.95rem;
}

.cooldown-details p:first-child {
  margin-top: 0;
  font-weight: 600;
}

.retry-time {
  color: #ff6b6b;
  font-weight: 700;
  font-size: 1.1rem;
}

.cooldown-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.cooldown-actions .close-btn {
  background: #ff6b6b;
  border-color: #ff6b6b;
  color: white;
  flex: 1;
}

.cooldown-actions .close-btn:hover {
  background: #e55555;
  border-color: #e55555;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-inner h1 {
    font-size: 2rem;
  }

  .quizzes-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }

  .quiz-card {
    padding: 25px;
    gap: 15px;
  }

  .quiz-icon {
    font-size: 2.8rem;
  }

  .quiz-title {
    font-size: 1.4rem;
  }

  .quiz-taker {
    padding: 30px;
    border-radius: 12px;
  }

  .quiz-header {
    flex-direction: column;
    text-align: center;
    margin-bottom: 35px;
    gap: 15px;
    padding-bottom: 20px;
    border-bottom: 2px solid var(--accent-color);
  }

  .quiz-header h2 {
    font-size: 1.6rem;
  }

  .icon {
    font-size: 2rem;
  }

  .question-text {
    font-size: 1.3rem;
    margin-bottom: 30px;
  }

  .options {
    gap: 15px;
    margin-bottom: 35px;
  }

  .option-label {
    padding: 18px;
    gap: 15px;
    border-radius: 8px;
  }

  .option-text {
    font-size: 1rem;
  }

  .question-nav {
    gap: 15px;
  }

  .nav-btn, .submit-btn {
    padding: 14px 20px;
    font-size: 0.95rem;
    min-height: 45px;
  }

  .question-indicator {
    margin-top: 35px;
    padding-top: 25px;
    gap: 8px;
  }

  .modal-content {
    padding: 25px;
    margin: 20px;
  }

  .results-header h2 {
    font-size: 1.5rem;
  }

  .score-circle {
    width: 100px;
    height: 100px;
  }

  .score-text {
    font-size: 1.8rem;
  }

  .badge-icon {
    font-size: 3rem;
  }

  .badge-text {
    font-size: 1.2rem;
  }

  .results-actions {
    flex-direction: column;
    gap: 15px;
  }

  .retry-btn, .close-btn {
    padding: 14px 20px;
    font-size: 1rem;
  }
}

@media (max-width: 500px) {
  .hero {
    padding: 35px 15px;
    margin-bottom: 25px;
  }

  .hero-inner h1 {
    font-size: 1.3rem;
  }

  .subtitle {
    font-size: 0.95rem;
  }

  .quizzes-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .quiz-card {
    padding: 20px;
    gap: 12px;
  }

  .quiz-icon {
    font-size: 2.5rem;
  }

  .quiz-title {
    font-size: 1.2rem;
  }

  .quiz-description {
    font-size: 0.9rem;
  }

  .start-quiz-btn {
    padding: 12px 20px;
    font-size: 0.95rem;
  }

  .quiz-taker {
    padding: 20px;
    margin: 10px;
    border-radius: 12px;
  }

  .quiz-header {
    margin-bottom: 30px;
    padding-bottom: 15px;
  }

  .quiz-header h2 {
    font-size: 1.3rem;
    gap: 8px;
  }

  .back-btn {
    font-size: 0.9rem;
  }

  .progress-info {
    font-size: 0.85rem;
    padding: 8px 12px;
  }

  .icon {
    font-size: 1.5rem;
  }

  .question-text {
    font-size: 1.15rem;
    margin-bottom: 25px;
    font-weight: 500;
  }

  .options {
    gap: 12px;
    margin-bottom: 30px;
  }

  .option-label {
    padding: 15px;
    gap: 12px;
    border-radius: 8px;
  }

  .option-input {
    width: 20px;
    height: 20px;
  }

  .option-text {
    font-size: 0.95rem;
  }

  .question-nav {
    gap: 10px;
    flex-direction: column;
  }

  .nav-btn, .submit-btn {
    width: 100%;
    padding: 12px 16px;
    font-size: 0.95rem;
    min-height: 44px;
  }

  .question-indicator {
    margin-top: 30px;
    padding-top: 20px;
  }

  .indicator-dot {
    width: 12px;
    height: 12px;
  }

  .indicator-dot.active {
    width: 20px;
  }

  .modal-overlay {
    padding: 10px;
  }

  .modal-content {
    padding: 20px;
    max-width: 95%;
    border-radius: 12px;
  }

  .modal-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .modal-header h3 {
    font-size: 1.3rem;
  }

  .modal-close {
    width: 28px;
    height: 28px;
    font-size: 1.3rem;
  }

  .results-body {
    gap: 20px;
  }

  .score-circle {
    width: 90px;
    height: 90px;
  }

  .score-text {
    font-size: 1.5rem;
  }

  .results-info {
    padding: 20px;
  }

  .results-info p {
    font-size: 1rem;
    margin: 10px 0;
  }

  .pass-text {
    font-size: 1.2rem;
  }

  .badge-notification {
    padding: 20px;
  }

  .badge-icon {
    font-size: 2.5rem;
    margin-bottom: 12px;
  }

  .badge-text {
    font-size: 1.1rem;
  }

  .badge-name {
    font-size: 1rem;
  }

  .results-actions {
    gap: 12px;
  }

  .retry-btn, .close-btn {
    padding: 12px 16px;
    font-size: 0.95rem;
    min-height: 44px;
  }

  .no-quizzes {
    padding: 40px 20px;
    font-size: 1rem;
  }
}
</style>
