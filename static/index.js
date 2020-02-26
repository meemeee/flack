$(document).ready(function () {

    // Fuction to add and remove the animations
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
                document.querySelector('.zero .is-animated').classList.remove('animated', 'fadeIn', 'delay-1s');
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

    //adding the action to the button
    $(document).on('click', '#btn', function () {
        fullpage_api.moveSlideRight();
    });
    $(document).on('click', '#btn2', function () {
        fullpage_api.moveSlideLeft();
    });
    $(document).on('click', '#btn3', function () {
        fullpage_api.moveSlideRight();
    });
    $(document).on('click', '#btn4', function () {
        fullpage_api.moveSlideLeft();
    });

    // By default, Start button is disabled
    const start = document.querySelector('#start');
    start.disabled = true;
    
    // Enable Start button only if there is text in the input field
    const name = document.querySelector('#name');
    document.querySelector('#name').onkeyup = () => {
        if (name.value.length > 0)
            start.disabled = false;                       
        else
            start.disabled = true;
    };

});