<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\PageSection;
use App\Models\SectionFieldValue;
use App\Models\Template;
use App\Models\TemplateField;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class SectionManageController extends Controller
{
    public function addSectionPage(Request $request, $slug) {
        try {
            $validator = Validator::make($request->all(), [
                "template_id" => "required|integer|exists:templates,id",
                "position" => "required|integer|min:1"
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

            if($page->user_id !== $request->user()->id) {
                return response()->json([
                    "status" => "error",
                    "message" => "Forbidden access"
                ], 403);
            }

            $template = Template::find($request->template_id);

            $pageSection = PageSection::create([
                "name" => $template->name,
                "page_id" => $page->id,
                "template_id" => $request->template_id,
                "position" => $request->position,
            ]);

            $pageSection->load(['template', 'sectionFieldValues.templateField']);

            $templateFields = TemplateField::where('template_id', $request->template_id)->get();

            return response()->json([
                "status" => "success",
                "message" => "Section added successful",
                "data" => [
                    "id" => $pageSection->id,
                    "page_id" => $pageSection->page_id,
                    "template_id" => $pageSection->template_id,
                    "position" => $pageSection->position,
                    "template" => [
                        "id" => $template->id,
                        "name" => $template->name,
                        "slug" => $template->slug,
                    ],
                    "fields" => $templateFields->map(function($field) {
                        return [
                            "id" => $field->id,
                            "name" => $field->name,
                            "slug" => Str::slug($field->name),
                            "type" => $field->type,
                            "value" => null
                        ];
                    }),
                    "created_at" => $pageSection->created_at->format('Y-m-d\TH:i:s.u\Z'),
                    "updated_at" => $pageSection->updated_at->format('Y-m-d\TH:i:s.u\Z'),
                ]
            ], 201); // Status 201 untuk created

        } catch (\Throwable $th) {
            Log::error("Failed to add section: " . $th->getMessage());
            return response()->json([
                "status" => "error",
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
            $page = Page::where("slug", $slug)->first();

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

            // Pastikan section milik page ini
            $pageSection = PageSection::where("id", $sectionId)
                ->where("page_id", $page->id)
                ->first();

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
            Log::error("Failed to delete section: " . $th->getMessage());
            return response()->json([
                "status" => "error",
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

     public function updateFields(Request $request, $slug, $sectionId)
    {
        $page = Page::where('slug', $slug)->first();

        if (!$page) {
            return response()->json([
                'status' => 'error',
                'message' => 'Not found'
            ], 404);
        }

        if ($page->user_id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden access'
            ], 403);
        }

        $section = PageSection::where('id', $sectionId)
            ->where('page_id', $page->id)
            ->first();

        if (!$section) {
            return response()->json([
                'status' => 'error',
                'message' => 'Not found'
            ], 404);
        }

        // Validate request
        $validator = Validator::make($request->all(), [
            'fields' => 'required|array',
            'fields.*.field_id' => 'required|integer|exists:template_fields,id',
            'fields.*.value' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid field',
                'errors' => $validator->errors()
            ], 422);
        }

        foreach ($request->fields as $field) {
            $templateField = TemplateField::where('id', $field['field_id'])
                ->where('template_id', $section->template_id)
                ->first();

            if ($templateField) {
                SectionFieldValue::updateOrCreate(
                    [
                        'page_section_id' => $section->id,
                        'template_field_id' => $field['field_id']
                    ],
                    [
                        'value' => $field['value']
                    ]
                );
            }
        }

        $section->load(['sectionFieldValues.templateField']);

        $fields = $section->sectionFieldValues->map(function ($fieldValue) {
            return [
                'id' => $fieldValue->templateField->id,
                'name' => $fieldValue->templateField->name,
                'slug' => $fieldValue->templateField->name,
                'type' => $fieldValue->templateField->type,
                'value' => $fieldValue->value
            ];
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Section fields updated successful',
            'data' => [
                'id' => $section->id,
                'page_id' => $section->page_id,
                'template_id' => $section->template_id,
                'position' => $section->position,
                'fields' => $fields
            ]
        ], 200);
    }

    public function reorder(Request $request, $slug)
    {
        $page = Page::where('slug', $slug)->first();

        if (!$page) {
            return response()->json([
                'status' => 'error',
                'message' => 'Not found'
            ], 404);
        }

        if ($page->user_id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden access'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'sections' => 'required|array',
            'sections.*' => 'required|integer|exists:page_sections,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid field',
                'errors' => $validator->errors()
            ], 422);
        }

        $sectionIds = $request->sections;
        $pageSections = PageSection::where('page_id', $page->id)
            ->whereIn('id', $sectionIds)
            ->count();

        if ($pageSections !== count($sectionIds)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid field',
                'errors' => [
                    'sections' => ['Some sections do not belong to this page.']
                ]
            ], 422);
        }

        foreach ($sectionIds as $position => $sectionId) {
            PageSection::where('id', $sectionId)
                ->where('page_id', $page->id)
                ->update(['position' => $position + 1]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Sections reordered successful'
        ], 200);
    }

}
