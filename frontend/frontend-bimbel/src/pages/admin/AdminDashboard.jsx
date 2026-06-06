import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [materis, setMateris] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // State untuk Form
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("pdf");
  const [file, setFile] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  }, [navigate]);

  const fetchMateris = useCallback(async () => {
    try {
      const response = await api.get("/list-materi");
      setMateris(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      if (error.response?.status === 401) handleLogout();
    }
  }, [handleLogout]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMateris();
  }, [fetchMateris]);

  // Fungsi untuk mereset form
  const resetForm = () => {
    setEditId(null);
    setTitle("");
    setType("pdf");
    setFile(null);
    setYoutubeUrl("");
    const fileInput = document.getElementById("file-upload");
    if (fileInput) fileInput.value = "";
  };

  // Fungsi Submit Form Menangani Upload Baru ATAU Update Data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("type", type);

    if (type === "youtube") {
      formData.append("youtube_url", youtubeUrl);
    } else {
      if (!file && !editId) {
        alert("Pilih file terlebih dahulu!");
        setIsLoading(false);
        return;
      }
      if (file) {
        formData.append("file", file);
      }
    }

    try {
      if (editId) {
        formData.append("_method", "PUT");
        await api.post(`/update-materi/${editId}`, formData);
        alert("Materi berhasil diperbarui!");
      } else {
        await api.post("/upload-materi", formData);
        alert("Materi berhasil diunggah!");
      }

      resetForm();
      fetchMateris();
    } catch (error) {
      console.error("Proses gagal:", error);
      alert(
        `Gagal memproses data. ${
          editId
            ? "Pastikan endpoint /update-materi/{id} tersedia di Laravel."
            : ""
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk mempersiapkan form saat tombol Edit ditekan
  const handleEditClick = (materi) => {
    setEditId(materi.id);
    setTitle(materi.title || "");
    setType(materi.type || "pdf");
    setYoutubeUrl(materi.youtube_url || "");
    setFile(null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fungsi untuk menghapus data
  const handleDeleteClick = async (id) => {
    const isConfirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus materi ini? Tindakan ini tidak dapat dibatalkan."
    );
    if (!isConfirmed) return;

    try {
      await api.delete(`/delete-materi/${id}`);
      alert("Materi berhasil dihapus!");
      fetchMateris();
    } catch (error) {
      console.error("Gagal menghapus:", error);
      alert(
        "Gagal menghapus data. Pastikan endpoint /delete-materi/{id} tersedia di Laravel."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center px-8 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-blue-600">Bimbel Panel Admin</h1>
        <button
          onClick={handleLogout}
          className="text-red-500 hover:text-red-700 font-medium"
        >
          Logout
        </button>
      </nav>

      <div className="p-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Kolom Kiri: Form */}
        <div className="col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              {editId ? "Edit Soal" : "Upload Soal Baru"}
            </h2>
            {editId && (
              <button
                onClick={resetForm}
                className="text-xs text-gray-500 hover:text-gray-800 underline"
              >
                Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Judul Soal
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Tipe Soal
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition"
              >
                <option value="pdf">PDF</option>
                <option value="image">Image (JPG/PNG)</option>
                <option value="youtube">Link Youtube</option>
              </select>
            </div>

            {type === "youtube" ? (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  URL Youtube
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  placeholder="https://youtube.com/..."
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  {editId ? "Pilih File Baru (Opsional)" : "Pilih File"}
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept={type === "pdf" ? ".pdf" : "image/*"}
                  onChange={(e) => setFile(e.target.files[0])}
                  required={!editId}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 rounded-lg text-white font-medium transition-colors ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : editId
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading
                ? "Memproses..."
                : editId
                ? "Simpan Perubahan"
                : "Upload Soal"}
            </button>
          </form>
        </div>

        {/* Kolom Kanan: Tabel Data */}
        <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Daftar Soal</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 text-sm bg-gray-50">
                  <th className="p-3">Judul Soal</th>
                  <th className="p-3">Tipe</th>
                  <th className="p-3">Tanggal Upload</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {materis.length > 0 ? (
                  materis.map((materi) => (
                    <tr
                      key={materi.id}
                      className="border-b hover:bg-blue-50 transition-colors"
                    >
                      <td className="p-3 font-medium text-gray-700">
                        {materi.title}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 text-xs font-bold rounded-md ${
                            materi.type === "pdf"
                              ? "bg-red-100 text-red-700"
                              : materi.type === "image"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {materi.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-500">
                        {new Date(materi.created_at).toLocaleDateString(
                          "id-ID"
                        )}
                      </td>
                      <td className="p-3 flex flex-wrap gap-2">
                        {materi.type === "youtube" ? (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                materi.youtube_url || ""
                              );
                              alert("Link Youtube berhasil disalin!");
                            }}
                            className="bg-gray-100 text-gray-700 border border-gray-300 px-3 py-1 rounded text-xs font-medium hover:bg-gray-200 transition"
                          >
                            Copy Link
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              try {
                                const response = await api.get(
                                  `/materi-download/${materi.id}`,
                                  { responseType: "blob" }
                                );
                                const url = window.URL.createObjectURL(
                                  new Blob([response.data])
                                );
                                const link = document.createElement("a");
                                link.href = url;
                                link.setAttribute(
                                  "download",
                                  `${materi.title}.${
                                    materi.type === "image" ? "jpg" : "pdf"
                                  }`
                                );
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                              } catch (error) {
                                console.error("Error saat download:", error);
                                alert("Gagal mengunduh file.");
                              }
                            }}
                            className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded text-xs font-medium hover:bg-blue-100 transition"
                          >
                            Download
                          </button>
                        )}

                        <button
                          onClick={() => handleEditClick(materi)}
                          className="bg-yellow-50 text-yellow-600 border border-yellow-200 px-3 py-1 rounded text-xs font-medium hover:bg-yellow-100 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(materi.id)}
                          className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded text-xs font-medium hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center p-8 text-gray-400">
                      Belum ada data soal yang diunggah.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
