<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\Activity;
use Illuminate\Http\Request;

class AdminBudgetController extends Controller
{
    public function index()
    {
        $budgets = Budget::orderBy('year', 'desc')->paginate(15);
        $pageData = ['budgets' => $budgets];
        return view('layouts.app', compact('pageData'));
    }

    public function create()
    {
        return view('layouts.app', ['pageData' => []]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:255',
            'allocated_amount' => 'required|numeric|min:0',
            'spent_amount' => 'required|numeric|min:0',
            'year' => 'required|integer|min:2020',
            'description' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,jpg,png,xlsx|max:5120',
        ]);

        if ($request->hasFile('file')) {
            $validated['file_path'] = $request->file('file')->store('budgets', 'public');
        }

        Budget::create($validated);
        Activity::logActivity(auth()->id(), 'Created new budget', 'budget_created', $validated['category']);

        return redirect()->route('admin.budgets.index')->with('success', 'Budget created successfully');
    }

    public function edit(Budget $budget)
    {
        $pageData = ['budget' => $budget];
        return view('layouts.app', compact('pageData'));
    }

    public function update(Request $request, Budget $budget)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:255',
            'allocated_amount' => 'required|numeric|min:0',
            'spent_amount' => 'required|numeric|min:0',
            'year' => 'required|integer|min:2020',
            'description' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,jpg,png,xlsx|max:5120',
        ]);

        if ($request->hasFile('file')) {
            if ($budget->file_path) {
                \Storage::disk('public')->delete($budget->file_path);
            }
            $validated['file_path'] = $request->file('file')->store('budgets', 'public');
        }

        $budget->update($validated);
        Activity::logActivity(auth()->id(), 'Updated budget', 'budget_updated', $budget->category);

        return redirect()->route('admin.budgets.index')->with('success', 'Budget updated successfully');
    }

    public function destroy(Budget $budget)
    {
        if ($budget->file_path) {
            \Storage::disk('public')->delete($budget->file_path);
        }

        Activity::logActivity(auth()->id(), 'Deleted budget', 'budget_deleted', $budget->category);
        $budget->delete();

        return redirect()->route('admin.budgets.index')->with('success', 'Budget deleted successfully');
    }

    public function downloadReport(Budget $budget)
    {
        if (!$budget->file_path) {
            return redirect()->back()->with('error', 'No file available for download');
        }

        return \Storage::disk('public')->download($budget->file_path);
    }
}
