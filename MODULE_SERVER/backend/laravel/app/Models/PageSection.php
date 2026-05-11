<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageSection extends Model
{
    protected $table = "page_sections";

    protected $fillable = [
        "name",
        "page_id",
        "template_id",
        "position"
    ];

    public function page() {
        return $this->belongsTo(Page::class);
    }

    public function template() {
        return $this->belongsTo(Template::class);
    }

    public function sectionFieldValues() {
        return $this->hasMany(SectionFieldValue::class);
    }
}
