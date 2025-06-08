<template>
    <div class="update-post">
        <h2 class="update-post-header" id="first-title"><slot>DEFAULT UPDATE</slot></h2>
        <div class="post-content">
            <p><slot name="content">default post content</slot></p>
        </div>
    </div>
</template>
<style>
    .post-content{
        min-height: auto;
        margin: 0 auto; 
        padding-top: 20px;
        padding-bottom: 50px;
        text-align: justify; 
        max-width: 900px;
    }
    .update-post-header {
        text-align: center;
        margin: 0;
        background: var(--dark-bg-color);
        background: linear-gradient(180deg, var(--dark-bg-color) 33%, var(--background-color) 100%);
    }
</style>