let currentStep = 1;
let IdUser;

let IdTrx = 0;
let kategoriLayanan = 'PERBAIKAN AC';
let RegAtauMember = 'REG';
let TotalHargaAkhir = 0;
let cartReguler = [];
let cartMember = [];

let paketMember = {};

let KunjunganReg = {};
let KunjunganMember = [];

let JenisProperti = {};

let kontakPelanggan = {};
let AlamatPelanggan = {};
let keluhanPerbaikan = [];
var $;

document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.jQuery === 'undefined') {
        console.error('jQuery is not loaded.');
        return;
    }
    $ = window.jQuery;
    eventstep_btn();
    showStep(currentStep);
    var user = getUserInfo();
    if (!isValidUser(user)) {
        $('#TitleModalLogin').text('Silahkan login terlebih dahulu');
        $('#btnClsModalLogin').show();
        $('#ModalLogin').modal('show');
        return false;
    } else {
        IdUser = user.id;
        setDataTrx();
        loadAlamat();
        LoadDataKontak();
    }
});

function setDataTrx() {
    var DataTrx = Storage.get('DataTrx');
    console.log(DataTrx);
    if (!isEmptyObject(DataTrx) && DataTrx != null) {
        console.log(DataTrx);
        kontakPelanggan = DataTrx.kontakPelanggan;
        AlamatPelanggan = DataTrx.alamatPelanggan;
        cartReguler = DataTrx.cartItem.Reguler;
        KunjunganReg = DataTrx.kunjungan.Reguler;
        KunjunganMember = DataTrx.kunjungan.Member;
        JenisProperti = DataTrx.jenisProperti;
        IdTrx = DataTrx.id;
        TotalHargaAkhir = DataTrx.totalTransaksi;
        paketMember = DataTrx.paketMember;
        RegAtauMember = DataTrx.jenisLayanan;
    }
}

function showStep(step) {
    document.querySelectorAll('.wizard-content').forEach((el) => {
        el.classList.toggle('d-none', el.dataset.step != step);
    });

    document.querySelectorAll('.wizard-step').forEach((el) => {
        el.classList.remove('active', 'completed');
        const stepNum = parseInt(el.dataset.step);
        if (stepNum < step) {
            el.classList.add('completed');
        } else if (stepNum === step) {
            el.classList.add('active');
        }
    });
}

function eventstep_btn() {
    document.querySelectorAll('.next-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (validasiStep(currentStep)) {
                if (currentStep < 6) {
                    currentStep++;
                    showStep(currentStep);
                }
            }
        });
    });

    document.querySelectorAll('.prev-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                showStep(currentStep);
            }
        });
    });
}

function validasiStep(step) {
    if (step === 1) {
        if (isEmptyObject(kontakPelanggan)) {
            showToast('Silahkan pilih kontak yang akan dihubungi teknisi');
            return false;
        }
        if (isEmptyObject(AlamatPelanggan)) {
            showToast('Silahkan pilih Alamat yang akan dikunjungi teknisi');
            return false;
        }
    } else if (step === 2) {
        if (keluhanPerbaikan.length == 0) {
            showToast('Silahkan pilih keluhan');
            return false;
        }
    } else if (step === 3) {
        if (isEmptyObject(BiayaSurvey)) {
            showToast('Silahkan ceklist setuju jika ingin melanjutkan');
            return false;
        }
    } else if (step === 4) {
        var tanggalLayanan = $('#tanggalLayanan').val();
        var jamLayanan = $('#jamLayanan').val();
        if (tanggalLayanan == '' || jamLayanan == '') {
            showToast('Silahkan isi jadwal kunjungan');
            return false;
        }

        Kunjungan = {
            tanggal: tanggalLayanan,
            jam: jamLayanan
        };
    } else if (step === 5) {
        if (isEmptyObject(JenisProperti)) {
            showToast('Silakan pilih properti terlebih dahulu.');
            return false;
        }

        $('#listTransaksi').html('');
        renderDataTransaksi(getDataAll());
    }
    return true;
}

function gotoBack() {
    window.location.href = '/';
}

function getDataAll() {
    setCartReg(BiayaSurvey);
    var alldata = {
        id: 0,
        createByIdUser: IdUser,
        kategoriLayanan: 'PERBAIKAN AC',
        jenisLayanan: 'REG',
        totalTransaksi: BiayaSurvey.harga,
        status: 0,
        statusDeskripsi: 'DRAFT',
        jenisProperti: JenisProperti,
        kontakPelanggan: kontakPelanggan,
        alamatPelanggan: AlamatPelanggan,
        kunjungan: {
            Reguler: Kunjungan,
            Member: {}
        },
        cartItem: {
            Reguler: cartReguler,
            Member: {}
        },
        paketMember: {},
        keluhanPerbaikan: keluhanPerbaikan
    };
    return alldata;
}

function renderDataTransaksi(data) {
    let Total = 0;
    var scr = `
                <div class="fw-bold text-prima">Kunjungan Layanan Reguler</div>
                <small class="text-muted">pada tanggal ${data.kunjungan.Reguler.tanggal} jam ${data.kunjungan.Reguler.jam}</small>
            `;
    $('#listTransaksi').append(scr);

    $.map(data.cartItem.Reguler, function (item) {
        var scr = `
                    <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                        <div>
                            <div class="fw-bold">${item.nama}</div>
                            <small class="text-muted">${formatRupiah(
                                item.after_diskon
                            )} x ${item.qty}</small>
                        </div>
                        <div class="fw-bold">${formatRupiah(
                            item.after_diskon * item.qty
                        )}</div>
                    </div>
                `;
        $('#listTransaksi').append(scr);

        Total = Total + item.after_diskon * item.qty;
    });
    $('#listTransaksi').append(`
                <div class="d-flex justify-content-between align-items-center mt-30">
                    <div>      
                        <div class="fw-bold">Sub Total</div>
                    </div>
                    <div class="fw-bold">${formatRupiah(Total)}</div>
                </div>
            `);
    var scr = `
                <div class="d-flex justify-content-between align-items-center border-bottom">
                    <div>
                        <div class="fw-bold">Biaya properti : ${
                            data.jenisProperti.nama_jenis
                        }</div>
                    </div>
                    <div class="fw-bold">${formatRupiah(
                        data.jenisProperti.harga
                    )}</div>
                </div>
            `;
    $('#listTransaksi').append(scr);
    Total = Total + data.jenisProperti.harga;
    $('#totalTransaksi').text(formatRupiah(Total));
}

function setCartReg(data) {
    let existingItem = cartReguler.find((item) => item.nama === data.nama);
    if (existingItem) {
        if (data.qty == 0) {
            let index = cartReguler.findIndex(
                (item) => item.nama === data.nama
            );
            if (index !== -1) {
                cartReguler.splice(index, 1);
            }
        } else {
            existingItem.qty = data.qty;
            existingItem.harga = data.harga;
            existingItem.diskon = data.diskon;
            existingItem.after_diskon = data.after_diskon;
            existingItem.sub_total = data.subtotal;
        }
    } else {
        cartReguler.push({
            id: data.id,
            nama: data.nama,
            harga: data.harga,
            diskon: data.diskon,
            after_diskon: data.after_diskon,
            qty: data.qty,
            sub_total: data.subtotal
        });
    }
}

function SimpanDulu() {
    callApi({
        url: '/api/Transaction/SimpanDulu',
        method: 'POST',
        data: getDataAll(),
        success: function (res) {
            Swal.fire({
                title: '<strong>🎉 Berhasil Disimpan!</strong>',
                html: 'Pesananmu telah ditambahkan ke keranjang.<br><small>Kamu akan diarahkan ke halaman <b>Keranjang Pesanan</b>.</small>',
                icon: 'success',
                showConfirmButton: true,
                confirmButtonText: 'Lihat Keranjang',
                customClass: {
                    popup: 'rounded-4 shadow-lg',
                    title: 'fw-bold text-success',
                    confirmButton: 'btn btn-primary px-4 py-2 rounded-pill'
                },
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                }
            }).then(() => {
                window.location.href = '/Cart';
            });
        },
        error: function (err) {
            alert('Gagal: ' + err);
        },
        onBeforeSend: function () {
            $('#btn_simpandulu').prop('disabled', true).text('Memproses...');
        },
        onComplete: function () {
            $('#btn_simpandulu').prop('disabled', false).text('Simpan Dulu');
        }
    });
}
