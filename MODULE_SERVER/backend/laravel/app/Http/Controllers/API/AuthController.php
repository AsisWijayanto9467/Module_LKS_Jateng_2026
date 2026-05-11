<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function Register(Request $request) {
        try {
            $validator = Validator::make($request->all(), [
                "name" => "required|string",
                "email"=> "required|email|unique:users,email",
                "password" => "required|min:6"
            ]);

            if($validator->fails()) {
                return response()->json([
                    "status" => "error",
                    "message" => "Invalid field",
                    "errors" => $validator->errors()
                ], 422);
            }

            $user = User::create([
                "name" => $request->name,
                "email" => $request->email,
                "password" => Hash::make($request->password),
            ]);

            $token = $user->createToken($request->email . "_Token")->plainTextToken;

            return response()->json([
                "status"=> "success",
                "message" => "Registration successful",
                "data" => [
                    "id" => $user->id,
                    "name" => $user->name,
                    "email" => $user->email,
                    "created_at" => $user->created_at,
                    "updated_at" => $user->updated_at,
                    "token" => $token
                ]
            ], 201);
        } catch (\Throwable $th) {
            Log::error("Tidak bisa melakukan register" . $th->getMessage());
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function Login(Request $request) {
        try {
            $validator = Validator::make($request->all(), [
                "email"=> "required",
                "password" => "required"
            ]);

            if($validator->fails()) {
                return response()->json([
                    "status" => "error",
                    "message" => "Invalid field",
                    "errors" => $validator->errors()
                ], 422);
            }

            $user = User::where("email", $request->email)->first();

            if(!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    "message"=> "Username or password incorrect"
                ], 401);
            }

            $token = $user->createToken($request->email . "_Token")->plainTextToken;

            return response()->json([
                "status"=> "success",
                "message" => "Login successful",
                "data" => [
                    "id" => $user->id,
                    "name" => $user->name,
                    "email" => $user->email,
                    "created_at" => $user->created_at,
                    "updated_at" => $user->updated_at,
                    "token" => $token
                ]
            ], 201);
        } catch (\Throwable $th) {
            Log::error("Tidak bisa melakukan login" . $th->getMessage());
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }

    public function Logout(Request $request) {
        try {
            $user = $request->user();

            if(!$user) {
                return response()->json([
                    "status" => "error",
                    "message" => "Unauthenticated."
                ], 401);
            }

            $user->currentAccessToken()->delete();

            return response()->json([
                "status" => "success",
                "message" => "Logout successful"
            ], 200);
        } catch (\Throwable $th) {
            Log::error("Tidak bisa melakukan logout" . $th->getMessage());
            return response()->json([
                "message" => "Server Error",
                "errors" => $th->getMessage()
            ], 500);
        }
    }
}
