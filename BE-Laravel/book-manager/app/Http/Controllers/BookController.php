<?php

namespace App\Http\Controllers;

use App\Http\Resources\BookResource;
use Illuminate\Validation\ValidationException;
use App\Models\Book;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Exception;

class BookController extends Controller
{
    const PAGINITE_ITEM_PER_PAGE = 5;
    //
    // function index(): BookResource
    // {
    //     $books = Book::latest()->paginate(BookController::PAGINITE_ITEM_PER_PAGE);
    //     return new BookResource(true, "SUCCESS: Books retrieved", $books);
    //     // return new BookResource(true, "Books list", Book::all());
    // }

    function show(Request $request): BookResource
    {
        $books = Book::query();

        $generalCategories = ["title", "author", "description"];

        foreach($generalCategories as $generalCategory)
        {
            if (empty($request->input($generalCategory)))
                continue;

            $categoryValue = $request->input($generalCategory);
            $books->where($generalCategory, "LIKE", "%{$categoryValue}%");
        }

        //region Publish year
        $publishYearFilter = $request->input("publish_year");
        if (!empty($publishYearFilter))
        {
            preg_match("/^([A-Za-z]+|>|>=|<|<=)/", $publishYearFilter, $matches);
            $publishYearOperator = $matches[0];

            preg_match("/(\d+-\d+|\d+)/", $publishYearFilter, $matches);
            $publishYearWithoutOperator = $matches[0];

            preg_match("/(\d+)/", $publishYearWithoutOperator, $matches);
            $year1 = $matches[0];
            $year2 = $matches[1];

            if ($publishYearOperator === "Range")
            {
                $books->whereBetween("publish_year", [$year1, $year2]);
            }
            else
            {
                $books->where("publish_year", $publishYearOperator, $year1);
            }
        }
        //endregion

        $books = $books->latest()->paginate(BookController::PAGINITE_ITEM_PER_PAGE);
        return new BookResource(true, "Showing books", $books);
    }

    static function ValidateBook(Request $request): Array
    {
        return $request->validate([
            "title" => "required|string|max:255",
            "author" => "required|string|max:255",
            "publish_year" => "required|integer|min:0",
            "description" => "nullable|string",
        ]);
    }

    function store(Request $request): BookResource
    {
        try
        {
            $validatedData = BookController::ValidateBook($request);
        }
        catch(ValidationException $e)
        {
            return new BookResource(false, "FAIL: Book not added", null);
        }

        $newBook = Book::create($validatedData);

        return new BookResource(true, "SUCCESS: Book added", $newBook);
    }

    function update(Request $request, $id): BookResource
    {
        try
        {
            $updatedBook = Book::findOrFail($id);
            $validatedData = BookController::ValidateBook($request);
            $updatedBook->update($validatedData);
        }
        catch(Exception $err)
        {
            return new BookResource(false, "FAIL: Book not edited", null);
        }

        return new BookResource(true, "SUCCESS: Book edited", $updatedBook);
    }

    function destroy($id): BookResource
    {
        try
        {
            $deletedBook = Book::findOrFail($id);
        }
        catch(Exception $err)
        {
            return new BookResource(false, "FAIL: Book not deleted", null);
        }

        $deletedBook->deleteOrFail();

        return new BookResource(true, "SUCCESS: Book deleted", $deletedBook);
    }
}
