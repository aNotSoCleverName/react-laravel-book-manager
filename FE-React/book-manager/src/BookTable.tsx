import { Dispatch, JSX, SetStateAction, useEffect, useState } from "react";
import { IBookFields } from "./MainPage";
import { Table } from "react-bootstrap";

import "./BookTable.css";

interface IBookTableProps
{
    url: string,
    setSelectedBook: Dispatch<SetStateAction<IBookFields | null>>,

    isLoading: boolean,
    searchResults: Array<IBookFields>,

    shownPage: number,
    itemsPerPage: number,
}

export function BookTable(props: IBookTableProps): JSX.Element
{
    const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1);

    useEffect(() =>{
        setSelectedRowIndex(-1);
        props.setSelectedBook(null);
    }, [props.searchResults]);

    return (
        <Table variant="dark" bordered>
            <thead>
                <tr className="align-middle">
                    <th className="col-1">#</th>
                    <th className="col-5">Title</th>
                    <th className="col-2">Author</th>
                    <th className="col-1">Publish Year</th>
                    <th className="col-4">Description</th>
                </tr>
            </thead>

            <tbody>
                {
                    props.isLoading ?
                    <GenerateRows rowCount={props.itemsPerPage} text="Loading..." /> :

                    props.searchResults.length <= 0 ?
                    <GenerateRows rowCount={props.itemsPerPage} text="No book found" /> :

                    <>
                        {
                            props.searchResults.map((book: IBookFields, index: number) =>
                                <tr key={index}
                                    className={index === selectedRowIndex ? "selected" : ""}
                                    onClick={() => {
                                        props.setSelectedBook(book);
                                        setSelectedRowIndex((prevSelectedRowIndex) =>
                                            prevSelectedRowIndex === index ?
                                            -1 :
                                            index
                                        );
                                    }}
                                >
                                    <td>
                                        {
                                            (props.shownPage-1)*props.itemsPerPage +
                                            index + 1
                                        }
                                    </td>
                                    <td>{book.title}</td>
                                    <td>{book.author}</td>
                                    <td>{book.publish_year}</td>
                                    <td>{book.description}</td>
                                </tr>
                            )
                        }

                        {/* Empty rows */}
                        {
                            Array.from({ length: props.itemsPerPage - props.searchResults.length }, (_, index) =>
                                <tr key={props.searchResults.length + index - 1}><td colSpan={99}>{"\u00A0"}</td></tr>
                            )
                        }
                    </>
                }
            </tbody>
        </Table>
    );
}

interface IGenerateRowsProps
{
    rowCount: number,
    text: string,
}
function GenerateRows(props: IGenerateRowsProps): JSX.Element
{
    return (
        props.rowCount < 1 ?
        <></> :
        <>
            {
                Array.from({ length: props.rowCount }, (_, index) =>
                    index === 0 ?
                    <tr key={index}><td colSpan={99}>{props.text}</td></tr> :
                    <tr key={index}><td colSpan={99}>{"\u00A0"}</td></tr>
                )
            }
        </>
    )
}