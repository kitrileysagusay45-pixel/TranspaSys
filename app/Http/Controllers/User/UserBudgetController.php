<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use Illuminate\Http\Request;

class UserBudgetController extends Controller
{
    public function index()
    {
        $budgets = Budget::orderBy('year', 'desc')->paginate(15);
        $pageData = ['budgets' => $budgets];
        return view('layouts.app', compact('pageData'));
    }

    public function show(Budget $budget)
    {
        $pageData = ['budget' => $budget];
        return view('layouts.app', compact('pageData'));
    }

    public function filter(Request $request)
    {
        $query = Budget::query();

        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }

        if ($request->has('year') && $request->year) {
            $query->where('year', $request->year);
        }

        $budgets = $query->orderBy('year', 'desc')->paginate(15);
        $pageData = ['budgets' => $budgets];
        return view('layouts.app', compact('pageData'));
    }

    public function downloadReport(Budget $budget)
    {
        if (!$budget->file_path) {
            return redirect()->back()->with('error', 'No file available for download');
        }

        return \Storage::disk('public')->download($budget->file_path);
    }
}
