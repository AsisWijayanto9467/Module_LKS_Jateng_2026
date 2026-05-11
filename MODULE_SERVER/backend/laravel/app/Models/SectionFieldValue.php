<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SectionFieldValue extends Model
{
    protected $table = "section_field_values";

    protected $fillable = [
        "page_section_id",
        "template_field_id",
        "value",
    ];

    public function pageSection() {
        return $this->belongsTo(PageSection::class);
    }

    public function templateField() {
        return $this->belongsTo(TemplateField::class);
    }
}
