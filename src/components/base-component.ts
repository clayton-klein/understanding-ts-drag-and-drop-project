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
 *
 * Since this class is the only thing we're exporting from this file then
 * we can export it as "default", then when we import it somwhere else,
 * it won't have a name and we can name the import whatever we want.
 * We can have "named" exports mixed with a "default" export in the same file,
 * but we can ONLY have 1 default export per file and in general we can just
 * use "export" without "default" to create named exports and enforce our names.
 */
export default abstract class ComponentBase<
  T extends HTMLElement,
  U extends HTMLElement
> {
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
