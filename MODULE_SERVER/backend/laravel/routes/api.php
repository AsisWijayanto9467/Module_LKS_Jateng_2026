<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\PageManagementController;
use App\Http\Controllers\API\SectionManageController;
use App\Http\Controllers\API\TemplateController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post("/register", [AuthController::class, "Register"]);
Route::post("/login", [AuthController::class, "Login"]);

Route::middleware("auth:sanctum")->group(function() {
    Route::post("/logout", [AuthController::class,"logout"]);
    Route::prefix("pages")->group(function() {
        Route::post('', [PageManagementController::class, 'createPage']);
        Route::get('', [PageManagementController::class, 'getAllPages']);
        Route::get('/{id}', [PageManagementController::class, 'getById']);
        Route::put('/{slug}', [PageManagementController::class, 'updatePage']);
        Route::delete('/{slug}', [PageManagementController::class, 'deletePage']);

        // Page Section
        Route::post("/{slug}/sections", [SectionManageController::class,"addSectionPage"]);
        Route::delete("/{slug}/sections/{sectionId}", [SectionManageController::class,"deleteSection"]);
        Route::put('/{slug}/sections/{sectionId}/fields', [SectionManageController::class, 'updateFields']);
        Route::put('/{slug}/sections/reorder', [SectionManageController::class, 'reorder']);
    });

    Route::prefix("templates")->group(function() {
        Route::get("/", [TemplateController::class,"getAllTemplate"]);
        Route::get("/{slug}", [TemplateController::class,"getTemplateBySlug"]);
    });
});

