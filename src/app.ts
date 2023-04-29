// This app was developed using the OOP paradigm.

/**
 * We MUST use/add the .js extension at the end of the name of the files
 * we're importing, because that's what it'll be in the end when TS is
 * transpiled and without it we'll get errors.
 */ 
import { ProjectInput } from "./components/project-input.js";
import { ProjectList } from "./components/project-list.js";

// Rendering components to the screen.
new ProjectInput();
new ProjectList("active");
new ProjectList("finished");
