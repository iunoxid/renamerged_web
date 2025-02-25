const socket = io.connect('https://www.mikhailovna.com', { transports: ['websocket', 'polling'] });

const progressBar = document.getElementById('progressBar');
const logBox = document.getElementById('logBox');
const downloadLink = document.getElementById('downloadLink');
const uploadButton = document.getElementById('uploadButton');
const fileInput = document.getElementById('fileInput');
const dropzone = document.getElementById('dropzone');
const estimatedTime = document.getElementById('estimatedTime');
const themeToggle = document.getElementById('themeToggle');

// ✅ Pastikan dropzone hanya memiliki satu teks
dropzone.innerHTML = "";
const dropzoneText = document.createElement("p");
dropzoneText.innerHTML = "📁 <b>Drag & Drop file ZIP di sini atau klik untuk memilih</b>";
dropzone.appendChild(dropzoneText);

// ✅ Batasi jenis file yang bisa dipilih di file manager
fileInput.setAttribute("accept", ".zip,.rar,.7z");

// 📂 Saat klik dropzone, hanya buka file picker **SEKALI**
let filePickerOpened = false;
dropzone.addEventListener("click", (event) => {
    event.preventDefault();
    if (!filePickerOpened) {
        filePickerOpened = true;
        fileInput.click();
        setTimeout(() => { filePickerOpened = false; }, 500); // Reset setelah 0.5 detik
    }
});

// 📂 Saat file dipilih dari file manager
fileInput.addEventListener("change", (event) => {
    handleFileSelect(event.target.files);
});

// 📂 Saat file di-drag masuk
dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("dragging");
});

// 📂 Saat file keluar dari dropzone
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragging"));

// 📂 Saat file di-drop
dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragging");
    handleFileSelect(event.dataTransfer.files);
});

// ✅ Fungsi menangani file yang dipilih
function handleFileSelect(files) {
    if (files.length > 0) {
        const fileName = files[0].name;
        dropzoneText.innerHTML = `📄 <b>${fileName}</b>`;
        dropzone.classList.add("file-selected");
        fileInput.files = files;
    }
}

// 🚀 Upload File
uploadButton.addEventListener('click', async (event) => {
    event.preventDefault();
    if (uploadButton.disabled) return;

    uploadButton.disabled = true;
    uploadButton.innerHTML = "⏳ Memproses...";
    uploadButton.classList.add('processing');

    const file = fileInput.files[0];
    if (!file) {
        alert("Pilih file terlebih dahulu!");
        resetUploadButton();
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    progressBar.style.width = '0%';
    logBox.innerHTML = "";
    downloadLink.style.display = 'none';
    estimatedTime.innerText = "Estimasi selesai: -";

    socket.disconnect();
    setTimeout(() => socket.connect(), 500);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (result.download_url) {
            downloadLink.href = result.download_url;
            downloadLink.style.display = 'block';
        }
    } catch (error) {
        console.error("❌ Upload gagal:", error);
        logBox.innerHTML += `<p style="color: red;">❌ Upload gagal!</p>`;
    }

    resetUploadButton();
});

// 🔄 Reset Upload Button
function resetUploadButton() {
    uploadButton.innerHTML = "🚀 Upload & Proses";
    uploadButton.classList.remove('processing');
    uploadButton.disabled = false;
}

// ⏳ Estimasi Waktu Pemrosesan
let startTime;
socket.on("progress", function (data) {
    if (data.percent === 1) startTime = Date.now();

    let elapsedTime = (Date.now() - startTime) / 1000;
    let estimatedTotalTime = data.percent > 0 ? (elapsedTime / data.percent) * 100 : 0;
    let remainingTime = Math.max(0, Math.round(estimatedTotalTime - elapsedTime));

    estimatedTime.innerText = `Estimasi selesai: ${isNaN(remainingTime) ? "-" : remainingTime + " detik"}`;
    progressBar.style.width = data.percent + '%';
});

// 🔍 Tangkap Log dari Server dengan Cegah Duplikasi
socket.on("progress", function (data) {
    if (data.percent === 1) startTime = Date.now();

    let elapsedTime = (Date.now() - startTime) / 1000;
    let estimatedTotalTime = data.percent > 0 ? (elapsedTime / data.percent) * 100 : 0;
    let remainingTime = Math.max(0, Math.round(estimatedTotalTime - elapsedTime));

    estimatedTime.innerText = `Estimasi selesai: ${isNaN(remainingTime) ? "-" : remainingTime + " detik"}`;
    progressBar.style.width = data.percent + '%';
});

// 🔍 Tangkap Log dari Server dengan Cegah Duplikasi
socket.on('log', function (data) {
    const logBox = document.getElementById('logBox');

    if (!logBox) {
        console.error("❌ Log Box tidak ditemukan di halaman!");
        return;
    }

    if (!logBox.innerHTML.includes(data.message)) {
        const logEntry = document.createElement('p');
        logEntry.innerText = data.message;
        logBox.appendChild(logEntry);
        logBox.scrollTop = logBox.scrollHeight; // Auto-scroll ke log terbaru
    }
});

// 🌙 Toggle Dark Mode
themeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
});

// 🔄 Simpan preferensi mode gelap
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        themeToggle.checked = true;
    }
});
