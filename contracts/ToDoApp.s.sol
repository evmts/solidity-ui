// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IDocument, IElement} from "./Dom.sol";

contract ToDoApp {
    IDocument private document;

    constructor(IDocument _document) {
        document = _document;
    }

    function run() public {
        // Grab body element and initialize the HTML
        address body = document.querySelector("body");
        string memory htmlString = string(abi.encodePacked(
            "<h1>Simple To-Do List</h1>",
            "<input type='text' id='new-task' placeholder='Add a new task'>",
            "<button onclick='addTask()'>Add</button>",
            "<ul id='task-list'></ul>"
        ));
        IElement(body).setInnerHTML(htmlString);
    }

    function addTask() public {
        // Get the input element and its value
        address inputElement = document.getElementById("new-task");
        string memory taskText = IElement(inputElement).value();

        if (bytes(taskText).length > 0) {
            // Create a new list item element
            address liElement = document.createElement("li");
            IElement(liElement).setInnerHTML(taskText);
            IElement(liElement).setAttribute("onclick", "removeTask(this)");
 e 
            // Append the list item to the unordered list
            address ulElement = document.getElementById("task-list");
            IElement(ulElement).appendChild(liElement);

            // Clear the input field
            IElement(inputElement).setAttribute("value", "");
        }
    }

    function removeTask(address liElement) public {
        address ulElement = document.getElementById("task-list");
        IElement(ulElement).removeChild(liElement);
    }
}

