<template>
  <div id="app">
    <div v-if="user">
      <!-- DEV: Cursor test overlay -->
      <CursorTrail v-if="cursorTestActive && cursorTestCurrent" :effectKey="cursorTestCurrent" :config="cursorTestConfigs[cursorTestCurrent] || {}" />
      <!-- Profile-wide background effect -->
      <ProfileBackground
        v-if="bgTestActive ? bgTestCurrent : activeBackground"
        :key="bgTestActive ? bgTestCurrent : activeBackground.effect_key"
        :effectKey="bgTestActive ? bgTestCurrent : activeBackground.effect_key"
        :config="bgTestActive ? (bgTestConfigs[bgTestCurrent] || {}) : parsedBgConfig"
        class="page-background-effect"
      />
      <!-- Hero Section -->
      <header class="hero">
        <div class="hero-band">
          <div class="hero-inner">
            <h1>{{ user.username }}'s {{ t('profile') }}</h1>
            <p class="subtitle"><SvgIcon name="edit" :size="16" /> {{ reviewCount }} {{ t('reviews') }} • <SvgIcon name="tv" :size="16" /> {{ followedShows.length }} {{ t('followedShows') }} • <SvgIcon name="users" :size="16" /> {{ followerCount }} {{ t('followers') }} • <SvgIcon name="heart" :size="16" /> {{ followingCount }} {{ t('following') }}</p>
          </div>
        </div>
      </header>

      <div class="profile-container">
        <!-- Profile Card -->
        <div class="profile-card">
          <div class="profile-header">
            <div class="pfp-section">
              <div class="pfp-wrapper" @click="isOwnProfile ? showProfilePictureModal = true : null" :style="{ cursor: isOwnProfile ? 'pointer' : 'default' }">
                <img 
                  class="profile-icon" 
                  :src="profileImageUrl || defaultIcon"
                  alt="Profile Icon"
                  @error="$event.target.src = '/assets/default_pfp_icons/default_grey.png'"
                />
                <div class="pfp-overlay" v-if="isOwnProfile && !isUploading">
                  <SvgIcon name="settings" :size="32" />
                </div>
                <div class="upload-spinner" v-if="isUploading">
                  <div class="spinner"></div>
                </div>
                <span v-if="user.role === 'admin'" class="admin-icon"><SvgIcon name="shield" :size="36" /></span>
                <div v-if="selectedBadge" class="selected-badge-display" :class="{ 'badge-below-admin': user.role === 'admin' }" :title="selectedBadge.title">
                  <img v-if="selectedBadge.badge_image" :src="`/assets/badges/${selectedBadge.badge_image}`" class="selected-badge-img" :alt="selectedBadge.title" />
                  <span v-else>{{ selectedBadge.icon_emoji || '🏅' }}</span>
                </div>
              </div>
            </div>

            <!-- Profile Picture Selection Modal (Owner only) -->
            <div v-if="isOwnProfile && showProfilePictureModal" class="modal-overlay" @click.self="showProfilePictureModal = false">
              <div class="modal-content pfp-modal-wide">
                <div class="modal-header">
                  <h3>{{ t('selectProfilePicture') }}</h3>
                  <button class="modal-close" @click="showProfilePictureModal = false"><SvgIcon name="close" :size="18" /></button>
                </div>
                <div class="pfp-modal-tabs">
                  <button :class="['pfp-tab', { active: pfpModalTab === 'defaults' }]" @click="pfpModalTab = 'defaults'">{{ t('defaultIcons') }}</button>
                  <button :class="['pfp-tab', { active: pfpModalTab === 'maker' }]" @click="pfpModalTab = 'maker'">{{ t('avatarMaker') }}</button>
                  <button :class="['pfp-tab', { active: pfpModalTab === 'upload' }]" @click="pfpModalTab = 'upload'">{{ t('uploadImage') }}</button>
                </div>
                <div class="modal-body">
                  <div v-if="pfpModalTab === 'defaults'">
                    <div class="pfp-section-title">{{ t('chooseDefaultPicture') }}</div>
                    <div class="default-pfp-grid">
                      <div 
                        v-for="icon in defaultIcons" 
                        :key="icon" 
                        class="default-pfp-option"
                        :class="{ selected: profileImageUrl === `/assets/default_pfp_icons/${icon}` }"
                        @click="selectDefaultProfilePicture(icon)"
                      >
                        <img :src="`/assets/default_pfp_icons/${icon}`" :alt="icon" />
                        <div v-if="profileImageUrl === `/assets/default_pfp_icons/${icon}`" class="checkmark"><SvgIcon name="check" :size="22" /></div>
                      </div>
                    </div>
                  </div>
                  <div v-if="pfpModalTab === 'maker'">
                    <AvatarMaker :userId="user.id" @saved="onAvatarSaved" />
                  </div>
                  <div v-if="pfpModalTab === 'upload'">
                    <div class="pfp-section-title">{{ t('uploadCustomPicture') }}</div>
                    <div class="upload-area">
                      <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*" style="display: none;" />
                      <button class="upload-btn" @click="triggerFileUpload" :disabled="isUploading">
                        <span v-if="!isUploading" style="display:inline-flex;align-items:center;gap:8px;"><SvgIcon name="upload" :size="18" /> {{ t('uploadImage') }}</span>
                        <span v-else>{{ t('uploading') }}</span>
                      </button>
                      <p class="upload-hint">{{ t('uploadHint') }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="user-details">
              <div class="username-section">
                <h2 class="username" v-if="!isEditingUsername">
                  {{ user.username }}
                  <span v-if="user.role==='admin'" class="admin-label"> ({{ t('admin') }})</span>
                </h2>
                <div v-if="isOwnProfile && isEditingUsername" class="edit-username-form">
                  <input v-model="newUsername" class="username-input" />
                  <div class="edit-buttons">
                    <button class="save-btn" @click="saveUsername">{{ t('save') }}</button>
                    <button class="cancel-btn" @click="isEditingUsername=false">{{ t('cancel') }}</button>
                  </div>
                </div>
              </div>

              <div class="action-buttons">
                <template v-if="isOwnProfile">
                  <button class="edit-btn" @click="edit" v-if="!isEditingUsername">
                    <SvgIcon name="edit" :size="20" />
                    <span>{{ t('editProfile') }}</span>
                  </button>
                  <button class="logout-btn" @click="logout">
                    <SvgIcon name="log-out" :size="20" />
                    <span>{{ t('logout') }}</span>
                  </button>
                </template>
                <template v-else>
                  <button
                    v-if="auth && auth.loggedIn"
                    class="follow-btn"
                    :class="{ 'following': isFollowing }"
                    @click="toggleFollow"
                    :disabled="followLoading"
                  >
                    <SvgIcon :name="isFollowing ? 'heart-fill' : 'heart'" :size="20" />
                    <span>{{ isFollowing ? t('unfollow') : t('follow') }}</span>
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Badges Section -->
        <div v-if="badges.length > 0" class="badges-section">
          <SectionHeader>
            <SvgIcon name="badge" :size="22" /> {{ isOwnProfile ? t('badges') : t('earnedBadges') }}
            <template #actions v-if="isOwnProfile">
              <div class="badge-header-actions">
                <span class="badge-hint">{{ t('clickToInspect') }}</span>
                <button v-if="selectedDisplayBadgeId" class="remove-badge-btn" @click="removeDisplayBadge">{{ t('removeBadge') }}</button>
              </div>
            </template>
          </SectionHeader>
          <div class="badges-container">
            <div 
              v-for="badge in badges" 
              :key="badge.id" 
              class="badge-item" 
              :class="{ 'badge-selected': isOwnProfile ? selectedDisplayBadgeId === badge.id : selectedBadge?.id === badge.id }"
              @click="openBadgeInspect(badge)"
              style="cursor: pointer;"
            >
              <div class="badge-item-header">
                <img v-if="badge.badge_image" :src="`/assets/badges/${badge.badge_image}`" class="badge-img" :alt="badge.title" />
                <span v-else class="badge-icon">{{ badge.icon_emoji || '🏅' }}</span>
                <div v-if="(isOwnProfile && selectedDisplayBadgeId === badge.id) || (!isOwnProfile && selectedBadge?.id === badge.id)" class="badge-check"><SvgIcon name="check" :size="14" /></div>
              </div>
              <div class="badge-info">
                <p class="badge-title">{{ badge.title }}</p>
                <p class="badge-earned">{{ formatDate(badge.earned_at) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Badge Inspect Modal -->
        <div v-if="inspectBadge" class="badge-inspect-overlay" @click.self="closeBadgeInspect">
          <div class="badge-inspect-modal">
            <button class="badge-inspect-close" @click="closeBadgeInspect"><SvgIcon name="close" :size="18" /></button>
            <div class="badge-inspect-card">
              <div 
                class="badge-inspect-image"
                ref="badgeInspectCard"
                @mousemove="handleBadgeTilt"
                @mouseleave="resetBadgeTilt"
              >
                <img v-if="inspectBadge.badge_image" ref="badgeInspectImg" :src="`/assets/badges/${inspectBadge.badge_image}`" :alt="inspectBadge.title" />
                <span v-else ref="badgeInspectImg" class="badge-inspect-emoji">{{ inspectBadge.icon_emoji || '🏅' }}</span>
              </div>
              <h3 class="badge-inspect-title">{{ inspectBadge.title }}</h3>
              <p v-if="inspectBadge.description" class="badge-inspect-desc">{{ inspectBadge.description }}</p>
              <p class="badge-inspect-date">{{ t('earned') }} {{ formatDate(inspectBadge.earned_at) }}</p>
            </div>
            <div v-if="isOwnProfile" class="badge-inspect-actions">
              <button 
                v-if="selectedDisplayBadgeId !== inspectBadge.id"
                class="badge-inspect-select-btn" 
                @click="selectDisplayBadge(inspectBadge.id); closeBadgeInspect()"
              >{{ t('setAsDisplayBadge') }}</button>
              <button 
                v-else
                class="badge-inspect-remove-btn"
                @click="removeDisplayBadge(); closeBadgeInspect()"
              >{{ t('removeDisplayBadge') }}</button>
            </div>
          </div>
        </div>

        <!-- Cosmetics Section (Owner only) -->
        <div v-if="isOwnProfile" class="cosmetics-section">
          <SectionHeader><SvgIcon name="palette" :size="22" /> {{ t('cosmetics') }}</SectionHeader>
          <CosmeticsPanel :userId="user.id" :isOwnProfile="isOwnProfile" />
        </div>

        <!-- DEV: Background Effects Test -->
        <div v-if="isOwnProfile && bgTestActive" class="bg-test-section">
          <SectionHeader>
            {{ t('backgroundEffectsTest') }}
            <template #actions>
              <button class="bg-test-close" @click="bgTestActive = false">✕</button>
            </template>
          </SectionHeader>
          <div class="bg-test-buttons">
            <button
              v-for="eff in bgTestEffects"
              :key="eff.key"
              :class="{ active: bgTestCurrent === eff.key }"
              @click="bgTestCurrent = eff.key"
            >{{ eff.label }}</button>
          </div>
          <p class="bg-test-hint">Effect is applied to the page background. Move your mouse around to see interactive effects.</p>
        </div>
        <!-- For Developer BG testing <button v-if="isOwnProfile && !bgTestActive" class="bg-test-toggle" @click="bgTestActive = true">🛠 {{ t('testBackgrounds') }}</button> -->

        <!-- DEV: Cursor Effects Test -->
        <div v-if="isOwnProfile && cursorTestActive" class="bg-test-section">
          <SectionHeader>
            {{ t('cursorEffectsTest') }}
            <template #actions>
              <button class="bg-test-close" @click="cursorTestActive = false; cursorTestCurrent = null">✕</button>
            </template>
          </SectionHeader>
          <div class="bg-test-buttons">
            <button
              v-for="eff in cursorTestEffects"
              :key="eff.key"
              :class="{ active: cursorTestCurrent === eff.key }"
              @click="cursorTestCurrent = eff.key"
            >{{ eff.label }}</button>
          </div>
          <p class="bg-test-hint">Move your mouse around to see the cursor effect. Click a different effect to switch.</p>
        </div>
        <!-- For Developer Cursor Effect testing <button v-if="isOwnProfile && !cursorTestActive" class="bg-test-toggle" @click="cursorTestActive = true">🖱 {{ t('testCursors') }}</button> -->

        <!-- Favorite Shows Section (Owner - editable) -->
        <div v-if="isOwnProfile" class="favorites-section">
          <SectionHeader>{{ t('favoriteShows') }}</SectionHeader>
          <div class="favorites-grid">
            <div v-for="(fav, index) in favorites" :key="index" class="favorite-slot" :class="{ dragging: isDragging && index === dragIndex }" @dragstart="dragStart($event, index)" @dragover.prevent @drop="drop($event, index)" @dragend="dragEnd" @click="openSelectModal(index)" :draggable="fav.tmdb_id !== null">
              <img v-if="fav.poster" :src="fav.poster" :alt="fav.title" />
              <div v-if="fav.title" class="show-title">{{ fav.title }}</div>
              <div v-else class="empty-slot">{{ t('selectShowSlot') }} {{ index + 1 }}</div>
              <button v-if="fav.tmdb_id" class="remove-btn" @click.stop="removeFavorite(index)" title="Remove show"><SvgIcon name="close" :size="14" /></button>
            </div>
          </div>
          <div v-if="showSelectModal" class="modal-overlay" @click.self="showSelectModal = false">
            <div class="modal-content">
              <div class="modal-header">
                <h3>{{ t('selectShowSlot') }} {{ selectingPosition + 1 }}</h3>
                <button class="modal-close" @click="showSelectModal = false"><SvgIcon name="close" :size="18" /></button>
              </div>
              <div class="modal-body">
                <input v-model="searchQuery" @input="searchShows" type="text" class="search-input" :placeholder="t('searchTVShows')" />
                <div class="search-results">
                  <div v-for="show in searchResults" :key="show.id" class="search-result" @click="selectShow(show)">
                    <img v-if="show.poster_path" :src="`https://image.tmdb.org/t/p/w200${show.poster_path}`" :alt="show.name" />
                    <div>
                      <div class="result-title">{{ show.name }}</div>
                      <div class="result-year" v-if="show.first_air_date">{{ show.first_air_date.split('-')[0] }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Favorite Shows Section (Visitor - read only) -->
        <div v-if="!isOwnProfile && favoriteShows.length > 0" class="favorites-section">
          <SectionHeader>{{ t('favoriteShows') }}</SectionHeader>
          <div class="favorites-grid">
            <div 
              v-for="fav in paddedFavorites" 
              :key="fav.position" 
              class="favorite-slot"
              :class="{ 'common-highlight': isCommonFavorite(fav.tmdb_series_id) }"
              @click="fav.tmdb_series_id ? $router.push(`/series/${fav.tmdb_series_id}`) : null"
            >
              <img v-if="fav.poster" :src="fav.poster" :alt="fav.title" />
              <div v-if="fav.title" class="show-title">
                {{ fav.title }}
                <span v-if="isCommonFavorite(fav.tmdb_series_id)" class="common-tag">⭐ {{ t('inCommon') }}</span>
              </div>
              <div v-else class="empty-slot">{{ t('slot') }} {{ fav.position }}</div>
            </div>
          </div>
        </div>

        <!-- Common Shows Section (Visitor only) -->
        <div v-if="!isOwnProfile && auth && auth.loggedIn && (commonFollowedShowsData.length > 0 || commonFavoritesData.length > 0)" class="common-section">
          <SectionHeader><SvgIcon name="star" :size="22" /> {{ t('whatInCommon') }}</SectionHeader>
          <div v-if="commonFavoritesData.length > 0" class="common-group">
            <h3 class="common-subtitle">{{ t('sharedFavoriteShows') }} ({{ commonFavoritesData.length }})</h3>
            <div class="common-grid">
              <div 
                v-for="show in commonFavoritesData" 
                :key="'cf-' + show.tmdb_series_id" 
                class="common-card"
                @click="$router.push(`/series/${show.tmdb_series_id}`)"
              >
                <img v-if="show.poster" :src="show.poster" :alt="show.title" class="common-poster" />
                <div v-else class="common-poster-placeholder"><SvgIcon name="monitor" :size="30" /></div>
                <div class="common-info">
                  <p class="common-title">{{ show.title }}</p>
                  <p class="common-positions">You: #{{ show.your_position }} • Them: #{{ show.their_position }}</p>
                </div>
              </div>
            </div>
          </div>
          <div v-if="commonFollowedShowsData.length > 0" class="common-group">
            <h3 class="common-subtitle">{{ t('sharedFollowedShows') }} ({{ commonFollowedShowsData.length }})</h3>
            <div class="common-grid">
              <div 
                v-for="show in commonFollowedShowsData" 
                :key="'cs-' + show.tmdb_series_id" 
                class="common-card"
                @click="$router.push(`/series/${show.tmdb_series_id}`)"
              >
                <img v-if="show.poster" :src="show.poster" :alt="show.title" class="common-poster" />
                <div v-else class="common-poster-placeholder"><SvgIcon name="monitor" :size="30" /></div>
                <div class="common-info">
                  <p class="common-title">{{ show.title }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reviews Section -->
        <div class="reviews-section" v-if="reviews.length">
          <SectionHeader>
            {{ isOwnProfile ? t('userReviews') : t('recentReviews') + ' ' + t('reviews') }}
            <template #actions v-if="isOwnProfile">
              <button class="new-review-btn" @click="new_review">+ {{ t('newReview') }}</button>
            </template>
          </SectionHeader>
          <div class="reviews-grid">
            <div 
              v-for="review in displayReviews" 
              :key="review.id" 
              class="review-card"
              @click="$router.push(`/review/${review.id}`)"
              role="button"
              tabindex="0"
              @keydown.enter="$router.push(`/review/${review.id}`)"
            >
              <img v-if="review.episode_image" :src="review.episode_image" alt="Episode Still" class="episode-still"/>
              <div v-else class="episode-img-placeholder"><SvgIcon name="monitor" :size="32" /></div>
              <div class="review-info">
                <strong class="episode-title">{{ review.episode_title || `S${review.season_number}E${review.episode_number}` }}</strong>
                <span class="series-info">{{ review.series_title }}{{ isOwnProfile ? ` | S${review.season_number}E${review.episode_number}` : '' }}</span>
                <p :class="['rating-text', `rating-${isOwnProfile ? review.rating : Math.round(review.rating)}`]">
                  {{ t('rating') }}: {{ review.rating }}/5
                </p>
                <p v-if="isOwnProfile" class="review-text"><b>{{ review.review_title }}</b>: {{ review.review_text }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Comments Section -->
        <div class="comments-section" v-if="userComments.length">
          <SectionHeader><SvgIcon name="chat" :size="22" /> {{ t('postedComments') }}</SectionHeader>
          <div class="comments-list">
            <div v-for="comment in displayComments" :key="comment.id" class="comment-card" @click="$router.push(`/review/${comment.review_id}`)">
              <div class="comment-header">
                <p class="review-title">{{ comment.review_title }}</p>
                <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
              </div>
              <p class="comment-text">{{ comment.comment_text }}</p>
            </div>
          </div>
        </div>

        <!-- Followed Shows Section -->
        <div class="followed-shows-section" v-if="followedShows.length">
          <SectionHeader><SvgIcon name="star" :size="22" /> {{ t('followedShows') }}</SectionHeader>
          <div class="followed-grid">
            <div 
              v-for="show in followedShows.slice(0, 12)" 
              :key="show.tmdb_series_id" 
              class="followed-card"
              @click="$router.push(`/series/${show.tmdb_series_id}`)"
            >
              <img v-if="show.poster" :src="show.poster" :alt="show.title" class="followed-poster" />
              <div v-else class="followed-poster-placeholder"><SvgIcon name="monitor" :size="48" /></div>
              <div class="followed-info">
                <p class="followed-title">{{ show.title || 'Loading...' }}</p>
                <p v-if="isOwnProfile" class="followed-date">{{ formatDate(show.followed_at) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State (Owner) -->
        <div v-if="isOwnProfile && !reviews.length && !followedShows.length" class="empty-state">
          <div class="empty-icon"><SvgIcon name="note" :size="64" /></div>
          <p>{{ t('noReviewsYet') }}</p>
          <button class="new-review-btn" @click="new_review">+ {{ t('newReview') }}</button>
        </div>

        <!-- Empty State (Visitor) -->
        <div v-if="!isOwnProfile && !hasVisitorContent" class="empty-state">
          <div class="empty-icon"><SvgIcon name="note" :size="64" /></div>
          <p>{{ t('noPublicActivity') }}</p>
        </div>
      </div>
    </div>

    <div v-else class="loading">
      <div class="spinner"></div>
      <p>{{ t('loading') }}...</p>
    </div>
  </div>
</template>

<script>
import { getTranslation, getCurrentLanguage } from '@/services/translations.js'
import SvgIcon from '@/components/SvgIcon.vue'
import SectionHeader from '@/components/SectionHeader.vue'
import AvatarMaker from '@/components/AvatarMaker.vue'
import CosmeticsPanel from '@/components/CosmeticsPanel.vue'
import ProfileBackground from '@/components/ProfileBackground.vue'
import CursorTrail from '@/components/CursorTrail.vue'

export default {
  components: { SvgIcon, SectionHeader, AvatarMaker, CosmeticsPanel, ProfileBackground, CursorTrail },
  data() {
    return {
      // Shared
      user: null,
      reviews: [],
      reviewCount: 0,
      userComments: [],
      followedShows: [],
      badges: [],
      selectedBadge: null,
      followerCount: 0,
      followingCount: 0,
      currentLanguage: 'en',
      isOwnProfile: false,
      auth: null,
      defaultIcon: '/assets/default_pfp_icons/default_grey.png',
      profileImageUrl: null,
      activeBackground: null,

      // DEV: Background test
      bgTestActive: false,
      bgTestCurrent: 'particles_stars',
      bgTestEffects: [
        { key: 'particles_stars', label: 'Stars' },
        { key: 'particles_bubbles', label: 'Bubbles' },
        { key: 'particles_fireflies', label: 'Fireflies' },
        { key: 'pattern_dots', label: 'Dots' },
        { key: 'pattern_waves', label: 'Waves' },
        { key: 'pattern_grid', label: 'Grid' },
        { key: 'smooth_wavy', label: 'Smooth Wavy' },
        { key: 'flowing_ribbons', label: 'Flowing Ribbons' },
      ],
      bgTestConfigs: {
        particles_stars: { count: 80, color: '255, 255, 200' },
        particles_bubbles: { count: 50, color: '150, 220, 255' },
        particles_fireflies: { count: 40, color: '200, 255, 100' },
        pattern_dots: { gridSpacing: 30, dotColor: '#70e974', animationSpeed: 0.005 },
        pattern_waves: { color: '112, 233, 116', waveCount: 4 },
        pattern_grid: { color: '80, 200, 200', gridSpacing: 40 },
        smooth_wavy: { primaryColor: '112, 233, 116', secondaryColor: '80, 200, 200', accentColor: '120, 80, 255', lineOpacity: 0.8 },
        flowing_ribbons: { lineColor: 'rgba(112, 233, 116, 0.35)' },
      },

      // DEV: Cursor test
      cursorTestActive: false,
      cursorTestCurrent: null,
      cursorTestEffects: [
        { key: 'particle_sparkle', label: 'Sparkle' },
        { key: 'particle_fire', label: 'Fire' },
        { key: 'particle_snow', label: 'Snow' },
        { key: 'glow_smooth', label: 'Glow Smooth' },
        { key: 'glow_rainbow', label: 'Glow Rainbow' },
        { key: 'particle_fairydust', label: 'Fairy Dust' },
        { key: 'particle_bubble', label: 'Bubbles' },
        { key: 'rainbow_cursor', label: 'Rainbow' },
        { key: 'canvas_cursor', label: 'Canvas' },
        { key: 'fluid_cursor', label: 'Fluid' },
      ],
      cursorTestConfigs: {},

      // Owner-only
      defaultIcons: ['default_grey.png', 'default_green.png', 'default_pink.png'],
      newUsername: '',
      isEditingUsername: false,
      isUploading: false,
      showProfilePictureModal: false,
      pfpModalTab: 'defaults',
      favorites: Array(5).fill().map(() => ({ tmdb_id: null, title: '', poster: '' })),
      dragIndex: null,
      isDragging: false,
      dragImage: null,
      showSelectModal: false,
      selectingPosition: null,
      searchQuery: '',
      searchResults: [],
      selectedDisplayBadgeId: null,
      inspectBadge: null,

      // Visitor-only
      isFollowing: false,
      followLoading: false,
      favoriteShows: [],
      commonFollowedShows: [],
      commonFavorites: [],
      commonFollowedShowsData: [],
      commonFavoritesData: []
    };
  },
  computed: {
    hasVisitorContent() {
      return this.badges.length > 0 ||
             this.reviews.length > 0 || this.userComments.length > 0 ||
             this.favoriteShows.length > 0 || this.followedShows.length > 0;
    },
    paddedFavorites() {
      const padded = [];
      for (let i = 0; i < 5; i++) {
        const fav = this.favoriteShows.find(f => f.position === i + 1);
        padded.push(fav || { position: i + 1, tmdb_series_id: null, title: '', poster: '' });
      }
      return padded;
    },
    displayReviews() {
      return this.isOwnProfile ? this.reviews : this.reviews.slice(0, 6);
    },
    displayComments() {
      return this.isOwnProfile ? this.userComments : this.userComments.slice(0, 5);
    },
    parsedBgConfig() {
      if (!this.activeBackground) return {};
      const cfg = this.activeBackground.config;
      if (!cfg) return {};
      if (typeof cfg === 'string') {
        try { return JSON.parse(cfg); } catch { return {}; }
      }
      return cfg;
    }
  },
  methods: {
    t(key) {
      return getTranslation(key, this.currentLanguage);
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString(this.currentLanguage === 'lv' ? 'lv-LV' : 'en-US');
    },

    // === Shared data loading ===
    async fetchShowDetails(tmdbId) {
      try {
        const res = await fetch(`/api/tmdb/series/${tmdbId}?lang=${encodeURIComponent(this.currentLanguage)}`);
        const data = await res.json();
        return {
          tmdb_id: tmdbId,
          title: data.name || this.t('noShow'),
          poster: data.poster_path ? `https://image.tmdb.org/t/p/w200${data.poster_path}` : ''
        };
      } catch (error) {
        return { tmdb_id: tmdbId, title: this.t('noShow'), poster: '' };
      }
    },
    async loadFollowCounts(userId) {
      try {
        const res = await fetch(`/api/users/${userId}/follow-counts`);
        if (res.ok) {
          const data = await res.json();
          this.followerCount = data.followers;
          this.followingCount = data.following;
        }
      } catch (error) {
        console.error('Failed to load follow counts:', error);
      }
    },
    async fetchUserReviews(userId) {
      try {
        const res = await fetch(`/api/user-reviews/${userId}?lang=${encodeURIComponent(this.currentLanguage)}`);
        if (!res.ok) throw new Error('Failed to fetch reviews');
        this.reviews = await res.json();
        this.reviewCount = this.reviews.length;
      } catch (error) {
        console.error('Failed to fetch user reviews:', error);
      }
    },
    async fetchUserBadges(userId) {
      try {
        const res = await fetch(`/api/users/${userId}/badges`);
        if (!res.ok) throw new Error('Failed to fetch badges');
        this.badges = await res.json();
        if (this.user.selected_badge_id) {
          this.selectedDisplayBadgeId = this.user.selected_badge_id;
          this.selectedBadge = this.badges.find(b => b.id === this.user.selected_badge_id) || null;
        } else if (this.badges.length > 0) {
          this.selectedDisplayBadgeId = this.badges[0].id;
          this.selectedBadge = this.badges[0];
        }
      } catch (error) {
        console.error('Failed to fetch user badges:', error);
      }
    },
    async fetchActiveCosmetics(userId) {
      try {
        const res = await fetch(`/api/users/${userId}/active-cosmetics`);
        if (!res.ok) return;
        const data = await res.json();
        this.activeBackground = data.backgroundEffect || null;
      } catch (err) {
        console.error('Failed to fetch active cosmetics:', err);
      }
    },
    async fetchUserComments(userId) {
      try {
        const res = await fetch(`/api/users/${userId}/comments`);
        if (!res.ok) throw new Error('Failed to fetch comments');
        this.userComments = await res.json();
      } catch (error) {
        console.error('Failed to fetch user comments:', error);
      }
    },
    async fetchFollowedShows(userId) {
      try {
        const res = await fetch(`/api/followed-shows/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch followed shows');
        const shows = await res.json();
        const enriched = await Promise.all(
          shows.map(async (show) => {
            try {
              const details = await this.fetchShowDetails(show.tmdb_series_id);
              return { ...show, title: details.title, poster: details.poster };
            } catch {
              return { ...show, title: this.t('noShow'), poster: '' };
            }
          })
        );
        this.followedShows = enriched;
      } catch (error) {
        console.error('Failed to fetch followed shows:', error);
      }
    },

    // === Owner-only methods ===
    getProfileImageUrl(profilePicture) {
      if (!profilePicture) return this.defaultIcon;
      const cacheBuster = Math.random().toString(36).substring(7);
      return `${profilePicture}?cb=${cacheBuster}`;
    },
    edit() {
      this.newUsername = this.user.username;
      this.isEditingUsername = true;
    },
    triggerFileUpload() {
      if (!this.isUploading) this.$refs.fileInput.click();
    },
    onAvatarSaved(profilePicturePath) {
      const cacheBuster = Date.now();
      this.profileImageUrl = `${profilePicturePath}?t=${cacheBuster}`;
      this.user.profile_picture = profilePicturePath;
      const auth = JSON.parse(localStorage.getItem('auth'));
      auth.user.profile_picture = profilePicturePath;
      localStorage.setItem('auth', JSON.stringify(auth));
      this.showProfilePictureModal = false;
      alert(this.t('avatarSavedSuccessfully'));
    },
    async selectDefaultProfilePicture(icon) {
      const defaultPath = `/assets/default_pfp_icons/${icon}`;
      this.profileImageUrl = defaultPath;
      try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        const res = await fetch(`/api/users/${this.user.id}/profile-picture-default`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth.user.id.toString()
          },
          body: JSON.stringify({ picturePath: defaultPath })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update profile picture');
        this.user.profile_picture = defaultPath;
        auth.user.profile_picture = defaultPath;
        localStorage.setItem('auth', JSON.stringify(auth));
        alert(this.t('profilePictureUpdatedSuccessfully'));
        this.showProfilePictureModal = false;
      } catch(err) {
        console.error('Error selecting default profile picture:', err);
        alert(err.message || this.t('profilePictureUpdateError'));
      }
    },
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        alert(this.t('selectImageFile'));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(this.t('imageSizeLessThan5MB'));
        return;
      }
      this.isUploading = true;
      try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        const formData = new FormData();
        formData.append('profilePicture', file);
        const res = await fetch(`/api/users/${this.user.id}/profile-picture`, {
          method: 'POST',
          headers: { 'Authorization': auth.user.id.toString() },
          body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to upload profile picture');
        const newPicturePath = data.profilePicture;
        this.user.profile_picture = newPicturePath;
        const cacheBuster = Date.now();
        this.profileImageUrl = `${newPicturePath}?t=${cacheBuster}`;
        auth.user.profile_picture = newPicturePath;
        localStorage.setItem('auth', JSON.stringify(auth));
        alert(this.t('profilePictureUpdatedSuccessfully'));
        this.showProfilePictureModal = false;
      } catch(err) {
        console.error('Upload error:', err);
        alert(err.message || this.t('profilePictureUploadError'));
      } finally {
        this.isUploading = false;
        this.$refs.fileInput.value = '';
      }
    },
    async saveUsername() {
      if (!this.newUsername.trim()) return alert(this.t('usernameCannotBeEmpty'));
      if (this.newUsername === this.user.username) return this.isEditingUsername = false;
      try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        const res = await fetch(`/api/users/${this.user.id}/username`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth.user.id.toString()
          },
          body: JSON.stringify({ newUsername: this.newUsername })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update username');
        this.user.username = data.user.username;
        this.isEditingUsername = false;
        auth.user.username = data.user.username;
        localStorage.setItem('auth', JSON.stringify({ loggedIn: true, user: this.user }));
        alert(this.t('usernameUpdatedSuccessfully'));
        location.reload();
      } catch(err) { alert(err.message || this.t('usernameUpdateError')); }
    },
    async removeDisplayBadge() {
      try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        const res = await fetch(`/api/users/${this.user.id}/select-badge`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth.user.id.toString()
          },
          body: JSON.stringify({ badgeId: null })
        });
        if (!res.ok) throw new Error('Failed to remove badge');
        this.selectedDisplayBadgeId = null;
        this.selectedBadge = null;
        this.user.selected_badge_id = null;
        auth.user.selected_badge_id = null;
        localStorage.setItem('auth', JSON.stringify(auth));
      } catch (error) {
        console.error('Failed to remove badge:', error);
        alert(this.t('errorRemovingBadge'));
      }
    },
    async selectDisplayBadge(badgeId) {
      try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        const res = await fetch(`/api/users/${this.user.id}/select-badge`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth.user.id.toString()
          },
          body: JSON.stringify({ badgeId })
        });
        if (!res.ok) throw new Error('Failed to select badge');
        this.selectedDisplayBadgeId = badgeId;
        this.selectedBadge = this.badges.find(b => b.id === badgeId) || null;
        this.user.selected_badge_id = badgeId;
        auth.user.selected_badge_id = badgeId;
        localStorage.setItem('auth', JSON.stringify(auth));
      } catch (error) {
        console.error('Failed to select badge:', error);
        alert(this.t('errorSelectingBadge'));
      }
    },
    openBadgeInspect(badge) {
      this.inspectBadge = badge;
      document.body.style.overflow = 'hidden';
    },
    closeBadgeInspect() {
      this.inspectBadge = null;
      document.body.style.overflow = '';
    },
    handleBadgeTilt(e) {
      const area = this.$refs.badgeInspectCard;
      const img = this.$refs.badgeInspectImg;
      if (!area || !img) return;
      const rect = area.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const nx = (x - centerX) / centerX;
      const ny = (y - centerY) / centerY;
      const rotateX = ny * -25;
      const rotateY = nx * 25;
      // Light from top-left: shine brighter when tilting toward light
      const lightAngle = (-nx + -ny) / 2;
      const brightness = 1 + lightAngle * 0.35;
      const shadowX = nx * -14;
      const shadowY = ny * -14;
      const shadowBlur = 18 + Math.abs(lightAngle) * 12;
      const shadowAlpha = 0.15 + Math.max(0, lightAngle) * 0.3;
      img.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
      img.style.filter = `brightness(${brightness.toFixed(2)}) drop-shadow(${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px ${shadowBlur.toFixed(0)}px rgba(255,255,255,${shadowAlpha.toFixed(2)}))`;
    },
    resetBadgeTilt() {
      const img = this.$refs.badgeInspectImg;
      if (!img) return;
      img.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      img.style.filter = 'brightness(1) drop-shadow(0 0 0px transparent)';
    },
    logout() {
      localStorage.removeItem('auth');
      this.$router.push('/login');
      location.reload();
    },
    new_review() { this.$router.push('/create-review'); },
    async fetchFavorites() {
      try {
        const res = await fetch(`/api/users/${this.user.id}/favorites`, {
          headers: { 'Authorization': this.user.id.toString() }
        });
        if (!res.ok) throw new Error('Failed to fetch favorites');
        const favs = await res.json();
        const promises = favs.map(async (fav) => {
          if (fav.tmdb_series_id) {
            return await this.fetchShowDetails(fav.tmdb_series_id);
          }
          return { tmdb_id: null, title: '', poster: '' };
        });
        const results = await Promise.all(promises);
        const favMap = {};
        favs.forEach((fav, index) => {
          favMap[fav.position] = results[index];
        });
        this.favorites = Array(5).fill().map((_, i) => favMap[i + 1] || { tmdb_id: null, title: '', poster: '' });
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      }
    },
    async fetchTopShows() {
      try {
        const res = await fetch(`/api/user-top-shows/${this.user.id}`, {
          headers: { 'Authorization': this.user.id.toString() }
        });
        if (!res.ok) throw new Error('Failed to fetch top shows');
        const shows = await res.json();
        const promises = shows.map(async (show) => {
          return await this.fetchShowDetails(show.tmdb_series_id);
        });
        const results = await Promise.all(promises);
        for (let i = 0; i < results.length; i++) {
          const show = results[i];
          try {
            await fetch(`/api/users/${this.user.id}/favorites`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': this.user.id.toString()
              },
              body: JSON.stringify({ tmdb_series_id: show.tmdb_id, position: i + 1 })
            });
          } catch (error) {
            console.error('Error saving favorite:', error);
          }
        }
        this.favorites = results.map(show => ({ tmdb_id: show.tmdb_id, title: show.title, poster: show.poster })).concat(Array(5).fill({ tmdb_id: null, title: '', poster: '' })).slice(0, 5);
      } catch (error) {
        console.error('Failed to fetch top shows:', error);
      }
    },
    dragStart(e, index) {
      this.dragIndex = index;
      this.isDragging = true;
      e.dataTransfer.effectAllowed = 'move';
      const dragImg = e.target.cloneNode(true);
      dragImg.style.position = 'absolute';
      dragImg.style.top = '-1000px';
      dragImg.style.opacity = '1';
      dragImg.style.transform = 'none';
      dragImg.style.borderRadius = '12px';
      dragImg.style.pointerEvents = 'none';
      document.body.appendChild(dragImg);
      e.dataTransfer.setDragImage(dragImg, e.offsetX, e.offsetY);
      this.dragImage = dragImg;
    },
    drop(e, dropIndex) {
      if (this.dragIndex === null || this.dragIndex === dropIndex) return;
      const temp = this.favorites[this.dragIndex];
      this.favorites[this.dragIndex] = this.favorites[dropIndex];
      this.favorites[dropIndex] = temp;
      this.updatePositions();
    },
    dragEnd() {
      this.isDragging = false;
      if (this.dragImage) {
        document.body.removeChild(this.dragImage);
        this.dragImage = null;
      }
    },
    async updatePositions() {
      const positions = this.favorites.map((fav, index) => ({
        tmdb_series_id: fav.tmdb_id,
        position: index + 1
      })).filter(fav => fav.tmdb_series_id !== null);
      for (const pos of positions) {
        try {
          await fetch(`/api/users/${this.user.id}/favorites`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': this.user.id.toString()
            },
            body: JSON.stringify(pos)
          });
        } catch (error) {
          console.error('Error updating position:', error);
        }
      }
    },
    openSelectModal(index) {
      this.selectingPosition = index;
      this.showSelectModal = true;
      this.searchQuery = '';
      this.searchResults = [];
    },
    async searchShows() {
      if (!this.searchQuery.trim()) {
        this.searchResults = [];
        return;
      }
      try {
        const res = await fetch(`/api/tmdb/search-series?query=${encodeURIComponent(this.searchQuery)}&lang=${encodeURIComponent(this.currentLanguage)}`);
        const data = await res.json();
        this.searchResults = (data || []).map(show => ({
          id: show.id,
          name: show.title,
          poster_path: show.series_picture
        }));
      } catch (error) {
        console.error('Search error:', error);
        this.searchResults = [];
      }
    },
    async selectShow(show) {
      const isDuplicate = this.favorites.some((fav, idx) =>
        idx !== this.selectingPosition && fav.tmdb_id === show.id
      );
      if (isDuplicate) {
        alert(this.t('duplicateFavoriteShow'));
        return;
      }
      this.favorites[this.selectingPosition] = {
        tmdb_id: show.id,
        title: show.name,
        poster: show.poster_path ? `https://image.tmdb.org/t/p/w200${show.poster_path}` : ''
      };
      try {
        await fetch(`/api/users/${this.user.id}/favorites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.user.id.toString()
          },
          body: JSON.stringify({
            tmdb_series_id: show.id,
            position: this.selectingPosition + 1
          })
        });
      } catch (error) {
        console.error('Error saving favorite:', error);
      }
      this.showSelectModal = false;
    },
    async removeFavorite(index) {
      this.favorites[index] = { tmdb_id: null, title: '', poster: '' };
      await this.updatePositions();
      try {
        await fetch(`/api/users/${this.user.id}/favorites/${index + 1}`, {
          method: 'DELETE',
          headers: { 'Authorization': this.user.id.toString() }
        });
      } catch (error) {
        console.error('Error removing favorite:', error);
      }
    },

    // === Visitor-only methods ===
    async loadFollowStatus(userId) {
      try {
        const res = await fetch(`/api/users/${userId}/follow-status`, {
          headers: { 'Authorization': this.auth.user.id.toString() }
        });
        if (res.ok) {
          const data = await res.json();
          this.isFollowing = data.isFollowing;
        }
      } catch (err) {
        console.error('Error loading follow status:', err);
      }
    },
    async toggleFollow() {
      if (this.followLoading) return;
      this.followLoading = true;
      const userId = this.$route.params.userId;
      try {
        if (this.isFollowing) {
          const res = await fetch(`/api/users/${userId}/follow`, {
            method: 'DELETE',
            headers: { 'Authorization': this.auth.user.id.toString() }
          });
          if (res.ok) {
            this.isFollowing = false;
            this.followerCount = Math.max(0, this.followerCount - 1);
          }
        } else {
          const res = await fetch(`/api/users/${userId}/follow`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': this.auth.user.id.toString()
            }
          });
          if (res.ok) {
            this.isFollowing = true;
            this.followerCount++;
          }
        }
      } catch (err) {
        console.error('Error toggling follow:', err);
      } finally {
        this.followLoading = false;
      }
    },
    async loadFavoriteShows(userId) {
      try {
        const res = await fetch(`/api/users/${userId}/public-favorites`);
        if (!res.ok) return;
        const favorites = await res.json();
        const enriched = await Promise.all(
          favorites.map(async (fav) => {
            try {
              const data = await this.fetchShowDetails(fav.tmdb_series_id);
              return {
                ...fav,
                title: data.title,
                poster: data.poster
              };
            } catch {
              return { ...fav, title: this.t('noShow'), poster: '' };
            }
          })
        );
        this.favoriteShows = enriched;
      } catch (err) {
        console.error('Error loading favorites:', err);
      }
    },
    async loadCommonShows(userId) {
      try {
        const res = await fetch(`/api/users/${userId}/common-shows`, {
          headers: { 'Authorization': this.auth.user.id.toString() }
        });
        if (!res.ok) return;
        const data = await res.json();
        this.commonFollowedShows = data.commonFollowedShows || [];
        this.commonFavorites = data.commonFavorites || [];
        if (this.commonFollowedShows.length > 0) {
          this.commonFollowedShowsData = await Promise.all(
            this.commonFollowedShows.map(async (tmdbId) => {
              try {
                const d = await this.fetchShowDetails(tmdbId);
                return {
                  tmdb_series_id: tmdbId,
                  title: d.title,
                  poster: d.poster
                };
              } catch {
                return { tmdb_series_id: tmdbId, title: this.t('noShow'), poster: '' };
              }
            })
          );
        }
        if (this.commonFavorites.length > 0) {
          this.commonFavoritesData = await Promise.all(
            this.commonFavorites.map(async (fav) => {
              try {
                const d = await this.fetchShowDetails(fav.tmdb_series_id);
                return {
                  tmdb_series_id: fav.tmdb_series_id,
                  your_position: fav.your_position,
                  their_position: fav.their_position,
                  title: d.title,
                  poster: d.poster
                };
              } catch {
                return { ...fav, title: this.t('noShow'), poster: '' };
              }
            })
          );
        }
      } catch (err) {
        console.error('Error loading common shows:', err);
      }
    },
    isCommonFavorite(tmdbSeriesId) {
      return this.commonFavorites.some(f => f.tmdb_series_id === tmdbSeriesId);
    }
  },
  async mounted() {
    this._badgeEscHandler = (e) => {
      if (e.key === 'Escape' && this.inspectBadge) this.closeBadgeInspect();
    };
    document.addEventListener('keydown', this._badgeEscHandler);
    this.currentLanguage = getCurrentLanguage();
    const userId = this.$route.params.userId;
    const authData = localStorage.getItem('auth');
    this.auth = authData ? JSON.parse(authData) : null;

    this.isOwnProfile = this.auth?.user?.id === parseInt(userId);

    if (this.isOwnProfile) {
      // Owner mode
      this.user = this.auth.user;
      this.profileImageUrl = this.user.profile_picture || null;

      this.fetchUserReviews(this.user.id);
      this.fetchUserBadges(this.user.id);
      this.fetchUserComments(this.user.id);
      this.fetchFollowedShows(this.user.id);
      this.loadFollowCounts(this.user.id);
      this.fetchActiveCosmetics(this.user.id);
      this._cosmeticHandler = () => this.fetchActiveCosmetics(this.user.id);
      window.addEventListener('cosmetic-changed', this._cosmeticHandler);
      this.fetchFavorites().then(() => {
        if (!this.favorites.some(fav => fav.tmdb_id !== null)) {
          this.fetchTopShows();
        }
      });
    } else {
      // Visitor mode
      try {
        const profileRes = await fetch(`/api/users/${userId}/public-profile`);
        if (!profileRes.ok) {
          alert(this.t('userNotFound'));
          this.$router.push('/');
          return;
        }
        const profileData = await profileRes.json();
        this.user = profileData.user;
        this.badges = profileData.badges || [];
        this.reviewCount = profileData.reviewCount || 0;
        this.profileImageUrl = this.user.profile_picture || null;

        if (this.user.selected_badge_id) {
          this.selectedBadge = this.badges.find(b => b.id === this.user.selected_badge_id);
        } else if (this.badges.length > 0) {
          this.selectedBadge = this.badges[0];
        }

        const promises = [
          this.fetchFollowedShows(userId),
          this.fetchUserReviews(userId),
          this.fetchUserComments(userId),
          this.loadFollowCounts(userId),
          this.loadFavoriteShows(userId)
        ];

        if (this.auth?.loggedIn && !this.isOwnProfile) {
          promises.push(this.loadFollowStatus(userId));
          promises.push(this.loadCommonShows(userId));
        }

        await Promise.all(promises);
        this.fetchActiveCosmetics(userId);
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    }

    this._languageChangedHandler = async (e) => {
      this.currentLanguage = e.detail.language;
      if (this.isOwnProfile && this.user?.id) {
        await Promise.all([this.fetchFollowedShows(this.user.id), this.fetchFavorites()]);
      } else if (this.user?.id) {
        await Promise.all([this.fetchFollowedShows(this.user.id), this.loadFavoriteShows(this.user.id)]);
      }
    };
    window.addEventListener('languageChanged', this._languageChangedHandler);
  },
  beforeUnmount() {
    window.removeEventListener('languageChanged', this._languageChangedHandler);
    document.removeEventListener('keydown', this._badgeEscHandler);
    if (this._cosmeticHandler) window.removeEventListener('cosmetic-changed', this._cosmeticHandler);
    document.body.style.overflow = '';
  }
};
</script>

<style scoped>
/* Page-level background effect */
.page-background-effect {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
}

/* Hero Section */
.hero {
  color: var(--text-color);
  margin-bottom: 40px;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.hero-band {
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  width: 100vw;
  background: var(--hero-gradient);
  padding: 60px 0;
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
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  font-weight: 700;
  animation: heroIntro 880ms cubic-bezier(0.2, 0.9, 0.25, 1) both;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
  color: var(--subtitle-color);
  animation: heroIntro 880ms cubic-bezier(0.2, 0.9, 0.25, 1) 100ms both;
}

@keyframes heroIntro {
  0%   { opacity: 0; transform: translateY(8px) scale(0.992); filter: blur(4px); }
  60%  { opacity: 1; transform: translateY(-2px) scale(1.02); filter: blur(0); }
  100% { opacity: 1; transform: translateY(0) scale(1);       filter: blur(0); }
}

/* Profile Container */
.profile-container {
  max-width: 1200px;
  margin: 0 auto 60px auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

/* Profile Card */
.profile-card {
  background: rgba(20, 20, 30, 0.55);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 50px 40px;
  margin-bottom: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Modal Styles */
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
}

.modal-content {
  background: var(--dark-bg-color);
  border-radius: 16px;
  padding: 30px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 2px solid var(--accent-color);
  padding-bottom: 15px;
}

.modal-header h3 {
  font-size: 1.5rem;
  margin: 0;
  color: var(--text-color);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-color);
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.modal-close:hover {
  color: var(--accent-color);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Profile Picture Modal Tabs */
.pfp-modal-wide {
  max-width: 680px;
  width: 95%;
}

.pfp-modal-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0;
}

.pfp-tab {
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: var(--subtitle-color);
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.25s ease;
}

.pfp-tab:hover {
  color: var(--text-color);
}

.pfp-tab.active {
  color: var(--accent-color);
  border-bottom-color: var(--accent-color);
}

.upload-hint {
  font-size: 0.85rem;
  color: var(--subtitle-color);
  margin: 0;
}

.pfp-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 10px;
}

.default-pfp-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.default-pfp-option {
  position: relative;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  border: 3px solid transparent;
  transition: all 0.3s ease;
}

.default-pfp-option img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.default-pfp-option:hover img {
  transform: scale(1.05);
}

.default-pfp-option.selected {
  border-color: var(--accent-color);
  box-shadow: 0 0 10px var(--accent-color);
}

.default-pfp-option .checkmark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--accent-color);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  font-weight: bold;
}

.upload-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-btn {
  padding: 15px 25px;
  border: 2px solid var(--accent-color);
  background: var(--accent-color);
  color: var(--text-color);
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-btn:hover:not(:disabled) {
  background: var(--medium-bg-color);
  transform: translateY(-2px);
}

.upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.profile-header {
  display: flex;
  flex-direction: column;
  gap: 25px;
  align-items: center;
  justify-content: center;
}

.pfp-section {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  width: 100%;
}

.pfp-wrapper {
  position: relative;
  display: inline-block;
  width: 140px;
  height: 140px;
}

.profile-icon {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--accent-color);
  transition: all 0.3s ease;
  display: block;
}

.pfp-wrapper:hover .profile-icon {
  filter: brightness(0.6);
}

.pfp-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
  pointer-events: none;
}

.pfp-overlay span {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}

.pfp-wrapper:hover .pfp-overlay {
  opacity: 1;
}

.upload-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.admin-icon {
  position: absolute;
  top: 0;
  right: 0;
  width: 44px;
  height: 44px;
  pointer-events: none;
  transform: translate(20%, -20%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
}

/* Selected Badge on Profile Icon */
.selected-badge-display {
  position: absolute;
  top: 0;
  right: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
  transform: translate(20%, -20%);
}

.selected-badge-display.badge-below-admin {
  top: 36px;
  transform: translate(20%, 0);
}

.selected-badge-display span {
  font-size: 1.6rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));
}

.selected-badge-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));
}

/* User Details */
.user-details {
  display: flex;
  flex-direction: column;
  gap: 15px;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.username-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.username {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-color);
  line-height: 1.2;
}

.admin-label {
  color: var(--subtitle-color);
  font-weight: normal;
  font-size: 1.3rem;
}

.edit-username-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.username-input {
  font-size: 1.3rem;
  padding: 12px;
  border: 2px solid var(--accent-color);
  border-radius: 8px;
  background: var(--background-color);
  color: var(--text-color);
  max-width: 400px;
}

.edit-buttons {
  display: flex;
  gap: 10px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.edit-btn, .logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  color: var(--text-color);
}

.edit-btn {
  background-color: var(--accent-color);
}

.edit-btn:hover {
  background-color: var(--medium-bg-color);
  transform: translateY(-2px);
}

.logout-btn {
  background-color: var(--light-bg-color);
}

.logout-btn:hover {
  background-color: #c44;
  transform: translateY(-2px);
}

.save-btn, .cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn {
  background-color: var(--accent-color);
  color: var(--text-color);
}

.save-btn:hover {
  background-color: var(--medium-bg-color);
}

.cancel-btn {
  background-color: var(--light-bg-color);
  color: var(--text-color);
}

.cancel-btn:hover {
  background-color: #888;
}

/* Follow Button */
.follow-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 2px solid var(--accent-color);
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  color: var(--text-color);
  background: rgba(112, 233, 116, 0.1);
}

.follow-btn:hover {
  background: rgba(112, 233, 116, 0.25);
  transform: translateY(-2px);
}

.follow-btn.following {
  background: rgba(255, 100, 100, 0.15);
  border-color: rgba(255, 100, 100, 0.5);
  color: rgb(255, 100, 100);
}

.follow-btn.following:hover {
  background: rgba(255, 100, 100, 0.3);
  border-color: rgb(255, 100, 100);
}

.follow-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Badges Section */
.badges-section {
  background: rgba(20, 20, 30, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.cosmetics-section {
  background: rgba(20, 20, 30, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.badge-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.badge-hint {
  font-size: 0.85rem;
  color: var(--subtitle-color);
  font-style: italic;
}

.remove-badge-btn {
  background: transparent;
  border: 1px solid #c44;
  color: #c44;
  padding: 5px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-badge-btn:hover {
  background: #c44;
  color: white;
}

.badges-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.badge-item {
  background: var(--dark-bg-color);
  border: 2px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.badge-item:hover {
  transform: translateY(-4px);
  border-color: var(--accent-color);
  box-shadow: 0 6px 20px rgba(112, 233, 116, 0.15);
}

.badge-item.badge-selected {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 1px var(--accent-color), 0 6px 20px rgba(112, 233, 116, 0.2);
}

.badge-item-header {
  background: linear-gradient(135deg, rgba(112, 233, 116, 0.12), rgba(112, 233, 116, 0.04));
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.badge-item.badge-selected .badge-item-header {
  background: linear-gradient(135deg, rgba(112, 233, 116, 0.25), rgba(112, 233, 116, 0.1));
}

.badge-check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: var(--accent-color);
  color: var(--dark-bg-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.85rem;
}

.badge-icon {
  font-size: 2.5rem;
}

.badge-img {
  width: 52px;
  height: 52px;
  object-fit: contain;
  border-radius: 6px;
}

.badge-info {
  padding: 12px 16px;
  text-align: center;
}

.badge-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge-earned {
  font-size: 0.8rem;
  color: var(--subtitle-color);
  margin: 0;
}

/* Badge Inspect Modal */
.badge-inspect-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: badgeOverlayIn 0.25s ease;
}

@keyframes badgeOverlayIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.badge-inspect-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  position: relative;
  animation: badgeModalIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes badgeModalIn {
  from { opacity: 0; transform: scale(0.85) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.badge-inspect-close {
  position: absolute;
  top: -40px;
  right: -40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--text-color);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.badge-inspect-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.badge-inspect-card {
  background: linear-gradient(145deg, var(--dark-bg-color), rgba(30, 30, 30, 0.95));
  border: 2px solid rgba(112, 233, 116, 0.3);
  border-radius: 20px;
  padding: 40px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  min-width: 280px;
  max-width: 340px;
  position: relative;
  overflow: visible;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(112, 233, 116, 0.1);
}

.badge-inspect-image {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  cursor: grab;
}

.badge-inspect-image img {
  width: 220px;
  height: 220px;
  object-fit: contain;
  transition: transform 0.15s ease-out, filter 0.15s ease-out;
  transform-style: preserve-3d;
  will-change: transform, filter;
}

.badge-inspect-emoji {
  font-size: 8rem;
  line-height: 1;
  display: block;
  transition: transform 0.15s ease-out, filter 0.15s ease-out;
  transform-style: preserve-3d;
  will-change: transform, filter;
}

.badge-inspect-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0;
  text-align: center;
  position: relative;
  z-index: 2;
}

.badge-inspect-desc {
  font-size: 0.9rem;
  color: var(--subtitle-color);
  margin: 0;
  text-align: center;
  line-height: 1.4;
  position: relative;
  z-index: 2;
}

.badge-inspect-date {
  font-size: 0.8rem;
  color: var(--subtitle-color);
  margin: 0;
  opacity: 0.7;
  position: relative;
  z-index: 2;
}

.badge-inspect-actions {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
}

.badge-inspect-select-btn {
  background: var(--accent-color);
  color: var(--dark-bg-color);
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.badge-inspect-select-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(112, 233, 116, 0.3);
}

.badge-inspect-remove-btn {
  background: transparent;
  color: #c44;
  border: 1px solid #c44;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.badge-inspect-remove-btn:hover {
  background: #c44;
  color: white;
}

/* Favorite Shows Section */
.favorites-section {
  background: rgba(20, 20, 30, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
}

.favorite-slot {
  position: relative;
  background: var(--dark-bg-color);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 2/3;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.favorite-slot:hover {
  transform: scale(1.05);
}

.favorite-slot.common-highlight {
  box-shadow: 0 0 12px rgba(112, 233, 116, 0.4);
  border: 2px solid var(--accent-color);
}

.favorite-slot[draggable="true"] {
  cursor: grab;
}

.favorite-slot[draggable="true"]:active {
  cursor: grabbing;
}

.favorite-slot.dragging {
  opacity: 0.5;
}

.favorite-slot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.show-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
  color: white;
  padding: 20px 8px 8px;
  font-size: 0.8rem;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.common-tag {
  display: block;
  color: var(--accent-color);
  font-size: 0.7rem;
  font-weight: 600;
  margin-top: 2px;
}

.empty-slot {
  color: var(--subtitle-color);
  text-align: center;
  font-size: 0.9rem;
}

.remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0,0,0,0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  cursor: pointer;
  font-size: 1.2rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.favorite-slot:hover .remove-btn {
  opacity: 1;
}

.search-input {
  width: 100%;
  padding: 10px;
  border: 2px solid var(--accent-color);
  border-radius: 8px;
  background: var(--background-color);
  color: var(--text-color);
  font-size: 1rem;
  margin-bottom: 10px;
}

.search-results {
  max-height: 300px;
  overflow-y: auto;
}

.search-result {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid var(--accent-color);
  transition: background 0.3s ease;
}

.search-result:hover {
  background: var(--medium-bg-color);
}

.search-result img {
  width: 50px;
  height: 75px;
  object-fit: cover;
}

.result-title {
  font-weight: bold;
  color: var(--text-color);
  font-size: 0.95rem;
}

.result-year {
  color: var(--subtitle-color);
  font-size: 0.85rem;
}

/* Common Section */
.common-section {
  background: rgba(20, 20, 30, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.common-group {
  margin-bottom: 1.5rem;
}

.common-group:last-child {
  margin-bottom: 0;
}

.common-subtitle {
  color: var(--accent-color);
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
}

.common-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.common-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(112, 233, 116, 0.08);
  border: 1px solid rgba(112, 233, 116, 0.2);
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.common-card:hover {
  background: rgba(112, 233, 116, 0.15);
  border-color: var(--accent-color);
  transform: translateY(-3px);
}

.common-poster {
  width: 50px;
  height: 75px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.common-poster-placeholder {
  width: 50px;
  height: 75px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--medium-bg-color);
  border-radius: 6px;
  flex-shrink: 0;
}

.common-info {
  flex: 1;
  min-width: 0;
}

.common-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.common-positions {
  font-size: 0.75rem;
  color: var(--subtitle-color);
  margin: 0;
}

/* Reviews Section */
.reviews-section {
  background: rgba(20, 20, 30, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.new-review-btn {
  background-color: var(--accent-color);
  color: var(--text-color);
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.new-review-btn:hover {
  background-color: var(--medium-bg-color);
  transform: translateY(-2px);
}

.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.review-card {
  background: var(--dark-bg-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.review-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.review-card:focus {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.episode-still {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.episode-img-placeholder {
  width: 100%;
  height: 160px;
  background: var(--medium-bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.review-info {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.episode-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1.3;
}

.series-info {
  font-size: 0.9rem;
  color: var(--subtitle-color);
  font-weight: 500;
}

.rating-text {
  font-weight: bold;
  font-size: 1rem;
  text-shadow: 0 0 2px rgba(0,0,0,0.5);
  transition: all 0.3s ease;
}

.rating-1 { color: #ff4c4c; text-shadow: 0 0 8px #ff4c4c; }
.rating-2 { color: #ff884c; text-shadow: 0 0 8px #ff884c; }
.rating-3 { color: #ffd93d; text-shadow: 0 0 8px #ffd93d; }
.rating-4 { color: #a6e22e; text-shadow: 0 0 8px #a6e22e; }
.rating-5 { color: #38c172; text-shadow: 0 0 12px #38c172; }

.review-text {
  font-size: 0.95rem;
  color: var(--text-color);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Comments Section */
.comments-section {
  background: rgba(20, 20, 30, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.comment-card:hover {
  border-color: var(--accent-color);
  background: rgba(166, 226, 46, 0.05);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.comment-header .review-title {
  color: var(--accent-color);
  font-weight: 600;
  margin: 0;
  font-size: 0.95rem;
}

.comment-date {
  font-size: 0.85rem;
  color: var(--subtitle-color);
}

.comment-text {
  color: var(--text-color);
  line-height: 1.6;
  margin: 0;
  word-break: break-word;
}

/* Followed Shows Section */
.followed-shows-section {
  background: rgba(20, 20, 30, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.followed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.followed-card {
  background: var(--dark-bg-color);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.followed-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.followed-poster {
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  display: block;
}

.followed-poster-placeholder {
  width: 100%;
  aspect-ratio: 2/3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  background: var(--medium-bg-color);
}

.followed-info {
  padding: 10px 12px;
}

.followed-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.followed-date {
  color: var(--subtitle-color);
  font-size: 0.8rem;
  margin: 0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--dark-bg-color);
  border-radius: 16px;
}

.empty-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.2rem;
  color: var(--subtitle-color);
  margin-bottom: 30px;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: 1rem;
}
.badges-section, 
.favorites-section, 
.reviews-section, 
.cosmetics-section,
.comments-section, 
.followed-shows-section {
  padding-top: 0 !important;
  padding-left: 0 !important; 
  padding-right: 0 !important; 
  overflow: hidden; 
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-inner h1 {
    font-size: 2rem;
  }

  .profile-card {
    padding: 25px;
  }

  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 20px;
  }

  .pfp-wrapper {
    width: 120px;
    height: 120px;
  }

  .profile-icon {
    width: 120px;
    height: 120px;
  }

  .user-details {
    align-items: center;
  }

  .username-section {
    align-items: center;
  }

  .action-buttons {
    justify-content: center;
  }

  .reviews-grid {
    grid-template-columns: 1fr;
  }

  .username {
    font-size: 2rem;
  }

  .favorites-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .shows-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .lists-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .comment-header {
    flex-direction: column;
    gap: 0.3rem;
    align-items: flex-start;
  }
}

@media (max-width: 500px) {
  .hero-inner h1 {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .pfp-wrapper {
    width: 100px;
    height: 100px;
  }

  .profile-icon {
    width: 100px;
    height: 100px;
  }

  .admin-icon {
    width: 35px;
    height: 35px;
  }

  .username {
    font-size: 1.5rem;
  }

  .edit-btn, .logout-btn {
    padding: 10px 16px;
    font-size: 0.9rem;
  }

  .favorites-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* DEV: Background test panel */
.bg-test-toggle {
  display: block;
  margin: 1rem auto;
  padding: 0.5rem 1.2rem;
  border: 1px dashed var(--accent-color, #70e974);
  background: transparent;
  color: var(--text-color);
  border-radius: 6px;
  cursor: pointer;
  opacity: 0.6;
  font-size: 0.85rem;
}
.bg-test-toggle:hover { opacity: 1; }

.bg-test-section {
  margin-top: 1.5rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  background: rgba(20, 20, 30, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
.bg-test-close {
  background: transparent;
  border: none;
  color: var(--text-color);
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.6;
}
.bg-test-close:hover { opacity: 1; }

.bg-test-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 1rem;
}
.bg-test-buttons button {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--accent-color, #70e974);
  background: transparent;
  color: var(--text-color);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.2s, color 0.2s;
}
.bg-test-buttons button:hover,
.bg-test-buttons button.active {
  background: var(--accent-color, #70e974);
  color: #111;
}

.bg-test-hint {
  font-size: 0.8rem;
  opacity: 0.5;
  margin: 0;
}
</style>
