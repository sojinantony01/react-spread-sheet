import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../../../store";
import { addData } from "../../../reducer";
import { generateDummyContent } from "../../utils";
import Tools from "../tools";

test("Tools render", async () => {
    store.dispatch(addData(generateDummyContent(3, 3)));
    const changeStyle = jest.fn()
    render(
        <Provider store={store}>
            <Tools changeStyle={changeStyle} />
        </Provider>,
    );
    const bold = screen.getByRole("button", {
        name: /B/i,
    });
    expect(bold).toBeInTheDocument(); 
    fireEvent.click(bold);
    expect(changeStyle).toHaveBeenLastCalledWith("B");

    const italic = screen.getByRole("button", {
      name: /I/i,
    });
    expect(italic).toBeInTheDocument(); 
    fireEvent.click(italic);
    expect(changeStyle).toHaveBeenLastCalledWith("I");
    
    const underline = screen.getByRole("button", {
        name: /U/i,
    })
    fireEvent.click(underline);
    expect(changeStyle).toHaveBeenLastCalledWith("U");
    expect(underline).toBeInTheDocument();  
    
    const fontInput = screen.getByTestId("font-size-input");
    expect(fontInput).toBeInTheDocument(); 
    fireEvent.change(fontInput, { target: { value: "23" } });
    fireEvent.keyDown(fontInput);
    await waitFor(() => expect(changeStyle).toHaveBeenLastCalledWith("FONT", "23"));

    const left = screen.getByTestId("align-left");
    expect(left).toBeInTheDocument();
    fireEvent.click(left);
    expect(changeStyle).toHaveBeenLastCalledWith("ALIGN-LEFT");

    const center = screen.getByTestId("align-center");
    expect(center).toBeInTheDocument();
    fireEvent.click(center);
    expect(changeStyle).toHaveBeenLastCalledWith("ALIGN-CENTER");

    const right = screen.getByTestId("align-right");
    expect(right).toBeInTheDocument();
    fireEvent.click(right);
    expect(changeStyle).toHaveBeenLastCalledWith("ALIGN-RIGHT");

    const justify = screen.getByTestId("align-justify");
    expect(justify).toBeInTheDocument();
    fireEvent.click(justify);
    expect(changeStyle).toHaveBeenLastCalledWith("ALIGN-JUSTIFY");

    const color = screen.getByTestId("font-color");
    expect(color).toBeInTheDocument();
    fireEvent.change(color, { target: { value: "#ffffff" } });
    await waitFor(() => expect(changeStyle).toHaveBeenLastCalledWith("COLOR", "#ffffff"));

    const background = screen.getByTestId("background-color");
    expect(background).toBeInTheDocument();
    fireEvent.change(background, { target: { value: "#ffffff" } });
    await waitFor(() => expect(changeStyle).toHaveBeenLastCalledWith("BACKGROUND", "#ffffff"));

});

