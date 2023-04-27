// This app was developed using the OOP paradigm.

//=================== AutoBind Method Decorator ===================
/**
 * The "this" keyword inside "handleSubmit" of the "ProjectInput" class
 * would point to the HTML element and not to the "configure" method called
 * inside the of the class, so we had to "bind" it, we could have just used
 * the .bind() method, but for the sake of exercising we created this
 * AutoBind decorator so we could reuse it in the future.
 *
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

//=================== Project Type Class ===================
enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

//============== Project State Management Class =============
// custom generic function type.
type Listener<T> = (items: T[]) => void;

/**
 * Technically we don't need this extra class, it was made just for
 * the sake of learning, in theory if we had different states to
 * manage other than ProjectState we could reuse this class.
 */
class State<T> {
  // Array of functions' references for event listeners.
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];

  /**
   * Bellow we created a singleton pattern to make sure this class can have
   * only 1 instance, since we need just one global state.
   */
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  } // end singleton's creation.

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(), // generating "random id".
      title,
      description,
      numOfPeople,
      ProjectStatus.Active // new projects will be active by default.
    );

    this.projects.push(newProject);

    for (const listenerFn of this.listeners) {
      /**
       * Since "listenerFn" is a reference to a function we can call
       * it and we used the "slice" method to return a copy of the
       * projects, because since it's an array, if we passed the original
       * it would be passed by "reference" and the values in the original
       * could be changed and it could introduce bugs.
       */
      listenerFn(this.projects.slice());
    }
  }
}

/**
 * By instantiating this class we created a "global state" and now
 * we can access the properties and methods of this class from
 * anywhere in or code through this variable.
 */
const projectState = ProjectState.getInstance();

//=================== Inputs Validation ===================
interface Validatable {
  // Apart from "value" the other props are optional.
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

//=================== ComponentBase Class =================
/**
 * This class contains the shared code used in the ProjectList and
 * ProjectInput classes to avoid repetition and improve maintainability.
 *
 * Abstract because this class should be only inherited and not instantiated.
 *
 * The "abstract" keyword must come before the "class" keyword.
 *
 * Added generics so we can specify the type of the HTMLElement later when we
 * inherit/extends this base class.
 */
abstract class ComponentBase<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;

  // The types bellow can be different, so we specify it when we instantiate.
  hostElement: T;
  htmlElement: U;

  constructor(
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

    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,

    // Optional parameters should ALWAYS come last.
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;

    // Getting access to the content inside the template element.
    const importedContent = document.importNode(
      this.templateElement.content,
      true
    );

    // Getting access to the html element.
    this.htmlElement = importedContent.firstElementChild as U;

    // Dynamically adding id to the section IF it exists.
    if (newElementId) {
      this.htmlElement.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  // Render section.
  private attach(insertAtStart: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtStart ? "afterbegin" : "beforeend",
      this.htmlElement
    );
  }

  // Methods to be implemented by the "inheritors".
  abstract configure(): void;
  abstract renderContent(): void;
}

//=================== ProjectItem Class ===================
class ProjectItem extends ComponentBase<HTMLUListElement, HTMLLIElement> {
  private project: Project;

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    this.project = project;
    this.configure();
    this.renderContent();
  }

  configure(): void {}

  renderContent(): void {
    this.htmlElement.querySelector("h2")!.textContent = this.project.title;
    this.htmlElement.querySelector("h3")!.textContent = this.project.people.toString();
    this.htmlElement.querySelector("p")!.textContent = this.project.description; 
  }
}

//=================== ProjectList Class ====================
class ProjectList extends ComponentBase<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[];

  // Literal union types in this constructor.
  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);

    this.assignedProjects = [];

    this.configure();
    this.renderSectionContent();
  }

  renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;

    /**
     * Clear the elements already on the screen before rerendering
     * to avoid duplication.
     */ 
    listEl.innerHTML = "";

    for (const projItem of this.assignedProjects) {
      new ProjectItem(this.htmlElement.querySelector('ul')!.id, projItem);
    }
  }

  configure(): void {
    // Adding listener to global state.
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((project) => {
        if (this.type === "active") {
          return project.status === ProjectStatus.Active;
        }
        return project.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  // Added just to satisfy the signature of our ComponentBase class.
  renderContent(): void {}

  renderSectionContent() {
    // Adding id to the list.
    const listId = `${this.type}-projects-list`;
    this.htmlElement.querySelector("ul")!.id = listId;

    // Adding h2 text.
    this.htmlElement.querySelector(
      "h2"
    )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }
}

//=================== ProjectInput Class ==================
class ProjectInput extends ComponentBase<HTMLDivElement, HTMLFormElement> {
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

    // Checking inputs.
    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
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

// Rendering components to the screen.
const projectForm = new ProjectInput();
const activeList = new ProjectList("active");
const finishedList = new ProjectList("finished");
