<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TemplateController extends Controller
{
    public function getAllTemplate(Request $request) {
        try {
            $user = $request->user();

            if(!$user) {
                return response()->json([
                    "status" => "error",
                    "message" => "Unauthenticated."
                ], 401);
            }

            $template = Template::with(["templateFields"])->get();

            return response()->json([
                "status"=> "success",
                "message" => "Get all templates successful",
                "data" => [
                    "templates" => $template->map(function($temp) {
                        return [
                            "id" => $temp->id,
                            "name" => $temp->name,
                            "slug" => $temp->slug,
                            "fields" => $temp->templateFields->map(function($field) {
                                return [
                                    "id" => $field->id,
                                    "template_id" => $field->template_id,
                                    "name" => $field->name,
                                    "slug" => $field->template->slug,
                                    "type" => $field->type,
                                ];
                            })
                        ];
                    })
                ]
            ], 200);
        } catch (\Throwable $th) {
            Log::error("failed to get all template" . $th->getMessage());
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function getTemplateByID($slug, Request $request) {
        try {
            $user = $request->user();

            if(!$user) {
                return response()->json([
                    "status" => "error",
                    "message" => "Unauthenticated."
                ], 401);
            }

            $template = Template::with(["templateFields"])->where("slug", $slug)->get();

            return response()->json([
                "status"=> "success",
                "message" => "Get all templates successful",
                "data" => [
                    "templates" => $template->map(function($temp) {
                        return [
                            "id" => $temp->id,
                            "name" => $temp->name,
                            "slug" => $temp->slug,
                            "fields" => $temp->templateFields->map(function($field) {
                                return [
                                    "id" => $field->id,
                                    "template_id" => $field->template_id,
                                    "name" => $field->name,
                                    "slug" => $field->template->slug,
                                    "type" => $field->type,
                                ];
                            })
                        ];
                    })
                ]
            ], 200);
        } catch (\Throwable $th) {
            Log::error("failed to get template by id" . $th->getMessage());
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }
}
