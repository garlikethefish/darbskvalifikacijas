<template>
    <div class="update-post">
        <h1 class="update-post-header"><slot>DEFAULT UPDATE</slot></h1>
        <div class="post-content">
            <p><slot name="content">default post content</slot></p>
        </div>
    </div>
</template>
<style>
    .post-content{
        min-height: 200px;
        margin: 0 auto; 
        padding-top: 20px;
        text-align: justify; 
        max-width: 900px;
    }
    .update-post-header {
        margin: 0;
        background: var(--dark-bg-color);
        background: linear-gradient(180deg, var(--dark-bg-color) 33%, var(--background-color) 100%);
    }
</style>