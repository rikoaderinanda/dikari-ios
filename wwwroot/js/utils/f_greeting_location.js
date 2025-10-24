// ==========================================

// Versi reusable & modular dari helper umum
// ==========================================

const f_location = (() => {
    // ------------------------------------------
    // 📍 GEOLOCATION & MAP FUNCTIONS
    // ------------------------------------------

    async function initMap({
        onSuccess = success_getLocation,
        onError = error_getLocation
    } = {}) {
        if (!navigator.geolocation) {
            console.warn('Geolocation tidak didukung browser ini.');
            return;
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }

    async function success_getLocation(pos) {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
            const data = await getAddress_api(lat, lng);
            if (data) {
                $('#currentLocation').text(
                    `${data.kelurahan}, ${data.kecamatan}, ${data.city}`
                );
            }
        } catch (err) {
            console.error('Gagal memuat alamat:', err);
        }
    }

    function error_getLocation(err) {
        console.error('Gagal mendapatkan lokasi:', err);
        alert('Tidak dapat mengambil lokasi saat ini. Pastikan GPS aktif.');
    }

    function extractAddressComponents(components) {
        const find = (type) => {
            const comp = components.find((c) => c.types.includes(type));
            return comp ? comp.long_name : '';
        };
        return {
            kelurahan:
                find('sublocality_level_1') ||
                find('administrative_area_level_4'),
            kecamatan: find('administrative_area_level_3'),
            city: find('administrative_area_level_2'),
            province: find('administrative_area_level_1'),
            country: find('country')
        };
    }

    function showMaps(koordinat) {
        console.log(koordinat);
        if (!koordinat) {
            Swal.fire({
                icon: 'warning',
                title: 'Koordinat tidak tersedia',
                text: 'Alamat ini belum memiliki titik lokasi di Maps.'
            });
            return;
        }

        // pastikan format koordinat: "lat,lng"
        const [lat, lng] = koordinat.split(',');
        const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;

        // buka di tab baru
        window.open(mapUrl, '_blank');
    }

    async function getAddress_api(lat, lng) {
        return new Promise((resolve, reject) => {
            global.callApi({
                url: `/api/Location/reverse-geocode?lat=${lat}&lng=${lng}`,
                method: 'GET',
                success: function (res) {
                    resolve(res); // kembalikan data API
                },
                error: function () {
                    console.log('Proses gagal.');
                    //Swal.fire('Gagal!', 'Proses gagal.', 'warning');
                    reject('API Error');
                },
                onBeforeSend: function () {
                    // btn.html(
                    //     `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`
                    // );
                    // btn.prop('disabled', true);
                },
                onComplete: function () {
                    // btn.html(
                    //     `<i class="bi bi-arrow-right" style="font-size: 1rem;"></i>`
                    // );
                    // btn.prop('disabled', false);
                }
            });
        });
    }

    // ------------------------------------------
    // 🧰 EXPORT
    // ------------------------------------------

    return {
        initMap,
        success_getLocation,
        error_getLocation,
        getAddress_api,
        showMaps,
        extractAddressComponents
    };
})();

// Optional: buat global alias (agar bisa dipanggil langsung tanpa import)
window.f_location = f_location;
