const f_promo = (() => {
    function initPromo() {
        $('.offer-slider').owlCarousel({
            loop: true,
            margin: 2,
            nav: false,
            dots: false,
            autoplay: true,
            autoplayTimeout: 3000,
            autoplayHoverPause: true,
            responsive: {
                0: { items: 2.3 },
                600: { items: 2 },
                1000: { items: 3 }
            }
        });
    }

    return {
        initPromo
    };
})();

window.f_promo = f_promo;
