<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Template extends Model
{
    protected $table = "templates";

    protected $fillable = [
        "name",
        "slug",
    ];

    public function pageSections() {
        return $this->hasMany(PageSection::class);
    }

    public function templateFields() {
        return $this->hasMany(TemplateField::class);
    }
}
