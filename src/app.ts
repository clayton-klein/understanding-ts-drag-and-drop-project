// This app was developed using the OOP paradigm.

/**
 * We MUST use/add the .js extension at the end of the name of the files
 * we're importing, because that's what it'll be in the end when TS is
 * transpiled and without it we'll get errors (we just removed them later
 * because we installed webpack and then having the extensions would be a 
 * problem).
 */
import { ProjectInput } from "./components/project-input";
import { ProjectList } from "./components/project-list";

// Rendering components to the screen.
new ProjectInput();
new ProjectList("active");
new ProjectList("finished");
