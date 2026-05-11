<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\PageSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class SectionManageController extends Controller
{
    public function addSectionPage(Request $request, $slug) {
        try {
            $user = $request->user();

            if(!$user) {
                return response()->json([
                    "status" => "error",
                    "message" => "Unauthenticated."
                ], 401);
            }

            $validator = Validator::make($request->all(), [
                "template_id" => "required|integer|exists:templates,id",
                "position" => "required|integer",
                "name" => "required|string"
            ]);

            if($validator->fails()) {
                return response()->json([
                  "status" => "error",
                  "message" => "Invalid field",
                  "errors" => $validator->errors()
                ], 422);
            }

            $page = Page::where("slug", $slug)->first();

            if(!$page) {
                return response()->json([
                    "status" => "error",
                    "message" => "Not found"
                ], 404);
            }

            if($page->user_id !== $user->id) {
                return response()->json([
                    "status" => "error",
                    "message" => "Forbidden access"
                ], 403);
            }

            $pageSection = PageSection::create([
                "name" => $request->name,
                "page_id" => $page->id,
                "template_id" => $request->template_id,
                "position" => $request->position,
            ]);



            return response()->json([
                "status" => "success",
                "message"=> "Section added successful",
                "data" => [
                    "id" => $pageSection->id,
                    "page_id" => $pageSection->page_id,
                    "template_id" => $pageSection->template_id,
                    "position" => $pageSection->position,
                    "template" => [
                        "id" => $pageSection->template->id,
                        "name" => $pageSection->template->name,
                        "slug" => $pageSection->template->slug,
                    ],
                    "fields" => $pageSection->sectionFieldValues->map(function($field) {
                        return [
                            "id"=> $field->id,
                            "name" => $field->templateField->name,
                            "type" => $field->templateField->type,
                            "slug" => $field->templateField->template->slug,
                            "value"=> $field->value,
                        ];
                    }),
                    "created_at" => $pageSection->created_at,
                    "updated_at" => $pageSection->updated_at,
                ]
            ], 200);

            if($validator->fails()) {
                return response()->json([
                     "status" => "error",
                     "message" => $validator->fails()
                ], 422);
            }

        } catch (\Throwable $th) {
            Log::error("failed to add" . $th->getMessage());
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function updateSectionField(Request $request, $slug, $sectionId) {
        try {
            $user = $request->user();

            if(!$user) {
                return response()->json([
                    "status" => "error",
                    "message" => "Unauthenticated."
                ], 401);
            }

            $validator = Validator::make($request->all(), [
                "template_id" => "required|integer|exists:templates,id",
                "position" => "required|integer",
                "name" => "required|string"
            ]);

            if($validator->fails()) {
                return response()->json([
                  "status" => "error",
                  "message" => "Invalid field",
                  "errors" => $validator->errors()
                ], 422);
            }

            $page = Page::where("slug", $slug)->first();

            if(!$page) {
                return response()->json([
                    "status" => "error",
                    "message" => "Not found"
                ], 404);
            }


        } catch (\Throwable $th) {
            Log::error("failed to get template by id" . $th->getMessage());
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function deleteSection(Request $request, $slug, $sectionId) {
        try {
            $user = $request->user();

            if(!$user) {
                return response()->json([
                    "status" => "error",
                    "message" => "Unauthenticated."
                ], 401);
            }

            $page = Page::where("slug", $slug)->first();

            if(!$page) {
                return response()->json([
                    "status" => "error",
                    "message" => "Not found"
                ], 404);
            }

            if($page->user_id !== $user->id) {
                return response()->json([
                    "status" => "error",
                    "message" => "Forbidden access"
                ], 403);
            }

            $pageSection = PageSection::where("id", $sectionId)->first();

            if(!$pageSection) {
                return response()->json([
                    "status" => "error",
                    "message" => "Not found"
                ], 404);
            }

            $pageSection->delete();

            return response()->json([
                "status" => "success",
                "message" => "Section removed successful"
            ], 200);
        } catch (\Throwable $th) {
            Log::error("failed to delete section" . $th->getMessage());
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }
}
