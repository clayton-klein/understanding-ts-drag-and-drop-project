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
export function AutoBind(_: any, _2: string, descriptor: PropertyDescriptor) {
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
