<template>
  <div id="admin-panel">
    <header class="hero">
      <div class="hero-band">
        <div class="hero-inner">
          <h1><SvgIcon name="shield" :size="32" style="vertical-align:middle;margin-right:10px;" /> {{ t('adminPanel') }}</h1>
          <p class="subtitle">{{ t('adminSubtitle') }}</p>
        </div>
      </div>
    </header>

    <div class="admin-container">
      <!-- Tab Navigation -->
      <nav class="admin-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id" 
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span class="tab-icon"><SvgIcon :name="tab.id === 'users' ? 'users' : tab.id === 'badges' ? 'badge' : tab.id === 'quizzes' ? 'question' : tab.id === 'reviews' ? 'note' : tab.id === 'cosmetics' ? 'palette' : 'settings'" :size="18" /></span>
          <span class="tab-label">{{ t(tab.labelKey) }}</span>
        </button>
      </nav>

      <!-- Users Tab -->
      <div v-if="activeTab === 'users'" class="tab-content">
        <div class="content-header">
          <h2>{{ t('userManagement') }}</h2>
          <div class="search-bar">
            <input v-model="userSearch" @input="filterUsers" type="text" :placeholder="t('searchUsers')" class="search-input" />
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-value">{{ allUsers.length }}</span>
            <span class="stat-label">{{ t('totalUsers') }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ allUsers.filter(u => u.role === 'admin').length }}</span>
            <span class="stat-label">{{ t('admins') }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ allUsers.filter(u => u.is_banned).length }}</span>
            <span class="stat-label">{{ t('banned') }}</span>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>{{ t('id') }}</th>
                <th>{{ t('username') }}</th>
                <th>{{ t('email') }}</th>
                <th>{{ t('role') }}</th>
                <th>{{ t('status') }}</th>
                <th>{{ t('joined') }}</th>
                <th>{{ t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id" :class="{ 'row-banned': user.is_banned, 'row-admin': user.role === 'admin' }">
                <td>{{ user.id }}</td>
                <td class="user-cell">
                  <img :src="user.profile_picture || '/assets/default_pfp_icons/default_grey.png'" class="table-pfp" @error="$event.target.src = '/assets/default_pfp_icons/default_grey.png'" />
                  <span>{{ user.username }}</span>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="role-badge" :class="user.role">{{ user.role }}</span>
                </td>
                <td>
                  <span v-if="user.is_banned" class="status-badge banned">{{ t('banned') }}</span>
                  <span v-else class="status-badge active">{{ t('active') }}</span>
                </td>
                <td>{{ formatDate(user.created_at) }}</td>
                <td class="actions-cell">
                  <button 
                    v-if="user.id !== currentUserId"
                    class="action-btn" 
                    :class="user.role === 'admin' ? 'demote' : 'promote'"
                    @click="toggleRole(user)"
                    :title="user.role === 'admin' ? 'Remove admin' : 'Make admin'"
                  >
                    <SvgIcon :name="user.role === 'admin' ? 'arrow-down' : 'arrow-up'" :size="16" />
                  </button>
                  <button 
                    v-if="user.id !== currentUserId"
                    class="action-btn"
                    :class="user.is_banned ? 'unban' : 'ban'"
                    @click="toggleBan(user)"
                    :title="user.is_banned ? 'Unban user' : 'Ban user'"
                  >
                    {{ user.is_banned ? '✅' : '🚫' }}
                  </button>
                  <button 
                    v-if="user.id !== currentUserId"
                    class="action-btn delete"
                    @click="confirmDeleteUser(user)"
                    title="Delete user"
                  >
                    <SvgIcon name="trash" :size="16" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Badges Tab -->
      <div v-if="activeTab === 'badges'" class="tab-content">
        <div class="content-header">
          <h2>{{ t('badgeManagement') }}</h2>
          <button class="primary-btn" @click="showBadgeCreateForm = !showBadgeCreateForm">{{ showBadgeCreateForm ? '✕ ' + t('cancel') : '+ ' + t('createNewBadge') }}</button>
        </div>

        <!-- Create Badge Inline Form -->
        <div v-if="showBadgeCreateForm" class="settings-section" style="margin-bottom:24px">
          <h3>{{ t('newBadge') }}</h3>
          <div class="form-group">
            <label>{{ t('badgeName') }} *</label>
            <input v-model="badgeFormData.name" type="text" class="form-input" placeholder="Badge name" />
          </div>
          <div class="form-group">
            <label>{{ t('badgeDescription') }}</label>
            <textarea v-model="badgeFormData.description" class="form-input form-textarea" rows="2" placeholder="Short description (optional)"></textarea>
          </div>
          <div class="form-group">
            <label>{{ t('badgeImage') }}</label>
            <input type="file" accept="image/*" class="form-input" @change="handleStandaloneBadgeImageUpload" />
            <div v-if="badgeFormData.image" style="display:flex;align-items:center;gap:10px;margin-top:8px">
              <img :src="`/assets/badges/${badgeFormData.image}`" style="width:52px;height:52px;object-fit:contain;border-radius:8px;border:1px solid rgba(255,255,255,0.12)" alt="Preview" />
              <button class="secondary-btn" style="padding:4px 10px" @click="badgeFormData.image = ''">✕ {{ t('remove') }}</button>
            </div>
          </div>
          <p v-if="badgeFormError" style="color:#f44336;margin:8px 0 0">{{ badgeFormError }}</p>
          <button class="primary-btn" style="margin-top:12px" @click="saveNewStandaloneBadge" :disabled="badgeFormSaving">{{ badgeFormSaving ? t('creating') : t('createBadge') }}</button>
        </div>

        <!-- Existing Standalone Badges -->
        <div class="badges-grid">
          <div v-for="badge in allStandaloneBadges" :key="badge.id" class="badge-admin-card">
            <div class="badge-admin-header">
              <img v-if="badge.image" :src="`/assets/badges/${badge.image}`" style="width:48px;height:48px;object-fit:contain;border-radius:8px;flex-shrink:0" alt="" />
              <span v-else class="badge-emoji">🏅</span>
              <div class="badge-admin-info">
                <h4>{{ badge.name }}</h4>
                <p>{{ badge.description }}</p>
              </div>
            </div>
            <div class="badge-admin-footer">
              <button class="action-btn promote" @click="awardStandaloneBadge(badge)" title="Award to user"><SvgIcon name="badge" :size="16" /></button>
              <button class="action-btn delete" @click="confirmDeleteStandaloneBadge(badge)" title="Delete badge"><SvgIcon name="trash" :size="16" /></button>
            </div>
          </div>
        </div>
        <div v-if="!allStandaloneBadges.length && !showBadgeCreateForm" class="empty-state">
          <p>{{ t('noBadgesYet') }}</p>
        </div>
      </div>

      <!-- Quizzes Tab -->
      <div v-if="activeTab === 'quizzes'" class="tab-content">
        <div class="content-header">
          <h2>{{ t('quizManagement') }}</h2>
          <button class="primary-btn" @click="toggleCreateQuiz">{{ showCreateQuiz ? '✕ ' + t('cancel') : '+ ' + t('createNewQuiz') }}</button>
        </div>

        <!-- Create Quiz Inline Form -->
        <div v-if="showCreateQuiz" class="settings-section" style="margin-bottom:24px">
          <h3>{{ t('newQuiz') }}</h3>
          <div class="form-group">
            <label>{{ t('title') }} *</label>
            <input v-model="adminQuizForm.title" type="text" class="form-input" placeholder="Quiz title" />
          </div>
          <div class="form-group">
            <label>{{ t('badgeDescription') }}</label>
            <textarea v-model="adminQuizForm.description" class="form-input form-textarea" rows="2"></textarea>
          </div>
          <div class="quiz-form-row-2">
            <div class="form-group">
              <label>{{ t('category') }}</label>
              <select v-model="adminQuizForm.category" class="form-input">
                <option v-for="cat in quizFormCategories" :key="cat.key" :value="cat.key">{{ cat.label }}</option>
                <option value="__custom__">＋ Custom…</option>
              </select>
              <input v-if="adminQuizForm.category === '__custom__'" v-model="adminQuizForm.newCategoryLabel" type="text" class="form-input" style="margin-top:6px" placeholder="Category name" />
            </div>
            <div class="form-group">
              <label>{{ t('difficulty') }}</label>
              <select v-model="adminQuizForm.difficulty" class="form-input">
                <option value="easy">{{ t('easy') }}</option>
                <option value="medium">{{ t('medium') }}</option>
                <option value="hard">{{ t('hard') }}</option>
              </select>
            </div>
          </div>
          <div class="quiz-form-row-2">
            <div class="form-group">
              <label>{{ t('iconName') }}</label>
              <input v-model="adminQuizForm.icon_name" type="text" class="form-input" placeholder="e.g. tv, crown, star" />
            </div>
            <div class="form-group">
              <label>{{ t('tmdbSeriesId') }}</label>
              <input v-model="adminQuizForm.tmdb_series_id" type="number" class="form-input" :placeholder="t('leaveBlankCustomImage')" />
            </div>
          </div>
          <div class="form-group">
            <label>{{ t('quizImage') }}</label>
            <input type="file" accept="image/*" class="form-input" @change="handleQuizImageUpload" />
            <div v-if="adminQuizForm.quiz_image" style="display:flex;align-items:center;gap:10px;margin-top:8px">
              <img :src="`/assets/quiz_images/${adminQuizForm.quiz_image}`" style="width:64px;height:64px;object-fit:contain;border-radius:8px;border:1px solid rgba(255,255,255,0.12)" alt="Preview" />
              <button class="secondary-btn" style="padding:4px 10px" @click="adminQuizForm.quiz_image = ''">✕ {{ t('remove') }}</button>
            </div>
          </div>

          <!-- Badge toggle -->
          <label class="quiz-toggle-row">
            <input type="checkbox" v-model="adminQuizForm.hasBadge" />
            <span>{{ t('thisQuizAwardsBadge') }}</span>
          </label>

          <template v-if="adminQuizForm.hasBadge">
            <div class="form-group">
              <label>{{ t('defaultBadge') }}</label>
              <select v-model="adminQuizForm.badge_name" class="form-input" @change="onAdminDefaultBadgeSelect">
                <option value="">{{ t('selectBadge') }}</option>
                <option v-for="b in allStandaloneBadges" :key="b.id" :value="b.name">{{ b.name }}</option>
              </select>
              <p v-if="!allStandaloneBadges.length" style="color:#e57373;font-size:0.82rem;margin:4px 0 0">{{ t('noBadgesYetCreate') }}</p>
            </div>

            <!-- Performance badges -->
            <label class="quiz-toggle-row">
              <input type="checkbox" v-model="adminQuizForm.badgeRules.performance.enabled" />
              <span>{{ t('performanceBadges') }}</span>
            </label>
            <template v-if="adminQuizForm.badgeRules.performance.enabled">
              <div v-for="(tier, ti) in adminQuizForm.badgeRules.performance.tiers" :key="ti" class="quiz-block">
                <div class="question-top">
                  <span class="question-num">{{ t('tier') }} {{ ti + 1 }}</span>
                  <button class="remove-question-btn" @click="removeAdminPerfTier(ti)" :disabled="adminQuizForm.badgeRules.performance.tiers.length === 1"><SvgIcon name="close" :size="16" /></button>
                </div>
                <div class="quiz-form-row-2">
                  <div class="form-group">
                    <label>{{ t('minScorePercent') }}</label>
                    <input v-model.number="tier.minScore" type="number" min="0" max="100" class="form-input" placeholder="70" />
                  </div>
                  <div class="form-group">
                    <label>{{ t('badge') }}</label>
                    <select v-model="tier.badgeName" class="form-input" @change="onAdminTierBadgeSelect(tier)">
                      <option value="">{{ t('selectBadge') }}</option>
                      <option v-for="b in allStandaloneBadges" :key="b.id" :value="b.name">{{ b.name }}</option>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label>{{ t('badgeImageOverride') }}</label>
                  <input type="file" accept="image/*" class="form-input" @change="e => handleAdminBadgeImageUpload(e, tier, 'badgeImage')" />
                  <div v-if="tier.badgeImage" style="display:flex;align-items:center;gap:8px;margin-top:6px">
                    <img :src="`/assets/badges/${tier.badgeImage}`" style="width:40px;height:40px;object-fit:contain;border-radius:6px" alt="" />
                    <button class="secondary-btn" style="padding:4px 10px" @click="tier.badgeImage = ''">✕</button>
                  </div>
                </div>
              </div>
              <button class="secondary-btn" @click="addAdminPerfTier">{{ t('addTier') }}</button>
              <p style="font-size:0.78rem;color:var(--subtitle-color);margin:6px 0 0">{{ t('tiersEvaluation') }}</p>
            </template>

            <!-- Secret badges -->
            <label class="quiz-toggle-row">
              <input type="checkbox" v-model="adminQuizForm.badgeRules.secrets.enabled" />
              <span>{{ t('secretBadges') }}</span>
            </label>
            <template v-if="adminQuizForm.badgeRules.secrets.enabled">
              <div v-for="(cond, ci) in adminQuizForm.badgeRules.secrets.conditions" :key="ci" class="quiz-block">
                <div class="question-top">
                  <span class="question-num">{{ t('condition') }} {{ ci + 1 }}</span>
                  <button class="remove-question-btn" @click="removeAdminSecretCond(ci)"><SvgIcon name="close" :size="16" /></button>
                </div>
                <div class="quiz-form-row-2">
                  <div class="form-group">
                    <label>{{ t('questionNumber') }} (1–{{ adminQuizForm.questions.length }})</label>
                    <input v-model.number="cond.questionIndex" type="number" min="1" :max="adminQuizForm.questions.length" class="form-input" />
                  </div>
                  <div class="form-group">
                    <label>{{ t('requiredAnswer') }}</label>
                    <select v-model="cond.answer" class="form-input">
                      <option v-for="l in ['A','B','C','D','E','F','G','H']" :key="l" :value="l">{{ l }}</option>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label>{{ t('badge') }}</label>
                  <select v-model="cond.badgeName" class="form-input" @change="onAdminCondBadgeSelect(cond)">
                    <option value="">{{ t('selectBadge') }}</option>
                    <option v-for="b in allStandaloneBadges" :key="b.id" :value="b.name">{{ b.name }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>{{ t('badgeImageOverride') }}</label>
                  <input type="file" accept="image/*" class="form-input" @change="e => handleAdminBadgeImageUpload(e, cond, 'badgeImage')" />
                  <div v-if="cond.badgeImage" style="display:flex;align-items:center;gap:8px;margin-top:6px">
                    <img :src="`/assets/badges/${cond.badgeImage}`" style="width:40px;height:40px;object-fit:contain;border-radius:6px" alt="" />
                    <button class="secondary-btn" style="padding:4px 10px" @click="cond.badgeImage = ''">✕</button>
                  </div>
                </div>
              </div>
              <button class="secondary-btn" @click="addAdminSecretCond">{{ t('addCondition') }}</button>
            </template>
          </template>

          <!-- Questions -->
          <div style="display:flex;justify-content:space-between;align-items:center;margin:20px 0 10px">
            <h4 style="margin:0;color:var(--text-color)">{{ t('questions') }}</h4>
            <button class="secondary-btn" @click="addAdminQuizQuestion">{{ t('addQuestion') }}</button>
          </div>
          <div v-for="(q, idx) in adminQuizForm.questions" :key="idx" class="quiz-block">
            <div class="question-top">
              <span class="question-num">Q{{ idx + 1 }}</span>
              <button class="remove-question-btn" @click="removeAdminQuizQuestion(idx)" :disabled="adminQuizForm.questions.length === 1"><SvgIcon name="close" :size="16" /></button>
            </div>
            <div class="form-group">
              <input v-model="q.question_text" type="text" class="form-input" :placeholder="t('questionText') + ` ${idx + 1}`" />
            </div>
            <div class="quiz-options-list">
              <div
                v-for="(optVal, optIdx) in q.options"
                :key="optIdx"
                class="quiz-opt-row"
                :class="{ 'quiz-opt-correct': q.correct_answer === String.fromCharCode(65 + optIdx) }"
              >
                <input type="radio" :name="`admin-correct-q-${idx}`" :value="String.fromCharCode(65 + optIdx)" v-model="q.correct_answer" />
                <span class="question-num" style="min-width:18px;font-size:0.8rem">{{ String.fromCharCode(65 + optIdx) }}</span>
                <input v-model="q.options[optIdx]" type="text" class="form-input" :placeholder="t('optionLabel') + ` ${String.fromCharCode(65 + optIdx)}`" style="flex:1" />
                <button v-if="q.options.length > 2" class="remove-question-btn" @click="q.options.splice(optIdx, 1); if (q.correct_answer > String.fromCharCode(64 + q.options.length)) q.correct_answer = 'A'"><SvgIcon name="close" :size="14" /></button>
              </div>
            </div>
            <button v-if="q.options.length < 8" class="secondary-btn" style="margin-bottom:8px;padding:5px 12px;font-size:0.82rem" @click="q.options.push('')">{{ t('addOption') }}</button>
            <input v-model="q.explanation" type="text" class="form-input" :placeholder="t('explanation')" />
          </div>

          <p v-if="adminQuizError" style="color:#f44336;margin:8px 0 0">{{ adminQuizError }}</p>
          <div style="display:flex;gap:12px;margin-top:16px">
            <button class="secondary-btn" @click="toggleCreateQuiz">{{ t('cancel') }}</button>
            <button class="primary-btn" @click="saveAdminQuiz" :disabled="adminQuizSaving">{{ adminQuizSaving ? t('savingQuiz') : t('createQuiz') }}</button>
          </div>
        </div>

        <!-- Quizzes Table -->
        <div class="table-wrapper" style="margin-top:0">
          <table class="admin-table">
            <thead>
              <tr>
                <th>{{ t('id') }}</th>
                <th>{{ t('title') }}</th>
                <th>{{ t('category') }}</th>
                <th>{{ t('difficulty') }}</th>
                <th>{{ t('questions') }}</th>
                <th>{{ t('completions') }}</th>
                <th>{{ t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="quiz in allBadges" :key="quiz.id">
                <td>{{ quiz.id }}</td>
                <td>{{ quiz.title }}</td>
                <td style="text-transform:capitalize">{{ quiz.category || 'series' }}</td>
                <td><span class="status-badge active" style="text-transform:capitalize">{{ quiz.difficulty || 'medium' }}</span></td>
                <td>{{ quiz.question_count || 0 }}</td>
                <td>{{ quiz.earned_count || 0 }}</td>
                <td>
                  <div class="actions-cell">
                    <button class="action-btn delete" @click="confirmDeleteBadge(quiz)" title="Delete quiz"><SvgIcon name="trash" :size="16" /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="!allBadges.length" class="empty-state">
          <p>{{ t('noQuizzesYet') }}</p>
        </div>
      </div>

      <!-- Reviews Tab -->
      <div v-if="activeTab === 'reviews'" class="tab-content">
        <div class="content-header">
          <h2>{{ t('reviewManagement') }}</h2>
          <div class="search-bar">
            <input v-model="reviewSearch" @input="filterReviews" type="text" :placeholder="t('searchReviews')" class="search-input" />
          </div>
        </div>

        <div class="table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>{{ t('id') }}</th>
                <th>{{ t('username') }}</th>
                <th>{{ t('series') }}</th>
                <th>{{ t('rating') }}</th>
                <th>{{ t('title') }}</th>
                <th>{{ t('date') }}</th>
                <th>{{ t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="review in filteredReviews" :key="review.id">
                <td>{{ review.id }}</td>
                <td>{{ review.username }}</td>
                <td>S{{ review.season_number }}E{{ review.episode_number }}</td>
                <td>
                  <span :class="'rating-badge rating-' + Math.round(review.rating)">{{ review.rating }}/5</span>
                </td>
                <td class="truncate">{{ review.review_title }}</td>
                <td>{{ formatDate(review.date) }}</td>
                <td class="actions-cell">
                  <button class="action-btn view" @click="$router.push(`/review/${review.id}`)" title="View"><SvgIcon name="show" :size="16" /></button>
                  <button class="action-btn delete" @click="confirmDeleteReview(review)" title="Delete"><SvgIcon name="trash" :size="16" /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Cosmetics Tab -->
      <div v-if="activeTab === 'cosmetics'" class="tab-content">
        <div class="content-header">
          <h2>{{ t('cosmeticsManagement') }}</h2>
          <button class="btn-primary" @click="showCosmeticCreateForm = !showCosmeticCreateForm">
            {{ showCosmeticCreateForm ? t('cancel') : '+ ' + t('newCosmetic') }}
          </button>
        </div>

        <!-- Create Cosmetic Form -->
        <div v-if="showCosmeticCreateForm" class="form-card">
          <h3>{{ t('createNewCosmetic') }}</h3>
          <div class="form-row">
            <label>{{ t('name') }}</label>
            <input v-model="cosmeticFormData.name" type="text" class="form-input" placeholder="e.g. Golden Sparkle Trail" />
          </div>
          <div class="form-row">
            <label>{{ t('badgeDescription') }}</label>
            <textarea v-model="cosmeticFormData.description" class="form-input" rows="2"></textarea>
          </div>
          <div class="form-row">
            <label>{{ t('type') }}</label>
            <select v-model="cosmeticFormData.type" class="form-input" @change="cosmeticFormData.effect_key = filteredEffectKeys[0]?.key || ''">
              <option value="cursor_trail">{{ t('cursorTrail') }}</option>
              <option value="background_effect">{{ t('backgroundEffect') }}</option>
            </select>
          </div>
          <div class="form-row">
            <label>{{ t('effect') }}</label>
            <select v-model="cosmeticFormData.effect_key" class="form-input">
              <option v-for="ek in filteredEffectKeys" :key="ek.key" :value="ek.key">{{ ek.label }}</option>
            </select>
          </div>
          <div class="form-row">
            <label>{{ t('config') }}</label>
            <textarea v-model="cosmeticFormData.config" class="form-input" rows="3" placeholder='{"color":"#ff0","size":4}'></textarea>
          </div>
          <div class="form-row">
            <label>{{ t('rarity') }}</label>
            <select v-model="cosmeticFormData.rarity" class="form-input">
              <option value="common">{{ t('common') }}</option>
              <option value="rare">{{ t('rare') }}</option>
              <option value="epic">{{ t('epic') }}</option>
              <option value="legendary">{{ t('legendary') }}</option>
            </select>
          </div>
          <p v-if="cosmeticFormError" class="form-error">{{ cosmeticFormError }}</p>
          <button class="btn-primary" @click="saveNewCosmetic" :disabled="cosmeticFormSaving">
            {{ cosmeticFormSaving ? t('saving') : t('createCosmetic') }}
          </button>
        </div>

        <!-- Cosmetics Table -->
        <div class="table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>{{ t('id') }}</th>
                <th>{{ t('name') }}</th>
                <th>{{ t('type') }}</th>
                <th>{{ t('effect') }}</th>
                <th>{{ t('rarity') }}</th>
                <th>{{ t('sources') }}</th>
                <th>{{ t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in allCosmetics" :key="c.id">
                <td>{{ c.id }}</td>
                <td>{{ c.name }}</td>
                <td><span class="cosmetic-type-tag" :class="c.type">{{ c.type === 'cursor_trail' ? t('cursor') : t('background') }}</span></td>
                <td><code>{{ c.effect_key }}</code></td>
                <td><span class="rarity-tag" :class="c.rarity">{{ c.rarity }}</span></td>
                <td>{{ (allCosmeticSources.filter(s => s.cosmetic_id === c.id)).length }}</td>
                <td>
                  <button class="btn-sm btn-danger" @click="deleteCosmetic(c.id)">{{ t('delete') }}</button>
                </td>
              </tr>
              <tr v-if="!allCosmetics.length">
                <td colspan="7" style="text-align:center;opacity:0.6;">{{ t('noCosmetics') }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Link Source / Award Section -->
        <div class="cosmetics-actions-row">
          <div class="form-card half">
            <h3>{{ t('linkSource') }}</h3>
            <div class="form-row">
              <label>{{ t('cosmetic') }}</label>
              <select v-model="cosmeticSourceForm.cosmetic_id" class="form-input">
                <option value="">{{ t('select') }}</option>
                <option v-for="c in allCosmetics" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="form-row">
              <label>{{ t('sourceType') }}</label>
              <select v-model="cosmeticSourceForm.source_type" class="form-input">
                <option value="quiz">{{ t('quiz') }}</option>
                <option value="milestone">{{ t('milestone') }}</option>
              </select>
            </div>
            <div v-if="cosmeticSourceForm.source_type === 'quiz'" class="form-row">
              <label>{{ t('quiz') }}</label>
              <select v-model="cosmeticSourceForm.quiz_id" class="form-input">
                <option value="">{{ t('select') }}</option>
                <option v-for="q in allQuizzesForSource" :key="q.id" :value="q.id">{{ q.title }}</option>
              </select>
            </div>
            <div v-if="cosmeticSourceForm.source_type === 'quiz'" class="form-row">
              <label>{{ t('minScore') }}</label>
              <input v-model.number="cosmeticSourceForm.min_score" type="number" min="0" max="100" class="form-input" />
            </div>
            <div v-if="cosmeticSourceForm.source_type === 'milestone'" class="form-row">
              <label>{{ t('milestoneType') }}</label>
              <select v-model="cosmeticSourceForm.milestone_type" class="form-input">
                <option value="review_count">{{ t('reviewCount') }}</option>
                <option value="follower_count">{{ t('followerCount') }}</option>
                <option value="quiz_completions">{{ t('quizCompletions') }}</option>
              </select>
            </div>
            <div v-if="cosmeticSourceForm.source_type === 'milestone'" class="form-row">
              <label>{{ t('valueRequired') }}</label>
              <input v-model.number="cosmeticSourceForm.milestone_value" type="number" min="1" class="form-input" />
            </div>
            <button class="btn-primary" @click="linkCosmeticSource">{{ t('linkSource') }}</button>
          </div>

          <div class="form-card half">
            <h3>{{ t('awardToUser') }}</h3>
            <div class="form-row">
              <label>{{ t('cosmetic') }}</label>
              <select v-model="cosmeticAwardForm.cosmetic_id" class="form-input">
                <option value="">{{ t('select') }}</option>
                <option v-for="c in allCosmetics" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="form-row">
              <label>{{ t('userId') }}</label>
              <input v-model.number="cosmeticAwardForm.userId" type="number" class="form-input" :placeholder="t('enterUserId')" />
            </div>
            <button class="btn-primary" @click="awardCosmeticToUser">{{ t('award') }}</button>
          </div>
        </div>

        <!-- Sources Table -->
        <div v-if="allCosmeticSources.length" class="table-wrapper" style="margin-top:1.5rem;">
          <h3 style="margin-bottom:0.5rem;">{{ t('allCosmeticSources') }}</h3>
          <table class="admin-table">
            <thead>
              <tr>
                <th>{{ t('cosmetic') }}</th>
                <th>{{ t('source') }}</th>
                <th>{{ t('detail') }}</th>
                <th>{{ t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in allCosmeticSources" :key="s.id">
                <td>{{ (allCosmetics.find(c => c.id === s.cosmetic_id) || {}).name || '#' + s.cosmetic_id }}</td>
                <td>{{ s.source_type }}</td>
                <td>
                  <span v-if="s.source_type === 'quiz'">Quiz #{{ s.quiz_id }} (min {{ s.min_score }}%)</span>
                  <span v-else>{{ s.milestone_type }} ≥ {{ s.milestone_value }}</span>
                </td>
                <td>
                  <button class="btn-sm btn-danger" @click="deleteCosmeticSource(s.id)">{{ t('remove') }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Site Settings Tab -->
      <div v-if="activeTab === 'settings'" class="tab-content">
        <div class="content-header">
          <h2>{{ t('siteOverview') }}</h2>
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-value">{{ siteStats.totalUsers || 0 }}</span>
            <span class="stat-label">{{ t('totalUsers') }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ siteStats.totalReviews || 0 }}</span>
            <span class="stat-label">{{ t('totalReviews') }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ siteStats.totalComments || 0 }}</span>
            <span class="stat-label">{{ t('totalComments') }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ siteStats.totalQuizzes || 0 }}</span>
            <span class="stat-label">{{ t('totalQuizzes') }}</span>
          </div>
        </div>

        <div class="settings-section">
          <h3>{{ t('dailyQuoteManagement') }}</h3>
          <div class="form-group">
            <label>{{ t('quoteText') }}</label>
            <textarea v-model="newQuote.text" :placeholder="t('enterQuote')" class="form-input form-textarea"></textarea>
          </div>
          <div class="form-group">
            <label>{{ t('author') }}</label>
            <input v-model="newQuote.author" type="text" :placeholder="t('quoteAuthor')" class="form-input" />
          </div>
          <button class="primary-btn" @click="addQuote">{{ t('addQuote') }}</button>
        </div>
      </div>
    </div>

    <!-- Confirm Dialog -->
    <div v-if="confirmDialog.show" class="modal-overlay" @click.self="confirmDialog.show = false">
      <div class="confirm-dialog">
        <h3>{{ confirmDialog.title }}</h3>
        <p>{{ confirmDialog.message }}</p>
        <div class="confirm-actions">
          <button class="secondary-btn" @click="confirmDialog.show = false">{{ t('cancel') }}</button>
          <button class="danger-btn" @click="confirmDialog.action">{{ confirmDialog.actionText }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SvgIcon from '@/components/SvgIcon.vue'
import { getTranslation, getCurrentLanguage } from '@/services/translations.js'

export default {
  components: { SvgIcon },
  data() {
    return {
      currentLanguage: 'en',
      activeTab: 'users',
      tabs: [
        { id: 'users', labelKey: 'users' },
        { id: 'badges', labelKey: 'badgesTab' },
        { id: 'quizzes', labelKey: 'quizzesTab' },
        { id: 'reviews', labelKey: 'reviewsTab' },
        { id: 'cosmetics', labelKey: 'cosmeticsTab' },
        { id: 'settings', labelKey: 'settingsTab' }
      ],
      currentUserId: null,
      allUsers: [],
      filteredUsers: [],
      userSearch: '',
      allBadges: [],
      allReviews: [],
      filteredReviews: [],
      reviewSearch: '',
      siteStats: {},
      showCreateBadge: false,
      isCreatingBadge: false,
      newBadge: {
        title: '',
        description: '',
        icon_emoji: '',
        questions: []
      },
      newQuote: { text: '', author: '' },
      confirmDialog: {
        show: false,
        title: '',
        message: '',
        actionText: '',
        action: () => {}
      },
      // Quizzes tab
      showCreateQuiz: false,
      adminQuizSaving: false,
      adminQuizError: '',
      adminQuizForm: {
        title: '', description: '', icon_name: 'question',
        category: 'series', newCategoryLabel: '', difficulty: 'medium',
        tmdb_series_id: '', quiz_image: '', hasBadge: false, badge_name: '', badge_image: '',
        badgeRules: {
          performance: { enabled: false, tiers: [{ minScore: 70, badgeName: '', badgeImage: '' }] },
          secrets: { enabled: false, conditions: [{ questionIndex: 1, answer: 'A', badgeName: '', badgeImage: '' }] }
        },
        questions: [{ question_text: '', options: ['', ''], correct_answer: 'A', explanation: '' }]
      },
      quizFormCategories: [
        { key: 'series', label: 'Series' },
        { key: 'tv_history', label: 'TV History' },
        { key: 'directors', label: 'Directors' },
        { key: 'actors', label: 'Actors' }
      ],
      // Standalone badges tab
      allStandaloneBadges: [],
      showBadgeCreateForm: false,
      badgeFormData: { name: '', description: '', image: '' },
      badgeFormSaving: false,
      badgeFormError: '',

      // Cosmetics tab
      allCosmetics: [],
      allCosmeticSources: [],
      showCosmeticCreateForm: false,
      cosmeticFormData: {
        name: '', description: '', type: 'cursor_trail', effect_key: 'particle_sparkle',
        config: '{}', preview_image: '', rarity: 'common'
      },
      cosmeticFormSaving: false,
      cosmeticFormError: '',
      cosmeticSourceForm: {
        cosmetic_id: '', source_type: 'quiz', quiz_id: '', min_score: 70,
        milestone_type: 'review_count', milestone_value: 10
      },
      cosmeticAwardForm: { cosmetic_id: '', userId: '' },
      allQuizzesForSource: [],
      effectKeyOptions: [
        { key: 'particle_sparkle', label: 'Sparkle Trail', type: 'cursor_trail' },
        { key: 'particle_fire', label: 'Fire Trail', type: 'cursor_trail' },
        { key: 'particle_snow', label: 'Snow Trail', type: 'cursor_trail' },
        { key: 'glow_smooth', label: 'Smooth Glow', type: 'cursor_trail' },
        { key: 'glow_rainbow', label: 'Rainbow Glow', type: 'cursor_trail' },
        { key: 'particle_fairydust', label: 'Fairy Dust', type: 'cursor_trail' },
        { key: 'particle_bubble', label: 'Bubble Trail', type: 'cursor_trail' },
        { key: 'rainbow_cursor', label: 'Rainbow Cursor', type: 'cursor_trail' },
        { key: 'canvas_cursor', label: 'Canvas Lines', type: 'cursor_trail' },
        { key: 'fluid_cursor', label: 'Fluid Cursor', type: 'cursor_trail' },
        { key: 'smooth_wavy', label: 'Smooth Wavy', type: 'background_effect' },
        { key: 'flowing_ribbons', label: 'Flowing Ribbons', type: 'background_effect' },
        { key: 'particles_stars', label: 'Floating Stars', type: 'background_effect' },
        { key: 'particles_bubbles', label: 'Bubbles', type: 'background_effect' },
        { key: 'particles_fireflies', label: 'Fireflies', type: 'background_effect' },
        { key: 'pattern_dots', label: 'Interactive Dots', type: 'background_effect' },
        { key: 'pattern_waves', label: 'Wave Lines', type: 'background_effect' },
        { key: 'pattern_grid', label: 'Glowing Grid', type: 'background_effect' }
      ]
    };
  },
  computed: {
    filteredEffectKeys() {
      return this.effectKeyOptions.filter(e => e.type === this.cosmeticFormData.type);
    }
  },
  methods: {
    t(key) { return getTranslation(key, this.currentLanguage); },
    tFormat(key, vars = {}) {
      return this.t(key).replace(/\{(\w+)\}/g, (_, token) => (vars[token] ?? `{${token}}`));
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    },
    getAuthHeaders() {
      const auth = JSON.parse(localStorage.getItem('auth'));
      return { 'Authorization': auth.user.id.toString(), 'Content-Type': 'application/json' };
    },

    // === USER MANAGEMENT ===
    async fetchUsers() {
      try {
        const res = await fetch('/api/admin/users', { headers: this.getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to fetch users');
        this.allUsers = await res.json();
        this.filteredUsers = [...this.allUsers];
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    },
    filterUsers() {
      const q = this.userSearch.toLowerCase();
      this.filteredUsers = this.allUsers.filter(u =>
        u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    },
    async toggleRole(user) {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      const action = newRole === 'admin' ? 'promote' : 'demote';
      this.confirmDialog = {
        show: true,
        title: action === 'promote' ? this.t('promoteUser') : this.t('demoteUser'),
        message: this.tFormat('confirmRoleChangeTemplate', {
          username: user.username,
          roleAction: action === 'promote' ? this.t('promoteToAdmin') : this.t('demoteFromAdmin')
        }),
        actionText: action === 'promote' ? this.t('promote') : this.t('demote'),
        action: async () => {
          try {
            const res = await fetch(`/api/admin/users/${user.id}/role`, {
              method: 'PUT',
              headers: this.getAuthHeaders(),
              body: JSON.stringify({ role: newRole })
            });
            if (!res.ok) throw new Error('Failed to update role');
            user.role = newRole;
            this.confirmDialog.show = false;
          } catch (err) {
            alert(`${this.t('errorPrefix')} ${err.message}`);
          }
        }
      };
    },
    async toggleBan(user) {
      const banning = !user.is_banned;
      this.confirmDialog = {
        show: true,
        title: banning ? this.t('banUserTitle') : this.t('unbanUserTitle'),
        message: banning
          ? this.tFormat('confirmBanUserTemplate', { username: user.username })
          : this.tFormat('confirmUnbanUserTemplate', { username: user.username }),
        actionText: banning ? this.t('ban') : this.t('unban'),
        action: async () => {
          try {
            const res = await fetch(`/api/admin/users/${user.id}/ban`, {
              method: 'PUT',
              headers: this.getAuthHeaders(),
              body: JSON.stringify({ banned: banning })
            });
            if (!res.ok) throw new Error('Failed');
            user.is_banned = banning ? 1 : 0;
            this.confirmDialog.show = false;
          } catch (err) {
            alert(`${this.t('errorPrefix')} ${err.message}`);
          }
        }
      };
    },
    confirmDeleteUser(user) {
      this.confirmDialog = {
        show: true,
        title: this.t('deleteUserTitle'),
        message: this.t('deleteUserMessage'),
        actionText: this.t('delete'),
        action: async () => {
          try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
              method: 'DELETE',
              headers: this.getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed');
            this.allUsers = this.allUsers.filter(u => u.id !== user.id);
            this.filterUsers();
            this.confirmDialog.show = false;
          } catch (err) {
            alert(`${this.t('errorPrefix')} ${err.message}`);
          }
        }
      };
    },

    // === BADGE MANAGEMENT ===
    async fetchBadges() {
      try {
        const res = await fetch('/api/admin/badges', { headers: this.getAuthHeaders() });
        if (!res.ok) throw new Error('Failed');
        this.allBadges = await res.json();
      } catch (err) {
        console.error('Error fetching badges:', err);
      }
    },
    addQuestion() {
      this.newBadge.questions.push({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: '',
        explanation: ''
      });
    },
    removeQuestion(idx) {
      this.newBadge.questions.splice(idx, 1);
    },
    async createBadge() {
      if (!this.newBadge.title.trim()) return alert(this.t('titleRequired'));
      if (!this.newBadge.icon_emoji.trim()) return alert(this.t('iconEmojiRequired'));
      if (this.newBadge.questions.length === 0) return alert(this.t('addAtLeastOneQuestion'));
      
      for (let i = 0; i < this.newBadge.questions.length; i++) {
        const q = this.newBadge.questions[i];
        if (!q.question_text || !q.option_a || !q.option_b || !q.correct_answer) {
          return alert(this.tFormat('questionIncompleteTemplate', { index: i + 1 }));
        }
      }

      this.isCreatingBadge = true;
      try {
        const res = await fetch('/api/admin/quizzes', {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(this.newBadge)
        });
        if (!res.ok) throw new Error('Failed to create badge');
        
        this.showCreateBadge = false;
        this.newBadge = { title: '', description: '', icon_emoji: '', questions: [] };
        await this.fetchBadges();
        alert(this.t('badgeQuizCreatedSuccessfully'));
      } catch (err) {
        alert(`${this.t('errorPrefix')} ${err.message}`);
      } finally {
        this.isCreatingBadge = false;
      }
    },
    confirmDeleteBadge(badge) {
      this.confirmDialog = {
        show: true,
        title: this.t('deleteBadge'),
        message: this.tFormat('confirmDeleteBadgeQuizTemplate', { title: badge.title }),
        actionText: this.t('delete'),
        action: async () => {
          try {
            const res = await fetch(`/api/admin/quizzes/${badge.id}`, {
              method: 'DELETE',
              headers: this.getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed');
            this.allBadges = this.allBadges.filter(b => b.id !== badge.id);
            this.confirmDialog.show = false;
          } catch (err) {
            alert(`${this.t('errorPrefix')} ${err.message}`);
          }
        }
      };
    },

    // === REVIEW MANAGEMENT ===
    async fetchReviews() {
      try {
        const res = await fetch('/api/admin/reviews', { headers: this.getAuthHeaders() });
        if (!res.ok) throw new Error('Failed');
        this.allReviews = await res.json();
        this.filteredReviews = [...this.allReviews];
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    },
    filterReviews() {
      const q = this.reviewSearch.toLowerCase();
      this.filteredReviews = this.allReviews.filter(r =>
        (r.username || '').toLowerCase().includes(q) || (r.review_title || '').toLowerCase().includes(q)
      );
    },
    confirmDeleteReview(review) {
      this.confirmDialog = {
        show: true,
        title: this.t('deleteReview'),
        message: this.tFormat('confirmDeleteReviewTemplate', { title: review.review_title, username: review.username }),
        actionText: this.t('delete'),
        action: async () => {
          try {
            const res = await fetch(`/api/reviews/${review.id}`, {
              method: 'DELETE',
              headers: this.getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed');
            this.allReviews = this.allReviews.filter(r => r.id !== review.id);
            this.filterReviews();
            this.confirmDialog.show = false;
          } catch (err) {
            alert(`${this.t('errorPrefix')} ${err.message}`);
          }
        }
      };
    },

    // === SITE SETTINGS ===
    async fetchSiteStats() {
      try {
        const res = await fetch('/api/admin/stats', { headers: this.getAuthHeaders() });
        if (!res.ok) throw new Error('Failed');
        this.siteStats = await res.json();
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    },
    async addQuote() {
      if (!this.newQuote.text.trim()) return alert(this.t('quoteTextRequired'));
      try {
        const res = await fetch('/api/admin/quotes', {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(this.newQuote)
        });
        if (!res.ok) throw new Error('Failed');
        this.newQuote = { text: '', author: '' };
        alert(this.t('quoteAdded'));
      } catch (err) {
        alert(`${this.t('errorPrefix')} ${err.message}`);
      }
    },

    // === QUIZ MANAGEMENT ===
    toggleCreateQuiz() {
      this.showCreateQuiz = !this.showCreateQuiz;
      if (this.showCreateQuiz) {
        this.adminQuizForm = {
          title: '', description: '', icon_name: 'question',
          category: 'series', newCategoryLabel: '', difficulty: 'medium',
          tmdb_series_id: '', quiz_image: '', hasBadge: false, badge_name: '', badge_image: '',
          badgeRules: {
            performance: { enabled: false, tiers: [{ minScore: 70, badgeName: '', badgeImage: '' }] },
            secrets: { enabled: false, conditions: [{ questionIndex: 1, answer: 'A', badgeName: '', badgeImage: '' }] }
          },
          questions: [{ question_text: '', options: ['', ''], correct_answer: 'A', explanation: '' }]
        };
        this.adminQuizError = '';
        if (!this.allStandaloneBadges.length) this.fetchStandaloneBadges();
      }
    },
    addAdminQuizQuestion() {
      this.adminQuizForm.questions.push({ question_text: '', options: ['', ''], correct_answer: 'A', explanation: '' });
    },
    removeAdminQuizQuestion(idx) {
      if (this.adminQuizForm.questions.length > 1) this.adminQuizForm.questions.splice(idx, 1);
    },
    addAdminPerfTier() {
      this.adminQuizForm.badgeRules.performance.tiers.push({ minScore: 0, badgeName: '', badgeImage: '' });
    },
    removeAdminPerfTier(ti) {
      if (this.adminQuizForm.badgeRules.performance.tiers.length > 1)
        this.adminQuizForm.badgeRules.performance.tiers.splice(ti, 1);
    },
    addAdminSecretCond() {
      this.adminQuizForm.badgeRules.secrets.conditions.push({ questionIndex: 1, answer: 'A', badgeName: '', badgeImage: '' });
    },
    removeAdminSecretCond(ci) {
      this.adminQuizForm.badgeRules.secrets.conditions.splice(ci, 1);
    },
    onAdminDefaultBadgeSelect() {
      const badge = this.allStandaloneBadges.find(b => b.name === this.adminQuizForm.badge_name);
      this.adminQuizForm.badge_image = badge?.image || '';
    },
    onAdminTierBadgeSelect(tier) {
      const badge = this.allStandaloneBadges.find(b => b.name === tier.badgeName);
      if (badge?.image) tier.badgeImage = badge.image;
    },
    onAdminCondBadgeSelect(cond) {
      const badge = this.allStandaloneBadges.find(b => b.name === cond.badgeName);
      if (badge?.image) cond.badgeImage = badge.image;
    },
    async handleQuizImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      try {
        const formData = new FormData();
        formData.append('quizImage', file);
        const res = await fetch('/api/admin/quiz-images', {
          method: 'POST',
          headers: { 'Authorization': this.currentUserId.toString() },
          body: formData
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        this.adminQuizForm.quiz_image = data.filename;
      } catch (err) {
        this.adminQuizError = `${this.t('failedToUploadImage')}: ${err.message}`;
      }
    },
    async handleAdminBadgeImageUpload(event, targetObj, field) {
      const file = event.target.files[0];
      if (!file) return;
      try {
        const formData = new FormData();
        formData.append('badgeImage', file);
        const res = await fetch('/api/admin/badge-images', {
          method: 'POST',
          headers: { 'Authorization': this.currentUserId.toString() },
          body: formData
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        targetObj[field] = data.filename;
      } catch (err) {
        this.adminQuizError = `${this.t('failedToUploadBadgeImage')}: ${err.message}`;
      }
    },
    async saveAdminQuiz() {
      this.adminQuizError = '';
      const f = this.adminQuizForm;
      if (!f.title.trim()) { this.adminQuizError = this.t('titleRequired'); return; }
      if (!f.questions.length) { this.adminQuizError = this.t('addAtLeastOneQuestion'); return; }
      for (const q of f.questions) {
        if (!q.question_text.trim()) { this.adminQuizError = this.t('allQuestionsMustHaveText'); return; }
        if (q.options.filter(o => o.trim()).length < 2) { this.adminQuizError = this.t('eachQuestionAtLeastTwoOptions'); return; }
        if (!q.correct_answer) { this.adminQuizError = this.t('selectCorrectAnswerEachQuestion'); return; }
      }
      let resolvedCategory = f.category;
      if (f.category === '__custom__') {
        if (!f.newCategoryLabel.trim()) { this.adminQuizError = this.t('customCategoryNameRequired'); return; }
        resolvedCategory = f.newCategoryLabel.trim().toLowerCase().replace(/\s+/g, '_');
        if (!this.quizFormCategories.find(c => c.key === resolvedCategory))
          this.quizFormCategories.push({ key: resolvedCategory, label: f.newCategoryLabel.trim() });
      }
      try {
        this.adminQuizSaving = true;
        const badgeRules = f.hasBadge ? { ...f.badgeRules, defaultBadgeImage: f.badge_image || null } : null;
        const res = await fetch('/api/admin/quizzes', {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            title: f.title.trim(),
            description: f.description.trim(),
            icon_name: f.icon_name.trim() || 'question',
            category: resolvedCategory,
            difficulty: f.difficulty,
            tmdb_series_id: f.tmdb_series_id ? parseInt(f.tmdb_series_id) : null,
            quiz_image: f.quiz_image || null,
            badge_name: f.hasBadge ? (f.badge_name || null) : null,
            badge_rules: badgeRules,
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
        this.showCreateQuiz = false;
        await this.fetchBadges();
      } catch (err) {
        this.adminQuizError = err.message;
      } finally {
        this.adminQuizSaving = false;
      }
    },

    // === STANDALONE BADGE MANAGEMENT ===
    async fetchStandaloneBadges() {
      try {
        const res = await fetch('/api/admin/standalone-badges', { headers: this.getAuthHeaders() });
        if (!res.ok) throw new Error('Failed');
        this.allStandaloneBadges = await res.json();
      } catch (err) {
        console.error('Error fetching standalone badges:', err);
      }
    },
    async handleStandaloneBadgeImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      try {
        const formData = new FormData();
        formData.append('badgeImage', file);
        const res = await fetch('/api/admin/badge-images', {
          method: 'POST',
          headers: { 'Authorization': this.currentUserId.toString() },
          body: formData
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        this.badgeFormData.image = data.filename;
      } catch (err) {
        this.badgeFormError = `${this.t('failedToUploadImage')}: ${err.message}`;
      }
    },
    async saveNewStandaloneBadge() {
      this.badgeFormError = '';
      if (!this.badgeFormData.name.trim()) { this.badgeFormError = this.t('badgeNameRequired'); return; }
      try {
        this.badgeFormSaving = true;
        const res = await fetch('/api/admin/standalone-badges', {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ name: this.badgeFormData.name.trim(), description: this.badgeFormData.description.trim(), image: this.badgeFormData.image || null })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed');
        this.badgeFormData = { name: '', description: '', image: '' };
        this.showBadgeCreateForm = false;
        await this.fetchStandaloneBadges();
      } catch (err) {
        this.badgeFormError = err.message;
      } finally {
        this.badgeFormSaving = false;
      }
    },
    awardStandaloneBadge(badge) {
      const uid = prompt(this.t('enterUserIdToAwardBadge'));
      if (!uid || isNaN(Number(uid))) return;
      fetch(`/api/admin/standalone-badges/${badge.id}/award`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ userId: Number(uid) })
      }).then(r => r.json()).then(data => {
        alert(data.message === 'Badge awarded' ? this.t('badgeAwardedSuccessfully') : (data.message || this.t('errorAwardingBadge')));
      }).catch(() => alert(this.t('errorAwardingBadge')));
    },
    confirmDeleteStandaloneBadge(badge) {
      this.confirmDialog = {
        show: true,
        title: this.t('deleteBadge'),
        message: this.tFormat('confirmDeleteBadgeTemplate', { name: badge.name }),
        actionText: this.t('delete'),
        action: async () => {
          try {
            const res = await fetch(`/api/admin/standalone-badges/${badge.id}`, {
              method: 'DELETE',
              headers: this.getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed');
            this.allStandaloneBadges = this.allStandaloneBadges.filter(b => b.id !== badge.id);
            this.confirmDialog.show = false;
          } catch (err) {
            alert(`${this.t('errorPrefix')} ${err.message}`);
          }
        }
      };
    },

    // Cosmetics methods
    async fetchCosmetics() {
      try {
        const headers = this.getAuthHeaders();
        const [cosRes, srcRes, quizRes] = await Promise.all([
          fetch('/api/cosmetics/catalog', { headers }),
          fetch('/api/admin/cosmetic-sources', { headers }),
          fetch('/api/quizzes')
        ]);
        if (cosRes.ok) this.allCosmetics = await cosRes.json();
        if (srcRes.ok) this.allCosmeticSources = await srcRes.json();
        if (quizRes.ok) this.allQuizzesForSource = await quizRes.json();
      } catch (err) {
        console.error('Failed to fetch cosmetics:', err);
      }
    },
    async saveNewCosmetic() {
      if (!this.cosmeticFormData.name || !this.cosmeticFormData.effect_key) {
        this.cosmeticFormError = this.t('nameAndEffectRequired');
        return;
      }
      try {
        JSON.parse(this.cosmeticFormData.config);
      } catch {
        this.cosmeticFormError = this.t('configMustBeValidJson');
        return;
      }
      this.cosmeticFormSaving = true;
      this.cosmeticFormError = '';
      try {
        const res = await fetch('/api/admin/cosmetics', {
          method: 'POST',
          headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...this.cosmeticFormData,
            config: JSON.parse(this.cosmeticFormData.config)
          })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to create');
        }
        await this.fetchCosmetics();
        this.showCosmeticCreateForm = false;
        this.cosmeticFormData = {
          name: '', description: '', type: 'cursor_trail', effect_key: 'particle_sparkle',
          config: '{}', preview_image: '', rarity: 'common'
        };
      } catch (err) {
        this.cosmeticFormError = err.message;
      } finally {
        this.cosmeticFormSaving = false;
      }
    },
    deleteCosmetic(id) {
      this.confirmDialog = {
        show: true,
        title: this.t('deleteCosmetic'),
        message: this.t('deleteCosmeticMessage'),
        actionText: this.t('delete'),
        action: async () => {
          try {
            const res = await fetch(`/api/admin/cosmetics/${id}`, {
              method: 'DELETE',
              headers: this.getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed');
            await this.fetchCosmetics();
            this.confirmDialog.show = false;
          } catch (err) {
            alert(`${this.t('errorPrefix')} ${err.message}`);
          }
        }
      };
    },
    async linkCosmeticSource() {
      if (!this.cosmeticSourceForm.cosmetic_id) {
        alert(this.t('selectCosmetic'));
        return;
      }
      const body = {
        cosmetic_id: this.cosmeticSourceForm.cosmetic_id,
        source_type: this.cosmeticSourceForm.source_type
      };
      if (body.source_type === 'quiz') {
        if (!this.cosmeticSourceForm.quiz_id) { alert(this.t('selectQuiz')); return; }
        body.quiz_id = this.cosmeticSourceForm.quiz_id;
        body.min_score = this.cosmeticSourceForm.min_score;
      } else {
        body.milestone_type = this.cosmeticSourceForm.milestone_type;
        body.milestone_value = this.cosmeticSourceForm.milestone_value;
      }
      try {
        const res = await fetch('/api/admin/cosmetic-sources', {
          method: 'POST',
          headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error('Failed to link source');
        await this.fetchCosmetics();
      } catch (err) {
        alert(`${this.t('errorPrefix')} ${err.message}`);
      }
    },
    async deleteCosmeticSource(id) {
      try {
        const res = await fetch(`/api/admin/cosmetic-sources/${id}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed');
        await this.fetchCosmetics();
      } catch (err) {
        alert(`${this.t('errorPrefix')} ${err.message}`);
      }
    },
    async awardCosmeticToUser() {
      if (!this.cosmeticAwardForm.cosmetic_id || !this.cosmeticAwardForm.userId) {
        alert(this.t('selectCosmeticAndUserId'));
        return;
      }
      try {
        const res = await fetch(`/api/admin/cosmetics/${this.cosmeticAwardForm.cosmetic_id}/award`, {
          method: 'POST',
          headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: this.cosmeticAwardForm.userId })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to award');
        }
        alert(this.t('cosmeticAwardedSuccessfully'));
        this.cosmeticAwardForm = { cosmetic_id: '', userId: '' };
      } catch (err) {
        alert(`${this.t('errorPrefix')} ${err.message}`);
      }
    }
  },
  mounted() {
    this.currentLanguage = getCurrentLanguage();
    this._langHandler = (e) => { this.currentLanguage = e.detail.language; };
    window.addEventListener('languageChanged', this._langHandler);

    const auth = JSON.parse(localStorage.getItem('auth'));
    if (!auth?.loggedIn || auth.user.role !== 'admin') {
      this.$router.push('/');
      return;
    }
    this.currentUserId = auth.user.id;
    this.fetchUsers();
    this.fetchBadges();
    this.fetchStandaloneBadges();
    this.fetchReviews();
    this.fetchSiteStats();
    this.fetchCosmetics();
  },
  beforeUnmount() {
    if (this._langHandler) window.removeEventListener('languageChanged', this._langHandler);
  }
};
</script>

<style scoped>
/* Hero */
.hero {
  color: var(--text-color);
  margin-bottom: 0;
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
  margin: 0 0 8px;
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

/* Layout */
.admin-container {
  max-width: 1200px;
  margin: 0 auto 60px;
  padding: 0 20px;
}

/* Tabs */
.admin-tabs {
  display: flex;
  gap: 4px;
  background: var(--dark-bg-color);
  border-radius: 12px 12px 0 0;
  padding: 8px 8px 0;
  margin-top: 0;
  overflow-x: auto;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border: none;
  background: transparent;
  color: var(--subtitle-color);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 10px 10px 0 0;
  transition: all 0.25s ease;
  white-space: nowrap;
}

.tab-btn:hover {
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  color: var(--accent-color);
  background: var(--background-color);
  box-shadow: inset 0 2px 0 var(--accent-color);
}

.tab-icon { font-size: 1.1rem; }

/* Tab Content */
.tab-content {
  background: var(--background-color);
  border-radius: 0 0 12px 12px;
  padding: 30px;
  min-height: 400px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.content-header h2 {
  font-size: 1.5rem;
  color: var(--text-color);
  margin: 0;
}

/* Search */
.search-bar { flex-shrink: 0; }

.search-input {
  padding: 10px 16px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: var(--dark-bg-color);
  color: var(--text-color);
  font-size: 0.95rem;
  width: 250px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-color);
}

/* Stats */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--dark-bg-color);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-color);
}

.stat-label {
  font-size: 0.85rem;
  color: var(--subtitle-color);
}

/* Table */
.table-wrapper {
  overflow-x: auto;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.admin-table th {
  background: var(--dark-bg-color);
  color: var(--subtitle-color);
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.admin-table td {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: var(--text-color);
  vertical-align: middle;
}

.admin-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

.row-banned { opacity: 0.6; }
.row-admin td:first-child { border-left: 3px solid var(--accent-color); }

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.table-pfp {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.truncate {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Badges */
.role-badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.role-badge.admin {
  background: rgba(112, 233, 116, 0.15);
  color: var(--accent-color);
}

.role-badge.user {
  background: rgba(255, 255, 255, 0.08);
  color: var(--subtitle-color);
}

.status-badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.active {
  background: rgba(112, 233, 116, 0.15);
  color: var(--accent-color);
}

.status-badge.banned {
  background: rgba(255, 75, 75, 0.15);
  color: #ff4b4b;
}

.rating-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 700;
  color: white;
}
.rating-1 { background: #ff4c4c; }
.rating-2 { background: #ff884c; }
.rating-3 { background: #ffd93d; color: #333; }
.rating-4 { background: #a6e22e; color: #333; }
.rating-5 { background: #38c172; }

/* Action buttons */
.actions-cell {
  display: flex;
  gap: 6px;
  white-space: nowrap;
}

.action-btn {
  width: 34px;
  height: 34px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: var(--dark-bg-color);
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.action-btn.delete:hover { border-color: #ff4b4b; background: rgba(255, 75, 75, 0.1); }
.action-btn.ban:hover { border-color: #ff884c; background: rgba(255, 136, 76, 0.1); }
.action-btn.unban:hover { border-color: var(--accent-color); background: rgba(112, 233, 116, 0.1); }
.action-btn.promote:hover { border-color: var(--accent-color); background: rgba(112, 233, 116, 0.1); }
.action-btn.demote:hover { border-color: #ff884c; background: rgba(255, 136, 76, 0.1); }

/* Buttons */
.primary-btn {
  padding: 12px 24px;
  background: var(--accent-color);
  color: var(--dark-bg-color);
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-btn:hover:not(:disabled) {
  background: var(--medium-bg-color);
  color: var(--text-color);
  transform: translateY(-2px);
}

.primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.primary-btn.full-width { width: 100%; margin-top: 16px; }

.secondary-btn {
  padding: 8px 16px;
  background: transparent;
  color: var(--accent-color);
  border: 2px solid var(--accent-color);
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.secondary-btn:hover {
  background: var(--accent-color);
  color: var(--dark-bg-color);
}

.danger-btn {
  padding: 12px 24px;
  background: #ff4b4b;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.danger-btn:hover { background: #e03e3e; transform: translateY(-1px); }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--dark-bg-color);
  border-radius: 16px;
  padding: 30px;
  max-width: 700px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--accent-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.4rem;
  color: var(--text-color);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-color);
  cursor: pointer;
  transition: color 0.2s;
}

.modal-close:hover { color: var(--accent-color); }

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Form */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--subtitle-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  padding: 10px 14px;
  border: 2px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: var(--background-color);
  color: var(--text-color);
  font-size: 0.95rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-color);
}

.form-textarea { min-height: 80px; resize: vertical; font-family: inherit; }
.emoji-input { max-width: 100px; font-size: 1.5rem; text-align: center; }
.form-select { max-width: 120px; cursor: pointer; }

/* Questions */
.questions-section {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 16px;
}

.questions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.questions-header h4 {
  margin: 0;
  color: var(--text-color);
}

.question-card {
  background: var(--background-color);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.question-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-num {
  font-weight: 700;
  color: var(--accent-color);
  font-size: 0.9rem;
}

.remove-question-btn {
  background: none;
  border: none;
  color: #ff4b4b;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 4px;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.correct-answer {
  display: flex;
  align-items: center;
  gap: 10px;
}

.correct-answer label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--subtitle-color);
  white-space: nowrap;
}

/* Badges Grid */
.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.badge-admin-card {
  background: var(--dark-bg-color);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.badge-admin-card:hover {
  border-color: var(--accent-color);
  box-shadow: 0 4px 16px rgba(112, 233, 116, 0.1);
}

.badge-admin-header {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.badge-emoji { font-size: 2.5rem; }

.badge-admin-info h4 {
  margin: 0 0 4px;
  color: var(--text-color);
  font-size: 1.05rem;
}

.badge-admin-info p {
  margin: 0;
  color: var(--subtitle-color);
  font-size: 0.85rem;
  line-height: 1.4;
}

.badge-admin-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.badge-stat {
  font-size: 0.8rem;
  color: var(--subtitle-color);
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 10px;
  border-radius: 6px;
}

.badge-admin-footer .action-btn { margin-left: auto; }

/* Confirm Dialog */
.confirm-dialog {
  background: var(--dark-bg-color);
  border-radius: 16px;
  padding: 30px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.confirm-dialog h3 {
  margin: 0 0 12px;
  color: var(--text-color);
  font-size: 1.3rem;
}

.confirm-dialog p {
  color: var(--subtitle-color);
  line-height: 1.5;
  margin: 0 0 24px;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Settings */
.settings-section {
  background: var(--dark-bg-color);
  border-radius: 12px;
  padding: 24px;
  margin-top: 20px;
}

.settings-section h3 {
  margin: 0 0 16px;
  color: var(--text-color);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--subtitle-color);
}

/* Responsive */
@media (max-width: 768px) {
  .admin-tabs {
    border-radius: 12px 12px 0 0;
  }

  .tab-label { display: none; }
  .tab-icon { font-size: 1.3rem; }

  .tab-content { padding: 20px 16px; }

  .search-input { width: 100%; }

  .options-grid { grid-template-columns: 1fr; }

  .badges-grid { grid-template-columns: 1fr; }

  .admin-table { font-size: 0.8rem; }
  .admin-table th, .admin-table td { padding: 8px 10px; }

  .quiz-form-row-2 { grid-template-columns: 1fr; }
}

/* Quiz creation form */
.quiz-form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.quiz-block {
  background: var(--background-color);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.quiz-options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}
.quiz-opt-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--dark-bg-color);
  border-radius: 7px;
  padding: 8px 10px;
  border: 1.5px solid transparent;
}
.quiz-opt-row.quiz-opt-correct { border-color: var(--accent-color); }
.quiz-toggle-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: var(--text-color);
  cursor: pointer;
  margin: 8px 0;
}
.quiz-toggle-row input[type="checkbox"] {
  accent-color: var(--accent-color);
  width: 16px;
  height: 16px;
}

/* Cosmetics Tab */
.cosmetics-actions-row {
  display: flex;
  gap: 1.5rem;
  margin-top: 1.5rem;
}
.cosmetics-actions-row .half {
  flex: 1;
  min-width: 0;
}
.cosmetic-type-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}
.cosmetic-type-tag.cursor_trail {
  background: rgba(100, 200, 255, 0.15);
  color: #64c8ff;
}
.cosmetic-type-tag.background_effect {
  background: rgba(200, 100, 255, 0.15);
  color: #c864ff;
}
.rarity-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}
.rarity-tag.common { background: rgba(180,180,180,0.15); color: #aaa; }
.rarity-tag.rare { background: rgba(66,135,245,0.15); color: #4287f5; }
.rarity-tag.epic { background: rgba(163,53,238,0.15); color: #a335ee; }
.rarity-tag.legendary { background: rgba(255,165,0,0.15); color: #ffa500; }
.form-card {
  background: var(--card-bg, rgba(30,30,40,0.6));
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(255,255,255,0.06);
}
.form-card h3 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
}
.form-row {
  margin-bottom: 0.75rem;
}
.form-row label {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 4px;
  opacity: 0.8;
}
.form-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.05);
  color: var(--text-color);
  font-size: 0.9rem;
  box-sizing: border-box;
}
.form-input:focus {
  outline: none;
  border-color: var(--accent-color);
}
.form-error {
  color: #ef4444;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

@media (max-width: 700px) {
  .cosmetics-actions-row {
    flex-direction: column;
  }
}
</style>
