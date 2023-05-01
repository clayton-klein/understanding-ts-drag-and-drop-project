/**
 * We MUST use/add the .js extension at the end of the name of the files
 * we're importing, because that's what it'll be in the end when TS is
 * transpiled and without it we'll get errors (we just removed them later
 * because we installed webpack and then having the extensions would be a 
 * problem).
 */ 
import BaseComponent from "./base-component";
import { DragTarget } from "../models/drag-drop";
import { Project, ProjectStatus } from "../models/project";
import { ProjectItem } from "./project-item";
import { AutoBind } from "../decorators/autobind";
import { projectState } from "../state/project-state";

export class ProjectList
  extends BaseComponent<HTMLDivElement, HTMLElement>
  implements DragTarget
{
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
      new ProjectItem(this.htmlElement.querySelector("ul")!.id, projItem);
    }
  }

  @AutoBind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      /**
       * A "drop" event is only allowed if the "dragover" event handler prevent
       * the default behavior, because the default behavior is to NOT allow
       * dropping.
       */
      event.preventDefault();
      const listEl = this.htmlElement.querySelector("ul")!;
      listEl.classList.add("droppable");
    }
  }

  @AutoBind
  dropHandler(event: DragEvent): void {
    const projectId = event.dataTransfer!.getData("text/plain");
    projectState.moveProject(
      projectId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  @AutoBind
  dragLeaveHandler(_: DragEvent): void {
    const listEl = this.htmlElement.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }

  configure(): void {
    this.htmlElement.addEventListener("dragover", this.dragOverHandler);
    this.htmlElement.addEventListener("dragleave", this.dragLeaveHandler);
    this.htmlElement.addEventListener("drop", this.dropHandler);

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
