// =====================================================
// SCRIPT UTAMA
// Sistem Pengendalian Pembelian Salon
// =====================================================


// =====================================================
// 1. DATA SEMENTARA
// =====================================================

let dataBahan = [];
let dataAnggaran = [];
let dataPembelian = [];

let editingBahanId = null;
let editingAnggaranId = null;
let editingPembelianId = null;


// =====================================================
// 2. SAAT HALAMAN DIBUKA
// =====================================================

document.addEventListener("DOMContentLoaded", async function () {

    console.log("Script.js berhasil dijalankan.");

    setTanggalHariIni();
    setupHitungTotalPembelian();

    // Hubungkan submit form
    document.getElementById("form-bahan")
        .addEventListener("submit", simpanBahan);

    document.getElementById("form-anggaran")
        .addEventListener("submit", simpanAnggaran);

    document.getElementById("form-pembelian")
        .addEventListener("submit", simpanPembelian);

    await loadAllData();

    showPage("dashboard");
});


// =====================================================
// 3. LOAD SEMUA DATA
// =====================================================

async function loadAllData() {

    try {

        await loadBahan();
        await loadAnggaran();
        await loadPembelian();

        renderAll();

        console.log("Semua data berhasil dimuat.");

    } catch (error) {

        console.error("Gagal memuat data:", error);

        alert(
            "Data gagal dimuat dari Supabase.\n\n" +
            error.message
        );
    }
}


// =====================================================
// 4. LOAD BAHAN
// =====================================================

async function loadBahan() {

    const { data, error } = await supabaseClient
        .from("bahan")
        .select("*")
        .order("id_bahan", {
            ascending: true
        });

    if (error) {
        throw error;
    }

    dataBahan = data || [];

    console.log("Data bahan:", dataBahan);
}


// =====================================================
// 5. LOAD ANGGARAN
// =====================================================

async function loadAnggaran() {

    const { data, error } = await supabaseClient
        .from("anggaran")
        .select(`
            *,
            bahan (
                nama_bahan,
                satuan
            )
        `)
        .order("periode", {
            ascending: false
        });

    if (error) {
        throw error;
    }

    dataAnggaran = data || [];

    console.log("Data anggaran:", dataAnggaran);
}


// =====================================================
// 6. LOAD PEMBELIAN
// =====================================================

async function loadPembelian() {

    const { data, error } = await supabaseClient
        .from("pembelian")
        .select(`
            *,
            bahan (
                nama_bahan,
                satuan
            )
        `)
        .order("tanggal", {
            ascending: false
        });

    if (error) {
        throw error;
    }

    dataPembelian = data || [];

    console.log("Data pembelian:", dataPembelian);
}


// =====================================================
// 7. RENDER SEMUA
// =====================================================

function renderAll() {

    renderDashboard();
    renderDropdownBahan();
    renderTabelBahan();
    renderTabelAnggaran();
    renderTabelPembelian();
    renderPengendalian();
    renderLaporan();
}


// =====================================================
// 8. NAVIGASI
// =====================================================

function showPage(pageId) {

    document.querySelectorAll(".page").forEach(function (page) {

        page.classList.remove("active-page");

    });


    const selectedPage =
        document.getElementById(pageId);

    if (selectedPage) {

        selectedPage.classList.add("active-page");

    }


    document.querySelectorAll(".menu-item")
        .forEach(function (item) {

            item.classList.remove("active");

        });


    document.querySelectorAll(".menu-item")
        .forEach(function (item) {

            const onclickText =
                item.getAttribute("onclick");

            if (
                onclickText &&
                onclickText.includes(`showPage('${pageId}')`)
            ) {

                item.classList.add("active");

            }

        });


    const titleMap = {

        dashboard: "Dashboard",
        bahan: "Data Bahan",
        anggaran: "Anggaran",
        pembelian: "Pembelian",
        pengendalian: "Pengendalian Anggaran",
        laporan: "Laporan"

    };


    const pageTitle =
        document.getElementById("page-title");

    if (pageTitle) {

        pageTitle.textContent =
            titleMap[pageId] || "Dashboard";

    }
}


// =====================================================
// 9. FORMAT RUPIAH
// =====================================================

function formatRupiah(value) {

    const number = Number(value) || 0;

    return new Intl.NumberFormat("id-ID", {

        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0

    }).format(number);
}


// =====================================================
// 10. FORMAT ANGKA
// =====================================================

function formatNumber(value) {

    const number = Number(value) || 0;

    return new Intl.NumberFormat("id-ID", {

        maximumFractionDigits: 2

    }).format(number);
}


// =====================================================
// 11. FORMAT TANGGAL
// =====================================================

function formatTanggal(dateString) {

    if (!dateString) {

        return "-";

    }

    const date =
        new Date(dateString);

    return date.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


// =====================================================
// 12. FORMAT PERIODE
// =====================================================

function formatPeriode(dateString) {

    if (!dateString) {

        return "-";

    }

    const date =
        new Date(dateString);

    return date.toLocaleDateString(
        "id-ID",
        {
            month: "long",
            year: "numeric"
        }
    );
}


// =====================================================
// 13. KEAMANAN HTML
// =====================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================================
// 14. TANGGAL HARI INI
// =====================================================

function setTanggalHariIni() {

    const input =
        document.getElementById(
            "tanggal-pembelian"
        );

    if (!input) {

        return;

    }

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    input.value =
        `${year}-${month}-${day}`;
}


// =====================================================
// 15. DROPDOWN BAHAN
// =====================================================

function renderDropdownBahan() {

    const dropdownAnggaran =
        document.getElementById(
            "anggaran-bahan"
        );

    const dropdownPembelian =
        document.getElementById(
            "pembelian-bahan"
        );


    if (dropdownAnggaran) {

        dropdownAnggaran.innerHTML =
            `<option value="">Pilih bahan</option>`;

        dataBahan
            .filter(
                bahan =>
                    bahan.status_aktif === true
            )
            .forEach(function (bahan) {

                dropdownAnggaran.innerHTML += `

                    <option value="${bahan.id_bahan}">
                        ${escapeHtml(bahan.nama_bahan)}
                    </option>

                `;

            });

    }


    if (dropdownPembelian) {

        dropdownPembelian.innerHTML =
            `<option value="">Pilih bahan</option>`;

        dataBahan
            .filter(
                bahan =>
                    bahan.status_aktif === true
            )
            .forEach(function (bahan) {

                dropdownPembelian.innerHTML += `

                    <option value="${bahan.id_bahan}">
                        ${escapeHtml(bahan.nama_bahan)}
                    </option>

                `;

            });

    }
}


// =====================================================
// 16. BUKA FORM BAHAN
// =====================================================

function openBahanForm() {

    editingBahanId = null;


    const formContainer =
        document.getElementById(
            "bahan-form"
        );

    const form =
        document.getElementById(
            "form-bahan"
        );


    if (form) {

        form.reset();

    }


    if (formContainer) {

        formContainer.classList.remove("hidden");

    }


    const heading =
        formContainer.querySelector("h3");

    if (heading) {

        heading.textContent =
            "Tambah Bahan";

    }


    const button =
        form.querySelector(
            'button[type="submit"]'
        );

    if (button) {

        button.textContent =
            "Simpan";

    }
}


// =====================================================
// 17. TUTUP FORM BAHAN
// =====================================================

function closeBahanForm() {

    editingBahanId = null;


    const formContainer =
        document.getElementById(
            "bahan-form"
        );

    const form =
        document.getElementById(
            "form-bahan"
        );


    if (form) {

        form.reset();

    }


    if (formContainer) {

        formContainer.classList.add("hidden");

    }
}


// =====================================================
// 18. SIMPAN BAHAN
// =====================================================

async function simpanBahan(event) {

    event.preventDefault();


    const nama =
        document.getElementById(
            "nama-bahan"
        ).value.trim();


    const satuan =
        document.getElementById(
            "satuan-bahan"
        ).value.trim();


    const stokMinimum =
        Number(
            document.getElementById(
                "stok-minimum"
            ).value
        ) || 0;


    if (!nama || !satuan) {

        alert(
            "Nama bahan dan satuan wajib diisi."
        );

        return;

    }


    try {

        let error;


        if (editingBahanId) {

            const result =
                await supabaseClient
                    .from("bahan")
                    .update({

                        nama_bahan: nama,
                        satuan: satuan,
                        stok_minimum: stokMinimum

                    })
                    .eq(
                        "id_bahan",
                        editingBahanId
                    );

            error = result.error;


        } else {

            const result =
                await supabaseClient
                    .from("bahan")
                    .insert([{

                        nama_bahan: nama,
                        satuan: satuan,
                        stok_minimum: stokMinimum,
                        status_aktif: true

                    }]);

            error = result.error;

        }


        if (error) {

            throw error;

        }


        alert(
            editingBahanId
                ? "Data bahan berhasil diperbarui."
                : "Bahan berhasil ditambahkan."
        );


        closeBahanForm();

        await loadAllData();


    } catch (error) {

        console.error(
            "Gagal menyimpan bahan:",
            error
        );


        alert(
            "Bahan gagal disimpan.\n\n" +
            error.message
        );

    }
}


// =====================================================
// 19. EDIT BAHAN
// =====================================================

function editBahan(id) {

    const bahan =
        dataBahan.find(
            item =>
                Number(item.id_bahan) ===
                Number(id)
        );


    if (!bahan) {

        return;

    }


    editingBahanId =
        bahan.id_bahan;


    document.getElementById(
        "nama-bahan"
    ).value =
        bahan.nama_bahan;


    document.getElementById(
        "satuan-bahan"
    ).value =
        bahan.satuan;


    document.getElementById(
        "stok-minimum"
    ).value =
        bahan.stok_minimum;


    const formContainer =
        document.getElementById(
            "bahan-form"
        );

    formContainer.classList.remove(
        "hidden"
    );


    formContainer.querySelector(
        "h3"
    ).textContent =
        "Edit Bahan";


    formContainer.querySelector(
        'button[type="submit"]'
    ).textContent =
        "Update Bahan";


    showPage("bahan");
}


// =====================================================
// 20. HAPUS BAHAN
// =====================================================

async function deleteBahan(id) {

    const bahan =
        dataBahan.find(
            item =>
                Number(item.id_bahan) ===
                Number(id)
        );


    if (!bahan) {

        return;

    }


    const yakin =
        confirm(
            `Hapus bahan "${bahan.nama_bahan}"?`
        );


    if (!yakin) {

        return;

    }


    try {

        const { error } =
            await supabaseClient
                .from("bahan")
                .delete()
                .eq(
                    "id_bahan",
                    id
                );


        if (error) {

            throw error;

        }


        alert(
            "Bahan berhasil dihapus."
        );


        await loadAllData();


    } catch (error) {

        console.error(error);


        alert(
            "Bahan tidak dapat dihapus.\n\n" +
            "Kemungkinan bahan sudah digunakan " +
            "dalam anggaran atau pembelian."
        );

    }
}


// =====================================================
// 21. TABEL BAHAN
// =====================================================

function renderTabelBahan() {

    const tbody =
        document.getElementById(
            "bahan-table"
        );


    if (!tbody) {

        return;

    }


    if (dataBahan.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="6"
                    class="empty-state">

                    Belum ada data bahan.

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        dataBahan.map(
            function (bahan, index) {

                return `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHtml(
                                bahan.nama_bahan
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                bahan.satuan
                            )}
                        </td>

                        <td>
                            ${formatNumber(
                                bahan.stok_minimum
                            )}
                        </td>

                        <td>

                            <span class="status-badge
                                         status-terkendali">

                                Aktif

                            </span>

                        </td>

                        <td>

                            <button
                                class="btn-edit"
                                onclick="editBahan(
                                    ${bahan.id_bahan}
                                )">

                                Edit

                            </button>

                            <button
                                class="btn-delete"
                                onclick="deleteBahan(
                                    ${bahan.id_bahan}
                                )">

                                Hapus

                            </button>

                        </td>

                    </tr>

                `;

            }
        ).join("");
}


// =====================================================
// 22. BUKA FORM ANGGARAN
// =====================================================

function openAnggaranForm() {

    editingAnggaranId = null;


    const container =
        document.getElementById(
            "anggaran-form"
        );

    const form =
        document.getElementById(
            "form-anggaran"
        );


    form.reset();

    container.classList.remove(
        "hidden"
    );


    container.querySelector(
        "h3"
    ).textContent =
        "Tambah Anggaran";


    container.querySelector(
        'button[type="submit"]'
    ).textContent =
        "Simpan";
}


// =====================================================
// 23. TUTUP FORM ANGGARAN
// =====================================================

function closeAnggaranForm() {

    editingAnggaranId = null;


    const container =
        document.getElementById(
            "anggaran-form"
        );


    const form =
        document.getElementById(
            "form-anggaran"
        );


    form.reset();

    container.classList.add(
        "hidden"
    );
}


// =====================================================
// 24. SIMPAN ANGGARAN
// =====================================================

async function simpanAnggaran(event) {

    event.preventDefault();


    const idBahan =
        document.getElementById(
            "anggaran-bahan"
        ).value;


    const periode =
        document.getElementById(
            "periode-anggaran"
        ).value;


    const nominal =
        Number(
            document.getElementById(
                "nominal-anggaran"
            ).value
        ) || 0;


    const keterangan =
        document.getElementById(
            "keterangan-anggaran"
        ).value.trim();


    if (!idBahan || !periode) {

        alert(
            "Bahan dan periode wajib diisi."
        );

        return;

    }


    try {

        // Ubah periode menjadi format PostgreSQL: YYYY-MM-DD
let periodeDate;

if (/^\d{4}-\d{2}$/.test(periode)) {

    // Jika nilai sudah seperti 2026-09
    periodeDate = `${periode}-01`;

} else {

    // Jika nilai seperti September 2026
    const namaBulan = {
        januari: "01",
        februari: "02",
        maret: "03",
        april: "04",
        mei: "05",
        juni: "06",
        juli: "07",
        agustus: "08",
        september: "09",
        oktober: "10",
        november: "11",
        desember: "12"
    };

    const bagian =
        periode
            .toLowerCase()
            .trim()
            .split(/\s+/);

    const bulan = namaBulan[bagian[0]];
    const tahun = bagian[1];

    if (!bulan || !tahun) {

        alert(
            "Format periode tidak dikenali."
        );

        return;

    }

    periodeDate =
        `${tahun}-${bulan}-01`;
}


const data = {

    id_bahan:
        Number(idBahan),

    periode:
        periodeDate,

    nominal_anggaran:
        nominal,

    keterangan:
        keterangan || null

};


        let error;


        if (editingAnggaranId) {

            const result =
                await supabaseClient
                    .from("anggaran")
                    .update(data)
                    .eq(
                        "id_anggaran",
                        editingAnggaranId
                    );

            error = result.error;


        } else {

            const result =
                await supabaseClient
                    .from("anggaran")
                    .insert([data]);

            error = result.error;

        }


        if (error) {

            throw error;

        }


        alert(
            editingAnggaranId
                ? "Anggaran berhasil diperbarui."
                : "Anggaran berhasil ditambahkan."
        );


        closeAnggaranForm();

        await loadAllData();


    } catch (error) {

        console.error(error);


        if (error.code === "23505") {

            alert(
                "Anggaran untuk bahan dan periode tersebut sudah ada."
            );

        } else {

            alert(
                "Anggaran gagal disimpan.\n\n" +
                error.message
            );

        }

    }
}


// =====================================================
// 25. EDIT ANGGARAN
// =====================================================

function editAnggaran(id) {

    const anggaran =
        dataAnggaran.find(
            item =>
                Number(item.id_anggaran) ===
                Number(id)
        );


    if (!anggaran) {

        return;

    }


    editingAnggaranId =
        anggaran.id_anggaran;


    document.getElementById(
        "anggaran-bahan"
    ).value =
        anggaran.id_bahan;


    document.getElementById(
        "periode-anggaran"
    ).value =
        String(
            anggaran.periode
        ).substring(0, 7);


    document.getElementById(
        "nominal-anggaran"
    ).value =
        anggaran.nominal_anggaran;


    document.getElementById(
        "keterangan-anggaran"
    ).value =
        anggaran.keterangan || "";


    const container =
        document.getElementById(
            "anggaran-form"
        );


    container.classList.remove(
        "hidden"
    );


    container.querySelector(
        "h3"
    ).textContent =
        "Edit Anggaran";


    container.querySelector(
        'button[type="submit"]'
    ).textContent =
        "Update Anggaran";


    showPage("anggaran");
}


// =====================================================
// 26. HAPUS ANGGARAN
// =====================================================

async function deleteAnggaran(id) {

    if (
        !confirm(
            "Hapus data anggaran ini?"
        )
    ) {

        return;

    }


    try {

        const { error } =
            await supabaseClient
                .from("anggaran")
                .delete()
                .eq(
                    "id_anggaran",
                    id
                );


        if (error) {

            throw error;

        }


        alert(
            "Anggaran berhasil dihapus."
        );


        await loadAllData();


    } catch (error) {

        console.error(error);


        alert(
            "Anggaran gagal dihapus.\n\n" +
            error.message
        );

    }
}


// =====================================================
// 27. TABEL ANGGARAN
// =====================================================

function renderTabelAnggaran() {

    const tbody =
        document.getElementById(
            "anggaran-table"
        );


    if (!tbody) {

        return;

    }


    if (dataAnggaran.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="6"
                    class="empty-state">

                    Belum ada data anggaran.

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        dataAnggaran.map(
            function (item, index) {

                return `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.bahan?.nama_bahan || "-"
                            )}
                        </td>

                        <td>
                            ${formatPeriode(
                                item.periode
                            )}
                        </td>

                        <td>
                            ${formatRupiah(
                                item.nominal_anggaran
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.keterangan || "-"
                            )}
                        </td>

                        <td>

                            <button
                                class="btn-edit"
                                onclick="editAnggaran(
                                    ${item.id_anggaran}
                                )">

                                Edit

                            </button>

                            <button
                                class="btn-delete"
                                onclick="deleteAnggaran(
                                    ${item.id_anggaran}
                                )">

                                Hapus

                            </button>

                        </td>

                    </tr>

                `;

            }
        ).join("");
}


// =====================================================
// 28. HITUNG TOTAL PEMBELIAN
// =====================================================

function setupHitungTotalPembelian() {

    const qty =
        document.getElementById(
            "qty-pembelian"
        );


    const harga =
        document.getElementById(
            "harga-satuan"
        );


    const total =
        document.getElementById(
            "total-pembelian"
        );


    if (!qty || !harga || !total) {

        return;

    }


    function hitung() {

        const jumlah =
            Number(qty.value) || 0;


        const hargaSatuan =
            Number(harga.value) || 0;


        total.value =
            formatRupiah(
                jumlah * hargaSatuan
            );

    }


    qty.addEventListener(
        "input",
        hitung
    );


    harga.addEventListener(
        "input",
        hitung
    );
}


// =====================================================
// 29. BUKA FORM PEMBELIAN
// =====================================================

function openPembelianForm() {

    editingPembelianId = null;


    const container =
        document.getElementById(
            "pembelian-form"
        );


    const form =
        document.getElementById(
            "form-pembelian"
        );


    form.reset();


    container.classList.remove(
        "hidden"
    );


    setTanggalHariIni();


    document.getElementById(
        "total-pembelian"
    ).value =
        formatRupiah(0);


    container.querySelector(
        "h3"
    ).textContent =
        "Tambah Pembelian";


    container.querySelector(
        'button[type="submit"]'
    ).textContent =
        "Simpan Pembelian";
}


// =====================================================
// 30. TUTUP FORM PEMBELIAN
// =====================================================

function closePembelianForm() {

    editingPembelianId = null;


    const container =
        document.getElementById(
            "pembelian-form"
        );


    const form =
        document.getElementById(
            "form-pembelian"
        );


    form.reset();


    container.classList.add(
        "hidden"
    );


    setTanggalHariIni();


    document.getElementById(
        "total-pembelian"
    ).value =
        formatRupiah(0);
}


// =====================================================
// 31. SIMPAN PEMBELIAN
// =====================================================

async function simpanPembelian(event) {

    event.preventDefault();


    const idBahan =
        document.getElementById(
            "pembelian-bahan"
        ).value;


    const tanggal =
        document.getElementById(
            "tanggal-pembelian"
        ).value;


    const supplier =
        document.getElementById(
            "supplier"
        ).value.trim();


    const qty =
        Number(
            document.getElementById(
                "qty-pembelian"
            ).value
        );


    const hargaSatuan =
        Number(
            document.getElementById(
                "harga-satuan"
            ).value
        );


    const keterangan =
        document.getElementById(
            "keterangan-pembelian"
        ).value.trim();


    if (!idBahan || !tanggal) {

        alert(
            "Bahan dan tanggal wajib diisi."
        );

        return;

    }


    if (!qty || qty <= 0) {

        alert(
            "Qty harus lebih dari 0."
        );

        return;

    }


    if (
        isNaN(hargaSatuan) ||
        hargaSatuan < 0
    ) {

        alert(
            "Harga satuan tidak valid."
        );

        return;

    }


    try {

        const data = {

            id_bahan:
                Number(idBahan),

            tanggal:
                tanggal,

            supplier:
                supplier || null,

            qty:
                qty,

            harga_satuan:
                hargaSatuan,

            keterangan:
                keterangan || null

        };


        let error;


        if (editingPembelianId) {

            const result =
                await supabaseClient
                    .from("pembelian")
                    .update(data)
                    .eq(
                        "id_pembelian",
                        editingPembelianId
                    );

            error = result.error;


        } else {

            const result =
                await supabaseClient
                    .from("pembelian")
                    .insert([data]);

            error = result.error;

        }


        if (error) {

            throw error;

        }


        alert(
            editingPembelianId
                ? "Pembelian berhasil diperbarui."
                : "Pembelian berhasil disimpan."
        );


        closePembelianForm();

        await loadAllData();


    } catch (error) {

        console.error(error);


        alert(
            "Pembelian gagal disimpan.\n\n" +
            error.message
        );

    }
}


// =====================================================
// 32. EDIT PEMBELIAN
// =====================================================

function editPembelian(id) {

    const pembelian =
        dataPembelian.find(
            item =>
                Number(item.id_pembelian) ===
                Number(id)
        );


    if (!pembelian) {

        return;

    }


    editingPembelianId =
        pembelian.id_pembelian;


    document.getElementById(
        "pembelian-bahan"
    ).value =
        pembelian.id_bahan;


    document.getElementById(
        "tanggal-pembelian"
    ).value =
        pembelian.tanggal;


    document.getElementById(
        "supplier"
    ).value =
        pembelian.supplier || "";


    document.getElementById(
        "qty-pembelian"
    ).value =
        pembelian.qty;


    document.getElementById(
        "harga-satuan"
    ).value =
        pembelian.harga_satuan;


    document.getElementById(
        "keterangan-pembelian"
    ).value =
        pembelian.keterangan || "";


    document.getElementById(
        "total-pembelian"
    ).value =
        formatRupiah(
            pembelian.total_harga
        );


    const container =
        document.getElementById(
            "pembelian-form"
        );


    container.classList.remove(
        "hidden"
    );


    container.querySelector(
        "h3"
    ).textContent =
        "Edit Pembelian";


    container.querySelector(
        'button[type="submit"]'
    ).textContent =
        "Update Pembelian";


    showPage("pembelian");
}


// =====================================================
// 33. HAPUS PEMBELIAN
// =====================================================

async function deletePembelian(id) {

    if (
        !confirm(
            "Hapus data pembelian ini?"
        )
    ) {

        return;

    }


    try {

        const { error } =
            await supabaseClient
                .from("pembelian")
                .delete()
                .eq(
                    "id_pembelian",
                    id
                );


        if (error) {

            throw error;

        }


        alert(
            "Pembelian berhasil dihapus."
        );


        await loadAllData();


    } catch (error) {

        console.error(error);


        alert(
            "Pembelian gagal dihapus.\n\n" +
            error.message
        );

    }
}


// =====================================================
// 34. TABEL PEMBELIAN
// =====================================================

function renderTabelPembelian() {

    const tbody =
        document.getElementById(
            "pembelian-table"
        );


    if (!tbody) {

        return;

    }


    if (dataPembelian.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="8"
                    class="empty-state">

                    Belum ada transaksi pembelian.

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        dataPembelian.map(
            function (item, index) {

                return `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${formatTanggal(
                                item.tanggal
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.bahan?.nama_bahan || "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.supplier || "-"
                            )}
                        </td>

                        <td>
                            ${formatNumber(
                                item.qty
                            )}
                        </td>

                        <td>
                            ${formatRupiah(
                                item.harga_satuan
                            )}
                        </td>

                        <td>
                            ${formatRupiah(
                                item.total_harga
                            )}
                        </td>

                        <td>

                            <button
                                class="btn-edit"
                                onclick="editPembelian(
                                    ${item.id_pembelian}
                                )">

                                Edit

                            </button>

                            <button
                                class="btn-delete"
                                onclick="deletePembelian(
                                    ${item.id_pembelian}
                                )">

                                Hapus

                            </button>

                        </td>

                    </tr>

                `;

            }
        ).join("");
}


// =====================================================
// 35. HITUNG REALISASI
// =====================================================

function hitungRealisasi(
    idBahan,
    periode
) {

    if (!periode) {

        return 0;

    }


    const startDate =
        new Date(
            `${periode}T00:00:00`
        );


    const endDate =
        new Date(startDate);


    endDate.setMonth(
        endDate.getMonth() + 1
    );


    return dataPembelian
        .filter(function (item) {

            if (
                Number(item.id_bahan) !==
                Number(idBahan)
            ) {

                return false;

            }


            const tanggal =
                new Date(
                    `${item.tanggal}T00:00:00`
                );


            return (
                tanggal >= startDate &&
                tanggal < endDate
            );

        })
        .reduce(
            function (total, item) {

                return total +
                    (
                        Number(
                            item.total_harga
                        ) || 0
                    );

            },
            0
        );
}


// =====================================================
// 36. STATUS PENGENDALIAN
// =====================================================

function tentukanStatus(
    persentase
) {

    if (persentase <= 90) {

        return {
            label: "Terkendali",
            className: "status-terkendali"
        };

    }


    if (persentase <= 100) {

        return {
            label: "Mendekati Batas",
            className: "status-mendekati"
        };

    }


    return {
        label: "Melebihi Anggaran",
        className: "status-melebihi"
    };
}


// =====================================================
// 37. DATA PENGENDALIAN
// =====================================================

function getDataPengendalian() {

    return dataAnggaran.map(
        function (item) {

            const anggaran =
                Number(
                    item.nominal_anggaran
                ) || 0;


            const realisasi =
                hitungRealisasi(
                    item.id_bahan,
                    item.periode
                );


            const selisih =
                anggaran - realisasi;


            let persentase = 0;


            if (anggaran > 0) {

                persentase =
                    (
                        realisasi /
                        anggaran
                    ) * 100;

            } else if (realisasi > 0) {

                persentase = 101;

            }


            return {

                id_anggaran:
                    item.id_anggaran,

                id_bahan:
                    item.id_bahan,

                nama_bahan:
                    item.bahan?.nama_bahan || "-",

                periode:
                    item.periode,

                anggaran:
                    anggaran,

                realisasi:
                    realisasi,

                selisih:
                    selisih,

                persentase:
                    persentase,

                status:
                    tentukanStatus(
                        persentase
                    )

            };

        }
    );
}


// =====================================================
// 38. RENDER PENGENDALIAN
// =====================================================

function renderPengendalian() {

    const tbody =
        document.getElementById(
            "pengendalian-table"
        );


    if (!tbody) {

        return;

    }


    const data =
        getDataPengendalian();


    if (data.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="7"
                    class="empty-state">

                    Belum ada data pengendalian.

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        data.map(
            function (item, index) {

                return `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.nama_bahan
                            )}
                        </td>

                        <td>
                            ${formatRupiah(
                                item.anggaran
                            )}
                        </td>

                        <td>
                            ${formatRupiah(
                                item.realisasi
                            )}
                        </td>

                        <td>
                            ${formatRupiah(
                                item.selisih
                            )}
                        </td>

                        <td>
                            ${item.persentase.toFixed(1)}%
                        </td>

                        <td>

                            <span class="status-badge
                                ${item.status.className}">

                                ${item.status.label}

                            </span>

                        </td>

                    </tr>

                `;

            }
        ).join("");
}


// =====================================================
// 39. DASHBOARD
// =====================================================

function renderDashboard() {

    const totalBahan =
        dataBahan.filter(
            item =>
                item.status_aktif === true
        ).length;


    const totalAnggaran =
        dataAnggaran.reduce(
            function (total, item) {

                return total +
                    (
                        Number(
                            item.nominal_anggaran
                        ) || 0
                    );

            },
            0
        );


    const totalRealisasi =
        dataPembelian.reduce(
            function (total, item) {

                return total +
                    (
                        Number(
                            item.total_harga
                        ) || 0
                    );

            },
            0
        );


    const sisa =
        totalAnggaran -
        totalRealisasi;


    document.getElementById(
        "total-bahan"
    ).textContent =
        formatNumber(totalBahan);


    document.getElementById(
        "total-anggaran"
    ).textContent =
        formatRupiah(totalAnggaran);


    document.getElementById(
        "total-realisasi"
    ).textContent =
        formatRupiah(totalRealisasi);


    document.getElementById(
        "sisa-anggaran"
    ).textContent =
        formatRupiah(sisa);


    renderDashboardTable();
}


// =====================================================
// 40. TABEL DASHBOARD
// =====================================================

function renderDashboardTable() {

    const tbody =
        document.getElementById(
            "dashboard-table"
        );


    if (!tbody) {

        return;

    }


    const data =
        getDataPengendalian();


    if (data.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="7"
                    class="empty-state">

                    Belum ada data pengendalian.

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        data.map(
            function (item, index) {

                return `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.nama_bahan
                            )}
                        </td>

                        <td>
                            ${formatRupiah(
                                item.anggaran
                            )}
                        </td>

                        <td>
                            ${formatRupiah(
                                item.realisasi
                            )}
                        </td>

                        <td>
                            ${formatRupiah(
                                item.selisih
                            )}
                        </td>

                        <td>
                            ${item.persentase.toFixed(1)}%
                        </td>

                        <td>

                            <span class="status-badge
                                ${item.status.className}">

                                ${item.status.label}

                            </span>

                        </td>

                    </tr>

                `;

            }
        ).join("");
}


// =====================================================
// 41. LAPORAN
// =====================================================

// =====================================================
// 41. LAPORAN
// =====================================================

function renderLaporan() {

    const section = document.getElementById("laporan");

    section.innerHTML = `

        <div class="page-header">

            <div>
                <h2>Laporan</h2>

                <p>
                    Ringkasan pembelian dan pengendalian anggaran.
                </p>
            </div>

        </div>


        <div class="report-grid">


            <!-- LAPORAN PEMBELIAN -->

            <div class="content-card report-card">

                <div class="report-icon pink-icon">
                    P
                </div>

                <div>

                    <h3>Laporan Pembelian</h3>

                    <p>
                        Rekap transaksi pembelian bahan habis pakai.
                    </p>

                    <button
                        type="button"
                        class="secondary-button"
                        onclick="tampilkanLaporanPembelian()">

                        Lihat Laporan

                    </button>

                </div>

            </div>


            <!-- LAPORAN ANGGARAN -->

            <div class="content-card report-card">

                <div class="report-icon purple-icon">
                    A
                </div>

                <div>

                    <h3>Laporan Anggaran</h3>

                    <p>
                        Rekap anggaran dan realisasi pembelian.
                    </p>

                    <button
                        type="button"
                        class="secondary-button"
                        onclick="tampilkanLaporanAnggaran()">

                        Lihat Laporan

                    </button>

                </div>

            </div>


        </div>

    `;
}


// =====================================================
// LAPORAN PEMBELIAN
// =====================================================

function tampilkanLaporanPembelian() {

    const section =
        document.getElementById("laporan");


    let html = "";


    if (!dataPembelian || dataPembelian.length === 0) {

        html = `

            <div class="content-card">

                <p class="empty-state">
                    Belum ada data pembelian.
                </p>

            </div>

        `;

    } else {

        html = `

            <div class="content-card">

                <div class="table-wrapper">

                    <table>

                        <thead>

                            <tr>

                                <th>No</th>
                                <th>Tanggal</th>
                                <th>Bahan</th>
                                <th>Supplier</th>
                                <th>Qty</th>
                                <th>Harga Satuan</th>
                                <th>Total</th>

                            </tr>

                        </thead>


                        <tbody>

        `;


        dataPembelian.forEach(function(item, index) {

            html += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${formatTanggal(item.tanggal)}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.bahan?.nama_bahan || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.supplier || "-"
                        )}
                    </td>

                    <td>
                        ${item.qty}
                    </td>

                    <td>
                        ${formatRupiah(
                            item.harga_satuan
                        )}
                    </td>

                    <td>
                        ${formatRupiah(
                            item.total_harga
                        )}
                    </td>

                </tr>

            `;

        });


        html += `

                        </tbody>

                    </table>

                </div>

            </div>

        `;

    }


    section.innerHTML = `

        <div class="page-header">

            <div>

                <h2>Laporan Pembelian</h2>

                <p>
                    Rekap transaksi pembelian bahan habis pakai.
                </p>

            </div>

        </div>


        ${html}


        <br>


        <button
            type="button"
            class="primary-button"
            onclick="renderLaporan()">

            Kembali ke Laporan

        </button>

    `;
}


// =====================================================
// LAPORAN ANGGARAN
// =====================================================

function tampilkanLaporanAnggaran() {

    const section =
        document.getElementById("laporan");


    const data =
        getDataPengendalian();


    let html = "";


    if (!data || data.length === 0) {

        html = `

            <div class="content-card">

                <p class="empty-state">
                    Belum ada data anggaran.
                </p>

            </div>

        `;

    } else {

        html = `

            <div class="content-card">

                <div class="table-wrapper">

                    <table>

                        <thead>

                            <tr>

                                <th>No</th>
                                <th>Bahan</th>
                                <th>Periode</th>
                                <th>Anggaran</th>
                                <th>Realisasi</th>
                                <th>Selisih</th>
                                <th>% Realisasi</th>
                                <th>Status</th>

                            </tr>

                        </thead>


                        <tbody>

        `;


        data.forEach(function(item, index) {

            html += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.nama_bahan || "-"
                        )}
                    </td>

                    <td>
                        ${formatPeriode(
                            item.periode
                        )}
                    </td>

                    <td>
                        ${formatRupiah(
                            item.anggaran
                        )}
                    </td>

                    <td>
                        ${formatRupiah(
                            item.realisasi
                        )}
                    </td>

                    <td>
                        ${formatRupiah(
                            item.selisih
                        )}
                    </td>

                    <td>
                        ${Number(
                            item.persentase || 0
                        ).toFixed(1)}%
                    </td>

                    <td>

                        <span class="status-badge ${item.status.className}">

                            ${item.status.label}

                        </span>

                    </td>

                </tr>

            `;

        });


        html += `

                        </tbody>

                    </table>

                </div>

            </div>

        `;

    }


    section.innerHTML = `

        <div class="page-header">

            <div>

                <h2>Laporan Anggaran</h2>

                <p>
                    Rekap anggaran dan realisasi pembelian.
                </p>

            </div>

        </div>


        ${html}


        <br>


        <button
            type="button"
            class="primary-button"
            onclick="renderLaporan()">

            Kembali ke Laporan

        </button>

    `;
}


// =====================================================
// 42. FUNGSI GLOBAL
// =====================================================

window.showPage =
    showPage;

window.openBahanForm =
    openBahanForm;

window.closeBahanForm =
    closeBahanForm;

window.editBahan =
    editBahan;

window.deleteBahan =
    deleteBahan;

window.openAnggaranForm =
    openAnggaranForm;

window.closeAnggaranForm =
    closeAnggaranForm;

window.editAnggaran =
    editAnggaran;

window.deleteAnggaran =
    deleteAnggaran;

window.openPembelianForm =
    openPembelianForm;

window.closePembelianForm =
    closePembelianForm;

window.editPembelian =
    editPembelian;

window.deletePembelian =
    deletePembelian;

window.renderLaporan =
    renderLaporan;

window.tampilkanLaporanPembelian =
    tampilkanLaporanPembelian;

window.tampilkanLaporanAnggaran =
    tampilkanLaporanAnggaran;