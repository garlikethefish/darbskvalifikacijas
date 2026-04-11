<template>
  <div class="user-lists-container">
    <!-- Page Header -->
    <div class="page-header">
      <h1>{{ t('my_lists') }}</h1>
      <p class="subtitle">{{ t('organize_favorites') }}</p>
    </div>

    <!-- Create New List Section -->
    <section v-if="isOwnProfile" class="create-list-section">
      <div class="create-list-card">
        <h2>{{ t('create_new_list') }}</h2>
        <form @submit.prevent="createList" class="create-form">
          <div class="form-group">
            <label for="listName">{{ t('list_name') }}</label>
            <input 
              id="listName"
              v-model="newListName"
              type="text"
              :placeholder="t('e_g_summer_vibes')"
              class="input-field"
              required
            />
          </div>

          <div class="form-group">
            <label for="listDescription">{{ t('description') }}</label>
            <textarea 
              id="listDescription"
              v-model="newListDescription"
              :placeholder="t('optional_list_description')"
              class="textarea-field"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group checkbox-group">
            <label>
              <input 
                v-model="newListIsPublic"
                type="checkbox"
                class="checkbox-input"
              />
              <span>{{ t('make_list_public') }}</span>
            </label>
            <p class="checkbox-hint">{{ t('public_lists_visible_others') }}</p>
          </div>

          <button type="submit" class="submit-btn" :disabled="isCreatingList">
            {{ isCreatingList ? t('creating') : t('create_list') }}
          </button>
        </form>
      </div>
    </section>

    <!-- Lists Display -->
    <section class="lists-section">
      <!-- Empty State -->
      <div v-if="lists.length === 0" class="empty-state">
        <p v-if="isOwnProfile">{{ t('no_lists_created') }}</p>
        <p v-else>{{ t('user_has_no_public_lists') }}</p>
      </div>

      <!-- Lists Grid -->
      <div v-else class="lists-grid">
        <div 
          v-for="list in lists" 
          :key="list.id"
          class="list-card"
          @click="selectList(list.id)"
          :class="{ active: selectedListId === list.id }"
        >
          <div class="list-header">
            <h3>{{ list.name }}</h3>
            <div class="list-actions" @click.stop>
              <span v-if="!list.is_public" class="privacy-badge">🔒 Private</span>
              <span v-else class="privacy-badge public">🌍 Public</span>
              
              <button 
                v-if="isOwnProfile"
                @click="deleteList(list.id)"
                class="delete-btn"
                :title="t('delete_list')"
              >
                🗑️
              </button>
            </div>
          </div>
          
          <p v-if="list.description" class="list-description">{{ list.description }}</p>
          <p class="show-count">{{ list.item_count || 0 }} {{ t('shows') }}</p>
        </div>
      </div>
    </section>

    <!-- List Details Section -->
    <section v-if="selectedList" class="list-details-section">
      <div class="details-header">
        <h2>{{ selectedList.name }}</h2>
        <button @click="selectedListId = null" class="close-details">✕</button>
      </div>

      <!-- Add Shows to List (if own profile) -->
      <div v-if="isOwnProfile" class="add-shows-section">
        <h3>{{ t('add_shows_to_list') }}</h3>
        <div class="search-box">
          <input 
            v-model="searchQuery"
            type="text"
            :placeholder="t('search_shows')"
            class="search-input"
            @input="searchShows"
          />
        </div>

        <div class="search-results">
          <div v-if="searchLoading" class="loading">{{ t('searching') }}...</div>
          <div v-else-if="searchResults.length === 0 && searchQuery" class="no-results">
            {{ t('no_shows_found') }}
          </div>
          <div v-else class="search-grid">
            <div 
              v-for="show in searchResults"
              :key="show.id"
              class="search-result-item"
              @click="addShowToList(show.id, show.name)"
            >
              <div v-if="show.poster_path" class="show-poster">
                <img :src="`https://image.tmdb.org/t/p/w92${show.poster_path}`" :alt="show.name" />
              </div>
              <div class="show-info">
                <p class="show-title">{{ show.name }}</p>
                <p class="show-year" v-if="show.first_air_date">{{ show.first_air_date.split('-')[0] }}</p>
              </div>
              <button class="add-btn">+ Add</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Shows in List -->
      <div class="list-items-section">
        <h3>{{ t('shows_in_list') }}</h3>
        
        <div v-if="listItems.length === 0" class="empty-list">
          <p>{{ t('no_shows_in_list_yet') }}</p>
        </div>

        <div v-else class="list-items-grid">
          <div 
            v-for="item in listItems" 
            :key="item.id"
            class="list-item"
          >
            <div v-if="item.poster_path" class="item-poster">
              <img :src="`https://image.tmdb.org/t/p/w154${item.poster_path}`" :alt="item.name" />
            </div>
            <div class="item-info">
              <p class="item-title">{{ item.name }}</p>
              <p class="item-date" v-if="item.first_air_date">{{ item.first_air_date.split('-')[0] }}</p>
            </div>
            <button 
              v-if="isOwnProfile"
              @click="removeShowFromList(item.list_item_id || item.id)"
              class="remove-btn"
              :title="t('remove_from_list')"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { getTranslation, getCurrentLanguage } from '@/services/translations.js';

export default {
  data() {
    return {
      lists: [],
      listItems: [],
      selectedListId: null,
      newListName: '',
      newListDescription: '',
      newListIsPublic: false,
      isCreatingList: false,
      searchQuery: '',
      searchResults: [],
      searchLoading: false,
      isOwnProfile: false,
      currentLanguage: 'en'
    };
  },
  computed: {
    selectedList() {
      return this.lists.find(l => l.id === this.selectedListId);
    }
  },
  methods: {
    t(key) {
      return getTranslation(key, this.currentLanguage);
    },
    async loadLists() {
      const auth = JSON.parse(localStorage.getItem('auth'));
      if (!auth || !auth.user?.id) return;

      try {
        const userId = this.$route.params.userId || auth.user.id;
        this.isOwnProfile = parseInt(userId) === auth.user.id;

        const res = await fetch(`/api/user-lists/${userId}`, {
          headers: {
            'Authorization': auth.user.id.toString()
          }
        });

        if (res.ok) {
          this.lists = await res.json();
        }
      } catch (error) {
        console.error('Error loading lists:', error);
      }
    },
    async createList() {
      const auth = JSON.parse(localStorage.getItem('auth'));
      if (!auth || !auth.user?.id) return;

      if (!this.newListName.trim()) {
        alert(this.t('please_enter_list_name'));
        return;
      }

      this.isCreatingList = true;
      try {
        const res = await fetch('/api/user-lists', {
          method: 'POST',
          headers: {
            'Authorization': auth.user.id.toString(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: this.newListName,
            description: this.newListDescription,
            is_public: this.newListIsPublic ? 1 : 0
          })
        });

        if (res.ok) {
          const newList = await res.json();
          this.lists.push(newList);
          this.newListName = '';
          this.newListDescription = '';
          this.newListIsPublic = false;
          alert(this.t('list_created_successfully'));
        }
      } catch (error) {
        console.error('Error creating list:', error);
        alert(this.t('error_creating_list'));
      } finally {
        this.isCreatingList = false;
      }
    },
    async deleteList(listId) {
      if (!confirm(this.t('confirm_delete_list'))) return;

      const auth = JSON.parse(localStorage.getItem('auth'));
      try {
        const res = await fetch(`/api/user-lists/${listId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': auth.user.id.toString()
          }
        });

        if (res.ok) {
          this.lists = this.lists.filter(l => l.id !== listId);
          if (this.selectedListId === listId) {
            this.selectedListId = null;
          }
          alert(this.t('list_deleted'));
        }
      } catch (error) {
        console.error('Error deleting list:', error);
      }
    },
    async selectList(listId) {
      this.selectedListId = listId;
      await this.loadListItems(listId);
    },
    async loadListItems(listId) {
      const auth = JSON.parse(localStorage.getItem('auth'));
      try {
        const res = await fetch(`/api/user-lists/${listId}/items`, {
          headers: {
            'Authorization': auth.user.id.toString()
          }
        });

        if (res.ok) {
          this.listItems = await res.json();
        }
      } catch (error) {
        console.error('Error loading list items:', error);
      }
    },
    async searchShows() {
      if (!this.searchQuery.trim()) {
        this.searchResults = [];
        return;
      }

      this.searchLoading = true;
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/tv?api_key=${import.meta.env.VITE_TMDB_API_KEY}&query=${encodeURIComponent(this.searchQuery)}`
        );
        const data = await res.json();
        this.searchResults = data.results || [];
      } catch (error) {
        console.error('Error searching shows:', error);
      } finally {
        this.searchLoading = false;
      }
    },
    async addShowToList(tmdbShowId, showName) {
      const auth = JSON.parse(localStorage.getItem('auth'));
      if (!auth || !auth.user?.id) return;

      try {
        const res = await fetch(`/api/user-lists/${this.selectedListId}/add-item`, {
          method: 'POST',
          headers: {
            'Authorization': auth.user.id.toString(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tmdb_series_id: tmdbShowId
          })
        });

        if (res.ok) {
          await this.loadListItems(this.selectedListId);
          this.searchQuery = '';
          this.searchResults = [];
          alert(`${showName} ${this.t('added_to_list')}`);
        } else if (res.status === 409) {
          alert(this.t('show_already_in_list'));
        }
      } catch (error) {
        console.error('Error adding show to list:', error);
      }
    },
    async removeShowFromList(itemId) {
      const auth = JSON.parse(localStorage.getItem('auth'));
      try {
        const res = await fetch(`/api/user-lists/${this.selectedListId}/remove-item/${itemId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': auth.user.id.toString()
          }
        });

        if (res.ok) {
          await this.loadListItems(this.selectedListId);
          alert(this.t('show_removed_from_list'));
        }
      } catch (error) {
        console.error('Error removing show from list:', error);
      }
    }
  },
  mounted() {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    if (!auth.user?.id) {
      this.$router.push('/login');
      return;
    }

    this.currentLanguage = getCurrentLanguage();
    window.addEventListener('languageChanged', (e) => {
      this.currentLanguage = e.detail.language;
    });

    this.loadLists();
  },
  beforeUnmount() {
    window.removeEventListener('languageChanged', (e) => {
      this.currentLanguage = e.detail.language;
    });
  }
};
</script>

<style scoped>
.user-lists-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
}

.subtitle {
  color: #999;
  font-size: 1.1rem;
  margin: 0;
}

/* Create List Section */
.create-list-section {
  margin-bottom: 3rem;
}

.create-list-card {
  background: linear-gradient(135deg, rgba(147, 112, 219, 0.1) 0%, rgba(112, 233, 116, 0.05) 100%);
  border: 1px solid rgba(147, 112, 219, 0.3);
  border-radius: 12px;
  padding: 2rem;
}

.create-list-card h2 {
  margin-top: 0;
  color: var(--text-color);
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: var(--text-color);
  font-weight: 600;
  font-size: 0.95rem;
}

.input-field,
.textarea-field {
  background: var(--dark-bg-color);
  border: 1px solid rgba(147, 112, 219, 0.3);
  color: var(--text-color);
  padding: 0.8rem;
  border-radius: 6px;
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-field:focus,
.textarea-field:focus {
  outline: none;
  border-color: #9370db;
  box-shadow: 0 0 10px rgba(147, 112, 219, 0.3);
}

.textarea-field {
  resize: vertical;
}

.checkbox-group {
  gap: 0.75rem;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 400;
}

.checkbox-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #9370db;
}

.checkbox-hint {
  margin: 0;
  font-size: 0.85rem;
  color: #999;
  padding-left: 1.75rem;
}

.submit-btn {
  background: linear-gradient(135deg, #9370db 0%, #70e974 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-start;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(147, 112, 219, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Lists Section */
.lists-section {
  margin-bottom: 3rem;
}

.lists-section > h2 {
  color: var(--text-color);
  margin-bottom: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #999;
}

.lists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.list-card {
  background: linear-gradient(135deg, rgba(147, 112, 219, 0.1) 0%, rgba(112, 233, 116, 0.05) 100%);
  border: 2px solid rgba(147, 112, 219, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.list-card:hover {
  border-color: #9370db;
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(147, 112, 219, 0.2);
}

.list-card.active {
  background: linear-gradient(135deg, rgba(147, 112, 219, 0.2) 0%, rgba(112, 233, 116, 0.1) 100%);
  border-color: #70e974;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.list-header h3 {
  margin: 0;
  color: var(--text-color);
  word-break: break-word;
}

.list-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-shrink: 0;
}

.privacy-badge {
  background: rgba(100, 100, 255, 0.2);
  color: #64a6ff;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.privacy-badge.public {
  background: rgba(112, 233, 116, 0.2);
  color: #70e974;
}

.delete-btn {
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid rgba(255, 107, 107, 0.3);
  color: #ff6b6b;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background: rgba(255, 107, 107, 0.3);
  border-color: #ff6b6b;
}

.list-description {
  color: #999;
  margin: 0.5rem 0;
  font-size: 0.95rem;
}

.show-count {
  margin: 0.5rem 0 0 0;
  color: #70e974;
  font-weight: 600;
  font-size: 0.9rem;
}

/* List Details Section */
.list-details-section {
  background: linear-gradient(135deg, rgba(147, 112, 219, 0.08) 0%, rgba(112, 233, 116, 0.04) 100%);
  border: 1px solid rgba(147, 112, 219, 0.2);
  border-radius: 12px;
  padding: 2rem;
  margin-top: 2rem;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(147, 112, 219, 0.2);
}

.details-header h2 {
  margin: 0;
  color: var(--text-color);
}

.close-details {
  background: none;
  border: none;
  color: #999;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-details:hover {
  color: var(--text-color);
}

/* Add Shows Section */
.add-shows-section {
  margin-bottom: 2rem;
}

.add-shows-section h3 {
  color: var(--text-color);
  margin-bottom: 1rem;
}

.search-box {
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 0.8rem;
  background: var(--dark-bg-color);
  border: 1px solid rgba(147, 112, 219, 0.3);
  color: var(--text-color);
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #9370db;
  box-shadow: 0 0 10px rgba(147, 112, 219, 0.3);
}

.search-results {
  min-height: 100px;
}

.loading,
.no-results {
  text-align: center;
  color: #999;
  padding: 2rem;
}

.search-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.search-result-item {
  background: var(--dark-bg-color);
  border: 1px solid rgba(147, 112, 219, 0.2);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.search-result-item:hover {
  border-color: #9370db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(147, 112, 219, 0.2);
}

.show-poster {
  width: 100%;
  height: 120px;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
}

.show-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.show-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.show-title {
  margin: 0;
  color: var(--text-color);
  font-weight: 600;
  font-size: 0.95rem;
  word-break: break-word;
}

.show-year {
  margin: 0;
  color: #999;
  font-size: 0.85rem;
}

.add-btn {
  width: 100%;
  padding: 0.5rem;
  background: rgba(112, 233, 116, 0.2);
  border: 1px solid rgba(112, 233, 116, 0.3);
  color: #70e974;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.add-btn:hover {
  background: rgba(112, 233, 116, 0.3);
  border-color: #70e974;
}

/* List Items Section */
.list-items-section {
  margin-top: 2rem;
}

.list-items-section h3 {
  color: var(--text-color);
  margin-bottom: 1rem;
}

.empty-list {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.list-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.list-item {
  background: var(--dark-bg-color);
  border: 1px solid rgba(147, 112, 219, 0.2);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.list-item:hover {
  border-color: #9370db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(147, 112, 219, 0.2);
}

.item-poster {
  width: 100%;
  height: 200px;
  background: rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.item-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-title {
  margin: 0;
  color: var(--text-color);
  font-weight: 600;
  word-break: break-word;
}

.item-date {
  margin: 0;
  color: #999;
  font-size: 0.85rem;
}

.remove-btn {
  align-self: flex-end;
  margin: 0.5rem 0.5rem 0 0;
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid rgba(255, 107, 107, 0.3);
  color: #ff6b6b;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: rgba(255, 107, 107, 0.3);
  border-color: #ff6b6b;
}

@media (max-width: 768px) {
  .user-lists-container {
    padding: 1rem 0.5rem;
  }

  .page-header h1 {
    font-size: 1.8rem;
  }

  .lists-grid {
    grid-template-columns: 1fr;
  }

  .search-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .list-items-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }

  .details-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
