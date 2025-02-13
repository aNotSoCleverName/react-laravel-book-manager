import { JSX, useEffect, useState } from 'react';
import { BookTable } from "./BookTable";
import { DataForm } from "./DataForm";
import { TableNavigationButtons } from "./TableNavigationButtons";

export const API_DOMAIN: string = "http://127.0.0.1:8000/api/";

export interface IBookFields
{
    id: number,
    title: string,
    author: string,
    publish_year: number,
    description: string,
}

export function MainPage(): JSX.Element
{
    const [url, setUrl] = useState<string>("");
    const [selectedBook, setSelectedBook] = useState<IBookFields | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchResults, setSearchResults] = useState<Array<IBookFields>>([]);

    const [shownPage, setShownPage] = useState<number>(1);
    const [lastPage, setLastPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(0);

    function RefreshData(): void
    {
        async function FetchData(): Promise<void>
        {
            try
            {
                const response: Response = await fetch(`${API_DOMAIN}books?page=${shownPage}&${url}`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                });
                const json = await response.json();
                const books: Array<IBookFields> = json.data.data;
                console.log(json.message);

                setSearchResults(books);
                setLastPage(json.data.last_page);
                setItemsPerPage(json.data.per_page);

                setIsLoading(false);
            }
            catch(e)
            {
                console.log(e);
            }
        }

        setIsLoading(true);
        FetchData();
    }

    useEffect(() => {
        RefreshData();
    }, [shownPage, url]);

    return (
        <div className="d-flex flex-column align-items-center w-100 h-100 p-5" style={{backgroundColor: "#1a1a1a"}}>
            <div className="d-flex flex-column align-items-center w-100 h-50">
                <BookTable url={url} setSelectedBook={setSelectedBook} isLoading={isLoading} searchResults={searchResults} shownPage={shownPage} itemsPerPage={itemsPerPage} />
                <TableNavigationButtons shownPage={shownPage} setShownPage={setShownPage} lastPage={lastPage} />
            </div>
            <DataForm setUrl={setUrl} selectedBook={selectedBook} setIsLoading={setIsLoading} setShownPage={setShownPage} refreshData={RefreshData} />
        </div>
    );
}