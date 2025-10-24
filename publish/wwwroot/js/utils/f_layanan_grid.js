// ======================================================
// File: layanan.js
// Modul untuk handling data layanan & pesanan
// ======================================================

const f_layanan = (() => {
    // 🧹 Hapus semua data pesanan dari local storage
    function clearStoragePesanan() {
        const keys = [
            'keranjang',
            'jenis_properti',
            'keluhan',
            'JamKunjungan',
            'TanggalKunjungan',
            'Total',
            'Customer',
            'IdPesanan',
            'id_layanan'
        ];

        keys.forEach((k) => Storage.remove(k));
    }

    // 🧭 Pindah ke halaman layanan tertentu
    function goToLayanan(urlAction) {
        global.Storage.remove('DataTrx');
        window.location.href = '/layanan/' + encodeURIComponent(urlAction);
    }

    // 🧰 Ambil daftar layanan dari API dan render ke carousel
    function loadLayanan() {
        global.callApi({
            url: '/api/Layanan/GetLayanan',
            method: 'GET',
            success: function (data) {
                const html = data
                    .map(
                        (item) => `
          <div class="col-3 mb-2">
            <div class="cate-item text-center">
              <a href="javascript:void(0);" 
                 onclick="f_layanan.goToLayanan('${item.url_action}')"
                 class="cate-item text-center">
                <div class="mb-2">
                  <img src="${item.img_layanan}" 
                       class="img-fluid shadow" 
                       style="border-radius:10px 10px;" 
                       loading="lazy" />
                </div>
                <p class="mb-0 medium text-dark">${item.nama_layanan}</p>
              </a>
            </div>
          </div>
        `
                    )
                    .join('');

                $('#layananCarousel').html(html);
                global.lazyAnimateItems('layananCarousel');
            },
            error: function () {
                $('#layananCarousel').html(`
          <p class="text-center text-muted py-4">
            Oops.. coba cek koneksi internet kamu.
          </p>
        `);
            },
            onBeforeSend: function () {
                $('#layananCarousel').html(generateSkeletonHTML());
            },
            onComplete: function () {}
        });
    }

    // 🔲 Tampilan skeleton loading sementara
    function generateSkeletonHTML() {
        const skeletonItem = `
      <div class="col-3">
        <div class="cate-item text-center loading-skeleton">
          <div class="cate-img mb-2 skeleton-circle"></div>
          <p class="mb-0 small fw-semibold text-dark text-truncate skeleton-text"></p>
        </div>
      </div>
    `;
        return skeletonItem.repeat(4);
    }

    // Ekspor fungsi publik
    return {
        clearStoragePesanan,
        loadLayanan,
        goToLayanan
    };
})();

// Jadikan global supaya bisa dipanggil dari HTML
window.f_layanan = f_layanan;
