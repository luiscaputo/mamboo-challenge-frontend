import { useRef } from 'react';
import { useDrag, useDrop, XYCoord } from 'react-dnd';
import { ItemType } from '../utils/enums';
import { DragItem, TaskModel } from '../utils/models';

export function useTaskDragAndDrop<T extends HTMLElement>(
  { task, index }: { task: TaskModel; index: number },
  handleDropHover: (i: number, j: number) => void,
) {
  const ref = useRef<T>(null);

  const [{ isDragging }, drag] = useDrag<
    DragItem,
    void,
    { isDragging: boolean }
  >({
    item: { from: task.column, id: task.id, index },
    type: ItemType.TASK,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [_, drop] = useDrop<DragItem, void, unknown>({
    accept: ItemType.TASK,
    hover: (item, monitor) => {
      if (!ref.current) {
        return;
      }

      // the tasks are not on the same column
      if (item.from !== task.column) {
        return;
      }

      const draggedItemIndex = item.index;
      const hoveredItemIndex = index;

      // we are swapping the task with itself
      if (draggedItemIndex === hoveredItemIndex) {
        return;
      }

      const isDraggedItemAboveHovered = draggedItemIndex < hoveredItemIndex;
      const isDraggedItemBelowHovered = !isDraggedItemAboveHovered;

      // get mouse coordinatees
      const { x: mouseX, y: mouseY } = monitor.getClientOffset() as XYCoord;

      // get hover item rectangle
      const hoveredBoundingRect = ref.current.getBoundingClientRect();

      // Get hover item middle height position
      const hoveredMiddleHeight =
        (hoveredBoundingRect.bottom - hoveredBoundingRect.top) / 2;

      const mouseYRelativeToHovered = mouseY - hoveredBoundingRect.top;
      const isMouseYAboveHoveredMiddleHeight =
        mouseYRelativeToHovered < hoveredMiddleHeight;
      const isMouseYBelowHoveredMiddleHeight =
        mouseYRelativeToHovered > hoveredMiddleHeight;

      if (isDraggedItemAboveHovered && isMouseYAboveHoveredMiddleHeight) {
        return;
      }

      if (isDraggedItemBelowHovered && isMouseYBelowHoveredMiddleHeight) {
        return;
      }

      // Time to actually perform the action
      handleDropHover(draggedItemIndex, hoveredItemIndex);

      item.index = hoveredItemIndex;
    },
  });

  drag(drop(ref));

  return {
    ref,
    isDragging,
  };
}
