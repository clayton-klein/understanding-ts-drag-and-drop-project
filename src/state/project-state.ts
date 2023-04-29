//============== Project State Management Class =============

/**
 * We MUST use/add the .js extension at the end of the name of the files
 * we're importing, because that's what it'll be in the end when TS is
 * transpiled and without it we'll get errors.
 */ 
import { Project, ProjectStatus } from "../models/project.js";

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

export class ProjectState extends State<Project> {
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
    this.updateListeners();
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((proj) => proj.id === projectId);

    // If the status is the same don't rerender.
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
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
 * 
 * This variable is imported in more than one file, but just to be
 * clear, it'll run ONLY once when the first "import" is made by
 * any ohter file and it can be proved by cheking the "log" bellow
 * on the console, it's just something to have in mind about how
 * those imports work.
 */
export const projectState = ProjectState.getInstance();
console.log("Creating projectState variable...");

