// =======================================================
// konfirmasi.js — Modul reusable untuk konfirmasi servis
// =======================================================

const KonfirmasiModule = (() => {
    // 🧠 Utility function
    const satuanMap = {
        suhu: '°C',
        tekanan: 'PSI',
        ampere: 'Amp'
    };

    const formatToSixDigits = (num) => String(num).padStart(6, '0');

    const renderImageCard = (item, value, satuan) => `
    <div style="background:#fafafa; padding:2px; border-radius:10px; 
                transition:0.3s; box-shadow:0 2px 6px rgba(0,0,0,0.05);">
      <img src="${item.Url}" 
          alt="Foto ${item.Name}" 
          style="width:100%; max-width:130px; height:110px; object-fit:cover; border-radius:8px;">
      <div style="margin-top:10px; font-size:14px; font-weight:500; color:#333;">
          ${item.Name} <br>
          <span style="font-weight:600; color:#007bff;">${value} ${satuan}</span>
      </div>
    </div>
  `;

    // 🔄 Fetch API
    async function fetchApi(
        url,
        method = 'GET',
        data = null,
        before = null,
        after = null
    ) {
        return new Promise((resolve, reject) => {
            callApi({
                url,
                method,
                data,
                success: (res) => resolve(res),
                error: (err) => reject(err),
                onBeforeSend: before,
                onComplete: after
            });
        });
    }

    // ✅ 1. Check apakah user sudah siap konfirmasi
    async function checkKonfirmasiSelesai(userId) {
        return fetchApi(`/api/Transaction/CheckKonfirmSelesai?Id=${userId}`);
    }

    // ✅ 2. Ambil data konfirmasi selesai
    async function getDataKonfirmasiSelesai(id) {
        return fetchApi(
            `/api/Transaction/GetData_KonfirmSelesai?Id=${id}`,
            'GET',
            null,
            () => {
                $('#SebelumServices').html(`
          <div class="p-3 mb-2 border rounded shadow-sm">
              <div class="d-flex align-items-center mb-2">
              <div class="skeleton-icon me-2"></div>
              <div class="skeleton-text w-50"></div>
              </div>
              <div class="skeleton-text w-75 mb-1"></div>
              <div class="skeleton-text w-25"></div>
          </div>
        `);
            }
        );
    }

    // ✅ 3. Update rating setelah order selesai
    async function updateRatingOrderSelesai(data) {
        return fetchApi(
            `/api/Transaction/UpdateRatingOrderSelesai`,
            'PUT',
            data,
            () => {
                $('#btnReview').prop('disabled', true).text('Memproses...');
            },
            () => {
                $('#btnReview').prop('disabled', false).text('Selesai');
            }
        );
    }

    // ✅ 4. Render data ke modal
    function renderModal(res, idTrx) {
        // Render data teknisi
        $('#TeknisiInfo').html(`
      <img src="${res.photo_selfie.url}" alt="Foto Teknisi" class="teknisi-photo mb-2">
      <h6 class="mb-1 fw-bold" id="NamaTeknisi">${res.nama_lengkap}</h6>
      <p class="text-muted small fst-italic">
          “Terima kasih sudah mempercayakan layanan kami. 
          Ulasan Anda sangat berarti untuk semangat dan masa depan teknisi kami.”
      </p>
    `);

        $('#OrderNo').html(`
      <span class="badge bg-light text-primary px-3 py-1 mb-2" style="font-size:0.85rem; border-radius:12px;">
          Order No: <strong>ACD-${formatToSixDigits(idTrx)}</strong>
      </span>
    `);

        // Render daftar foto
        const renderGroup = (title, items, values) => `
      <div style="margin-bottom:20px; padding:1px; border-radius:12px; background:#fff;">
          <h4 style="margin:10px 0 20px 0; font-size:12px; font-weight:600; color:#222; text-align:center;
                     padding-bottom:10px; border-bottom:1px solid #eee;">
              ${title}
          </h4>
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; text-align:center;">
              ${items
                  .map((item) => {
                      const key = item.Name.toLowerCase();
                      const valKey = key.includes('tekanan') ? 'tekanan' : key;
                      const value = values[valKey] ?? '';
                      const satuan = satuanMap[valKey] ?? '';
                      return renderImageCard(item, value, satuan);
                  })
                  .join('')}
          </div>
      </div>
    `;

        $('#SebelumServices').html(
            renderGroup(
                'Pengukuran Sebelum Diservice',
                res.img_pengukuran_awal,
                res.pengukuran_awal
            )
        );
        $('#SaatPengerjaan').html(
            renderGroup(
                'Saat Pengerjaan sesuai Layanan',
                res.img_pengerjaan,
                {}
            )
        );
        $('#SetelahServices').html(
            renderGroup(
                'Pengukuran Setelah Diservice',
                res.img_pengukuran_akhir,
                res.pengukuran_akhir
            )
        );

        // Tombol aksi
        $('#TombolAksi').html(`
      <div class="d-flex flex-row gap-2 py-2">
        <button onclick="KonfirmasiModule.getReviewData(${res.id})"
            id="btnReview"
            class="btn btn-success flex-fill rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2">
            <span>Selesai</span>
        </button>
      </div>
    `);
    }

    // ✅ 5. Inisialisasi utama
    function initKonfirmasi(userId) {
        checkKonfirmasiSelesai(userId)
            .then((res) => {
                if (res) {
                    $('#ModalKonfirmasiSelesai')
                        .attr('data-id', res.id)
                        .modal('show');

                    $('#ModalKonfirmasiSelesai').on(
                        'show.bs.modal',
                        async function (e) {
                            let idTrx =
                                $(this).data('id') ||
                                (e.relatedTarget
                                    ? $(e.relatedTarget).data('id')
                                    : null);
                            const data = await getDataKonfirmasiSelesai(idTrx);
                            renderModal(data, idTrx);
                        }
                    );
                }
            })
            .catch((err) => console.error(err));
    }

    // ✅ 6. Kirim data review
    async function getReviewData(idTrx) {
        const rank = document.querySelector('input[name="star"]:checked');
        const komentar = $('#komentar').val().trim();
        const persetujuan = $('#persetujuan').is(':checked');
        const ratingValue = rank ? parseInt(rank.value) : 0;

        if (ratingValue === 0)
            return showToast('Silakan pilih jumlah bintang terlebih dahulu ⭐');
        if (!komentar) return showToast('Silakan isi komentar Anda ✍️');
        if (!persetujuan)
            return showToast(
                'Silakan centang persetujuan untuk melanjutkan ✅'
            );

        const payload = {
            id: idTrx,
            rating: {
                nilai: ratingValue,
                Komentar: komentar
            }
        };

        try {
            const res = await updateRatingOrderSelesai(payload);
            if (res.success) {
                Swal.fire({
                    icon: 'success',
                    title: '✅ Berhasil!',
                    text: 'Terima kasih, ulasan Anda sudah tersimpan 🙏'
                }).then((r) => r.isConfirmed && location.reload());
            } else {
                Swal.fire(
                    '⚠️ Gagal Menyimpan',
                    'Mohon coba lagi beberapa saat.',
                    'warning'
                );
            }
        } catch (err) {
            Swal.fire(
                '❌ Gagal!',
                err || 'Terjadi kesalahan saat menyimpan data.',
                'error'
            );
        }
    }

    // Public API
    return {
        initKonfirmasi,
        getReviewData
    };
})();

window.KonfirmasiModule = KonfirmasiModule;
