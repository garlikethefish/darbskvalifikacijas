<script>
import UpdatePost from '@/components/UpdatePost.vue';
export default {
    name: 'Contact',
    components: {
        UpdatePost
    }
};
</script>

<template>
    <div id="app">
        <UpdatePost>0.6 ≽^•⩊•^≼ update<template #content>added profiles, tweaked general design, added connection to database, removed hopes and dreams, added new review addition option</template></UpdatePost>
        <UpdatePost>(づ｡◕‿‿◕｡)づ 0.5 update<template #content>added reviews page, added more data to database, added login functionality</template></UpdatePost>
        <UpdatePost>0.4 update ╭∩╮( •̀_•́ )╭∩╮<template #content>added hopes and dreams</template></UpdatePost>
        <UpdatePost>⸜(｡˃ ᵕ ˂)⸝♡ 0.3 update<template #content>removed hopes for a decent math exam grade (pray for me)</template></UpdatePost>
        <UpdatePost>(¬_¬") 0.2 (¬_¬") update<template #content>tweaked sites design</template></UpdatePost>
        <UpdatePost>0.1 update<template #content>drank pepsi</template></UpdatePost>
    </div>
</template>