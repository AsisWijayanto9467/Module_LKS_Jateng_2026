<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    protected $table ="pages";

    protected $fillable = [
        "title",
        "summary",
        "slug",
        "user_id",
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function pageSections() {
        return $this->hasMany(PageSection::class);
    }
}
