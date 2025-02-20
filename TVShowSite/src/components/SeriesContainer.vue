<template>
    <div class="series-container">
        <img :src="'./src/assets/series_images/basic_series.png'" alt="Series">
        <div class="card">Series Title</div>
        <div class="caption-text">Basic series description with a lot of text like a lot a hell of a lot of text juppp jp jup.</div>
        <router-link to="reviews">
            <button class="hover-button">Review</button>
        </router-link>
        <button @click="initModal('modal1')" class="modal-button" data-target="modal1">More</button>
        <div id="modal1" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h1>Series Title</h1>
                <p>Series description.</p>
                <p>Seasons: X</p>
                <p>Episodes: XX</p>
                <p>Created by: John Doe, Jane Doe</p>
                <p>Released: XXXX</p>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    methods: {
        initModal(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) return;
            
            const closeButton = modal.querySelector('.close');
            
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    modal.style.display = 'none';
                });
            }

            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });

            // Show the modal
            modal.style.display = 'block';
        }
    }
}
</script>