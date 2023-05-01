/**
 * We MUST use/add the .js extension at the end of the name of the files
 * we're importing, because that's what it'll be in the end when TS is
 * transpiled and without it we'll get errors (we just removed them later
 * because we installed webpack and then having the extensions would be a 
 * problem).
 */ 
import { Draggable } from "../models/drag-drop";
import BaseComponent from "./base-component";
import { Project } from "../models/project";
import { AutoBind } from "../decorators/autobind";

export class ProjectItem
  extends BaseComponent<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  // implementing the "contract" of the interface.
  private project: Project;

  get numberOfColaborators() {
    if (this.project.people === 1) {
      return "1 person";
    } else {
      return `${this.project.people} people`;
    }
  }

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    this.project = project;
    this.configure();
    this.renderContent();
  }

  @AutoBind
  dragStartHandler(event: DragEvent): void {
    // "dataTransfer" property is special for "drag" events.
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }

  // We won't use it.
  dragEndHandler(_: DragEvent): void {
    console.log("Drag ended...");
  }

  configure(): void {
    this.htmlElement.addEventListener("dragstart", this.dragStartHandler);
    this.htmlElement.addEventListener("dragend", this.dragEndHandler);
  }

  renderContent(): void {
    this.htmlElement.querySelector("h2")!.textContent = this.project.title;

    /**
     * Remember to use "getters/setters" like properties, without "()", because
     * they are considered "pseudo-properties" and not exactly methods.
     */
    this.htmlElement.querySelector("h3")!.textContent =
      this.numberOfColaborators + " assigned.";

    this.htmlElement.querySelector("p")!.textContent = this.project.description;
  }
}
