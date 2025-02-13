import React, { useEffect } from "react";
import { Dispatch, JSX, SetStateAction, useState } from "react";
import { Button, Col, Form, Row, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { API_DOMAIN, IBookFields } from "./MainPage";

enum FormMode
{
    Search = "Search",
    Add = "Add",
    EditDelete = "Edit & Delete",
}

//#region DataForm
interface IDataFormProps
{
    setUrl: Dispatch<SetStateAction<string>>,
    selectedBook: IBookFields | null,
    refreshData: () => void,

    setIsLoading: Dispatch<SetStateAction<boolean>>,
    setShownPage: Dispatch<SetStateAction<number>>,
}
export function DataForm(props: IDataFormProps): JSX.Element
{
   const [formMode, setFormMode] = useState<FormMode>(FormMode.Search);

    return (
        <div className="w-75 h-50 p-3 mt-auto bg-dark text-white border rounded-3">
            <ToggleButtonGroup name="formMode" type="radio">
                {
                    Object.values(FormMode).map((mode) => 
                        <ToggleButton key={mode} name={mode} id={mode} value={mode} variant="outline-primary"
                            defaultChecked={mode === formMode} active={mode === formMode}
                            onClick={() => setFormMode(mode)}
                        >
                            {mode}
                        </ToggleButton>
                    )
                }
            </ToggleButtonGroup>
            <br/>
            <br/>
            {
                formMode === FormMode.EditDelete && !props.selectedBook ?
                <div>Select a book in the table to be edited/deleted</div> :
                <DataInput dataFormProps={props} formMode={formMode} />
            }
        </div>
    );
}
//#endregion

//#region DataInput
interface IDataInputProps
{
    dataFormProps: IDataFormProps,
    formMode: FormMode,
}
function DataInput(props: IDataInputProps): JSX.Element
{
    const [title, setTitle] = useState<string>("");
    const [author, setAuthor] = useState<string>("");
    const [yearUrl, setYearUrl] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    //#region Functions
    async function Filter(): Promise<void>
    {
        let filterUrl: string = `
            title=${title}&
            author=${author}&
            publish_year=${yearUrl}&
            description=${description}
        `;
        filterUrl = filterUrl.replace(/\s/g, "");

        props.dataFormProps.setUrl(filterUrl);
        props.dataFormProps.setShownPage(1);
    }

    async function Add(): Promise<void>
    {
        const newBook: IBookFields =
        {
            id: -1,
            title: title,
            author: author,
            publish_year: Number.parseInt(yearUrl, 10),
            description: description,
        }

        const response: Response = await fetch(`${API_DOMAIN}books`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(newBook),
        });
        const json = await response.json();
        console.log(json.message);

        if (json.isSuccessful)
        {
            props.dataFormProps.refreshData();
        }
        else
        {
            alert(json.message);
        }
    }

    async function Edit(): Promise<void>
    {
        const updatedBook: IBookFields =
        {
            id: props.dataFormProps.selectedBook!.id,
            title: title,
            author: author,
            publish_year: Number.parseInt(yearUrl, 10),
            description: description,
        }

        const response: Response = await fetch(`${API_DOMAIN}books/${updatedBook.id}`, {
            method: "PUT",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedBook),
        });
        const json = await response.json();
        console.log(json.message);

        if (json.isSuccessful)
        {
            props.dataFormProps.refreshData();
        }
        else
        {
            alert(json.message);
        }
    }

    async function Delete(): Promise<void>
    {
        const response: Response = await fetch(`${API_DOMAIN}books/${props.dataFormProps.selectedBook!.id}`, {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
        const json = await response.json();
        console.log(json);

        if (json.isSuccessful)
        {
            props.dataFormProps.refreshData();
        }
        else
        {
            alert(json.message);
        }
    }
    //#endregion

    // Write selected book data in form
    useEffect(() => {
        if (props.formMode !== FormMode.EditDelete)
            return;

        if (!props.dataFormProps.selectedBook)
            return;

        const selectedBook: IBookFields = props.dataFormProps.selectedBook;
        setTitle(selectedBook.title);
        setAuthor(selectedBook.author);
        setDescription(selectedBook.description);
    }, [props.formMode, props.dataFormProps.selectedBook]);

    const isSearching: boolean = props.formMode === FormMode.Search;
    const isTitleFilled: boolean = title.length > 0;
    const isAuthorFilled: boolean = author.length > 0;

    return (
        <Form className="w-100 h-100 text-end">
            {/* Title */}
            <Form.Group as={Row}>
                <Form.Label column>Title:</Form.Label>
                <Col className="position-relative" sm="10">
                    <Form.Control type="text" value={title ?? ""}
                        onChange={(e) => setTitle(e.currentTarget.value)}
                    />
                    <div className={`text-danger position-absolute ${isSearching || isTitleFilled ? "d-none" : ""}`}>*Minimum 1 character</div>
                </Col>
            </Form.Group>
            <br />

            {/* Author */}
            <Form.Group as={Row}>
                <Form.Label column>Author:</Form.Label>
                <Col className="position-relative" sm="10">
                    <Form.Control type="text" value={author ?? ""}
                        onChange={(e) => setAuthor(e.currentTarget.value)}
                    />
                    <div className={`text-danger position-absolute ${isSearching || isAuthorFilled ? "d-none" : ""}`}>*Minimum 1 character</div>
                </Col>
            </Form.Group>
            <br />

            {/* Year */}
            <YearInput dataInputProps={props} setYearUrl={setYearUrl} />
            <br />

            {/* Description */}
            <Form.Group as={Row}>
                <Form.Label column>Description:</Form.Label>
                <Col sm="10">
                    <Form.Control type="text" value={description ?? ""}
                        onChange={(e) => setDescription(e.currentTarget.value)}
                    />
                </Col>
            </Form.Group>
            <br />

            <div className="d-flex">
                <Button
                    onClick={() => {
                        setTitle("");
                        setAuthor("");
                        setDescription("");
                    }}
                >
                    Clear
                </Button>

                {
                    props.formMode === FormMode.Search ?
                    <Button className="ms-auto" variant="primary" onClick={Filter}>Search</Button> :
                    props.formMode === FormMode.Add ?
                    <Button className={`ms-auto ${!isTitleFilled || !isAuthorFilled ? "disabled" : ""}`} variant="primary" onClick={Add}>Add</Button> :
                    props.formMode === FormMode.EditDelete ?
                    <>
                        <Button className={`ms-auto me-2 ${!isTitleFilled || !isAuthorFilled ? "disabled" : ""}`} variant="primary" onClick={Edit}>Edit</Button>
                        <Button variant="danger" onClick={Delete}>Delete</Button>
                    </> :
                    null
                }
            </div>
        </Form>
    );
}
//#endregion

//#region YearInput
enum YearOperator
{
    Range = "Range",
    Equal = "=",
    GreaterThan = ">",
    GreaterThanOrEqualTo = ">=",
    LessThan = "<",
    LessThanOrEqualTo = "<=",
}

interface IYearInputProps
{
    dataInputProps: IDataInputProps,
    setYearUrl: Dispatch<SetStateAction<string>>,
}

function YearInput(props: IYearInputProps): JSX.Element
{
    const THIS_YEAR: number = new Date().getFullYear();

    const [publishYearOperator, setPublishYearOperator] = useState<YearOperator>(YearOperator.Range);
    const [publishYearStart, setPublishYearStart] = useState<number>(0);
    const [publishYearEnd, setPublishYearEnd] = useState<number>(THIS_YEAR);

    const isSearching: boolean = props.dataInputProps.formMode === FormMode.Search;

    const isOperatorRange: boolean = publishYearOperator === YearOperator.Range;

    function SetYearUrl(inOperator?: YearOperator, inYearStart?: number, inYearEnd?: number): void
    {
        const newOperator: YearOperator = inOperator ?? publishYearOperator;
        const newYearStart: number = inYearStart ?? publishYearStart;
        const newYearEnd: number = inYearEnd ?? publishYearEnd;

        let publishYear: string = `
            ${isSearching ? newOperator : ""}
            ${newYearStart}
            ${isSearching && isOperatorRange ? "-" + newYearEnd : ""}
        `

        publishYear = publishYear.trim().replace("/\s/g", "");
        props.setYearUrl(publishYear);
    }

    // Write selected book data in form
    useEffect(() => {
        if (props.dataInputProps.formMode !== FormMode.EditDelete)
            return;

        const selectedBook: IBookFields | null = props.dataInputProps.dataFormProps.selectedBook;
        if (!selectedBook)
            return;

        setPublishYearStart(selectedBook.publish_year);
    }, [props.dataInputProps.formMode, props.dataInputProps.dataFormProps.selectedBook]);

    useEffect(() => {
        SetYearUrl();
    }, [props.dataInputProps.formMode]);

    return (
        <Form.Group as={Row}>
            <Form.Label column>Publish Year:</Form.Label>

            {/* Operator */}
            {
                !isSearching ?
                null :
                <Col sm="3">
                    <Form.Select onChange={(e) => {
                            const newYearOperator: YearOperator = e.currentTarget.value as YearOperator;
                            setPublishYearOperator(newYearOperator);
                            SetYearUrl(newYearOperator, publishYearStart, publishYearEnd);
                        }}>
                        {
                            Object.values(YearOperator).map((operator) =>
                                <option key={operator} value={operator}>{operator}</option>
                            )
                        }
                    </Form.Select>
                </Col>
            }

            {/* Start */}
            <Col sm={
                    !isSearching ?
                    "10" :
                    isOperatorRange ? "3" : "7"
                }
            >
                <Form.Control type="number" defaultValue={publishYearStart} min={0} max={publishYearEnd}
                    onChange={(e) => {
                        const newYearStart: number = parseInt(e.currentTarget.value, 10);
                        setPublishYearStart(newYearStart);
                        SetYearUrl(publishYearOperator, newYearStart, publishYearEnd);
                    }} 
                />
            </Col>

            {/* End */}
            {
                !isSearching || !isOperatorRange ?
                null :
                <React.Fragment>
                    <Col sm="1" className="d-flex justify-content-center align-items-center">
                        <Form.Label>-</Form.Label>
                    </Col>
                    <Col sm="3">
                        <Form.Control type="number" defaultValue={publishYearEnd} min={publishYearStart} max={THIS_YEAR}
                            onChange={(e) => {
                                const newYearEnd: number = parseInt(e.currentTarget.value, 10);
                                setPublishYearEnd(newYearEnd);
                                SetYearUrl(publishYearOperator, publishYearStart, newYearEnd);
                            }}
                        />
                    </Col>
                </React.Fragment>
            }
        </Form.Group>
    );
}
//#endregion