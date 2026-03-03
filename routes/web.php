<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminBudgetController;
use App\Http\Controllers\Admin\AdminEventController;
use App\Http\Controllers\Admin\AdminAnnouncementController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminChatbotController;
use App\Http\Controllers\User\UserDashboardController;
use App\Http\Controllers\User\UserBudgetController;
use App\Http\Controllers\User\UserEventController;
use App\Http\Controllers\User\UserAnnouncementController;
use App\Http\Controllers\User\UserChatbotController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;

/* |-------------------------------------------------------------------------- | Web Routes |-------------------------------------------------------------------------- | | Here is where you can register web routes for your application. These | routes are loaded by the RouteServiceProvider within a group which | contains the "web" middleware group. Now create something great! | */

Route::get('/', function () {
    if (auth()->check()) {
        return redirect(auth()->user()->isAdmin() ? '/admin/dashboard' : '/user/dashboard');
    }
    return redirect('/login');
});

// ========== AUTHENTICATION ROUTES ==========
Route::middleware('guest')->group(function () {
    Route::get('/register', [RegisterController::class , 'showRegisterForm'])->name('register');
    Route::post('/register', [RegisterController::class , 'register']);
    Route::get('/login', [LoginController::class , 'showLoginForm'])->name('login');
    Route::post('/login', [LoginController::class , 'login']);
});

Route::post('/logout', [LoginController::class , 'logout'])->middleware('auth')->name('logout');

// Authentication routes (default Laravel auth)
Route::middleware('auth')->group(function () {
    Route::middleware('redirect_role')->get('/dashboard', function () {
            return redirect(auth()->user()->isAdmin() ? '/admin/dashboard' : '/user/dashboard');
        }
        );
    });

// ========== ADMIN ROUTES ==========
Route::middleware(['auth', 'is_admin'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [AdminDashboardController::class , 'index'])->name('dashboard');

    // Budget Management
    Route::resource('budgets', AdminBudgetController::class);
    Route::get('budgets/{budget}/download', [AdminBudgetController::class , 'downloadReport'])->name('budgets.download');

    // Event Management
    Route::resource('events', AdminEventController::class);
    Route::get('events/{event}/participants', [AdminEventController::class , 'participants'])->name('events.participants');

    // Announcement Management
    Route::resource('announcements', AdminAnnouncementController::class);

    // User Management
    Route::prefix('users')->name('users.')->group(function () {
            Route::get('/', [AdminUserController::class , 'index'])->name('index');
            Route::post('{user}/approve', [AdminUserController::class , 'approve'])->name('approve');
            Route::post('{user}/deactivate', [AdminUserController::class , 'deactivate'])->name('deactivate');
            Route::post('{user}/assign-role', [AdminUserController::class , 'assignRole'])->name('assign-role');
        }
        );

        // Chatbot Monitoring
        Route::prefix('chatbot')->name('chatbot.')->group(function () {
            Route::get('/logs', [AdminChatbotController::class , 'logs'])->name('logs');
            Route::get('/logs/{category}', [AdminChatbotController::class , 'filterByCategory'])->name('logs.category');
        }
        );
    });

// ========== USER ROUTES ==========
Route::middleware(['auth', 'is_user'])->prefix('user')->name('user.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [UserDashboardController::class , 'index'])->name('dashboard');

    // Budget Transparency
    Route::prefix('budgets')->name('budgets.')->group(function () {
            Route::get('/', [UserBudgetController::class , 'index'])->name('index');
            Route::get('/{budget}', [UserBudgetController::class , 'show'])->name('show');
            Route::get('/filter', [UserBudgetController::class , 'filter'])->name('filter');
            Route::get('/{budget}/download', [UserBudgetController::class , 'downloadReport'])->name('download');
        }
        );

        // Event Participation
        Route::prefix('events')->name('events.')->group(function () {
            Route::get('/', [UserEventController::class , 'index'])->name('index');
            Route::get('/{event}', [UserEventController::class , 'show'])->name('show');
            Route::post('/{event}/register', [UserEventController::class , 'register'])->name('register');
            Route::post('/{event}/unregister', [UserEventController::class , 'unregister'])->name('unregister');
            Route::get('/my-events', [UserEventController::class , 'myEvents'])->name('my-events');
        }
        );

        // Announcements
        Route::prefix('announcements')->name('announcements.')->group(function () {
            Route::get('/', [UserAnnouncementController::class , 'index'])->name('index');
            Route::get('/{announcement}', [UserAnnouncementController::class , 'show'])->name('show');
        }
        );

        // Chatbot
        Route::prefix('chatbot')->name('chatbot.')->group(function () {
            Route::get('/', [UserChatbotController::class , 'index'])->name('index');
            Route::post('/chat', [UserChatbotController::class , 'chat'])->name('chat');
            Route::get('/history', [UserChatbotController::class , 'getHistory'])->name('history');
            Route::delete('/history', [UserChatbotController::class , 'clearHistory'])->name('clear');
        }
        );
    });
