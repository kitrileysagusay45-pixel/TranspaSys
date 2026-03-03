<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Budget;
use App\Models\Event;
use App\Models\Announcement;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // Create Admin User
        $admin = User::create([
            'name' => 'Barangay Admin',
            'email' => 'admin@transpasys.com',
            'password' => bcrypt('admin123'),
            'role' => 'admin',
            'is_approved' => true,
        ]);

        // Create Treasurer User
        $treasurer = User::create([
            'name' => 'Barangay Treasurer',
            'email' => 'treasurer@transpasys.com',
            'password' => bcrypt('treasurer123'),
            'role' => 'treasurer',
            'is_approved' => true,
        ]);

        // Create SK Official User
        $sk = User::create([
            'name' => 'SK Official',
            'email' => 'sk@transpasys.com',
            'password' => bcrypt('sk123'),
            'role' => 'sk',
            'is_approved' => true,
        ]);

        // Create Regular User
        $user = User::create([
            'name' => 'Juan Dela Cruz',
            'email' => 'user@transpasys.com',
            'password' => bcrypt('user123'),
            'role' => 'user',
            'is_approved' => true,
        ]);

        // Create sample budgets
        Budget::create([
            'category' => 'Education',
            'allocated_amount' => 500000,
            'spent_amount' => 350000,
            'year' => 2024,
            'description' => 'Budget allocation for educational programs and scholarships',
        ]);

        Budget::create([
            'category' => 'Infrastructure',
            'allocated_amount' => 1000000,
            'spent_amount' => 750000,
            'year' => 2024,
            'description' => 'Budget for road repairs and barangay facilities',
        ]);

        Budget::create([
            'category' => 'Health',
            'allocated_amount' => 300000,
            'spent_amount' => 200000,
            'year' => 2024,
            'description' => 'Health programs and medical assistance',
        ]);

        // Create sample events
        Event::create([
            'title' => 'Barangay Fiesta 2024',
            'description' => 'Annual celebration and community gathering to celebrate our barangay\'s cultural heritage and traditions.',
            'event_date' => now()->addDays(10)->setHour(8)->setMinute(0),
            'location' => 'Barangay Plaza',
            'max_participants' => 500,
            'status' => 'upcoming',
        ]);

        Event::create([
            'title' => 'Health and Wellness Program',
            'description' => 'Free health checkups and fitness activities organized by the barangay health office.',
            'event_date' => now()->addDays(7)->setHour(7)->setMinute(0),
            'location' => 'Barangay Health Center',
            'max_participants' => 100,
            'status' => 'upcoming',
        ]);

        Event::create([
            'title' => 'Youth Skills Development Workshop',
            'description' => 'Vocational training and skills enhancement program for youth, organized by the SK office.',
            'event_date' => now()->addDays(15)->setHour(9)->setMinute(0),
            'location' => 'Barangay Community Center',
            'max_participants' => 80,
            'status' => 'upcoming',
        ]);

        // Create sample announcements
        Announcement::create([
            'title' => 'Budget Transparency Report 2024',
            'content' => 'The barangay has released the first quarter budget report for 2024. All financial documents are now available for public review in the barangay office and online.',
            'created_by' => $admin->id,
            'is_published' => true,
            'published_at' => now(),
        ]);

        Announcement::create([
            'title' => 'Scheduled Maintenance of Water Systems',
            'content' => 'Dear residents, please be informed that the water system maintenance will be conducted on March 20-21, 2024. Water supply will be temporarily unavailable during this period.',
            'created_by' => $admin->id,
            'is_published' => true,
            'published_at' => now(),
        ]);

        Announcement::create([
            'title' => 'Call for Scholarship Applicants',
            'content' => 'The barangay is now accepting applications for educational scholarships for deserving students. Application deadline is March 31, 2024. Visit the barangay office for requirements and application forms.',
            'created_by' => $admin->id,
            'is_published' => true,
            'published_at' => now(),
        ]);
    }
}
