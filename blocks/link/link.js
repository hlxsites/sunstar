export default async function decorate(block) {
  if (block.classList.contains('download')) {
    const a = block.querySelector('a');
    if (a) {
      a.setAttribute('download', '');
    }
  }
}
