export function defineElement(elementName: string, element: typeof HTMLElement): void {
  if (!customElements.get(elementName)) {
    window.customElements.define(elementName, element)
  }
}
