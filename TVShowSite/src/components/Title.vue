<template>
    <div class="title-container">
        <h1 class="title">PlotTwizts</h1>
        <button id="theme-toggle" class="theme-toggle">🌙</button>
    </div>
</template>

<style>
    div{
        display: table;
        width: 100%;
        table-layout: fixed;
    }
    h1{
        color: var(--text-color);
        padding-top: 30px;
        margin-top: 0px;
        text-align: center;
    }
    
    .title-container{
        display: flex; 
        align-items: center;
        justify-content: space-between;
    }
    .title{
        padding-top: 30px;
        text-align: center;
        font-size: 40px;
        color: var(--text-color);
        background-color: var(--medium-bg-color);
        margin: 0;
        flex: 1;
        text-align: center; 
        margin-left: 80px;
    }
    .theme-toggle {
        cursor: pointer; 
        font-size: 34px; 
        background: none; 
        border: none; 
        padding: 0; 
        display: inline;
        outline: none; 
        margin-right: 20px;
    }
</style>