<template>
    <aside>
                <h2><slot>{{ t('contactInfoBlurb') }}</slot></h2>
    </aside>
</template>
<script>
import { getTranslation, getCurrentLanguage } from '@/services/translations.js'

export default {
    data() {
        return { currentLanguage: 'en' }
    },
    methods: {
        t(key) {
            return getTranslation(key, this.currentLanguage)
        },
        onLanguageChanged(e) {
            this.currentLanguage = e.detail.language
        }
    },
    mounted() {
        this.currentLanguage = getCurrentLanguage()
        window.addEventListener('languageChanged', this.onLanguageChanged)
    },
    beforeUnmount() {
        window.removeEventListener('languageChanged', this.onLanguageChanged)
    }
}
</script>
<style>
    aside{
        padding-top: 50px;
        padding-bottom: 50px;
        text-align: center;
        background: linear-gradient(to right,var(--gradient-start),var(--medium-bg-color));
    }
</style>