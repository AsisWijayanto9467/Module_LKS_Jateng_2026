<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class PageManagementController extends Controller
{
    public function createPage(Request $request) {
        try {
            $validator = Validator::make($request->all(), [
                "title" => "required|string",
                "slug" => ["required", "string", "unique:pages,slug", "regex:/^[a-z0-9-]+$/"],
                "summary" => "nullable|string"
            ], [
                'slug.regex' => 'The slug may only contain lowercase letters, numbers, and hyphens.'
            ]);

            if($validator->fails()) {
                return response()->json([
                     "status" => "error",
                     "message" => "Invalid field",
                     "errors" => $validator->errors()
                ], 422);
            }

            $page = Page::create([
                "user_id" => $request->user()->id,
                "summary" => $request->summary,
                "slug" => $request->slug,
                "title" => $request->title
            ]);

            return response()->json([
                "status" => "success",
                "message" => "Page created successful",
                "data" => [
                    "id" => $page->id,
                    "user_id" => $page->user_id,
                    "title" => $page->title,
                    "slug" => $page->slug,
                    "summary" => $page->summary,
                    "created_at" => $page->created_at->format('Y-m-d\TH:i:s.u\Z'),
                    "updated_at" => $page->updated_at->format('Y-m-d\TH:i:s.u\Z'),
                ]
            ], 201);
        } catch (\Throwable $th) {
            Log::error("Failed to create page: " . $th->getMessage());
            return response()->json([
                "status" => "error",
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function getAllPages(Request $request) {
        try {
            $pages = Page::where('user_id', $request->user()->id)
                ->get()
                ->map(function ($page) {
                    return [
                        "id" => $page->id,
                        "user_id" => $page->user_id,
                        "title" => $page->title,
                        "slug" => $page->slug,
                        "summary" => $page->summary,
                        "created_at" => $page->created_at->format('Y-m-d\TH:i:s.u\Z'),
                        "updated_at" => $page->updated_at->format('Y-m-d\TH:i:s.u\Z'),
                    ];
                });

            return response()->json([
                "status" => "success",
                "message" => "Get all pages successful",
                "data" => [
                    "pages" => $pages
                ]
            ], 200);
        } catch (\Throwable $th) {
            Log::error("Failed to get all pages: " . $th->getMessage());
            return response()->json([
                "status" => "error",
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function getById(Request $request, $id) {
        try {
            $page = Page::with(['pageSections.template', 'pageSections.sectionFieldValues.templateField'])
                ->where('id', $id)
                ->first();

            if(!$page) {
                return response()->json([
                    "status" => "error",
                    "message" => "Not found",
                ], 404);
            }

            if($page->user_id !== $request->user()->id) {
                return response()->json([
                    "status" => "error",
                    "message" => "Forbidden access"
                ], 403);
            }

            return response()->json([
                "status" => "success",
                "message" => "Get page successful",
                "data" => [
                    "id" => $page->id,
                    "user_id" => $page->user_id,
                    "title" => $page->title,
                    "slug" => $page->slug,
                    "summary" => $page->summary,
                    "sections" => $page->pageSections->map(function($section) {
                        return [
                            "id" => $section->id,
                            "position" => $section->position,
                            "template" => [
                                "id" => $section->template->id,
                                "name" => $section->template->name,
                                "slug" => $section->template->slug,
                            ],
                            "fields" => $section->sectionFieldValues->map(function($fieldValue) {
                                return [
                                    "id" => $fieldValue->templateField->id,
                                    "name" => $fieldValue->templateField->name,
                                    "slug" => $fieldValue->templateField->name,
                                    "type" => $fieldValue->templateField->type,
                                    "value" => $fieldValue->value,
                                ];
                            })
                        ];
                    }),
                    "created_at" => $page->created_at->format('Y-m-d\TH:i:s.u\Z'),
                    "updated_at" => $page->updated_at->format('Y-m-d\TH:i:s.u\Z'),
                ]
            ], 200);
        } catch (\Throwable $th) {
            Log::error("Failed to get page: " . $th->getMessage());
            return response()->json([
                "status" => "error",
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function updatePage(Request $request, $slug) {
        try {
            $page = Page::where('slug', $slug)->first();

            if(!$page) {
                return response()->json([
                    "status" => "error",
                    "message" => "Not found"
                ], 404);
            }

            if($page->user_id !== $request->user()->id) {
                return response()->json([
                    "status" => "error",
                    "message" => "Forbidden access"
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                "title" => "nullable|string",
                "slug" => [
                    "nullable",
                    "string",
                    Rule::unique('pages', 'slug')->ignore($page->id),
                    "regex:/^[a-z0-9-]+$/"
                ],
                "summary" => "nullable|string"
            ], [
                'slug.regex' => 'The slug may only contain lowercase letters, numbers, and hyphens.'
            ]);

            if($validator->fails()) {
                return response()->json([
                    "status" => "error",
                    "message" => "Invalid field",
                    "errors" => $validator->errors()
                ], 422);
            }

            // Hanya update field yang dikirim
            if($request->has('title')) {
                $page->title = $request->title;
            }
            if($request->has('slug')) {
                $page->slug = $request->slug;
            }
            if($request->has('summary')) {
                $page->summary = $request->summary;
            }

            $page->save();

            return response()->json([
                "status" => "success",
                "message" => "Page updated successful",
                "data" => [
                    "id" => $page->id,
                    "user_id" => $page->user_id,
                    "title" => $page->title,
                    "slug" => $page->slug,
                    "summary" => $page->summary,
                    "created_at" => $page->created_at->format('Y-m-d\TH:i:s.u\Z'),
                    "updated_at" => $page->updated_at->format('Y-m-d\TH:i:s.u\Z'),
                ]
            ], 200);
        } catch (\Throwable $th) {
            Log::error("Failed to update page: " . $th->getMessage());
            return response()->json([
                "status" => "error",
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function deletePage(Request $request, $slug) {
        try {
            $page = Page::where('slug', $slug)->first();

            if(!$page) {
                return response()->json([
                    "status" => "error",
                    "message" => "Not found"
                ], 404);
            }

            if($page->user_id !== $request->user()->id) {
                return response()->json([
                    "status" => "error",
                    "message" => "Forbidden access"
                ], 403);
            }

            $page->delete();

            return response()->json([
                "status" => "success",
                "message" => "Page deleted successful"
            ], 200);
        } catch (\Throwable $th) {
            Log::error("Failed to delete page: " . $th->getMessage());
            return response()->json([
                "status" => "error",
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }
}
