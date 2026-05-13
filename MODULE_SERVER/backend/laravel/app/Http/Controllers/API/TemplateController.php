<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TemplateController extends Controller
{
    public function getAllTemplate(Request $request) {
        try {
            $templates = Template::with(["templateFields"])->get();

            return response()->json([
                "status" => "success",
                "message" => "Get all templates successful",
                "data" => [
                    "templates" => $templates->map(function($temp) {
                        return [
                            "id" => $temp->id,
                            "name" => $temp->name,
                            "slug" => $temp->slug,
                            "fields" => $temp->templateFields->map(function($field) {
                                return [
                                    "id" => $field->id,
                                    "template_id" => $field->template_id,
                                    "name" => $field->name,
                                    "slug" => Str::slug($field->name), // Slug dari nama field
                                    "type" => $field->type,
                                ];
                            })
                        ];
                    })
                ]
            ], 200);
        } catch (\Throwable $th) {
            Log::error("Failed to get all templates: " . $th->getMessage());
            return response()->json([
                "status" => "error",
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function getTemplateBySlug(Request $request, $slug) {
        try {
            $template = Template::with(["templateFields"])
                ->where("slug", $slug)
                ->first();

            if(!$template) {
                return response()->json([
                    "status" => "error",
                    "message" => "Not found"
                ], 404);
            }

            return response()->json([
                "status" => "success",
                "message" => "Get template successful",
                "data" => [
                    "id" => $template->id,
                    "name" => $template->name,
                    "slug" => $template->slug,
                    "fields" => $template->templateFields->map(function($field) {
                        return [
                            "id" => $field->id,
                            "template_id" => $field->template_id,
                            "name" => $field->name,
                            "slug" => Str::slug($field->name), // Slug dari nama field
                            "type" => $field->type,
                        ];
                    })
                ]
            ], 200);
        } catch (\Throwable $th) {
            Log::error("Failed to get template by slug: " . $th->getMessage());
            return response()->json([
                "status" => "error",
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }
}
