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
    // animateCSS('.zero .is-animated', 'bounce');
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

    // new fullpage('#fullpage', {
    //     anchors: ['page1', 'page2', 'page3', 'page4'],
    //     sectionsColor: ['yellow', 'orange', '#C0C0C0', '#ADD8E6'],
    // });

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

});