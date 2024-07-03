import { ToDoApp } from "../contracts/ToDoApp.s.sol";
import { mountApp } from "./mountApp";

mountApp(ToDoApp.bytecode);
