// This app was developed using the OOP paradigm.

// AutoBind Method Decorator
/**
 * Since we're not using the first (target) and second (name) params
 * in this case, then we can ignore them in TS using the "special
 * undescore variable" (it means we're aware we're not going to use
 * these 2 params, but we need to accept them as "placeholders"
 * because we'll need the third param after them and we need to follow
 * the decorator signature) to avoid errors depending on our tsconfig
 * file.
 */
function AutoBind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };

  return adjustedDescriptor;
}

// Inputs validation
interface Validatable {
  // apart from "value" the other props are optional
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(obj: Validatable) {
  let isValid = true;

  if (obj.required) {
    isValid = isValid && obj.value.toString().trim().length !== 0;
  }

  if (obj.minLength != null && typeof obj.value === "string") {
    isValid = isValid && obj.value.length >= obj.minLength;
  }

  if (obj.maxLength != null && typeof obj.value === "string") {
    isValid = isValid && obj.value.length <= obj.maxLength;
  }

  if (obj.min != null && typeof obj.value === "number") {
    isValid = isValid && obj.value >= obj.min;
  }

  if (obj.max != null && typeof obj.value === "number") {
    isValid = isValid && obj.value <= obj.max;
  }

  return isValid;
}

//=================== ProjectItem Class ===================
class ProjectItem {}

//=================== ProjectList Class ===================
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  sectionElement: HTMLElement; // there's no "section" element type

  constructor(private type: "active" | "finished") {
    // literal union types
    this.templateElement = document.getElementById(
      "project-list"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    // Getting access to the content inside the template element.
    const importedContent = document.importNode(
      this.templateElement.content,
      true
    );

    // Getting access to the section element.
    this.sectionElement = importedContent.firstElementChild as HTMLElement;

    // Dynamically adding id to the section
    this.sectionElement.id = `${this.type}-projects`;

    // Render form
    this.attach();

    this.renderSectionContent();
  }

  private renderSectionContent() {
    // Adding id to the list
    const listId = `${this.type}-projects-list`;
    this.sectionElement.querySelector("ul")!.id = listId;

    // Adding h2 text
    this.sectionElement.querySelector(
      "h2"
    )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  // Render section
  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.sectionElement);
  }
}

//=================== ProjectInput Class ==================
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  formElement: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLTextAreaElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    /**
     * Using "!" non-null assertion operator after the selection of the elements to
     * inform TS they won't return null or undefined (since they are hard coded in
     * the HTML file), if we were not sure about it we should check it first with an
     * if statement and add a fallback for example.
     *
     * We're also using type casting to informe TS the type of the HTML elements we
     * are storing in the variables to avoid errors, because "getElementById" doesn't
     * know what type they are.
     */
    this.templateElement = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    // Getting access to the content inside the template element.
    const importedContent = document.importNode(
      this.templateElement.content,
      true
    );

    // Getting access to the form element.
    this.formElement = importedContent.firstElementChild as HTMLFormElement;
    this.formElement.id = "user-input";

    this.titleInputElement = this.formElement.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.formElement.querySelector(
      "#description"
    ) as HTMLTextAreaElement;
    this.peopleInputElement = this.formElement.querySelector(
      "#people"
    ) as HTMLInputElement;

    // Add listener to submit btn
    this.configure();

    // Add content when instantiate.
    this.attach();
  }

  // Render form
  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.formElement);
  }

  private configure() {
    /**
     * Binding the "this" keyword to this method that is called inside
     * of the class and not to the HTML Element itself (which would be
     * the default) to avoid error.
     *
     * We could have used the AutoBind decorator here, but we'll keep
     * it this way as an example.
     */
    this.formElement.addEventListener("submit", this.handleSubmit.bind(this));
  }

  private getUserInput(): [string, string, number] | void {
    // Getting inputs values
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    // Creating objects to validate
    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };

    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 2,
      maxLength: 280,
    };

    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5,
    };

    // Checking inputs
    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert("Invalid input, please try again!");
      return; // return "void"
    } else {
      // return the tuple
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  private clearInputs(): void {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  /**
   * The "this" keyword inside handleSubmit would point to the HTML
   * element and not to the "configure" method called inside the of
   * the class, so we had to "bind" it, we could have just used the
   * .bind() method, but for the sake of exercising we created this
   * AutoBind decorator.
   */
  
  @AutoBind
  // validate inputs
  private handleSubmit(e: Event) {
    // prevent page from refreshing after clicking the btn
    e.preventDefault();

    const userInput = this.getUserInput();

    // The "tuple" later in JS will be an ordinary array.
    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;
      this.clearInputs();
      console.log(title, description, people);
    }
  }
}

const projectForm = new ProjectInput();
const activeList = new ProjectList("active");
const finishedList = new ProjectList("finished");
