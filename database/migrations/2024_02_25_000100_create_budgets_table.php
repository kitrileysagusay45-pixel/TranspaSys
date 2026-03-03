<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBudgetsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->string('category')->comment('Budget category');
            $table->decimal('allocated_amount', 15, 2);
            $table->decimal('spent_amount', 15, 2)->default(0);
            $table->year('year');
            $table->text('description')->nullable();
            $table->string('file_path')->nullable()->comment('Path to financial report');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('budgets');
    }
}
