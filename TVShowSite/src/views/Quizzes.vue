<template>
  <div id="quizzes-page">
    <!-- Galvenes sadaļa -->
    <HeroBand variant="quizzes">
      <h1>{{ t('quizzes') }}</h1>
      <p class="subtitle">{{ t('testYourKnowledge') }}</p>
    </HeroBand>

    <div class="quizzes-container">
      <!-- Ielādes stāvoklis -->
      <div v-if="loading" class="loading-spinner">
        <div class="spinner"></div>
        <p>{{ t('loading') }}</p>
      </div>

      <!-- Viktorīnas pildīšanas režīms -->
      <div v-else-if="activeQuiz && !showResults" class="quiz-taker">
        <div class="quiz-header">
          <button type="button" class="back-btn" @click.stop="backToList">
            <SvgIcon name="arrow-left" :size="16" /> {{ t('back') }}
          </button>
          <h2>
            <SvgIcon v-if="activeQuiz.icon_name" :name="activeQuiz.icon_name" :size="28" />
            {{ activeQuiz.title }}
          </h2>
          <div class="progress-info">
            {{ currentQuestionIndex + 1 }} / {{ activeQuiz.questions.length }}
          </div>
        </div>

        <!-- Pašreizējais jautājums -->
        <div class="question-container">
          <h3 class="question-text">{{ currentQuestion.question_text }}</h3>
          
          <div class="options">
            <template v-for="letter in ['a','b','c','d','e','f','g','h']" :key="letter">
              <label v-if="currentQuestion[`option_${letter}`]" class="option-label">
                <input 
                  type="radio" 
                  :name="`question-${currentQuestion.id}`"
                  :value="letter.toUpperCase()"
                  v-model="answers[currentQuestion.id]"
                  class="option-input"
                />
                <span class="option-text">{{ currentQuestion[`option_${letter}`] }}</span>
              </label>
            </template>
          </div>

          <div class="question-nav">
            <button 
              type="button"
              class="nav-btn prev-btn" 
              @click.stop="previousQuestion" 
              :disabled="currentQuestionIndex === 0"
            >
              {{ t('previous') }}
            </button>

            <button 
              v-if="currentQuestionIndex < activeQuiz.questions.length - 1"
              type="button"
              class="nav-btn next-btn" 
              @click.stop="nextQuestion"
            >
              {{ t('next') }}
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

        <!-- Jautājuma indikators -->
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

      <!-- Rezultātu modālais logs -->
      <div v-else-if="showResults && quizResult" class="modal-overlay quiz-state-overlay" @click.self="handleResultsClose">
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
              <p v-if="quizResult.passed" class="pass-text">{{ t('youPassed') }}!</p>
              <p v-else class="fail-text">{{ t('keepTrying') }}</p>
            </div>

            <!-- Žetonu paziņojumi -->
            <template v-if="quizResult.badgesAwarded && quizResult.badgesAwarded.length">
              <div
                v-for="badge in quizResult.badgesAwarded"
                :key="badge.type"
                class="badge-notification"
                :class="badge.type"
              >
                <div class="badge-icon">
                  <SvgIcon :name="badge.type === 'secret' ? 'star' : 'badge'" :size="48" />
                </div>
                <p class="badge-text">
                  {{ badge.type === 'secret' ? t('secretBadgeUnlocked') : t('badgeEarned') + '!' }}
                </p>
                <p class="badge-name">{{ badge.name }}</p>
              </div>
            </template>

            <!-- Kosmētikas paziņojumi -->
            <template v-if="quizResult.cosmeticsAwarded && quizResult.cosmeticsAwarded.length">
              <div
                v-for="cosmetic in quizResult.cosmeticsAwarded"
                :key="cosmetic.id"
                class="cosmetic-notification"
                :class="cosmetic.rarity"
              >
                <div class="cosmetic-unlock-icon">
                  <SvgIcon :name="getEffectIcon(cosmetic.effect_key, cosmetic.type)" :size="38" />
                </div>
                <p class="cosmetic-unlock-text">{{ t('newCosmeticUnlocked') }}</p>
                <p class="cosmetic-unlock-name">{{ getCosmeticName(cosmetic) }}</p>
                <span class="cosmetic-rarity-tag" :class="cosmetic.rarity">{{ getRarityLabel(cosmetic.rarity) }}</span>
              </div>
            </template>

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

      <!-- Gaidīšanas laika modālais logs -->
      <div v-if="showCooldownModal && cooldownInfo" class="modal-overlay" @click.self="closeCooldownModal">
        <div class="modal-content cooldown-modal">
          <div class="cooldown-header">
            <SvgIcon name="clock" :size="28" />
            <h2>{{ t('quizLockedTitle') || 'Quiz Temporarily Locked' }}</h2>
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

      <!-- Administratora viktorīnas izveides modālais logs -->
      <div v-if="showAdminPanel" class="modal-overlay" @click.self="closeAdminPanel">
        <div class="modal-content admin-quiz-modal">
          <div class="admin-modal-header">
            <h2>{{ t('createNewQuiz') }}</h2>
            <button type="button" class="close-x-btn" @click.stop="closeAdminPanel">✕</button>
          </div>

          <div class="admin-form">
            <!-- Pamatinformācija -->
            <div class="admin-section">
              <h3>{{ t('quizDetails') }}</h3>
              <div class="form-row">
                <label>{{ t('title') }} *</label>
                <input v-model="adminForm.title" type="text" class="admin-input" placeholder="Quiz title" />
              </div>
              <div class="form-row">
                <label>{{ t('description') }}</label>
                <textarea v-model="adminForm.description" class="admin-input admin-textarea" placeholder="Short description…" rows="2"></textarea>
              </div>
              <div class="form-grid-2">
                <div class="form-row">
                  <label>{{ t('category') }}</label>
                  <select v-model="adminForm.category" class="admin-input">
                    <option v-for="cat in categories.filter(c => c.key !== 'all')" :key="cat.key" :value="cat.key">{{ cat.localLabel || cat.key }}</option>
                    <option value="__custom__">＋ Add new category…</option>
                  </select>
                  <template v-if="adminForm.category === '__custom__'">
                    <div class="custom-cat-fields">
                      <input v-model="adminForm.newCategoryLabel" type="text" class="admin-input" :placeholder="t('categoryName')" />
                      <input v-model="adminForm.newCategoryIcon" type="text" class="admin-input" :placeholder="t('iconName')" />
                    </div>
                  </template>
                </div>
                <div class="form-row">
                  <label>{{ t('difficulty') }}</label>
                  <select v-model="adminForm.difficulty" class="admin-input">
                    <option value="easy">{{ t('easy') }}</option>
                    <option value="medium">{{ t('medium') }}</option>
                    <option value="hard">{{ t('hard') }}</option>
                  </select>
                </div>
              </div>
              <div class="form-grid-2">
                <div class="form-row">
                  <label>{{ t('iconName') }}</label>
                  <input v-model="adminForm.icon_name" type="text" class="admin-input" :placeholder="t('iconName')" />
                </div>
                <div class="form-row">
                  <label>{{ t('tmdbSeriesId') }}</label>
                  <input v-model="adminForm.tmdb_series_id" type="number" class="admin-input" :placeholder="t('leaveBlankCustomImage')" />
                </div>
              </div>
              <div class="form-row">
                <label>{{ t('badge') }} <span class="form-hint">({{ t('thisQuizAwardsBadge') }})</span></label>
                <select v-model="adminForm.badge_name" class="admin-input" @change="onDefaultBadgeSelect">
                  <option value="">— Select badge —</option>
                  <option v-for="b in standaloneBadges" :key="b.id" :value="b.name">{{ b.name }}</option>
                </select>
                <p v-if="!standaloneBadges.length" class="form-hint" style="color:#e57373;margin-top:4px">{{ t('noBadgesYetCreate') }}</p>
              </div>

              <!-- Attēla augšupielāde -->
              <div class="form-row">
                <label>{{ t('quizImage') }}</label>
                <input
                  type="file"
                  accept="image/*"
                  class="admin-input"
                  @change="handleQuizImageFile"
                />
                <div v-if="adminForm.quiz_image" class="img-upload-preview">
                  <img :src="`/assets/quiz_images/${adminForm.quiz_image}`" alt="Preview" />
                  <button type="button" class="img-clear-btn" @click.stop="adminForm.quiz_image = ''">✕ Remove</button>
                </div>
              </div>

              <!-- Žetona pārslēgs -->
              <label class="toggle-row" style="margin-top:4px">
                <input type="checkbox" v-model="adminForm.hasBadge" />
                <span>This quiz awards a badge <span class="form-hint">(disable for quizzes with no badge reward)</span></span>
              </label>
            </div>

            <!-- Žetona noteikumi (tikai, ja hasBadge ir ieslēgts) -->
            <div v-if="adminForm.hasBadge" class="admin-section">
              <h3>Badge Rules</h3>

              <!-- Veiktspējas žetonu pārslēgs -->
              <label class="toggle-row">
                <input type="checkbox" v-model="adminForm.badgeRules.performance.enabled" />
                <span>Performance-based badges <span class="form-hint">(badge awarded based on score — first matching tier wins)</span></span>
              </label>
              <template v-if="adminForm.badgeRules.performance.enabled">
                <div
                  v-for="(tier, ti) in adminForm.badgeRules.performance.tiers"
                  :key="ti"
                  class="badge-tier-block"
                >
                  <div class="tier-header">
                    <span class="tier-num">Tier {{ ti + 1 }}</span>
                    <button type="button" class="remove-q-btn" @click.stop="removePerformanceTier(ti)" :disabled="adminForm.badgeRules.performance.tiers.length === 1">✕</button>
                  </div>
                  <div class="form-grid-2">
                    <div class="form-row">
                      <label>Min score (%) to earn</label>
                      <input v-model.number="tier.minScore" type="number" min="0" max="100" class="admin-input" placeholder="70" />
                    </div>
                    <div class="form-row">
                      <label>Badge</label>
                      <select v-model="tier.badgeName" class="admin-input" @change="onTierBadgeSelect(tier)">
                        <option value="">— Select badge —</option>
                        <option v-for="b in standaloneBadges" :key="b.id" :value="b.name">{{ b.name }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-row">
                    <label>Badge Image <span class="form-hint">(optional custom image for this badge)</span></label>
                    <input type="file" accept="image/*" class="admin-input" @change="e => handleBadgeImageFile(e, tier, 'badgeImage')" />
                    <div v-if="tier.badgeImage" class="img-upload-preview">
                      <img :src="`/assets/badges/${tier.badgeImage}`" alt="Preview" />
                      <button type="button" class="img-clear-btn" @click.stop="tier.badgeImage = ''">✕ Remove</button>
                    </div>
                  </div>
                </div>
                <button type="button" class="add-q-btn" style="align-self:flex-start" @click.stop="addPerformanceTier">+ Add tier</button>
                <p class="form-hint" style="margin:0">Tiers are evaluated highest→lowest; the first one the user qualifies for is awarded.</p>
              </template>

              <!-- Slepeno žetonu pārslēgs -->
              <label class="toggle-row">
                <input type="checkbox" v-model="adminForm.badgeRules.secrets.enabled" />
                <span>Secret badges <span class="form-hint">(awarded for picking a specific answer on a question)</span></span>
              </label>
              <template v-if="adminForm.badgeRules.secrets.enabled">
                <div
                  v-for="(cond, ci) in adminForm.badgeRules.secrets.conditions"
                  :key="ci"
                  class="badge-tier-block"
                >
                  <div class="tier-header">
                    <span class="tier-num">Condition {{ ci + 1 }}</span>
                    <button type="button" class="remove-q-btn" @click.stop="removeSecretCondition(ci)">✕</button>
                  </div>
                  <div class="form-grid-2">
                    <div class="form-row">
                      <label>Question # (1–{{ adminForm.questions.length }})</label>
                      <input v-model.number="cond.questionIndex" type="number" min="1" :max="adminForm.questions.length" class="admin-input" />
                    </div>
                    <div class="form-row">
                      <label>Required answer</label>
                      <select v-model="cond.answer" class="admin-input">
                        <option v-for="l in ['A','B','C','D','E','F','G','H']" :key="l" :value="l">{{ l }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-row">
                    <label>Badge</label>
                    <select v-model="cond.badgeName" class="admin-input" @change="onCondBadgeSelect(cond)">
                      <option value="">— Select badge —</option>
                      <option v-for="b in standaloneBadges" :key="b.id" :value="b.name">{{ b.name }}</option>
                    </select>
                  </div>
                  <div class="form-row">
                    <label>Badge Image <span class="form-hint">(optional custom image for this badge)</span></label>
                    <input type="file" accept="image/*" class="admin-input" @change="e => handleBadgeImageFile(e, cond, 'badgeImage')" />
                    <div v-if="cond.badgeImage" class="img-upload-preview">
                      <img :src="`/assets/badges/${cond.badgeImage}`" alt="Preview" />
                      <button type="button" class="img-clear-btn" @click.stop="cond.badgeImage = ''">✕ Remove</button>
                    </div>
                  </div>
                </div>
                <button type="button" class="add-q-btn" style="align-self:flex-start" @click.stop="addSecretCondition">+ Add condition</button>
              </template>
            </div>

            <!-- Jautājumi -->
            <div class="admin-section">
              <div class="questions-header">
                <h3>Questions</h3>
                <button type="button" class="add-q-btn" @click.stop="addQuestion">+ Add Question</button>
              </div>

              <div v-for="(q, idx) in adminForm.questions" :key="idx" class="question-block">
                <div class="q-block-header">
                  <span class="q-num">Q{{ idx + 1 }}</span>
                  <button type="button" class="remove-q-btn" @click.stop="removeQuestion(idx)" :disabled="adminForm.questions.length === 1">✕</button>
                </div>
                <div class="form-row">
                  <input v-model="q.question_text" type="text" class="admin-input" :placeholder="`Question ${idx + 1}`" />
                </div>
                <div class="options-grid">
                  <label
                    v-for="(optVal, optIdx) in q.options"
                    :key="optIdx"
                    class="opt-row"
                    :class="{ correct: q.correct_answer === String.fromCharCode(65 + optIdx) }"
                  >
                    <input
                      type="radio"
                      :name="`correct-${idx}`"
                      :value="String.fromCharCode(65 + optIdx)"
                      v-model="q.correct_answer"
                    />
                    <span class="opt-letter">{{ String.fromCharCode(65 + optIdx) }}</span>
                    <input
                      v-model="q.options[optIdx]"
                      type="text"
                      class="admin-input opt-input"
                      :placeholder="`Option ${String.fromCharCode(65 + optIdx)}`"
                    />
                    <button
                      v-if="q.options.length > 2"
                      type="button"
                      class="remove-opt-btn"
                      @click.stop="q.options.splice(optIdx, 1); if (q.correct_answer > String.fromCharCode(64 + q.options.length)) q.correct_answer = 'A'"
                      title="Remove option"
                    >✕</button>
                  </label>
                </div>
                <button
                  v-if="q.options.length < 8"
                  type="button"
                  class="add-q-btn"
                  style="align-self:flex-start; margin-bottom:8px"
                  @click.stop="q.options.push('')"
                >+ Add Option</button>
                <div class="form-row">
                  <input v-model="q.explanation" type="text" class="admin-input" placeholder="Explanation (optional)" />
                </div>
              </div>
            </div>

            <p v-if="adminError" class="admin-error">{{ adminError }}</p>

            <div class="admin-actions">
              <button type="button" class="cancel-btn" @click.stop="closeAdminPanel">{{ t('cancel') }}</button>
              <button type="button" class="save-quiz-btn" @click.stop="saveNewQuiz" :disabled="adminSaving">
                {{ adminSaving ? t('savingQuiz') : t('createQuiz') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Administratora žetona izveides modālais logs -->
      <div v-if="showBadgePanel" class="modal-overlay" @click.self="closeBadgePanel">
        <div class="modal-content admin-quiz-modal">
          <div class="admin-modal-header">
            <h2>{{ t('manageBadges') }}</h2>
            <button type="button" class="close-x-btn" @click.stop="closeBadgePanel">✕</button>
          </div>
          <div class="admin-form">
            <div class="admin-section">
              <h3>Create New Badge</h3>
              <div class="form-row">
                <label>Name *</label>
                <input v-model="badgeForm.name" type="text" class="admin-input" placeholder="Badge name" />
              </div>
              <div class="form-row">
                <label>Description</label>
                <textarea v-model="badgeForm.description" class="admin-input admin-textarea" rows="2" placeholder="Short description (optional)"></textarea>
              </div>
              <div class="form-row">
                <label>Badge Image</label>
                <input type="file" accept="image/*" class="admin-input" @change="e => handleBadgeImageFile(e, badgeForm, 'image')" />
                <div v-if="badgeForm.image" class="img-upload-preview">
                  <img :src="`/assets/badges/${badgeForm.image}`" alt="Preview" />
                  <button type="button" class="img-clear-btn" @click.stop="badgeForm.image = ''">✕ Remove</button>
                </div>
              </div>
              <p v-if="badgeError" class="admin-error">{{ badgeError }}</p>
              <div class="admin-actions" style="margin-top:8px">
                <button type="button" class="save-quiz-btn" @click.stop="saveNewBadge" :disabled="badgeSaving">
                  {{ badgeSaving ? t('creating') : t('createBadge') }}
                </button>
              </div>
            </div>

            <div class="admin-section" v-if="standaloneBadges.length">
              <h3>Existing Badges</h3>
              <div v-for="badge in standaloneBadges" :key="badge.id" class="badge-tier-block">
                <div class="tier-header">
                  <div style="display:flex;align-items:center;gap:10px">
                    <img v-if="badge.image" :src="`/assets/badges/${badge.image}`" class="badge-thumb" alt="" />
                    <div>
                      <strong>{{ badge.name }}</strong>
                      <p v-if="badge.description" class="form-hint" style="margin:0">{{ badge.description }}</p>
                    </div>
                  </div>
                  <div style="display:flex;gap:6px">
                    <button type="button" class="add-q-btn" @click.stop="awardBadgeToUser(badge.id)">Award</button>
                    <button type="button" class="remove-q-btn" @click.stop="deleteBadge(badge.id)">✕</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- VIKTORĪNU SARAKSTA SKATS -->
      <template v-if="!activeQuiz">

        <!-- Dienas viktorīnas sadaļa -->
        <div v-if="dailyQuiz" class="daily-quiz-section">
          <div class="section-label">
            <SvgIcon name="bolt" :size="20" />
            <span>{{ t('dailyQuiz') }}</span>
          </div>
          <div class="daily-quiz-card" :class="{ 'login-required': !isLoggedIn }" @click="startQuiz(dailyQuiz)">
            <div class="daily-poster" :style="getPosterStyle(dailyQuiz)">
              <div class="daily-poster-overlay"></div>
              <div class="daily-badges">
                <span class="diff-badge" :class="dailyQuiz.difficulty || 'medium'">{{ t(dailyQuiz.difficulty || 'medium') }}</span>
              </div>
            </div>
            <div class="daily-info">
              <div class="daily-title-row">
                <SvgIcon :name="dailyQuiz.icon_name || 'question'" :size="24" />
                <h3>{{ dailyQuiz.title }}</h3>
              </div>
              <p class="daily-desc">{{ dailyQuiz.description }}</p>
              <div class="daily-meta">
                <span class="meta-item"><SvgIcon name="users" :size="14" /> {{ dailyQuiz.completion_count || 0 }}</span>
                <span class="meta-item"><SvgIcon name="question" :size="14" /> {{ dailyQuiz.question_count || 0 }} {{ t('questions') }}</span>
              </div>
              <button type="button" class="daily-start-btn" :disabled="!isLoggedIn">
                {{ isLoggedIn ? t('takeQuiz') : t('loginToTakeQuiz') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Kategoriju cilnes -->
        <div class="controls-container quiz-filter-panel">
          <div class="controls-wrapper quiz-filter-wrapper">
            <div class="filter-controls quiz-filter-row">
              <label>{{ t('category') }}</label>
            <div class="category-tabs">
              <button 
                v-for="cat in categories" :key="cat.key"
                type="button"
                class="cat-tab" 
                :class="{ active: selectedCategory === cat.key }"
                @click="selectedCategory = cat.key"
              >
                <SvgIcon :name="cat.icon" :size="16" />
                <span>{{ t(cat.label) }}</span>
              </button>
            </div>
            </div>
            <div class="filter-controls quiz-filter-row">
              <label>{{ t('difficulty') }}</label>
              <div class="difficulty-filter">
                <button 
                  v-for="diff in difficulties" :key="diff.key"
                  type="button"
                  class="diff-tab"
                  :class="{ active: selectedDifficulty === diff.key, [diff.key]: true }"
                  @click="selectedDifficulty = diff.key"
                >
                  {{ t(diff.label) }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Viktorīnu režģis -->
        <div class="quizzes-grid">
          <div v-if="filteredQuizzes.length === 0" class="no-quizzes">
            <SvgIcon name="question" :size="48" />
            <p>{{ t('noQuizzesAvailable') }}</p>
          </div>

          <div 
            v-for="quiz in filteredQuizzes" 
            :key="quiz.id" 
            class="quiz-card"
            :class="{ 
              'locked': isLocked(quiz),
              'completed': userBadges[quiz.id],
              'login-required': !isLoggedIn
            }"
            @click="startQuiz(quiz)"
          >
            <!-- Kartītes plakāts/galvene -->
            <div class="card-poster" :style="getPosterStyle(quiz)">
              <div class="card-poster-overlay"></div>

              <!-- Bloķēšanas pārklājuma stūra žetons -->
              <div v-if="isLocked(quiz)" class="lock-corner">
                <SvgIcon name="lock" :size="16" />
                <span>{{ Math.ceil(quizLockStatus[quiz.id].hoursRemaining) }}h</span>
              </div>

              <!-- Žetonu rinda uz plakāta -->
              <div class="card-badges">
                <span class="cat-badge">{{ t(quiz.category || 'series') }}</span>
                <span class="diff-badge" :class="quiz.difficulty || 'medium'">{{ t(quiz.difficulty || 'medium') }}</span>
              </div>
            </div>

            <!-- Kartītes saturs -->
            <div class="card-body">
              <div class="card-title-row">
                <SvgIcon :name="quiz.icon_name || 'question'" :size="20" />
                <h3>{{ quiz.title }}</h3>
              </div>
              <p class="card-desc">{{ quiz.description }}</p>

              <div class="card-meta">
                <span class="meta-item" :title="t('completedBy')">
                  <SvgIcon name="users" :size="14" />
                  {{ quiz.completion_count || 0 }}
                </span>
                <span class="meta-item">
                  <SvgIcon name="question" :size="14" />
                  {{ quiz.question_count || 0 }}
                </span>

                <!-- Žetona ikona: iegūta vai pelēkota -->
                <span class="badge-indicator" :class="{ earned: userBadges[quiz.id] }">
                  <SvgIcon name="badge" :size="18" />
                </span>
              </div>

              <button 
                type="button" 
                class="card-btn"
                :disabled="!isLoggedIn || userBadges[quiz.id] || isLocked(quiz)"
              >
                <template v-if="!isLoggedIn">
                  <SvgIcon name="lock" :size="16" /> {{ t('loginToTakeQuiz') }}
                </template>
                <template v-else-if="userBadges[quiz.id]">
                  <SvgIcon name="check" :size="16" /> {{ t('completed') }}
                </template>
                <template v-else-if="isLocked(quiz)">
                  <SvgIcon name="lock" :size="16" /> {{ Math.ceil(quizLockStatus[quiz.id].hoursRemaining) }}h
                </template>
                <template v-else>
                  {{ t('takeQuiz') }}
                </template>
              </button>

              <button
                v-if="isAdmin"
                type="button"
                class="admin-delete-btn"
                @click.stop="deleteQuiz(quiz.id)"
                title="Delete quiz"
              >
                <SvgIcon name="trash" :size="14" /> Delete
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { getTranslation, getCurrentLanguage } from '@/services/translations.js'
import SvgIcon from '@/components/SvgIcon.vue'
import HeroBand from '@/components/HeroBand.vue'

const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';

const EFFECT_COPY = {
  particle_sparkle: { en: 'Sparkle Trail', lv: 'Dzirksteļu pēda' },
  particle_fire: { en: 'Fire Trail', lv: 'Uguns pēda' },
  particle_snow: { en: 'Snow Trail', lv: 'Sniega pēda' },
  glow_smooth: { en: 'Smooth Glow', lv: 'Maigs mirdzums' },
  glow_rainbow: { en: 'Rainbow Glow', lv: 'Varavīksnes mirdzums' },
  particle_fairydust: { en: 'Fairy Dust', lv: 'Pasaku putekļi' },
  particle_bubble: { en: 'Bubble Trail', lv: 'Burbuļu pēda' },
  smooth_wavy: { en: 'Wavy Background', lv: 'Viļņots fons' },
  flowing_ribbons: { en: 'Flowing Ribbons', lv: 'Plūstošas lentes' },
  rainbow_cursor: { en: 'Rainbow Cursor', lv: 'Varavīksnes kursors' },
  canvas_cursor: { en: 'Canvas Cursor', lv: 'Audekla kursors' },
  fluid_cursor: { en: 'Fluid Cursor', lv: 'Plūstošs kursors' },
  particles_stars: { en: 'Star Field', lv: 'Zvaigžņu lauks' },
  particles_bubbles: { en: 'Bubble Field', lv: 'Burbuļu lauks' },
  particles_fireflies: { en: 'Fireflies', lv: 'Spīdvaboles' },
  pattern_dots: { en: 'Dot Pattern', lv: 'Punktu raksts' },
  pattern_waves: { en: 'Wave Pattern', lv: 'Viļņu raksts' },
  pattern_grid: { en: 'Grid Pattern', lv: 'Režģa raksts' }
};

const EFFECT_ICONS = {
  particle_sparkle: 'sparkle',
  particle_fire: 'bonfire',
  particle_snow: 'snowflake',
  glow_smooth: 'glow',
  glow_rainbow: 'rainbow',
  particle_fairydust: 'magic',
  particle_bubble: 'drops',
  smooth_wavy: 'soundwave',
  flowing_ribbons: 'planet3',
  rainbow_cursor: 'rainbow',
  canvas_cursor: 'magic',
  fluid_cursor: 'drops',
  particles_stars: 'stars',
  particles_bubbles: 'cloud-drops',
  particles_fireflies: 'lightning',
  pattern_dots: 'star-rings',
  pattern_waves: 'water',
  pattern_grid: 'planet3'
};

const RARITY_KEYS = {
  common: 'rarityCommon',
  rare: 'rarityRare',
  epic: 'rarityEpic',
  legendary: 'rarityLegendary'
};

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
      showCooldownModal: false,
      selectedCategory: 'all',
      selectedDifficulty: 'all',
      tmdbPosters: {},
      isAdmin: false,
      showAdminPanel: false,
      showBadgePanel: false,
      standaloneBadges: [],
      badgeForm: { name: '', description: '', image: '', awardToUserId: '' },
      badgeSaving: false,
      badgeError: '',
      adminForm: {
        title: '',
        description: '',
        icon_name: 'question',
        category: 'series',
        newCategoryLabel: '',
        newCategoryIcon: 'question',
        difficulty: 'medium',
        tmdb_series_id: '',
        quiz_image: '',
        hasBadge: false,
        badge_name: '',
        badge_image: '',
        badgeRules: {
          performance: { enabled: false, tiers: [{ minScore: 70, badgeName: '', badgeImage: '' }] },
          secrets: { enabled: false, conditions: [{ questionIndex: 1, answer: 'A', badgeName: '', badgeImage: '' }] }
        },
        questions: [
          { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', explanation: '' }
        ]
      },
      adminSaving: false,
      adminError: '',
      categories: [
        { key: 'all', label: 'allCategories', icon: 'list' },
        { key: 'series', label: 'seriesCategory', icon: 'tv', localLabel: 'Series' },
        { key: 'tv_history', label: 'tvHistoryCategory', icon: 'history', localLabel: 'TV History' },
        { key: 'directors', label: 'directorsCategory', icon: 'clapperboard', localLabel: 'Directors' },
        { key: 'actors', label: 'actorsCategory', icon: 'mask-happy', localLabel: 'Actors' },
      ],
      difficulties: [
        { key: 'all', label: 'allDifficulties' },
        { key: 'easy', label: 'easy' },
        { key: 'medium', label: 'medium' },
        { key: 'hard', label: 'hard' },
      ],
    };
  },
  components: { SvgIcon, HeroBand },
  computed: {
    currentQuestion() {
      if (!this.activeQuiz || !this.activeQuiz.questions) return {};
      return this.activeQuiz.questions[this.currentQuestionIndex] || {};
    },
    dailyQuiz() {
      if (!this.quizzes.length) return null;
      const today = new Date();
      const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
      return this.quizzes[dayOfYear % this.quizzes.length];
    },
    filteredQuizzes() {
      return this.quizzes.filter(q => {
        if (this.selectedCategory !== 'all' && (q.category || 'series') !== this.selectedCategory) return false;
        if (this.selectedDifficulty !== 'all' && (q.difficulty || 'medium') !== this.selectedDifficulty) return false;
        return true;
      });
    },
    isLoggedIn() {
      const auth = JSON.parse(localStorage.getItem('auth'));
      return Boolean(auth?.loggedIn && auth?.user?.id);
    }
  },
  methods: {
    t(key) {
      return getTranslation(key, this.currentLanguage);
    },
    getEffectIcon(effectKey, type) {
      return EFFECT_ICONS[effectKey] || (type === 'cursor_trail' ? 'sparkle' : 'palette');
    },
    getCosmeticName(cosmetic) {
      const copy = EFFECT_COPY[cosmetic?.effect_key];
      if (!copy) return cosmetic?.name || '';
      return copy[this.currentLanguage] || copy.en || cosmetic?.name || '';
    },
    getRarityLabel(rarity) {
      return this.t(RARITY_KEYS[rarity] || 'rarityCommon');
    },
    isLocked(quiz) {
      return this.quizLockStatus[quiz.id] && !this.quizLockStatus[quiz.id].canRetake;
    },
    getTmdbPoster(tmdbId) {
      if (!tmdbId) return '';
      if (this.tmdbPosters[tmdbId]) return this.tmdbPosters[tmdbId];
      return `${TMDB_IMG}/placeholder.jpg`; // will be populated async
    },
    getPosterStyle(quiz) {
      if (quiz.quiz_image) {
        return { backgroundImage: `url(/assets/quiz_images/${quiz.quiz_image})` };
      }
      if (quiz.tmdb_series_id && this.tmdbPosters[quiz.tmdb_series_id]) {
        return { backgroundImage: `url(${this.tmdbPosters[quiz.tmdb_series_id]})` };
      }
      return {};
    },
    async fetchTmdbPosters() {
      const ids = [...new Set(this.quizzes.map(q => q.tmdb_series_id).filter(Boolean))];
      for (const id of ids) {
        try {
          const res = await fetch(`/api/tmdb/series/${id}?lang=${encodeURIComponent(this.currentLanguage)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.backdrop_path) {
              this.tmdbPosters[id] = `${TMDB_IMG}${data.backdrop_path}`;
            } else if (data.poster_path) {
              this.tmdbPosters[id] = `${TMDB_IMG}${data.poster_path}`;
            }
          }
        } catch (e) { /* Ignorēt */ }
      }
    },
    async fetchQuizzes() {
      try {
        const res = await fetch('/api/quizzes');
        if (!res.ok) throw new Error('Failed to fetch quizzes');
        this.quizzes = await res.json();
        
        // Iegūst lietotāja nopelnītos žetonus un bloķēšanas statusu
        const auth = JSON.parse(localStorage.getItem('auth'));
        if (auth?.user?.id) {
          this.isAdmin = auth.user.role === 'admin';
          await this.fetchUserBadges(auth.user.id);
          await this.fetchQuizLockStatus(auth.user.id);
          if (this.isAdmin) this.fetchStandaloneBadges();
        }

        // Automātiski atrod pielāgotās kategorijas no ielādētajām viktorīnām
        const knownKeys = new Set(this.categories.map(c => c.key));
        for (const quiz of this.quizzes) {
          const cat = quiz.category;
          if (cat && !knownKeys.has(cat)) {
            this.categories.push({ key: cat, label: cat, icon: 'question', localLabel: cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) });
            knownKeys.add(cat);
          }
        }

        // Iegūst TMDB plakātus
        await this.fetchTmdbPosters();
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
        badges.forEach(badge => {
          // 'default', 'pass' un 'perf' žetonu tipi atzīmē viktorīnu kā pilnībā pabeigtu
          if (!badge.badge_type || badge.badge_type === 'default' || badge.badge_type === 'pass' || badge.badge_type === 'perf') {
            this.userBadges[badge.quiz_id] = true;
          }
        });
      } catch (err) {
        console.error('Error fetching user badges:', err);
      }
    },
    async fetchQuizLockStatus(userId) {
      try {
        for (const quiz of this.quizzes) {
          const res = await fetch(`/api/quizzes/${quiz.id}/cooldown-status`, {
            headers: { 'Authorization': userId.toString() }
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
        if (!auth?.user?.id) return true;
        const res = await fetch(`/api/quizzes/${quizId}/cooldown-status`, {
          headers: { 'Authorization': auth.user.id.toString() }
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
        return true;
      }
    },
    async startQuiz(quiz) {
      if (!this.isLoggedIn) {
        this.$alert(this.t('loginToTakeQuiz'));
        return;
      }
      if (this.userBadges[quiz.id]) return;
      if (this.isLocked(quiz)) {
        this.cooldownInfo = this.quizLockStatus[quiz.id];
        this.showCooldownModal = true;
        return;
      }
      try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        const res = await fetch(`/api/quizzes/${quiz.id}`, {
          headers: { 'Authorization': auth.user.id.toString() }
        });
        if (!res.ok) throw new Error('Failed to fetch quiz details');
        this.activeQuiz = await res.json();
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.activeQuiz.questions.forEach(q => { this.answers[q.id] = ''; });
        this.showResults = false;
        this.quizResult = null;
      } catch (err) {
        console.error('Error starting quiz:', err);
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
      if (!this.isLoggedIn) {
        await this.$alert(this.t('loginToTakeQuiz'));
        this.backToList();
        return;
      }
      const answeredCount = Object.values(this.answers).filter(a => a && a.trim()).length;
      if (answeredCount < this.activeQuiz.questions.length) {
        this.$alert(this.t('pleaseAnswerAllQuestions'));
        return;
      }
      try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        if (!auth?.user?.id) { await this.$alert(this.t('mustBeLoggedInToSubmitQuiz')); return; }
        const res = await fetch(`/api/quizzes/${this.activeQuiz.id}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': auth.user.id.toString() },
          body: JSON.stringify({ answers: this.answers })
        });
        const responseData = await res.json();
        if (!res.ok) throw new Error(responseData.message || 'Failed to submit quiz');
        this.quizResult = responseData;
        if (this.quizResult.badgeAwarded) {
          this.userBadges[this.activeQuiz.id] = true;
        }
        // Apstrādā nokārtošanas žetonu no badgesAwarded masīva
        if (this.quizResult.badgesAwarded) {
          this.quizResult.badgesAwarded.forEach(b => {
            if (b.type === 'default' || b.type === 'pass' || b.type === 'perf') {
              this.userBadges[this.activeQuiz.id] = true;
            }
          });
        }
        this.showResults = true;
      } catch (err) {
        console.error('Error submitting quiz:', err);
        this.$alert(err.message || this.t('failedToSubmitQuiz'));
      }
    },
    retakeQuiz() {
      if (!this.quizResult.passed) {
        const auth = JSON.parse(localStorage.getItem('auth'));
        if (auth?.user?.id) {
          this.checkQuizCooldown(this.activeQuiz.id).then(canRetake => {
            if (canRetake) {
              this.answers = {};
              this.currentQuestionIndex = 0;
              this.showResults = false;
              this.quizResult = null;
            }
          });
          return;
        }
      }
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
    async handleQuizImageFile(event) {
      const file = event.target.files[0];
      if (!file) return;
      try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        const formData = new FormData();
        formData.append('quizImage', file);
        const res = await fetch('/api/admin/quiz-images', {
          method: 'POST',
          headers: { 'Authorization': auth.user.id.toString() },
          body: formData
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        this.adminForm.quiz_image = data.filename;
      } catch (err) {
        this.adminError = `${this.t('failedToUploadImage')}: ${err.message}`;
      }
    },
    async handleBadgeImageFile(event, targetObj, field) {
      const file = event.target.files[0];
      if (!file) return;
      try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        const formData = new FormData();
        formData.append('badgeImage', file);
        const res = await fetch('/api/admin/badge-images', {
          method: 'POST',
          headers: { 'Authorization': auth.user.id.toString() },
          body: formData
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        targetObj[field] = data.filename;
      } catch (err) {
        this.adminError = `${this.t('failedToUploadBadgeImage')}: ${err.message}`;
      }
    },
    openBadgePanel() {
      this.badgeForm = { name: '', description: '', image: '', awardToUserId: '' };
      this.badgeError = '';
      this.showBadgePanel = true;
      this.fetchStandaloneBadges();
    },
    closeBadgePanel() {
      this.showBadgePanel = false;
    },
    async fetchStandaloneBadges() {
      try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        const res = await fetch('/api/admin/standalone-badges', {
          headers: { 'Authorization': auth.user.id.toString() }
        });
        if (res.ok) this.standaloneBadges = await res.json();
      } catch (e) { /* Ignorēt */ }
    },
    async saveNewBadge() {
      this.badgeError = '';
      if (!this.badgeForm.name.trim()) { this.badgeError = this.t('badgeNameRequired'); return; }
      try {
        this.badgeSaving = true;
        const auth = JSON.parse(localStorage.getItem('auth'));
        const res = await fetch('/api/admin/standalone-badges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': auth.user.id.toString() },
          body: JSON.stringify({ name: this.badgeForm.name.trim(), description: this.badgeForm.description.trim(), image: this.badgeForm.image || null })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to create badge');
        this.badgeForm = { name: '', description: '', image: '', awardToUserId: '' };
        await this.fetchStandaloneBadges();
      } catch (err) {
        this.badgeError = err.message;
      } finally {
        this.badgeSaving = false;
      }
    },
    async awardBadgeToUser(badgeId) {
      const uid = await this.$prompt(this.t('enterUserIdToAwardBadge'));
      if (!uid || isNaN(Number(uid))) return;
      try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        const res = await fetch(`/api/admin/standalone-badges/${badgeId}/award`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': auth.user.id.toString() },
          body: JSON.stringify({ userId: Number(uid) })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        this.$alert(this.t('badgeAwardedSuccessfully'));
      } catch (err) {
        this.$alert(`${this.t('errorPrefix')} ${err.message}`);
      }
    },
    async deleteBadge(badgeId) {
      if (!await this.$confirm(this.t('deleteBadgeConfirm'))) return;
      try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        const res = await fetch(`/api/admin/standalone-badges/${badgeId}`, {
          method: 'DELETE',
          headers: { 'Authorization': auth.user.id.toString() }
        });
        if (!res.ok) throw new Error(this.t('failedToDeleteBadge'));
        await this.fetchStandaloneBadges();
      } catch (err) {
        this.$alert(err.message);
      }
    },
    openAdminPanel() {
      this.adminForm = {
        title: '', description: '', icon_name: 'question',
        category: 'series', newCategoryLabel: '', newCategoryIcon: 'question',
        difficulty: 'medium',
        tmdb_series_id: '', quiz_image: '', hasBadge: false, badge_name: '', badge_image: '',
        badgeRules: {
          performance: { enabled: false, tiers: [{ minScore: 70, badgeName: '', badgeImage: '' }] },
          secrets: { enabled: false, conditions: [{ questionIndex: 1, answer: 'A', badgeName: '', badgeImage: '' }] }
        },
        questions: [
          { question_text: '', options: ['', ''], correct_answer: 'A', explanation: '' }
        ]
      };
      this.adminError = '';
      this.showAdminPanel = true;
    },
    closeAdminPanel() {
      this.showAdminPanel = false;
    },
    addQuestion() {
      this.adminForm.questions.push(
        { question_text: '', options: ['', ''], correct_answer: 'A', explanation: '' }
      );
    },
    removeQuestion(idx) {
      if (this.adminForm.questions.length > 1) {
        this.adminForm.questions.splice(idx, 1);
      }
    },
    addPerformanceTier() {
      this.adminForm.badgeRules.performance.tiers.push({ minScore: 0, badgeName: '', badgeImage: '' });
    },
    removePerformanceTier(idx) {
      if (this.adminForm.badgeRules.performance.tiers.length > 1) {
        this.adminForm.badgeRules.performance.tiers.splice(idx, 1);
      }
    },
    addSecretCondition() {
      this.adminForm.badgeRules.secrets.conditions.push({ questionIndex: 1, answer: 'A', badgeName: '', badgeImage: '' });
    },
    removeSecretCondition(idx) {
      this.adminForm.badgeRules.secrets.conditions.splice(idx, 1);
    },
    onDefaultBadgeSelect() {
      const badge = this.standaloneBadges.find(b => b.name === this.adminForm.badge_name);
      this.adminForm.badge_image = badge?.image || '';
    },
    onTierBadgeSelect(tier) {
      const badge = this.standaloneBadges.find(b => b.name === tier.badgeName);
      if (badge?.image) tier.badgeImage = badge.image;
    },
    onCondBadgeSelect(cond) {
      const badge = this.standaloneBadges.find(b => b.name === cond.badgeName);
      if (badge?.image) cond.badgeImage = badge.image;
    },
    async saveNewQuiz() {
      this.adminError = '';
      const f = this.adminForm;

      // Atrisina pielāgoto kategoriju
      let resolvedCategory = f.category;
      if (f.category === '__custom__') {
        if (!f.newCategoryLabel.trim()) { this.adminError = this.t('customCategoryNameRequired'); return; }
        resolvedCategory = f.newCategoryLabel.trim().toLowerCase().replace(/\s+/g, '_');
        // Reģistrē filtra cilnēs, ja tā tur vēl nav
        if (!this.categories.find(c => c.key === resolvedCategory)) {
          this.categories.push({ key: resolvedCategory, label: resolvedCategory, icon: f.newCategoryIcon.trim() || 'question', localLabel: f.newCategoryLabel.trim() });
        }
      }

      if (!f.title.trim()) { this.adminError = this.t('titleRequired'); return; }
      if (f.questions.length === 0) { this.adminError = this.t('addAtLeastOneQuestion'); return; }
      for (const q of f.questions) {
        if (!q.question_text.trim()) {
          this.adminError = this.t('allQuestionsMustHaveText'); return;
        }
        const filledOptions = q.options.filter(o => o.trim());
        if (filledOptions.length < 2) {
          this.adminError = this.t('eachQuestionAtLeastTwoOptions'); return;
        }
        if (!q.correct_answer) {
          this.adminError = this.t('selectCorrectAnswerEachQuestion'); return;
        }
      }
      try {
        this.adminSaving = true;
        const auth = JSON.parse(localStorage.getItem('auth'));
        const res = await fetch('/api/admin/quizzes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': auth.user.id.toString() },
          body: JSON.stringify({
            title: f.title.trim(),
            description: f.description.trim(),
            icon_name: f.icon_name.trim() || 'question',
            category: resolvedCategory,
            difficulty: f.difficulty,
            tmdb_series_id: f.tmdb_series_id ? parseInt(f.tmdb_series_id) : null,
            quiz_image: f.quiz_image || null,
            badge_name: f.hasBadge ? (f.badge_name.trim() || null) : null,
            badge_rules: f.hasBadge ? { ...f.badgeRules, defaultBadgeImage: f.badge_image || null } : null,
            questions: f.questions.map(q => {
              const letters = ['a','b','c','d','e','f','g','h'];
              const mapped = { question_text: q.question_text, correct_answer: q.correct_answer, explanation: q.explanation || '' };
              letters.forEach((l, i) => { mapped[`option_${l}`] = q.options[i] || null; });
              return mapped;
            })
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to create quiz');
        this.showAdminPanel = false;
        await this.fetchQuizzes();
      } catch (err) {
        this.adminError = err.message;
      } finally {
        this.adminSaving = false;
      }
    },
    async deleteQuiz(quizId) {
      if (!await this.$confirm(this.t('deleteQuizConfirm'))) return;
      try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        const res = await fetch(`/api/admin/quizzes/${quizId}`, {
          method: 'DELETE',
          headers: { 'Authorization': auth.user.id.toString() }
        });
        if (!res.ok) throw new Error(this.t('failedToDeleteQuiz'));
        await this.fetchQuizzes();
      } catch (err) {
        this.$alert(err.message);
      }
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
    this._languageChangedHandler = async (e) => {
      this.currentLanguage = e.detail.language;
      this.tmdbPosters = {};
      await this.fetchTmdbPosters();
    };
    window.addEventListener('languageChanged', this._languageChangedHandler);
  },
  beforeUnmount() {
    window.removeEventListener('languageChanged', this._languageChangedHandler);
  }
};
</script>

<style scoped>
/* Galvenes sadaļa */
.hero {
  color: var(--text-color);
  margin-bottom: 30px;
  overflow: hidden;
}

.hero-band {
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  width: 100vw;
  background: var(--hero-gradient);
  padding: 50px 0;
  box-shadow: var(--hero-shadow);
  position: relative;
  overflow: hidden;
}

.hero-band::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.02) 28%,
    rgba(255, 255, 255, 0.1) 48%,
    rgba(255, 255, 255, 0.02) 72%,
    rgba(255, 255, 255, 0) 100%
  );
  mix-blend-mode: overlay;
  pointer-events: none;
  transform: translateX(-80%);
  animation: shimmerSlide 3200ms cubic-bezier(0.22, 0.1, 0.25, 1) infinite;
  opacity: 0.95;
}

@keyframes shimmerSlide {
  0%   { transform: translateX(-80%); opacity: 0.45; }
  50%  { transform: translateX(0%);   opacity: 1; }
  100% { transform: translateX(80%);  opacity: 0.45; }
}

.hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  text-align: center;
}

.hero-inner h1 {
  font-size: 2.2rem;
  margin: 0 0 8px 0;
  font-weight: 700;
  animation: heroIntro 880ms cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

.subtitle {
  font-size: 1rem;
  opacity: 0.85;
  margin: 0;
  color: var(--subtitle-color);
  animation: heroIntro 880ms cubic-bezier(0.2, 0.9, 0.25, 1) 100ms both;
}

@keyframes heroIntro {
  0%   { opacity: 0; transform: translateY(8px) scale(0.992); filter: blur(4px); }
  60%  { opacity: 1; transform: translateY(-2px) scale(1.02); filter: blur(0); }
  100% { opacity: 1; transform: translateY(0) scale(1);       filter: blur(0); }
}

/* Galvenais konteiners */
.quizzes-container {
  max-width: 1180px;
  margin: 28px auto 64px;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* Ielāde */
.loading-spinner { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; gap: 20px; }
.spinner { width: 44px; height: 44px; border: 3px solid rgba(255,255,255,0.2); border-top: 3px solid var(--accent-color); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* ======= DIENAS VIKTORĪNAS SADAĻA ======= */
.daily-quiz-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.section-label {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px;
  color: var(--accent-color);
}
.daily-quiz-card {
  display: grid; grid-template-columns: minmax(240px, 32%) 1fr;
  background: var(--glass-bg); border-radius: 14px; overflow: hidden;
  box-shadow: 0 18px 46px rgba(0,0,0,0.2); cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  border: 1px solid var(--surface-border);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
}
.daily-quiz-card:hover { transform: translateY(-4px); box-shadow: 0 26px 58px rgba(0,0,0,0.28); border-color: rgba(112,233,116,0.28); }
.daily-quiz-card.login-required,
.quiz-card.login-required {
  cursor: default;
}
.daily-quiz-card.login-required:hover,
.quiz-card.login-required:hover {
  transform: none;
}
.daily-poster {
  min-height: 190px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--gradient-start), var(--medium-bg-color));
  background-size: cover; background-position: center; position: relative;
}
.daily-poster-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(90deg, rgba(0,0,0,0.15) 0%, rgba(30,28,39,0.85) 100%);
}
.daily-badges { position: absolute; bottom: 10px; left: 10px; display: flex; gap: 6px; z-index: 1; }
.daily-info { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.daily-title-row { display: flex; align-items: center; gap: 10px; color: var(--text-color); }
.daily-title-row h3 { margin: 0; font-size: 1.3rem; font-weight: 700; }
.daily-desc { color: var(--subtitle-color); font-size: 0.9rem; line-height: 1.5; margin: 0; flex-grow: 1; max-width: 68ch; }
.daily-meta { display: flex; gap: 16px; margin-top: auto; flex-wrap: wrap; }
.daily-start-btn {
  align-self: flex-start; margin-top: 8px;
  background: var(--accent-color); color: var(--dark-bg-color); border: none;
  padding: 10px 24px; border-radius: 8px; font-weight: 700; font-size: 0.92rem;
  cursor: pointer; transition: background 0.2s, transform 0.2s;
}
.daily-start-btn:hover { background: #8cf590; transform: translateY(-2px); }
.daily-start-btn:disabled {
  background: var(--disabled-bg);
  color: var(--disabled-text);
  cursor: not-allowed;
  opacity: 0.75;
}

/* ======= FILTRA JOSLA ======= */
.controls-container {
  max-width: 430px;
  margin: 0 auto;
  padding: 24px;
  background: linear-gradient(180deg, var(--dark-bg-color) 0%, rgba(112, 233, 116, 0.05) 100%);
  border-radius: 12px;
  border: 1px solid rgba(112, 233, 116, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
}
.controls-wrapper {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.filter-controls {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
}
.filter-controls label {
  font-weight: 700;
  color: var(--accent-color);
  font-size: 0.95em;
  text-align: right;
}
.category-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-start;
  min-width: 0;
}
.cat-tab {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 10px; border-radius: 7px; border: 1px solid transparent;
  background: var(--glass-bg-soft); color: var(--subtitle-color);
  font-size: 0.82rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
  min-height: 34px;
}
.cat-tab:hover { border-color: var(--accent-color); color: var(--text-color); }
.cat-tab.active { background: var(--accent-color); color: var(--dark-bg-color); border-color: var(--accent-color); }
.difficulty-filter {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-start;
  min-width: 0;
  width: fit-content;
  max-width: 100%;
  box-sizing: border-box;
  padding: 8px;
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 8px;
}
.diff-tab {
  padding: 6px 10px; border-radius: 6px; border: 1px solid transparent;
  background: rgba(255,255,255,0.045); color: var(--subtitle-color);
  font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
  min-height: 32px;
}
.diff-tab:hover { border-color: var(--accent-color); }
.diff-tab.active.all { background: var(--accent-color); color: var(--dark-bg-color); border-color: var(--accent-color); }
.diff-tab.active.easy { background: #4caf50; color: #fff; border-color: #4caf50; }
.diff-tab.active.medium { background: #ff9800; color: #fff; border-color: #ff9800; }
.diff-tab.active.hard { background: #f44336; color: #fff; border-color: #f44336; }

/* ======= VIKTORĪNU REŽĢIS ======= */
.quizzes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(255px, 1fr));
  gap: 22px;
  align-items: stretch;
}
.no-quizzes {
  grid-column: 1 / -1; text-align: center; padding: 60px 20px;
  color: var(--subtitle-color); display: flex; flex-direction: column; align-items: center; gap: 12px;
}

/* ======= VIKTORĪNAS KARTĪTE ======= */
.quiz-card {
  background: var(--glass-bg); border-radius: 14px; overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 16px 38px rgba(0,0,0,0.18);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  cursor: pointer; position: relative;
  min-height: 354px;
  height: 100%;
  border: 1px solid var(--surface-border);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
}
.quiz-card:hover { transform: translateY(-5px); box-shadow: 0 24px 54px rgba(0,0,0,0.26); border-color: rgba(112,233,116,0.28); }
.quiz-card.locked { opacity: 0.55; cursor: not-allowed; }
.quiz-card.locked:hover { transform: none; box-shadow: 0 16px 38px rgba(0,0,0,0.18); }
.quiz-card.completed { border: 1.5px solid var(--accent-color); cursor: default; }
.quiz-card.completed:hover { transform: none; }

/* Kartītes plakāts */
.card-poster {
  position: relative; height: 124px;
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--medium-bg-color) 100%);
  background-size: cover; background-position: center top;
  flex: 0 0 auto;
}
.card-poster-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(30,28,39,0.88) 100%);
}
.card-badges {
  position: absolute; left: 10px; right: 10px; bottom: 10px;
  display: flex; gap: 6px; z-index: 1; flex-wrap: wrap;
}
.cat-badge, .diff-badge {
  font-size: 0.68rem; font-weight: 700; padding: 3px 8px; border-radius: 4px;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.cat-badge { background: rgba(255,255,255,0.15); color: var(--text-color); backdrop-filter: blur(4px); }
.diff-badge { color: #fff; }
.diff-badge.easy { background: rgba(76,175,80,0.85); }
.diff-badge.medium { background: rgba(255,152,0,0.85); }
.diff-badge.hard { background: rgba(244,67,54,0.85); }

/* Bloķēšanas stūra žetons */
.lock-corner {
  position: absolute; top: 8px; right: 8px; z-index: 2;
  display: flex; align-items: center; gap: 4px;
  background: rgba(0,0,0,0.7); color: #ff6b6b;
  padding: 4px 8px; border-radius: 6px;
  font-size: 0.72rem; font-weight: 700;
  backdrop-filter: blur(4px);
}

/* Kartītes saturs */
.card-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; flex: 1; width:auto; min-width: 0;}
.card-title-row { display: flex; align-items: flex-start; gap: 8px; min-height: 2.7em; }
.card-title-row .svg-icon { flex: 0 0 auto; margin-top: 1px; }
.card-title-row h3 {
  margin: 0; font-size: 1rem; font-weight: 700; color: var(--text-color); line-height: 1.3;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.card-desc {
  color: var(--subtitle-color); font-size: 0.82rem; line-height: 1.5;
  margin: 0;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  min-height: 2.46rem;
}

/* Kartītes metadatu rinda */
.card-meta {
  display: flex; align-items: center; gap: 12px; margin-top: auto;
  min-height: 22px;
}
.meta-item {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 0.75rem; color: var(--subtitle-color); font-weight: 600;
}
.badge-indicator {
  margin-left: auto; display: inline-flex; color: rgba(255,255,255,0.18);
  transition: color 0.3s, filter 0.3s;
  filter: grayscale(1);
}
.badge-indicator.earned { color: var(--accent-color); filter: none; }

/* Kartītes poga */
.card-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; margin-top: 2px; padding: 10px; border: none; border-radius: 8px;
  background: var(--accent-color); color: var(--dark-bg-color);
  font-weight: 700; font-size: 0.88rem; cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  min-height: 40px;
}
.card-btn:hover:not(:disabled) { background: #8cf590; transform: translateY(-2px); }
.card-btn:disabled { background: var(--disabled-bg); color: var(--disabled-text); cursor: not-allowed; opacity: 0.7; }
.quiz-card.completed .card-btn:disabled { background: rgba(112,233,116,0.15); color: var(--accent-color); opacity: 1; }

/* ======= VIKTORĪNAS PILDĪTĀJS ======= */
.quiz-taker {
  background: var(--glass-bg); border-radius: 16px; padding: 36px;
  max-width: 920px; width: 100%; margin: 0 auto; box-shadow: 0 24px 58px rgba(0,0,0,0.24);
  border: 1px solid var(--surface-border);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-sizing: border-box;
}
.quiz-header {
  display: grid;
  grid-template-columns: minmax(90px, 1fr) minmax(0, 2fr) minmax(90px, 1fr);
  align-items: center;
  margin-bottom: 32px; gap: 16px; padding-bottom: 20px;
  border-bottom: 1px solid var(--surface-border-strong);
}
.back-btn {
  background: none; border: none; color: var(--accent-color); cursor: pointer;
  font-size: 0.95rem; font-weight: 600; white-space: nowrap;
  display: flex; align-items: center; gap: 6px;
  transition: color 0.2s;
}
.back-btn:hover { color: #8cf590; }
.quiz-header h2 {
  margin: 0; font-size: 1.6rem; color: var(--text-color);
  display: flex; align-items: center; gap: 10px; text-align: center; justify-content: center;
  min-width: 0;
  line-height: 1.25;
}
.progress-info {
  justify-self: end;
  background: var(--glass-bg-soft); padding: 8px 16px; border-radius: 16px;
  font-weight: 600; color: var(--accent-color); font-size: 0.9rem; white-space: nowrap;
  border: 1px solid var(--surface-border);
}

/* Jautājums */
.question-container { display: flex; flex-direction: column; gap: 26px; margin-bottom: 0; }
.question-text { font-size: 1.35rem; margin: 0; color: var(--text-color); line-height: 1.6; font-weight: 600; }
.options { display: flex; flex-direction: column; gap: 12px; margin-bottom: 0; }
.option-label {
  display: flex; align-items: flex-start; gap: 14px; padding: 16px;
  background: var(--glass-bg-soft); border-radius: 10px; cursor: pointer;
  transition: all 0.2s; border: 2px solid transparent;
  min-height: 56px;
  box-sizing: border-box;
}
.option-label:hover { background: rgba(112,233,116,0.08); border-color: var(--accent-color); transform: translateX(3px); }
.option-label input:checked ~ .option-text { color: var(--accent-color); font-weight: 600; }
.option-input { flex-shrink: 0; width: 20px; height: 20px; cursor: pointer; margin-top: 2px; accent-color: var(--accent-color); }
.option-text { flex: 1; color: var(--text-color); font-size: 1rem; line-height: 1.5; }

/* Jautājumu navigācija */
.question-nav { display: flex; gap: 16px; justify-content: space-between; margin-top: 4px; }
.nav-btn, .submit-btn {
  flex: 1; padding: 14px 24px; border: 2px solid var(--accent-color);
  background: transparent; color: var(--accent-color); border-radius: 8px;
  font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.2s;
  min-height: 46px; display: flex; align-items: center; justify-content: center;
}
.nav-btn:hover:not(:disabled), .submit-btn:hover {
  background: var(--accent-color); color: var(--dark-bg-color);
  transform: translateY(-2px); box-shadow: 0 4px 12px rgba(112,233,116,0.25);
}
.nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.submit-btn { background: var(--accent-color); color: var(--dark-bg-color); }
.submit-btn:hover { background: #8cf590; }

/* Jautājumu indikatori */
.question-indicator {
  display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;
  margin-top: 30px; padding-top: 22px; border-top: 1px solid var(--surface-border);
}
.indicator-dot {
  width: 12px; height: 12px; border-radius: 50%;
  background: var(--glass-bg-soft); cursor: pointer;
  transition: all 0.2s; border: 2px solid transparent;
}
.indicator-dot.answered { background: var(--accent-color); }
.indicator-dot.active { border-color: var(--accent-color); box-shadow: 0 0 8px rgba(112,233,116,0.4); }

/* ======= MODĀLIE LOGI ======= */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: var(--overlay-bg); display: flex; align-items: center; justify-content: center;
  z-index: 1000; backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
.modal-content {
  background: var(--glass-bg-strong); border-radius: 14px; padding: 36px;
  max-width: 500px; width: 90%; box-shadow: 0 14px 44px rgba(0,0,0,0.3);
  max-height: 90vh; overflow-y: auto;
  border: 1px solid var(--surface-border);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-sizing: border-box;
}
.quiz-state-overlay {
  position: static;
  inset: auto;
  z-index: auto;
  width: auto;
  max-width: 100%;
  padding: 0;
  background: transparent;
  align-items: flex-start;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
.quiz-state-overlay .modal-content {
  width: auto;
  max-width: min(500px, 100%);
  max-height: none;
  margin: 0;
  overflow: visible;
}
.results-modal { text-align: center; }
.results-header { border-bottom: 2px solid var(--accent-color); padding-bottom: 20px; margin-bottom: 28px; }
.results-header h2 { font-size: 1.7rem; margin: 0; color: var(--text-color); font-weight: 700; }
.results-body { display: flex; flex-direction: column; gap: 24px; }

/* Rezultāts */
.score-display { display: flex; justify-content: center; padding: 24px 0; }
.score-circle {
  width: 120px; height: 120px; border-radius: 50%;
  background: var(--glass-bg-soft); display: flex; align-items: center; justify-content: center;
  border: 3px solid var(--accent-color); box-shadow: 0 8px 24px rgba(0,0,0,0.18);
}
.score-display.passed .score-circle { background: rgba(112,233,116,0.12); border-color: var(--accent-color); }
.score-text { font-size: 2.4rem; font-weight: 800; color: var(--accent-color); }

/* Rezultātu informācija */
.results-info {
  align-self: center;
  width: auto;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  color: var(--text-color);
  padding: 20px;
  background: var(--glass-bg-soft);
  border-radius: 10px;
  border: 1px solid var(--surface-border);
  overflow-wrap: anywhere;
}
.results-info p { margin: 12px 0; font-size: 1.05rem; line-height: 1.6; }
.results-info p:first-child { margin-top: 0; }
.results-info p:last-child { margin-bottom: 0; }
.pass-text { color: var(--accent-color); font-weight: 700; font-size: 1.3rem; }
.fail-text { color: var(--subtitle-color); font-weight: 600; font-size: 1.1rem; }

/* Žetona paziņojums */
.badge-notification {
  background: linear-gradient(135deg, rgba(112,233,116,0.12), rgba(112,233,116,0.05));
  border: 1.5px solid var(--accent-color); border-radius: 12px;
  padding: 24px; text-align: center; animation: slideIn 0.4s ease;
  align-self: stretch;
  box-sizing: border-box;
  max-width: 100%;
  min-width: 0;
}
@keyframes slideIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
.badge-icon { font-size: 3rem; margin-bottom: 10px; display: inline-block; animation: bounce 0.8s ease infinite; }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
.badge-text { font-size: 1.2rem; font-weight: 800; color: var(--accent-color); margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.8px; }
.badge-name { font-size: 0.95rem; color: var(--subtitle-color); margin: 0; font-weight: 600; }

/* Kosmētikas paziņojums */
.cosmetic-notification {
  background: linear-gradient(135deg, rgba(120, 80, 255, 0.12), rgba(120, 80, 255, 0.04));
  border: 1.5px solid #ab47bc; border-radius: 12px;
  padding: 24px; text-align: center; animation: slideIn 0.4s ease;
  align-self: stretch;
  box-sizing: border-box;
  max-width: 100%;
  min-width: 0;
}
.cosmetic-notification.rare { border-color: #42a5f5; background: linear-gradient(135deg, rgba(66, 165, 245, 0.12), rgba(66, 165, 245, 0.04)); }
.cosmetic-notification.epic { border-color: #ab47bc; background: linear-gradient(135deg, rgba(171, 71, 188, 0.12), rgba(171, 71, 188, 0.04)); }
.cosmetic-notification.legendary { border-color: #ffd54f; background: linear-gradient(135deg, rgba(255, 213, 79, 0.15), rgba(255, 213, 79, 0.05)); }
.cosmetic-unlock-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ce93d8;
  margin-bottom: 8px;
  animation: bounce 0.8s ease infinite;
}
.cosmetic-unlock-icon .svg-icon { color: currentColor; }
.cosmetic-unlock-text { font-size: 1.1rem; font-weight: 800; color: #ce93d8; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.8px; }
.cosmetic-unlock-name { font-size: 0.95rem; color: var(--subtitle-color); margin: 0 0 6px 0; font-weight: 600; overflow-wrap: anywhere; }
.cosmetic-rarity-tag { font-size: 0.7rem; padding: 2px 10px; border-radius: 10px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
.cosmetic-rarity-tag.common { color: #bdbdbd; }
.cosmetic-rarity-tag.rare { color: #42a5f5; }
.cosmetic-rarity-tag.epic { color: #ce93d8; }
.cosmetic-rarity-tag.legendary { color: #ffd54f; }

/* Rezultātu darbības */
.results-actions { display: flex; gap: 16px; align-self: center; margin-top: 20px; width: auto; max-width: 100%; min-width: 0; box-sizing: border-box; }
.retry-btn, .close-btn {
  flex: 1; padding: 14px 24px; border: none; border-radius: 8px;
  font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.2s; min-height: 46px;
  display: flex; align-items: center; justify-content: center;
  min-width: 0;
}
.retry-btn { background: var(--accent-color); color: var(--dark-bg-color); }
.results-actions .retry-btn,
.results-actions .close-btn { flex: 0 1 210px; }
.retry-btn:hover { background: #8cf590; transform: translateY(-2px); }
.close-btn { background: var(--glass-bg-soft); color: var(--text-color); border: 1.5px solid var(--accent-color); }
.close-btn:hover { background: var(--accent-color); color: var(--dark-bg-color); transform: translateY(-2px); }

/* Gaidīšanas laika modālais logs */
.cooldown-modal { text-align: center; border: 1.5px solid #ff6b6b; }
.cooldown-header { display: flex; align-items: center; justify-content: center; gap: 10px; border-bottom: 2px solid #ff6b6b; padding-bottom: 20px; margin-bottom: 24px; }
.cooldown-header h2 { font-size: 1.5rem; margin: 0; color: #ff6b6b; font-weight: 700; overflow-wrap: anywhere; }
.cooldown-body { display: flex; flex-direction: column; align-items: center; gap: 20px; }
.cooldown-message { color: var(--text-color); font-size: 1rem; line-height: 1.6; margin: 0; }
.cooldown-timer {
  width: auto;
  max-width: 100%;
  align-self: center;
  background: linear-gradient(135deg, rgba(255,107,107,0.12), rgba(255,107,107,0.05));
  border: 1.5px solid #ff6b6b; border-radius: 10px; padding: 24px;
}
.timer-display { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.timer-value { font-size: 3rem; font-weight: 800; color: #ff6b6b; }
.timer-label { font-size: 0.85rem; color: var(--subtitle-color); font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; }
.cooldown-details { width: auto; max-width: 100%; background: var(--glass-bg-soft); border: 1px solid var(--surface-border); border-radius: 8px; padding: 16px; box-sizing: border-box; }
.cooldown-details p { margin: 8px 0; font-size: 0.9rem; color: var(--text-color); }
.retry-time { color: #ff6b6b; font-weight: 700; font-size: 1rem; }
.cooldown-actions { display: flex; gap: 12px; margin-top: 12px; width: auto; max-width: 100%; }
.cooldown-actions .close-btn { background: #ff6b6b; border-color: #ff6b6b; color: #fff; flex: 0 1 auto; }
.cooldown-actions .close-btn:hover { background: #e55555; border-color: #e55555; }

/* ======= RESPONSĪVAIS IZKĀRTOJUMS ======= */
@media (max-width: 768px) {
  .hero-inner h1 { font-size: 1.8rem; }
  .quizzes-container { margin-top: 24px; gap: 22px; padding: 0 16px; }
  .daily-quiz-card { grid-template-columns: 1fr; }
  .daily-poster { width: 100%; min-height: 150px; }
  .daily-poster-overlay { background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(30,28,39,0.85) 100%); }
  .controls-container { max-width: 430px; padding: 18px; }
  .filter-controls { grid-template-columns: 1fr; gap: 8px; }
  .filter-controls label { text-align: left; }
  .category-tabs,
  .difficulty-filter { justify-content: flex-start; }
  .quizzes-grid { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
  .quiz-taker { padding: 28px; border-radius: 12px; }
  .quiz-header { grid-template-columns: 1fr; text-align: center; gap: 12px; justify-items: center; }
  .quiz-header h2 { font-size: 1.35rem; }
  .progress-info { justify-self: center; }
  .question-container { gap: 22px; }
  .question-text { font-size: 1.15rem; }
  .options { gap: 10px; }
  .option-label { padding: 14px; gap: 12px; }
  .question-nav { gap: 10px; }
  .nav-btn, .submit-btn { padding: 12px 18px; font-size: 0.9rem; min-height: 42px; }
  .modal-content { padding: 24px; margin: 16px; width: auto;}
  .quiz-state-overlay .modal-content { margin: 0; }
  .results-header h2 { font-size: 1.4rem; }
  .score-circle { width: 100px; height: 100px; }
  .score-text { font-size: 1.8rem; }
  .results-actions { flex-direction: column; gap: 12px; }
}
@media (max-width: 500px) {
  .hero-inner h1 { font-size: 1.3rem; }
  .subtitle { font-size: 0.9rem; }
  .quizzes-container { margin-top: 20px; padding: 0 12px; gap: 18px; }
  .daily-info { padding: 16px; }
  .daily-title-row h3 { font-size: 1.1rem; }
  .cat-tab { padding: 6px 8px; font-size: 0.74rem; min-height: 30px; }
  .diff-tab { padding: 5px 8px; font-size: 0.72rem; min-height: 28px; }
  .quizzes-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .card-poster { height: 90px; }
  .card-body { padding: 10px 12px 14px; gap: 6px; }
  .card-title-row { min-height: 2.5em; }
  .card-title-row h3 { font-size: 0.88rem; }
  .card-desc { font-size: 0.75rem; -webkit-line-clamp: 2; }
  .card-meta { gap: 8px; }
  .meta-item { font-size: 0.68rem; }
  .card-btn { padding: 8px; font-size: 0.8rem; }
  .quiz-taker { padding: 18px; margin: 8px; }
  .quiz-header { margin-bottom: 24px; padding-bottom: 12px; }
  .quiz-header h2 { font-size: 1.2rem; }
  .question-container { gap: 18px; }
  .question-text { font-size: 1.05rem; }
  .option-label { padding: 12px; gap: 10px; }
  .question-nav { flex-direction: column; gap: 8px; }
  .nav-btn, .submit-btn { width: 100%; padding: 12px; min-height: 42px; }
  .question-indicator { margin-top: 24px; padding-top: 16px; }
  .indicator-dot { width: 10px; height: 10px; }
  .indicator-dot.active { width: 10px; }
  .modal-content { padding: 18px; max-width: 95%; border-radius: 12px; }
  .results-info { padding: 16px; }
  .results-actions { flex-direction: column; gap: 10px; }
  .score-circle { width: 86px; height: 86px; }
  .score-text { font-size: 1.5rem; }
  .badge-notification { padding: 18px; }
  .retry-btn, .close-btn { padding: 12px; font-size: 0.92rem; }
}

.badge-thumb {
  width: 40px; height: 40px; object-fit: contain; border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.1);
}

/* Administratora dzēšana kartītē */
.admin-delete-btn {
  display: flex; align-items: center; justify-content: center; gap: 4px;
  width: 100%; margin-top: 4px; padding: 7px; border: 1.5px solid #f44336;
  background: transparent; color: #f44336; border-radius: 7px;
  font-size: 0.78rem; font-weight: 600; cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.admin-delete-btn:hover { background: #f44336; color: #fff; }

/* ======= ADMINISTRATORA VIKTORĪNAS IZVEIDES MODĀLAIS LOGS ======= */
.admin-quiz-modal {
  max-width: 720px; width: 95%; padding: 28px 32px;
  max-height: 75vh; overflow-y: auto;
  display: block;
}
.admin-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 2px solid var(--accent-color); padding-bottom: 16px; margin-bottom: 24px;
}
.admin-modal-header h2 { margin: 0; font-size: 1.45rem; color: var(--text-color); }
.close-x-btn {
  background: none; border: none; color: var(--subtitle-color); font-size: 1.2rem;
  cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: color 0.2s;
}
.close-x-btn:hover { color: var(--text-color); }

.admin-form { display: flex; flex-direction: column; gap: 24px; }
.admin-section { display: flex; flex-direction: column; gap: 14px; }
.admin-section h3 {
  margin: 0 0 6px; font-size: 1rem; font-weight: 700; color: var(--accent-color);
  text-transform: uppercase; letter-spacing: 0.8px; font-size: 0.82rem;
}
.form-row { display: flex; flex-direction: column; gap: 5px; }
.form-row label { font-size: 0.82rem; font-weight: 600; color: var(--subtitle-color); }
.form-hint { font-weight: 400; margin-left: 4px; }
.custom-cat-fields { display: flex; flex-direction: column; gap: 6px; margin-top: 6px; }

/* Pārslēgu rindas */
.toggle-row {
  display: flex; align-items: flex-start; gap: 10px;
  font-size: 0.9rem; color: var(--text-color); cursor: pointer;
  padding: 10px 12px; border-radius: 8px;
  background: var(--medium-bg-color);
  border: 1.5px solid rgba(255,255,255,0.07);
}
.toggle-row input[type="checkbox"] { margin-top: 1px; flex-shrink: 0; accent-color: var(--accent-color); width: 16px; height: 16px; cursor: pointer; }

/* Žetonu līmeņu bloki */
.badge-tier-block {
  background: var(--dark-bg-color); border-radius: 8px; padding: 12px 14px;
  display: flex; flex-direction: column; gap: 10px;
  border: 1.5px solid rgba(255,255,255,0.07);
}
.tier-header { display: flex; align-items: center; justify-content: space-between; }
.tier-num { font-size: 0.78rem; font-weight: 700; color: var(--accent-color); text-transform: uppercase; letter-spacing: 0.8px; }

/* Žetonu tipu varianti rezultātos */
.badge-notification.fail { background: linear-gradient(135deg, rgba(255,152,0,0.12), rgba(255,152,0,0.05)); border-color: #ff9800; }
.badge-notification.fail .badge-text { color: #ff9800; }
.badge-notification.secret { background: linear-gradient(135deg, rgba(156,39,176,0.12), rgba(156,39,176,0.05)); border-color: #9c27b0; }
.badge-notification.secret .badge-text { color: #9c27b0; }
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.admin-input {
  background: var(--medium-bg-color); border: 1.5px solid rgba(255,255,255,0.1);
  color: var(--text-color); border-radius: 8px; padding: 9px 12px;
  font-size: 0.92rem; width: 100%; box-sizing: border-box;
  transition: border-color 0.2s;
}
.admin-input:focus { outline: none; border-color: var(--accent-color); }
.admin-textarea { resize: vertical; min-height: 60px; }

/* Attēla augšupielādes priekšskatījums */
.img-upload-preview {
  display: flex; align-items: center; gap: 12px; margin-top: 8px;
}
.img-upload-preview img {
  width: 120px; height: 80px; object-fit: cover; border-radius: 8px;
  border: 1.5px solid var(--accent-color);
}
.img-clear-btn {
  background: none; border: 1.5px solid #f44336; color: #f44336;
  padding: 5px 12px; border-radius: 7px; font-size: 0.82rem; font-weight: 600;
  cursor: pointer; transition: background 0.2s, color 0.2s;
}
.img-clear-btn:hover { background: #f44336; color: #fff; }

/* Jautājumu veidotājs */
.questions-header { display: flex; align-items: center; justify-content: space-between; }
.add-q-btn {
  background: none; border: 1.5px solid var(--accent-color); color: var(--accent-color);
  padding: 6px 14px; border-radius: 7px; font-size: 0.82rem; font-weight: 700;
  cursor: pointer; transition: background 0.2s, color 0.2s;
}
.add-q-btn:hover { background: var(--accent-color); color: var(--dark-bg-color); }

.question-block {
  background: var(--medium-bg-color); border-radius: 10px; padding: 16px;
  display: flex; flex-direction: column; gap: 10px;
  border: 1.5px solid rgba(255,255,255,0.07);
  width:auto;
}
.q-block-header { display: flex; align-items: center; justify-content: space-between; }
.q-num { font-size: 0.78rem; font-weight: 700; color: var(--accent-color); text-transform: uppercase; letter-spacing: 0.8px; }
.remove-q-btn {
  background: none; border: none; color: #f44336; cursor: pointer;
  font-size: 0.9rem; padding: 2px 6px; border-radius: 5px; transition: background 0.2s;
}
.remove-q-btn:hover:not(:disabled) { background: rgba(244,67,54,0.15); }
.remove-q-btn:disabled { color: #555; cursor: not-allowed; }
.remove-opt-btn {
  background: none; border: none; color: #f44336; cursor: pointer;
  font-size: 0.85rem; padding: 2px 5px; border-radius: 4px; transition: background 0.2s; flex-shrink: 0;
}
.remove-opt-btn:hover { background: rgba(244,67,54,0.15); }

.options-grid { display: flex; flex-direction: column; gap: 7px; }
.opt-row {
  display: flex; align-items: center; gap: 8px;
  background: var(--dark-bg-color); border-radius: 7px; padding: 8px 10px;
  border: 1.5px solid transparent; cursor: pointer; transition: border-color 0.2s;
}
.opt-row.correct { border-color: var(--accent-color); }
.opt-row input[type="radio"] { cursor: pointer; accent-color: var(--accent-color); }
.opt-letter { font-size: 0.8rem; font-weight: 700; color: var(--subtitle-color); min-width: 16px; }
.opt-input { flex: 1; }

.admin-error { color: #f44336; font-size: 0.88rem; font-weight: 600; margin: 0; }
.admin-actions {
  display: flex; gap: 12px; justify-content: flex-end; padding-top: 8px;
  border-top: 1.5px solid rgba(255,255,255,0.08);
}
.cancel-btn {
  padding: 10px 22px; border: 1.5px solid rgba(255,255,255,0.18);
  background: none; color: var(--subtitle-color); border-radius: 8px;
  font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: border-color 0.2s, color 0.2s;
}
.cancel-btn:hover { border-color: var(--text-color); color: var(--text-color); }
.save-quiz-btn {
  padding: 10px 28px; border: none; background: var(--accent-color);
  color: var(--dark-bg-color); border-radius: 8px;
  font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: background 0.2s, transform 0.15s;
}
.save-quiz-btn:hover:not(:disabled) { background: #8cf590; transform: translateY(-2px); }
.save-quiz-btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
