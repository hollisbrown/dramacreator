export function addInputListener(onMouseClick, onMouseDown) {

    document.addEventListener('click', onMouseClick);
    document.addEventListener('mousedown', onMouseDown);

}
