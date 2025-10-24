// ==============================
// Component: AlamatPelanggan
// Reusable JS Class
// ==============================

class AlamatPelanggan {
    constructor(options = {}) {
        // --- konfigurasi default
        this.config = Object.assign(
            {
                rootId: '#formTambahAlamat',
                btnTambah: '#btnTambahAlamat',
                btnSimpan: '#btnSimpanAlamat',
                listAlamat: '#ListAlamat',
                btnMyLocation: '#btnMyLocation',
                spinnerLocation: '#spinnerLocation',
                btnText: '#btnText',
                onSave: null, // callback saat simpan ditekan
                apiWilayah: '/api/wilayah',
                apiAlamat: '/api/alamat',
                mapId: 'googleMap'
            },
            options
        );

        // --- cache element
        this.$form = $(this.config.rootId);
        this.$btnTambah = $(this.config.btnTambah);
        this.$btnSimpan = $(this.config.btnSimpan);
        this.$listAlamat = $(this.config.listAlamat);
        this.$btnMyLocation = $(this.config.btnMyLocation);
        this.$spinner = $(this.config.spinnerLocation);
        this.$btnText = $(this.config.btnText);

        this.map = null;
        this.marker = null;

        // --- init event
        this.initEvents();
    }

    // =======================
    // Event Binding
    // =======================
    initEvents() {
        this.$btnTambah.on('click', () => this.toggleForm());
        this.$btnSimpan.on('click', () => this.saveAlamat());
        this.$btnMyLocation.on('click', () => this.getMyLocation());
    }

    // =======================
    // Form Toggle
    // =======================
    toggleForm() {
        const opening = this.$form.is(':hidden');

        if (opening) {
            this.loadWilayah();
            this.$form.show();
            this.$btnSimpan.show();
            this.$btnTambah.html('<i class="bi bi-x-circle me-1"></i> Batal');
            this.$listAlamat.hide();
        } else {
            this.resetForm();
            this.$form.hide();
            this.$btnSimpan.hide();
            this.$btnTambah.html(
                '<i class="bi bi-plus-circle me-1"></i> Tambah Alamat'
            );
            this.$listAlamat.show();
        }
    }

    // =======================
    // Reset Form
    // =======================
    resetForm() {
        this.$form.trigger('reset');
        this.$form.find('.is-invalid').removeClass('is-invalid');
        this.$form.find('select.select2').val('').trigger('change');
        $('#infoHargaProperti, #AlertProperti').hide();
    }

    // =======================
    // Simpan Alamat
    // =======================
    saveAlamat() {
        const data = {
            judul: $('#inputJudul').val(),
            alamat: $('#inputAlamat').val(),
            koordinat: $('#inputMaps').val(),
            provinsi: $('#selectProvinsi').val(),
            kota: $('#selectKota').val(),
            kecamatan: $('#selectKecamatan').val(),
            kelurahan: $('#selectKelurahan').val(),
            properti: $('#selectJenisProperti').val()
        };

        // Validasi sederhana
        const valid = Object.values(data).every((v) => v && v.trim() !== '');
        if (!valid) {
            alert('Mohon lengkapi semua field sebelum menyimpan.');
            return;
        }

        if (typeof this.config.onSave === 'function') {
            this.config.onSave(data);
        } else {
            // default behavior: POST ke API
            fetch(this.config.apiAlamat, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then((r) => r.json())
                .then((res) => alert('Alamat disimpan!'))
                .catch((err) => alert('Gagal menyimpan: ' + err.message));
        }
    }

    // =======================
    // Wilayah Loader
    // =======================
    loadWilayah() {
        $.ajax({
            url: `${this.config.apiWilayah}/provinsi`,
            method: 'GET',
            success: (res) => {
                const $select = $('#selectProvinsi');
                $select
                    .empty()
                    .append('<option value="">Pilih Provinsi</option>');
                res.forEach((p) =>
                    $select.append(`<option value="${p.id}">${p.nama}</option>`)
                );
                $select.prop('disabled', false);
            }
        });

        $('.select2').select2({
            width: '100%',
            placeholder: 'Cari...',
            allowClear: true,
            dropdownParent: $(this.config.rootId)
        });
    }

    // =======================
    // Lokasi GPS
    // =======================
    getMyLocation() {
        this.$spinner.show();
        this.$btnText.text('Mencari...');

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                $('#inputMaps').val(`${lat},${lng}`);

                this.initMap(lat, lng);
                this.$spinner.hide();
                this.$btnText.text('📍 Lokasi Saya');
            },
            (err) => {
                alert('Gagal mendapatkan lokasi: ' + err.message);
                this.$spinner.hide();
                this.$btnText.text('📍 Lokasi Saya');
            }
        );
    }

    // =======================
    // Peta Google
    // =======================
    initMap(lat, lng) {
        const mapEl = document.getElementById(this.config.mapId);
        if (!mapEl) return;

        const center = { lat: parseFloat(lat), lng: parseFloat(lng) };
        if (!this.map) {
            this.map = new google.maps.Map(mapEl, { zoom: 16, center });
            this.marker = new google.maps.Marker({
                position: center,
                map: this.map,
                draggable: true
            });
            this.marker.addListener('dragend', (e) => {
                const newPos = e.latLng;
                $('#inputMaps').val(`${newPos.lat()},${newPos.lng()}`);
            });
        } else {
            this.map.setCenter(center);
            this.marker.setPosition(center);
        }
    }
}

// Export ke global agar bisa diinisialisasi dari HTML
window.AlamatPelanggan = AlamatPelanggan;
