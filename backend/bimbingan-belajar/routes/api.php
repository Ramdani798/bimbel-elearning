<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MateriController;

// Route Terbuka Tidak butuh token
Route::post('/login', [AuthController::class, 'login']);

// Route Tertutup Butuh token Sanctum
Route::middleware('auth:sanctum')->group(function () {
    
    // Endpoint khusus Admin
    Route::post('/upload-materi', [MateriController::class, 'uploadMateri']);
    Route::put('/update-materi/{id}', [MateriController::class, 'updateMateri']); 
    Route::delete('/delete-materi/{id}', [MateriController::class, 'deleteMateri']);
    Route::get('/materi-download/{id}', [MateriController::class, 'downloadMateri']);
    
    // Endpoint Admin & Siswa bisa diakses keduanya
    Route::get('/list-materi', [MateriController::class, 'listMateri']);
    Route::get('/show-materi/{id}', [MateriController::class, 'detailMateri']); // Untuk Admin
    Route::get('/detail-materi/{id}', [MateriController::class, 'detailMateri']); // Untuk Siswa
});