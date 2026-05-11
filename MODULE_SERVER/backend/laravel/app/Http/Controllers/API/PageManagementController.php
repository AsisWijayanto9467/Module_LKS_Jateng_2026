<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PageManagementController extends Controller
{
    public function createPage(Request $request) {
        try {
            $validator = Validator::make($request->all(), [
                "title"=> "required|string",
                "slug" => "required|string|unique:pages,slug",
                "summary" => "nullable|string"
            ]);

            if($validator->fails()) {
                return response()->json([
                     "status" => "error",
                     "message" => $validator->fails()
                ], 422);
            }

            $user = $request->user();

            if(!$user) {
                return response()->json([
                    "status" => "error",
                    "message" => "Unauthenticated."
                ], 401);
            }

            $page = Page::create([
                "user_id" => $user->id,
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
                    "slug"=> $page->slug,
                    "summary" => $page->summary,
                    "created_at" => $page->created_at,
                    "updated_at" => $page->updated_at,
                ]
            ], 201);
        } catch (\Throwable $th) {
            Log::error("Tidak bisa melakukan membuat page" . $th->getMessage());
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function getAllPages(Request $request) {
        try {
            $user = $request->user();

            if(!$user) {
                return response()->json([
                    "status" => "error",
                    "message" => "Unauthenticated."
                ], 401);
            }

            $page = Page::all();

            return response()->json([
                "status"=> "success",
                "message" => "Get all pages successful",
                "data" => $page
            ], 200);
        } catch (\Throwable $th) {
            Log::error("failed to get all page" . $th->getMessage());
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function getAllByID(Request $request, $id) {
        try {
            $user = $request->user();

            if(!$user) {
                return response()->json([
                    "status" => "error",
                    "message" => "Unauthenticated."
                ], 401);
            }


            $page = Page::With(["pageSections"])->where("id", $id)->first();

            if(!$page) {
                return response()->json([
                    "status" => "error",
                    "message" => "not-found",
                ], 404);
            }

            if($page->user_id !== $user->id) {
                return response()->json([
                    "status" => "error",
                    "message" => "Forbidden access"
                ], 403);
            }

           return response()->json([
                "status"=> "success",
                "message" => "Get page successful",
                "data" => [
                    "id" => $page->id,
                    "user_id" => $page->user_id,
                    "title" => $page->title,
                    "slug" => $page->slug,
                    "summary" => $page->summary,
                    "sections" => $page->pageSections->map(function($sec) use($page) {
                        return [
                            "id"=> $sec->id,
                            "position" => $sec->position,
                            "template" => [
                                "id"=> $sec->template->id,
                                "name" => $sec->template->name,
                                "slug" => $sec->template->slug,
                            ],
                            "fields" => $sec->sectionFieldValues->map(function($field) use($page) {
                                return [
                                    "id"=> $field->id,
                                    "name" => $field->templateField->name,
                                    "slug" => $field->templateField->slug,
                                    "type" => $field->type,
                                ];
                            })
                        ];
                    }),
                    "created_at" => $page->created_at,
                    "updated_at" => $page->updated_at,
                ]
           ], 200);
        } catch (\Throwable $th) {
            Log::error("failed to get all page" . $th->getMessage());
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function updatePage(Request $request, $id) {
        try {
            $user = $request->user();

            if(!$user) {
                return response()->json([
                    "status" => "error",
                    "message" => "Unauthenticated."
                ], 401);
            }

            $validator = Validator::make($request->all(), [
                "title" => "nullable|string",
                "slug" => "nullable|unique:pages,slug",
                "summary" => "nullable|string"
            ]);

            if($validator->fails()) {
                return response()->json([
                    "status" => "error",
                    "message" => "Invalid field",
                    "errors" => $validator->errors()
                ], 422);
            }

            $page = Page::find($id);

            if(!$page) {
                return response()->json([
                    "status" => "error",
                    "message" => "Not Found"
                ], 404);
            }

            if($page->user_id !== $user->id) {
                return response()->json([
                    "status" => "error",
                    "message" => "Forbidden access"
                ], 403);
            }



            $page->title = $request->title;
            $page->slug = $request->slug;
            $page->summary = $request->summary;
            $page->save();

            return response()->json([
                "status"=> "success",
                "message" => "Page updated successful",
                "data" => $page
            ], 200);
        } catch (\Throwable $th) {
            Log::error("failed to update page" . $th->getMessage());
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function deletePage(Request $request, $id) {
        try {
            $user = $request->user();

            if(!$user) {
                return response()->json([
                    "status" => "error",
                    "message" => "Unauthenticated."
                ], 401);
            }

            $page = Page::find($id);

            if(!$page) {
                return response()->json([
                    "status" => "error",
                    "message" => "Not Found"
                ], 404);
            }

            if($page->user_id !== $user->id) {
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
            Log::error("failed to delete page" . $th->getMessage());
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }
}
