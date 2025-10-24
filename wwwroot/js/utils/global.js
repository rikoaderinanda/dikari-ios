// global.js
const global = (() => {
    /* ===============================
       📦 Storage Utility
    =============================== */
    const Storage = {
        set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
        get: (key) => {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        },
        remove: (key) => localStorage.removeItem(key),
        clear: () => localStorage.clear()
    };

    /* ===============================
       💰 Format & String Utils
    =============================== */
    const formatRupiah = (angka) => {
        if (typeof angka !== 'number' || isNaN(angka)) return 'Rp 0';
        return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const formatTimeLocal = (waktu) => {
        const date = new Date(waktu.split('.')[0]);
        return new Intl.DateTimeFormat('id-ID', {
            dateStyle: 'long',
            timeStyle: 'medium'
        }).format(date);
    };

    const formatToSixDigits = (number) => number.toString().padStart(6, '0');

    const getSalamWaktu = () => {
        const jam = new Date().getHours();
        if (jam >= 4 && jam < 11) return 'Pagi';
        if (jam >= 11 && jam < 15) return 'Siang';
        if (jam >= 15 && jam < 18) return 'Sore';
        return 'Malam';
    };

    /* ===============================
       🎨 Random Generator
    =============================== */
    const getRandomHexColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const getRandomLinearGradient = (deg = 135) => {
        const color1 = getRandomHexColor();
        const color2 = getRandomHexColor();
        return `linear-gradient(${deg}deg, ${color1}, ${color2})`;
    };

    /* ===============================
       📅 Date & Time Utilities
    =============================== */
    const formatUnixToDateTimeString = (unixTimestamp) => {
        const date = new Date(unixTimestamp * 1000);
        const day = date.getDate().toString().padStart(2, '0');
        const monthNames = [
            'Januari',
            'Februari',
            'Maret',
            'April',
            'Mei',
            'Juni',
            'Juli',
            'Agustus',
            'September',
            'Oktober',
            'November',
            'Desember'
        ];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
    };

    const checkDateAndTimeVisitOrder = (date, time) => {
        const now = new Date();
        const visitDateTime = new Date(`${date}T${time}:00`);
        if (isNaN(visitDateTime.getTime())) {
            throw new Error('Format date/time tidak valid');
        }
        const expiredThreshold = new Date(
            visitDateTime.getTime() - 2 * 60 * 60 * 1000
        );
        return now > expiredThreshold;
    };

    /* ===============================
       🧭 Map & Location Utilities
    =============================== */
    const error_getLocation = (err) => console.error('Error:', err.message);

    const getAddress_api = async (lat, lng) => {
        return new Promise((resolve, reject) => {
            callApi({
                url: `/api/Location/reverse-geocode?lat=${lat}&lng=${lng}`,
                method: 'GET',
                success: resolve,
                error: () => reject('API Error')
            });
        });
    };

    const showMaps = (koordinat) => {
        if (!koordinat) {
            Swal.fire({
                icon: 'warning',
                title: 'Koordinat tidak tersedia',
                text: 'Alamat ini belum memiliki titik lokasi di Maps.'
            });
            return;
        }
        const [lat, lng] = koordinat.split(',');
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    };

    /* ===============================
       ⚙️ API Helper
    =============================== */
    const callApi = (options) => {
        const {
            url,
            method = 'GET',
            data = null,
            token = null,
            contentType = 'application/json',
            success = () => {},
            error = () => {},
            onBeforeSend = () => {},
            onComplete = () => {}
        } = options;

        $.ajax({
            url,
            method,
            contentType,
            data:
                contentType === 'application/json' && data
                    ? JSON.stringify(data)
                    : data,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            success,
            error: (xhr) => {
                const errMsg =
                    xhr.responseJSON?.message || xhr.statusText || 'API Error';
                error(errMsg);
                Swal.fire({
                    icon: 'error',
                    title: '<strong>Koneksi gagal</strong>',
                    html: `<div style="font-size: 15px;">Silahkan cek koneksi internet anda</div>`,
                    confirmButtonText:
                        '<i class="bi bi-x-circle me-1"></i> Tutup',
                    confirmButtonColor: '#e74c3c',
                    cancelButtonText:
                        '<i class="bi bi-arrow-repeat me-1"></i> Ulangi Proses',
                    cancelButtonColor: '#3498db',
                    showCancelButton: true,
                    reverseButtons: true,
                    background: '#fff',
                    color: '#333',
                    padding: '1.5em',
                    customClass: { popup: 'rounded-4 shadow-lg' }
                }).then((result) => {
                    if (result.dismiss === Swal.DismissReason.cancel)
                        location.reload();
                });
            },
            beforeSend: onBeforeSend,
            complete: onComplete
        });
    };

    /* ===============================
       🎠 UI Utilities
    =============================== */
    const toggleBottomSheet = (id) =>
        document.getElementById(id)?.classList.toggle('show');

    const initCarousel = (element, qty, loop = false) => {
        const $slider = $('#' + element);
        if ($slider.hasClass('owl-loaded'))
            $slider.trigger('destroy.owl.carousel');
        $slider.owlCarousel({
            loop,
            margin: 16,
            nav: false,
            dots: true,
            responsive: {
                0: { items: qty },
                600: { items: qty },
                1000: { items: qty }
            }
        });
    };

    const lazyAnimateItems = (element) => {
        const items = document.querySelectorAll(`#${element} .fade-in`);
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(
                (entries, obs) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
                            obs.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.1 }
            );
            items.forEach((item) => observer.observe(item));
        } else {
            items.forEach((item) => item.classList.add('visible'));
        }
    };

    /* ===============================
       ✅ Return Public API
    =============================== */
    return {
        Storage,
        formatRupiah,
        formatTimeLocal,
        formatToSixDigits,
        getSalamWaktu,
        getRandomHexColor,
        getRandomLinearGradient,
        formatUnixToDateTimeString,
        checkDateAndTimeVisitOrder,
        error_getLocation,
        getAddress_api,
        showMaps,
        callApi,
        toggleBottomSheet,
        initCarousel,
        lazyAnimateItems
    };
})();

window.global = global;
