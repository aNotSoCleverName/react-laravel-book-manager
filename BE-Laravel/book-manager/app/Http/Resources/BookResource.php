<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookResource extends JsonResource
{
    public $isSuccessful;
    public $message;
    public $resource;

    public function __construct($isSuccessful, $message, $resource)
    {
        parent::__construct($resource);
        $this->isSuccessful = $isSuccessful;
        $this->message = $message;
    }
    
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // return parent::toArray($request);
        return [
            "isSuccessful" => $this->isSuccessful,
            "message" => $this->message,
            "data" => $this->resource,
        ];
    }
}
