import { Dispatch, FocusEvent, JSX, RefObject, SetStateAction, useEffect, useRef } from "react";
import { Button, Form } from "react-bootstrap";

interface ITableNavigationButtonsProps
{
    shownPage: number,
    setShownPage: Dispatch<SetStateAction<number>>,

    lastPage: number,
}
export function TableNavigationButtons(props: ITableNavigationButtonsProps): JSX.Element
{
    const ref_Input: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const input: HTMLInputElement = ref_Input.current!;
        input.value = props.shownPage.toString();
    }, [props.shownPage]);

    function SetPage(e: FocusEvent<HTMLInputElement>): void
    {
        let inputValue: number = parseInt(e.currentTarget.value, 10);
        if (Number.isNaN(inputValue))
            return;

        inputValue = Math.max(0, inputValue);
        inputValue = Math.min(props.lastPage, inputValue);
        props.setShownPage(inputValue);
    }

    return (
        <div className="d-flex justify-content-center w-25">
            <Button className={props.shownPage === 1 ? "disabled" : ""}
                onClick={() => props.setShownPage((prevPage) => Math.max(1, prevPage-1))}
            >
                {"<"}
            </Button>

            <Form.Control ref={ref_Input} className="w-25 text-center p-0 mx-4"
                type="text" defaultValue={props.shownPage}
                onBlur={SetPage}
                onKeyUp={(e) => {
                    if (e.key !== "Enter")
                        return;

                    e.currentTarget.blur();
                }}
            />

            <Button className={props.shownPage === props.lastPage ? "disabled" : ""}
                onClick={() => props.setShownPage((prevPage) => Math.min(props.lastPage, prevPage+1))}
            >
                {">"}
            </Button>
        </div>
    );
}