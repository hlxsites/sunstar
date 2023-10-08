import { createTabs, addTabs } from '../../scripts/blocks-utils.js';

export default function decorate(block) {
  const tabs = createTabs(block);
  const wrapper = block.parentElement;
  const container = wrapper.parentElement;
  container.insertBefore(wrapper, container.firstElementChild);

  addTabs(tabs, block);

  return block;
}
