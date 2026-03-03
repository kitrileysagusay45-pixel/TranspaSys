# TranspaSys - Transparency System

A comprehensive Laravel-based transparency system for barangay administration with separate admin and user interfaces.

## Features

### Admin Dashboard
- **Dashboard Overview**: Total budget summary, events, registered users, and recent activities
- **Budget Management**: Create, edit, delete budgets, upload financial reports, view allocation vs spent
- **Event Management**: Create, update, cancel/delete events, view participants, change status
- **Announcement Management**: Post, edit, and delete announcements
- **User Management**: View registered residents, approve/deactivate accounts, assign roles
- **Chatbot Monitoring**: View chatbot conversation logs and monitor user interactions

### User Dashboard  
- **Dashboard**: Latest announcements, upcoming events, budget transparency quick access
- **Budget Transparency**: View yearly budget, expenses, download financial reports, filter by category/year
- **Event Participation**: View, register, and manage event registrations
- **Announcements**: Read barangay announcements and updates
- **AI Chatbot**: Ask questions about budget, events, office hours, contact info, and SK programs

## System Architecture

### Roles
- **Admin**: Full system access and management
- **Treasurer**: Budget and financial oversight
- **SK Officials**: Event and youth program management
- **Users**: Public access and event participation

### Technology Stack
- **Backend**: Laravel 8
- **Database**: MySQL
- **Frontend**: Bootstrap 5 with Chart.js
- **Authentication**: Laravel Blade templates with session-based auth

## Installation & Setup

### Prerequisites
- PHP 7.3+ or 8.0+
- MySQL 5.7+
- Composer
- XAMPP or similar local server

### Steps

1. **Clone/Navigate to Project**
   ```bash
   cd c:\xampp\htdocs\TranspaSys
   ```

2. **Install Dependencies**
   ```bash
   composer install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env` (already done)
   - Update `.env` with your database credentials:
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=Sagusay
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. **Generate Application Key**
   ```bash
   php artisan key:generate
   ```

5. **Run Database Migrations**
   ```bash
   php artisan migrate
   ```

6. **Create Admin User (Optional)**
   Create a user via registration, then update role manually:
   ```php
   // Use tinker
   php artisan tinker
   
   // Find your user and update
   $user = App\Models\User::where('email', 'your-email@example.com')->first();
   $user->role = 'admin';
   $user->save();
   ```

7. **Serve the Application**
   ```bash
   php artisan serve
   ```
   Then navigate to `http://localhost:8000`

## Usage

### User Registration & Login
1. Go to `/register` to create a new account
2. Automatically assigned "user" role
3. Login with credentials at `/login`
4. Redirected to appropriate dashboard based on role

### Admin Features
1. Access `/admin/dashboard`
2. Manage budgets, events, users, announcements
3. View chatbot logs and analytics

### User Features
1. Access `/user/dashboard`
2. View budget transparency with charts
3. Register for events
4. Read announcements
5. Chat with AI chatbot for information

## Key Routes

### Authentication
- `GET /login` - Login page
- `POST /login` - Submit login
- `GET /register` - Register page
- `POST /register` - Submit registration
- `POST /logout` - Logout

### Admin Routes
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/budgets` - Budget management
- `GET /admin/events` - Event management
- `GET /admin/announcements` - Announcement management
- `GET /admin/users` - User management
- `GET /admin/chatbot/logs` - Chatbot logs

### User Routes
- `GET /user/dashboard` - User home
- `GET /user/budgets` - Budget transparency
- `GET /user/events` - View events
- `GET /user/announcements` - Read announcements
- `GET /user/chatbot` - Chat interface

## Database Structure

### Tables Created
- `users` - User accounts with roles (admin, user, sk, treasurer)
- `budgets` - Budget allocations and spending
- `events` - Barangay events
- `event_participants` - Event registrations
- `announcements` - Barangay announcements
- `chatbot_conversations` - Chat logs
- `activities` - System activity logs

## Security Features

1. **Role-Based Access Control (RBAC)**
   - Middleware enforces user roles
   - Admin routes protected with `is_admin` middleware
   - User routes protected with `is_user` middleware

2. **Authentication**
   - Session-based authentication
   - CSRF token protection
   - Password hashing with Laravel's Hash class

3. **Authorization**
   - Role-based dashboard redirection
   - View-level access control
   - Activity logging for auditing

## Customization

### Add New Admin Feature
1. Create migration for new table
2. Create model in `app/Models/`
3. Create controller in `app/Http/Controllers/Admin/`
4. Add routes in `routes/web.php` under admin group
5. Create views in `resources/views/admin/`

### Customize Chatbot Responses
Edit `app/Http/Controllers/User/UserChatbotController.php` and update the `$faqResponses` array with your custom questions and answers.

### Modify Styling
- Main stylesheet is in `resources/views/layouts/app.blade.php`
- Uses Bootstrap 5 classes
- Customize color scheme by updating CSS variables in `:root`

## Troubleshooting

### "SQLSTATE errors" when running migrations
- Ensure MySQL is running
- Check database credentials in `.env`
- Run `php artisan migrate:fresh` to reset (⚠️ deletes data)

### "Route not found" errors
- Run `php artisan route:cache clear`
- Verify routes in `routes/web.php`

### Middleware not working
- Ensure middleware is registered in `app/Http/Kernel.php`
- Check middleware logic in `app/Http/Middleware/`

## File Structure
```
TranspaSys/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/
│   │   │   ├── User/
│   │   │   └── Auth/
│   │   ├── Middleware/
│   │   └── Kernel.php
│   └── Models/
├── database/
│   └── migrations/
├── resources/
│   └── views/
│       ├── layouts/
│       ├── admin/
│       ├── user/
│       └── auth/
├── routes/
│   └── web.php
└── public/
```

## Support

For issues or questions:
1. Check Laravel documentation: https://laravel.com/docs/8.x
2. Review application logs: `storage/logs/laravel.log`
3. Use Laravel Tinker for debugging: `php artisan tinker`

## License

MIT License - See LICENSE file for details

## Notes for Defense

### Security Highlights
- ✅ Role-based access control with middleware
- ✅ User authentication with session management
- ✅ Activity logging for audit trails
- ✅ CSRF protection on all forms
- ✅ Password hashing with Laravel's Hash

### Transparency Features
- ✅ Complete budget visibility
- ✅ Event participation tracking
- ✅ Announcement management
- ✅ AI chatbot for public inquiries
- ✅ Activity logs for accountability

### Professional UI/UX
- ✅ Responsive Bootstrap design
- ✅ Dark sidebar for admin panel
- ✅ Analytics charts with Chart.js
- ✅ Intuitive navigation
- ✅ Form validation and error handling

---

**TranspaSys v1.0** - Built with Laravel 8 and Bootstrap 5
