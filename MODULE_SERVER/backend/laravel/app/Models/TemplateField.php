<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TemplateField extends Model
{
    protected $table = "template_fields";

    protected $fillable = [
        "name",
        "type",
        "template_id",
    ];

    public function template() {
        return $this->belongsTo(Template::class);
    }

}
