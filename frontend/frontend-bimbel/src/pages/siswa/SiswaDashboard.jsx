import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function SiswaDashboard() {
  const navigate = useNavigate();
  const [materis, setMateris] = useState([]);

  // State untuk mengontrol Modal Detail
  const [selectedMateri, setSelectedMateri] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fungsi Logout stabil di memori
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  }, [navigate]);

  // Fungsi mengambil data soal
  const fetchMateris = useCallback(async () => {
    try {
      const response = await api.get("/list-materi");
      setMateris(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  }, [handleLogout]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMateris();
  }, [fetchMateris]);

  // Fungsi membuka dan menutup modal
  const openModal = (materi) => {
    if (!materi) return;

    console.log(
      "Cek URL Gambar/PDF:",
      materi.file_path
        ? `${import.meta.env.VITE_STORAGE_URL}/${materi.file_path}`
        : "Tidak ada file fisik"
    );

    setSelectedMateri(materi);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMateri(null);
    setIsModalOpen(false);
  };

  const handleOpenPdf = (materi) => {
    const url = `${import.meta.env.VITE_STORAGE_URL}/${materi.file_path}`;
    window.open(url, "_blank");
  };

  const handleZoomImage = (materi) => {
    const url = `${import.meta.env.VITE_STORAGE_URL}/${materi.file_path}`;
    window.open(url, "_blank");
  };

  // Fungsi Download File
  const handleDownload = async (materi) => {
    try {
      alert("Mempersiapkan unduhan...");
      const response = await api.get(`/materi-download/${materi.id}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${materi.title}.${materi.type === "image" ? "jpg" : "pdf"}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error saat download:", error);
      alert(
        "Gagal mengunduh file. Kemungkinan file fisik tidak tersedia di server."
      );
    }
  };

  // Fungsi Copy Link
  const handleCopyLink = (url) => {
    if (url) {
      navigator.clipboard.writeText(url);
      alert("Link Youtube berhasil disalin ke clipboard!");
    } else {
      alert("URL tidak valid.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Navbar */}
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center px-8 sticky top-0 z-10 border-b-4 border-green-500">
        <h1 className="text-xl font-bold text-green-600">
          Bimbel E-Learning (Siswa)
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            Mode Siswa
          </span>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="p-8 max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Daftar Materi & Soal Belajar
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 text-sm bg-gray-50">
                  <th className="p-4 rounded-tl-lg font-semibold text-gray-700">
                    Judul Soal
                  </th>
                  <th className="p-4 font-semibold text-gray-700">
                    Tipe Media
                  </th>
                  <th className="p-4 font-semibold text-gray-700">
                    Tanggal Diunggah
                  </th>
                  <th className="p-4 rounded-tr-lg font-semibold text-gray-700 text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {materis.length > 0 ? (
                  materis.map((materi) => (
                    <tr
                      key={materi.id}
                      className="border-b hover:bg-green-50 transition-colors"
                    >
                      <td className="p-4 font-medium text-gray-800">
                        {materi.title}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full border ${
                            materi.type === "pdf"
                              ? "bg-red-50 text-red-600 border-red-200"
                              : materi.type === "image"
                              ? "bg-blue-50 text-blue-600 border-blue-200"
                              : "bg-red-500 text-white border-red-600"
                          }`}
                        >
                          {materi.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(materi.created_at).toLocaleDateString(
                          "id-ID",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </td>
                      <td className="p-4 flex justify-center gap-2">
                        <button
                          onClick={() => openModal(materi)}
                          className="bg-green-100 text-green-700 border border-green-200 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-200 transition-colors"
                        >
                          Lihat Detail
                        </button>

                        {materi.type === "youtube" ? (
                          <button
                            onClick={() => handleCopyLink(materi.youtube_url)}
                            className="bg-gray-100 text-gray-700 border border-gray-200 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                          >
                            Copy Link
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDownload(materi)}
                            className="bg-blue-100 text-blue-700 border border-blue-200 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-200 transition-colors"
                          >
                            Unduh File
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center p-12 text-gray-400 font-medium"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="w-12 h-12 mb-3 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          ></path>
                        </svg>
                        Belum ada materi yang tersedia dari guru.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Detail Materi overlay */}
      {isModalOpen && selectedMateri && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" // Tambahkan overflow-y-auto di sini
          onClick={closeModal}
        >
          <div
            className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 my-auto" // Tambahkan my-auto agar modal tetap di tengah
            onClick={(e) => e.stopPropagation()}
          >
            {/* Konten Modal */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Detail Materi</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Area konten */}
            <div className="p-6 max-h-[80vh] overflow-y-auto space-y-4">
              <div className="w-full bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 min-h-75">
                {selectedMateri.type === "youtube" ? (
                  <iframe
                    className="w-full aspect-video"
                    src={
                      selectedMateri.youtube_url?.includes("youtu.be")
                        ? selectedMateri.youtube_url.replace(
                            "youtu.be/",
                            "youtube.com/embed/"
                          )
                        : selectedMateri.youtube_url?.replace(
                            "watch?v=",
                            "embed/"
                          )
                    }
                    title="Preview Video"
                    allowFullScreen
                  ></iframe>
                ) : selectedMateri.type === "image" ? (
                  <img
                    src={`${import.meta.env.VITE_STORAGE_URL}/${
                      selectedMateri.file_path
                    }`}
                    alt="Preview"
                    className="max-h-100 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                    title="Klik untuk melihat ukuran penuh"
                    onClick={() => handleZoomImage(selectedMateri)}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="p-8 text-center">
                    {/* Preview untuk PDF */}
                    <iframe
                      src={`${import.meta.env.VITE_STORAGE_URL}/${
                        selectedMateri.file_path
                      }`}
                      className="w-full h-100"
                      title="PDF Preview"
                    ></iframe>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">
                  Judul Soal
                </p>
                <p className="text-lg font-semibold text-gray-800">
                  {selectedMateri.title}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">
                    Tipe Media
                  </p>
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-bold uppercase border border-gray-200">
                    {selectedMateri.type}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">
                    Tanggal Upload
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(selectedMateri.created_at).toLocaleDateString(
                      "id-ID"
                    )}
                  </p>
                </div>
              </div>

              {selectedMateri.type === "youtube" &&
                selectedMateri.youtube_url && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-sm font-medium text-red-800 mb-2">
                      Tautan Video Youtube:
                    </p>
                    <a
                      href={selectedMateri.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm break-all"
                    >
                      {selectedMateri.youtube_url}
                    </a>
                  </div>
                )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-5 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-200"
              >
                Tutup
              </button>

              {selectedMateri.type === "youtube" ? (
                <button
                  onClick={() => handleCopyLink(selectedMateri.youtube_url)}
                  className="..."
                >
                  Salin Link Youtube
                </button>
              ) : selectedMateri.type === "pdf" ? (
                <button
                  onClick={() => handleOpenPdf(selectedMateri)}
                  className="px-5 py-2 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 shadow-sm"
                >
                  Buka PDF di Tab Baru
                </button>
              ) : (
                <button
                  onClick={() => handleDownload(selectedMateri)}
                  className="..."
                >
                  Unduh Gambar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
