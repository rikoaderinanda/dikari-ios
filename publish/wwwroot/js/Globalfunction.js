function formatTimeLocal(waktu) {
    const date = new Date(waktu.split('.')[0]);

    const formatted = new Intl.DateTimeFormat("id-ID", {
        dateStyle: "long",
        timeStyle: "medium",
    }).format(date);
    return formatted
}


function toggleBottomSheet(Id) {
    document.getElementById(Id).classList.toggle("show");
}

const Storage = {
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    get(key) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    },
    remove(key) {
        localStorage.removeItem(key);
    },
    clear() {
        localStorage.clear();
    }
};

function initCarousel(Element, Qty, loop) {
    var $slider = $('#' + Element + '');
    if ($slider.hasClass('owl-loaded')) {
        $slider.trigger('destroy.owl.carousel');
    }
    $slider.owlCarousel({
        loop: loop,
        margin: 16,
        nav: false,
        dots: true,
        responsive: {
            0: { items: Qty },
            600: { items: Qty },
            1000: { items: Qty }
        }
    });
}

function lazyAnimateItems(Element) {
    var items = document.querySelectorAll('#' + Element + ' .fade-in');
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        items.forEach(function (item) { observer.observe(item); });
    } else {
        // fallback
        items.forEach(function (item) { item.classList.add('visible'); });
    }
}

function formatRupiah(angka) {
    if (typeof angka !== 'number' || isNaN(angka)) return 'Rp 0';
    return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function validasiForm() {
    let isValid = true;

    // Reset error
    $(':input').removeClass('is-invalid');

    // Cek tiap input required
    $('input[required], textarea[required]').each(function () {
        let val = $(this).val().trim();
        let id = $(this).attr('id');
        // Validasi khusus untuk WhatsApp
        if (id === 'whatsapp') {
            if (!isValidWhatsapp(val)) {
                $(this).addClass('is-invalid');
                $(this)
                    .next('.invalid-feedback')
                    .text('Format nomor WhatsApp tidak valid.');
                isValid = false;
                return;
            } else {
                $(this).removeClass('is-invalid');
            }
        }

        if (!val) {
            $(this).addClass('is-invalid'); // Tambah class untuk trigger pesan error
            isValid = false;
        } else {
            if (id !== 'whatsapp') {
                $(this).removeClass('is-invalid');
            }
        }
    });

    return isValid;
}

function isValidWhatsapp(number) {
    let cleaned = number.replace(/\D/g, ''); // Hapus semua karakter non-digit
    return /^((62)|0)8[1-9][0-9]{7,11}$/.test(cleaned); // Validasi pola umum WhatsApp di Indonesia
}

function getEmptyFields(obj, path = '') {
    let emptyFields = [];

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const val = obj[key];
            const currentPath = path ? `${path}.${key}` : key;

            if (Array.isArray(val)) {
                if (val.length === 0) {
                    emptyFields.push(currentPath);
                } else {
                    // Jika array isinya object, iterasi setiap item
                    val.forEach((item, index) => {
                        if (typeof item === 'object' && item !== null) {
                            emptyFields.push(
                                ...getEmptyFields(
                                    item,
                                    `${currentPath}[${index}]`
                                )
                            );
                        }
                    });
                }
            } else if (typeof val === 'object' && val !== null) {
                emptyFields.push(...getEmptyFields(val, currentPath));
            } else if (val === '' || val === null || val === undefined) {
                emptyFields.push(currentPath);
            }
        }
    }

    return emptyFields;
}

function postApi(options) {
    const {
        url,
        data,
        onSuccess = function () {},
        onError = function () {},
        onBeforeSend = function () {},
        onComplete = function () {}
    } = options;

    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        beforeSend: function () {
            onBeforeSend();
        },
        success: function (response) {
            onSuccess(response);
        },
        error: function (xhr, status, error) {
            let message = 'Terjadi kesalahan saat mengirim data.';

            if (xhr.responseJSON && xhr.responseJSON.message) {
                message = xhr.responseJSON.message;
            } else if (xhr.status === 0) {
                message = 'Tidak dapat terhubung ke server.';
            } else if (xhr.status >= 400) {
                message = `Error ${xhr.status}: ${xhr.statusText}`;
            }

            console.error('Error:', message);
            onError(xhr, message);
        },
        complete: function () {
            onComplete();
        }
    });
}

function getStoragePemesanan() {
    var keranjang = Storage.get('keranjang') || [];
    var JenisProperti = Storage.get('jenis_properti') || [];
    var Keluhan = Storage.get('keluhan') || [];
    var TanggalKunjungan = Storage.get('TanggalKunjungan') || '';
    var JamKunjungan = Storage.get('JamKunjungan') || '';
    var Total = Storage.get('Total') || 0;
    var Customer = Storage.get('Customer') || [];
    var IdPesanan = Storage.get('IdPesanan') || 0;
    var id_layanan = Storage.get('id_layanan') || 0;
    var user_id = Storage.get('userId') || null;
    var _NoRefCheckout = Storage.get('NoRefCheckout') || '';

    var data = {
        Keranjang: keranjang,
        JenisProperti: JenisProperti,
        Keluhan: Keluhan,
        TanggalKunjungan: TanggalKunjungan,
        JamKunjungan: JamKunjungan,
        Total: Total,
        Customer: Customer,
        Id: IdPesanan,
        id_layanan: id_layanan,
        user_id: user_id,
        NoRefCheckout: _NoRefCheckout
    };

    return data;
}

function callApi(options) {
    const {
        url,
        method = 'GET',
        data = null,
        token = null,
        contentType = 'application/json',
        success = function () {},
        error = function () {},
        onBeforeSend = function () {},
        onComplete = function () {}
    } = options;

    $.ajax({
        url: url,
        method: method,
        contentType: contentType,
        data:
            contentType === 'application/json' && data
                ? JSON.stringify(data)
                : data,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        success: function (response) {
            success(response);
        },
        error: function (xhr) {
            const errMsg =
                xhr.responseJSON?.message || xhr.statusText || 'API Error';
            //console.error('API Error:', errMsg);
            error(errMsg);
            Swal.fire({
                icon: 'error',
                title: '<strong>Koneksi gagal</strong>',
                html: `<div style="font-size: 15px;">Silahkan cek koneksi internet anda</div>`,
                confirmButtonText: '<i class="bi bi-x-circle me-1"></i> Tutup',
                confirmButtonColor: '#e74c3c',
                cancelButtonText:
                    '<i class="bi bi-arrow-repeat me-1"></i> Ulangi Proses',
                cancelButtonColor: '#3498db',
                showCancelButton: true,
                reverseButtons: true,
                background: '#fff',
                color: '#333',
                padding: '1.5em',
                customClass: {
                    popup: 'rounded-4 shadow-lg'
                }
            }).then((result) => {
                if (result.dismiss === Swal.DismissReason.cancel) {
                    // Jalankan ulang proses di sini
                    location.reload(); // contoh: reload halaman
                    // atau panggil fungsi ulangiProses();
                }
            });
        },
        beforeSend: function () {
            onBeforeSend();
        },
        complete: function () {
            onComplete();
        }
    });
}

function formatToSixDigits(number) {
    return number.toString().padStart(6, '0');
}

function isValidUser(u) {
    return (
        u != null &&
        typeof u === 'object' &&
        u.id != null &&
        typeof u.username === 'string' &&
        u.username.trim() !== ''
    );
}

function getUserInfo() {
    var data = {
        id: Storage.get('userId') || '',
        username: Storage.get('username') || '',
        nama_lengkap: Storage.get('nama_lengkap') || '',
        email: Storage.get('email') || '',
        no_hp: Storage.get('no_hp') || '',
        photo: Storage.get('photo') || ''
    };
    return data;
}

function getSalamWaktu() {
    const jam = new Date().getHours();

    if (jam >= 4 && jam < 11) {
        return 'Pagi';
    } else if (jam >= 11 && jam < 15) {
        return 'Siang';
    } else if (jam >= 15 && jam < 18) {
        return 'Sore';
    } else {
        return 'Malam';
    }
}

function formatUnixToDateTimeString(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000); // konversi ke milidetik

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
}

function getRandomHexColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getRandomLinearGradient(deg = 135) {
    const color1 = getRandomHexColor();
    const color2 = getRandomHexColor();
    return `linear-gradient(${deg}deg, ${color1}, ${color2})`;
}

function isEmptyObject(obj) {
    return obj && typeof obj === 'object' && Object.keys(obj).length === 0;
}

function showSpinnerOnButton(btnId) {
    const btn = $(`#${btnId}`);
    btn.prop('disabled', true);
    btn.html(`
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        `);
}

function resetButtonIcon(btnId) {
    $(`#${btnId}`).prop('disabled', false).html(`
        <i class="bi bi-arrow-right" style="font-size: 1.0rem;"></i>
    `);
}

async function InstruksiBayar(dataapi, btn) {
    return new Promise((resolve, reject) => {
        callApi({
            url: '/api/Tripay/CreateTransaction',
            method: 'POST',
            data: dataapi,
            success: function (res) {
                resolve(res); // return hasil sukses
            },
            error: function (err) {
                reject(err); // return error ke caller
            },
            onBeforeSend: function () {
                $(`#${btn.id}`)
                    .prop('disabled', true)
                    .text(`${btn.txtProcess}`);
            },
            onComplete: function () {
                $(`#${btn.id}`)
                    .prop('disabled', false)
                    .text(`${btn.txtfinish}`);
            }
        });
    });
}

async function CheckOutTrx(dataapi, btn) {
    return new Promise((resolve, reject) => {
        callApi({
            url: '/api/Transaction/Checkout',
            method: 'PUT',
            data: dataapi,
            success: function (res) {
                resolve(res); // return hasil sukses
            },
            error: function (err) {
                reject(err); // return error ke caller
            },
            onBeforeSend: function () {
                $(`#${btn.id}`)
                    .prop('disabled', true)
                    .text(`${btn.txtProcess}`);
            },
            onComplete: function () {
                $(`#${btn.id}`)
                    .prop('disabled', false)
                    .text(`${btn.txtfinish}`);
            }
        });
    });
}

async function getDataTransaksi(id, btnId) {
    return new Promise((resolve, reject) => {
        const btn = $(`#${btnId}`);
        callApi({
            url: `/api/Transaction/GetDetailTrx_ById?id=` + id,
            method: 'GET',
            success: function (res) {
                resolve(res); // kembalikan data API
            },
            error: function () {
                Swal.fire('Gagal!', 'Proses gagal.', 'warning');
                reject('API Error');
            },
            onBeforeSend: function () {
                btn.html(
                    `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`
                );
                btn.prop('disabled', true);
            },
            onComplete: function () {
                btn.html(
                    `<i class="bi bi-arrow-right" style="font-size: 1rem;"></i>`
                );
                btn.prop('disabled', false);
            }
        });
    });
}

async function DetailPesanan(id, btn) {
    await new Promise((r) => setTimeout(r, 0));

    try {
        let data = await getDataTransaksi(id, btn);

        if (data && data.length > 0 && data[0]) {
            const alldata = {
                id: data[0].id,
                createByIdUser: data[0].create_by_id_user,
                kategoriLayanan: data[0].kategori_layanan,
                jenisLayanan: data[0].jenis_layanan,
                totalTransaksi: data[0].total_transaksi,
                jenisProperti: data[0].properti,
                kontakPelanggan: data[0].kontak,
                alamatPelanggan: data[0].alamat_pelanggan,
                kunjungan: {
                    Reguler: data[0].kunjungan.reguler,
                    Member: data[0].kunjungan.member
                },
                cartItem: {
                    Reguler: data[0].cart_items,
                    Member: {}
                },
                paketMember: data[0].paket
            };
            console.log(alldata);
            Storage.set('DataTrx', alldata);
            window.location.href = '/Pembayaran/PaymentMethod';
        }
    } catch (err) {
        console.error(err);
    }
}

function checkDateAndTimeVisitOrder(date, time) {
    // date format: "YYYY-MM-DD"
    // time format: "HH:mm" (24 jam)

    const now = new Date();

    // gabungkan date + time jadi 1 Date object
    const visitDateTime = new Date(`${date}T${time}:00`);

    if (isNaN(visitDateTime.getTime())) {
        throw new Error('Format date/time tidak valid');
    }

    // kurangi 2 jam dari waktu visit
    const expiredThreshold = new Date(
        visitDateTime.getTime() - 2 * 60 * 60 * 1000
    );

    // return true kalau sudah lewat
    return now > expiredThreshold;
}

// helper untuk ambil token
function getValidToken() {
    let token = localStorage.getItem('jwt');
    if (!token) return null;

    token = token.replace(/^"(.+)"$/, '$1'); // hapus quotes ganda

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // if (payload.exp && Date.now() >= payload.exp * 1000) {
        //     console.warn('Token expired');
        //     Storage.remove('username');
        //     Storage.remove('jwt');
        //     return null;
        // }
    } catch (e) {
        console.error('Token tidak valid', e);
        Storage.remove('username');
        Storage.remove('jwt');
        return null;
    }

    return token;
}

function error_getLocation(err) {
    console.error('Error:', err.message);
}

async function getAddress_api(lat, lng) {
    return new Promise((resolve, reject) => {
        callApi({
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

function validateField(id, isSelect = false, fieldName = '') {
    const el = document.getElementById(id);
    const val = el.value.trim();

    if (!val || val === '0') {
        el.style.border = '2px solid red';

        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: `${fieldName} wajib diisi!`,
            confirmButtonColor: '#3085d6'
        });

        return false;
    } else {
        el.style.border = '';
        return true;
    }
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

function getCleanToken() {
    let token = localStorage.getItem('jwt');
    if (!token) return null;

    // hapus tanda kutip di depan & belakang kalau ada
    if (token.startsWith('"') && token.endsWith('"')) {
        token = token.substring(1, token.length - 1);
    }

    return token;
}

function decodeJwt(token) {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    console.log('Header:', JSON.parse(atob(parts[0])));
    console.log('Payload:', payload);
    return payload;
}