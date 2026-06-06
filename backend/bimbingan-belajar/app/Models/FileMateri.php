<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FileMateri extends Model
{
    protected $fillable = [
        'title', 
        'description', 
        'type', 
        'file_path', 
        'youtube_url', 
        'created_by'
    ];
}