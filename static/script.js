document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('feedbackForm');
    const ratingFilter = document.getElementById('ratingFilter');
    const limitFilter = document.getElementById('limitFilter');
    let ratings = {
        1: 0,
        2: 0,
        3: 0
    };

    // Star rating functionality
    document.querySelectorAll('.rating').forEach(ratingContainer => {
        const stars = ratingContainer.querySelectorAll('.fa-star');
        
        stars.forEach(star => {
            star.addEventListener('mouseover', function() {
                const value = this.dataset.value;
                highlightStars(stars, value);
            });

            star.addEventListener('mouseout', function() {
                const questionNum = this.parentElement.dataset.question;
                highlightStars(stars, ratings[questionNum] || 0);
            });

            star.addEventListener('click', function() {
                const value = this.dataset.value;
                const questionNum = this.parentElement.dataset.question;
                ratings[questionNum] = parseInt(value);
                highlightStars(stars, value);
            });
        });
    });

    function highlightStars(stars, value) {
        stars.forEach(star => {
            star.classList.toggle('active', star.dataset.value <= value);
        });
    }

    function calculateAverageRating(ratings) {
        const values = Object.values(ratings);
        const sum = values.reduce((a, b) => a + b, 0);
        return (sum / values.length).toFixed(1);
    }

    function getStarDisplay(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '★'.repeat(fullStars);
        
        if (hasHalfStar) {
            stars += '½';
        }
        
        const remainingStars = 5 - Math.ceil(rating);
        if (remainingStars > 0) {
            stars += '☆'.repeat(remainingStars);
        }
        
        return stars;
    }

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate that all star ratings are provided
        if (!ratings[1] || !ratings[2] || !ratings[3]) {
            alert('Please provide ratings for all questions');
            return;
        }

        const name = form.name.value.trim() || 'Anonymous';
        const averageRating = calculateAverageRating(ratings);

        const feedback = {
            timestamp: new Date().toISOString(),
            name: name,
            ratings: {
                productQuality: ratings[1],
                recommendation: ratings[2],
                communication: ratings[3]
            },
            averageRating: averageRating,
            additionalFeedback: form.additional_feedback.value.trim()
        };

        try {
            const response = await fetch('/submit_feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(feedback)
            });

            if (response.ok) {
                form.reset();
                ratings = { 1: 0, 2: 0, 3: 0 };
                document.querySelectorAll('.fa-star').forEach(star => {
                    star.classList.remove('active');
                });
                loadFeedback();
                alert('Feedback submitted successfully!');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error submitting feedback');
        }
    });

    // Load and display feedback
    async function loadFeedback() {
        try {
            const response = await fetch('/get_feedback');
            const feedbackList = await response.json();
            displayFeedback(feedbackList);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function displayFeedback(feedbackList) {
        const tbody = document.querySelector('#feedbackTable tbody');
        tbody.innerHTML = '';

        const filterValue = ratingFilter.value;
        const limitValue = limitFilter.value;

        // Sort feedbacks by timestamp (newest first)
        feedbackList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Apply rating filter
        let filteredList = feedbackList.filter(feedback => {
            const averageRating = parseFloat(feedback.averageRating);
            return filterValue === 'all' || Math.round(averageRating) === parseInt(filterValue);
        });

        // Apply limit filter
        if (limitValue !== 'all') {
            filteredList = filteredList.slice(0, parseInt(limitValue));
        }

        filteredList.forEach(feedback => {
            const averageRating = parseFloat(feedback.averageRating);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${feedback.name}</td>
                <td>${getStarDisplay(averageRating)} (${averageRating})</td>
                <td>${feedback.additionalFeedback || '-'}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // Filter change handlers
    ratingFilter.addEventListener('change', () => {
        loadFeedback();
    });

    limitFilter.addEventListener('change', () => {
        loadFeedback();
    });

    // Initial load
    loadFeedback();
}); 