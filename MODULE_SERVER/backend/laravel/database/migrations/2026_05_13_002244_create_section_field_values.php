<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('section_field_values', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('page_section_id');
            $table->unsignedBigInteger('template_field_id');
            $table->text('value')->nullable();
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('page_section_id')
                  ->references('id')
                  ->on('page_sections')
                  ->onDelete('cascade');

            $table->foreign('template_field_id')
                  ->references('id')
                  ->on('template_fields')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('section_field_values');
    }
};
