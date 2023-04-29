/**
 * We MUST use/add the .js extension at the end of the name of the files
 * we're importing, because that's what it'll be in the end when TS is
 * transpiled and without it we'll get errors.
 */ 

/**
 * Since this is importing a "default" export, we can name it whatever we
 * want, differently from "named" exports where we need to import what we
 * need with the exact same names they were created.
 */
import BaseComponent from "./base-component.js";

/**
 * A different sintax for importing (* = all, it'll import everything that
 * is being exported from the file) and the alias "as" can be named 
 * whatever we want, it'll be like an object and then we can access
 * the imported items from inside of it using dot notation.
 * 
 * Aliases are also useful to rename imports and avoid name clashes. 
 */ 
import * as Validation from "../util/validation.js";

import { AutoBind } from "../decorators/autobind.js";
import { projectState } from "../state/project-state.js";

export class ProjectInput extends BaseComponent<
  HTMLDivElement,
  HTMLFormElement
> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLTextAreaElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");

    this.titleInputElement = this.htmlElement.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.htmlElement.querySelector(
      "#description"
    ) as HTMLTextAreaElement;
    this.peopleInputElement = this.htmlElement.querySelector(
      "#people"
    ) as HTMLInputElement;

    // Add listener to submit btn.
    this.configure();
  }

  configure() {
    /**
     * Binding the "this" keyword to this method that is called inside
     * of the class and not to the HTML Element itself (which would be
     * the default) to avoid error.
     *
     * We could have used the AutoBind decorator here, but we'll keep
     * it this way as an example.
     */
    this.htmlElement.addEventListener("submit", this.handleSubmit.bind(this));
  }

  // Added just to satisfy the signature of our ComponentBase class.
  renderContent(): void {}

  private getUserInput(): [string, string, number] | void {
    // Getting inputs' values.
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    // Creating objects to validate.
    const titleValidatable: Validation.Validatable = {
      value: enteredTitle,
      required: true,
    };

    const descriptionValidatable: Validation.Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 2,
      maxLength: 280,
    };

    const peopleValidatable: Validation.Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5,
    };

    // Checking inputs.
    if (
      !Validation.validate(titleValidatable) ||
      !Validation.validate(descriptionValidatable) ||
      !Validation.validate(peopleValidatable)
    ) {
      alert("Invalid input, please try again!");
      return; // Return "void" if any input is invalid.
    } else {
      // Return the "tuple" if everything is ok.
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  private clearInputs(): void {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  // Binding the "this" keyword (see line)
  @AutoBind
  // Validate inputs.
  private handleSubmit(e: Event) {
    // Prevent page from refreshing after clicking the btn.
    e.preventDefault();

    const userInput = this.getUserInput();

    // The "tuple" later in JS will be an ordinary array.
    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;

      // Adding project in the global state.
      projectState.addProject(title, description, people);
      this.clearInputs();
    }
  }
}
