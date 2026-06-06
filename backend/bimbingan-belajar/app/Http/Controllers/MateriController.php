<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FileMateri;
use Illuminate\Support\Facades\Storage;

class MateriController extends Controller
{
    // 1. Upload Materi Hanya Admin
    public function uploadMateri(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak. Hanya Admin yang dapat mengunggah soal.'], 403);
        }

        $request->validate([
            'title' => 'required|string',
            'type' => 'required|in:pdf,image,youtube',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png',
            'youtube_url' => 'nullable|url'
        ]);

        $filePath = null;

        if ($request->hasFile('file') && in_array($request->type, ['pdf', 'image'])) {
            $filePath = $request->file('file')->store('materis', 'public'); 
        }

        $materi = FileMateri::create([
            'title' => $request->title,
            'description' => $request->description,
            'type' => $request->type,
            'file_path' => $filePath,
            'youtube_url' => $request->youtube_url,
            'created_by' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Materi berhasil diunggah', 'data' => $materi], 201);
    }

    // 2. Lihat Daftar Materi Admin & Siswa
    public function listMateri()
    {
        $materis = FileMateri::select('id', 'title', 'type', 'youtube_url', 'file_path', 'created_at')
                ->latest()
                ->get();
        return response()->json(['data' => $materis]);
    }

    // 3. Lihat Detail Materi Admin & Siswa
    public function detailMateri($id)
    {
        $materi = FileMateri::find($id);
        
        if (!$materi) {
            return response()->json(['message' => 'Materi tidak ditemukan'], 404);
        }

        // Generate URL lengkap untuk preview image/pdf
        if ($materi->file_path) {
            $materi->file_url = asset('storage/' . $materi->file_path);
        }

        return response()->json(['data' => $materi]);
    }

    // 4. Download Soal (PDF & Image)
    public function downloadMateri($id)
    {
        $materi = FileMateri::find($id);

        if (!$materi || !$materi->file_path || !Storage::disk('public')->exists($materi->file_path)) {
            return response()->json(['message' => 'File tidak ditemukan'], 404);
        }

        return Storage::disk('public')->download($materi->file_path);
    }

    // 5. Update Materi Hanya Admin
    public function updateMateri(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $materi = FileMateri::find($id);
        if (!$materi) {
            return response()->json(['message' => 'Materi tidak ditemukan'], 404);
        }

        $request->validate([
            'title' => 'required|string',
            'type' => 'required|in:pdf,image,youtube',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png',
            'youtube_url' => 'nullable|url'
        ]);

        $filePath = $materi->file_path;

        if ($request->hasFile('file') && in_array($request->type, ['pdf', 'image'])) {
            if ($materi->file_path && Storage::disk('public')->exists($materi->file_path)) {
                Storage::disk('public')->delete($materi->file_path);
            }
            $filePath = $request->file('file')->store('materis', 'public');
        }
        elseif ($request->type === 'youtube' && $materi->file_path) {
            if (Storage::disk('public')->exists($materi->file_path)) {
                Storage::disk('public')->delete($materi->file_path);
            }
            $filePath = null;
        }

        $materi->update([
            'title' => $request->title,
            'description' => $request->description,
            'type' => $request->type,
            'file_path' => $filePath,
            'youtube_url' => $request->type === 'youtube' ? $request->youtube_url : null,
        ]);

        return response()->json(['message' => 'Materi berhasil diperbarui', 'data' => $materi]);
    }

    // 6. Delete Materi Hanya Admin
    public function deleteMateri(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $materi = FileMateri::find($id);
        if (!$materi) {
            return response()->json(['message' => 'Materi tidak ditemukan'], 404);
        }

        if ($materi->file_path && Storage::disk('public')->exists($materi->file_path)) {
            Storage::disk('public')->delete($materi->file_path);
        }

        $materi->delete();

        return response()->json(['message' => 'Materi beserta file fisiknya berhasil dihapus']);
    }
}