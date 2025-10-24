const f_testimoni = (() => {
    function initTestimoni() {
        $('#TestiPelanggan').owlCarousel({
            loop: true,
            margin: 10,
            nav: false,
            dots: false,
            autoplay: true,
            autoplayTimeout: 3000,
            autoplayHoverPause: true,
            responsive: {
                0: {
                    items: 1
                },
                600: {
                    items: 2
                },
                1000: {
                    items: 3
                }
            }
        });
    }
    return {
        initTestimoni
    };
})();

window.f_promo = f_promo;
