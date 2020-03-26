$(document).ready(function () {
    // Redirect to last channel if this is not the first visit
    if (localStorage.getItem('last_channel') && document.querySelector('#last_channel')) {
        document.querySelector('#last_channel').href = localStorage.getItem('last_channel');
        // Clear previous lastChannel value
        localStorage.removeItem('last_channel');
    }

    // Function to add and remove the animations
    function animateCSS(element, animationName, callback) {
        const node = document.querySelector(element)
        node.classList.add('animated', animationName)

        function handleAnimationEnd() {
            node.classList.remove('animated', animationName)
            node.removeEventListener('animationend', handleAnimationEnd)

            if (typeof callback === 'function') callback()
        }

        node.addEventListener('animationend', handleAnimationEnd)
    }

    // Initialize Fullpage
    $('#fullpage').fullpage({
        navigation: true,
        onLeave: function (index, nextIndex, direction) {

            // Moving from section 0
            if (index.index == 0 && direction == 'down') {
                // Remove 'delay' attribute in section 0
                document.querySelector('.zero .is-animated').classList.remove('animated', 'fadeIn');
                document.querySelector('.fa-chevron-down').style.display = "none";
                // Animate next section
                animateCSS('.first .is-animated', 'fadeInUp');
            }

            // Moving from section 1
            else if (index.index == 1 && direction == 'down') {
                animateCSS('.second .is-animated', 'fadeInUp');
            }
            else if (index.index == 1 && direction == 'up') {
                animateCSS('.zero .is-animated', 'fadeInUp');
            }

            // Moving from section 2
            else if (index.index == 2 && direction == 'down') {
                animateCSS('.third .is-animated', 'fadeInUp');
            }
            else if (index.index == 2 && direction == 'up') {
                animateCSS('.first .is-animated', 'fadeInUp');
            }

            // Moving from section 3
            else if (index.index == 3 && direction == 'up') {
                animateCSS('.second .is-animated', 'fadeInUp');
            }
        },

    })
    // Adding action to chevron button
    document.querySelector('.fa-chevron-down').onclick = () => {
        // animation
        fullpage_api.moveSectionDown();
    };

    // Add action to 'Get started' button
    document.querySelector('#get-started').onclick = () => {
        // animation
        fullpage_api.moveSlideRight();
    };
    document.querySelectorAll('.CTA').forEach(button => {
        button.onclick = () => {
            // no animation
            fullpage_api.silentMoveTo(4, 1);
        }
    });

    // By default, Go button is disabled
    const go = document.querySelector('#go');
    go.disabled = true;
    
    // Enable Start button only if there is text in the input field
    const name = document.querySelector('#name');
    document.querySelector('#name').onkeyup = () => {
        if (name.value.length > 0)
            go.disabled = false;                       
        else
            go.disabled = true;
    };

});