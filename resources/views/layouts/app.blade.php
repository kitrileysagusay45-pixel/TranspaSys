<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>TranspaSys</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <link rel="stylesheet" href="{{ mix('css/app.css') }}">
</head>
<body>
    <script>
        window.__APP__ = {
            user: @json(auth()->check() ? auth()->user() : null),
            flash: {
                success: @json(session('success')),
                error: @json(session('error'))
            },
            errors: @json($errors->toArray()),
            pageData: @json($pageData ?? []),
            csrfToken: "{{ csrf_token() }}"
        };
    </script>
    <div id="app"></div>
    <script src="{{ mix('js/app.js') }}"></script>
</body>
</html>
