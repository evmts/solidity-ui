// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IElement {
    function setInnerHTML(string memory html) external;
    function appendChild(address element) external;
    function removeChild(address element) external;
    function setAttribute(string memory name, string memory value) external;
    function value() external view returns (string memory);
}

interface IDocument {
    function getElementById(string memory id) external view returns (address);
    function createElement(string memory tagName) external returns (address);
    function querySelector(string memory selector) external view returns (address);
}


