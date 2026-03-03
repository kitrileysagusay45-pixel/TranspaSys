# TranspaSys Quick Start Guide

## First Time Setup (5 minutes)

### 1. Open Terminal/Command Prompt
Navigate to your project folder:
```bash
cd c:\xampp\htdocs\TranspaSys
```

### 2. Install PHP Dependencies
```bash
composer install
```

### 3. Migrate Database
```bash
php artisan migrate
```

### 4. Start Laravel Server
```bash
php artisan serve
```

### 5. Access Application
Open browser and go to: `http://localhost:8000`

## Creating First Admin User

### Option A: Via Interface
1. Go to `/register`
2. Create account with your email
3. Open MySQL and run:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Option B: Via Tinker
```bash
php artisan tinker

# Create user directly
$user = App\Models\User::create([
    'name' => 'Admin Name',
    'email' => 'admin@example.com',
    'password' => bcrypt('password123'),
    'role' => 'admin',
    'is_approved' => true
]);
exit
```

## Testing the System

### Admin Features to Test
1. ✅ Login as admin
2. ✅ Create a budget entry
3. ✅ Create an event
4. ✅ Post an announcement
5. ✅ View user management
6. ✅ Check chatbot logs

### User Features to Test
1. ✅ Register as new user
2. ✅ View budget transparency
3. ✅ Register for an event
4. ✅ Read announcements
5. ✅ Chat with bot (try: "How is the budget allocated?")

## Useful Commands

```bash
# View all routes
php artisan route:list

# Reset database (WARNING: deletes all data)
php artisan migrate:fresh

# Clear all caches
php artisan cache:clear
php artisan route:cache clear

# Interactive shell
php artisan tinker

# Run migrations with seed
php artisan migrate:fresh --seed
```

## Common Issues & Fixes

### ❌ "SQLSTATE[HY000]: General error"
**Fix:** Make sure MySQL is running in XAMPP

### ❌ "Class not found" error
**Fix:** Run `composer dump-autoload`

### ❌ "Route not found"
**Fix:** Run `php artisan route:cache clear`

### ❌ "Storage permission denied"
**Fix:** Run `php artisan storage:link`

## Default Login Credentials (After Setup)

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| Admin | admin@example.com | admin123 | /admin/dashboard |
| User | user@example.com | user123 | /user/dashboard |

(These are examples - use the credentials you created during registration)

## File Locations for Customization

| Feature | Location |
|---------|----------|
| Add admin feature | `app/Http/Controllers/Admin/` |
| Add user feature | `app/Http/Controllers/User/` |
| Edit chatbot responses | `app/Http/Controllers/User/UserChatbotController.php` |
| Create migrations | `database/migrations/` |
| Add views | `resources/views/` |
| Update routes | `routes/web.php` |
| Edit styling | `resources/views/layouts/app.blade.php` |

## Next Steps

1. **Add Sample Data**
   - Create 2-3 budgets
   - Create 2-3 events
   - Post 2-3 announcements

2. **Customize**
   - Update office hours in chatbot
   - Add your logo/branding
   - Customize email from name

3. **Deploy (Optional)**
   - Follow Laravel deployment guide
   - Set up proper domain
   - Enable HTTPS

## Support Resources

- Laravel Docs: https://laravel.com/docs/8.x
- Bootstrap Docs: https://getbootstrap.com/docs/5.0/
- Chart.js Docs: https://www.chartjs.org/docs/latest/

---

**Ready to go!** 🚀
