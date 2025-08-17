import React from "react";
import { FilterType } from "../types/ErrorType";
import { Todo } from "../types/Todo"
import { StatusFilter } from "./StatusFilter";

interface FooterProps {
  todos: Todo[];
  activeTodosCounter: number;
  status: FilterType;
  onStatusChange: React.Dispatch<React.SetStateAction<FilterType>>;
  onClearCompleted: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  todos,
  activeTodosCounter,
  status,
  onStatusChange,
  onClearCompleted,
}) => {
  const hasCompletedTodos = todos.some(todo => todo.completed);

  return (
    <footer className="todoapp__footer" data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {activeTodosCounter} items left
      </span>

      {/* Active link should have the 'selected' class */}
      <StatusFilter status={status} onStatusChange={onStatusChange} />
      {/* this button should be disabled if there are no completed todos */}
      <button
        type="button"
        className="todoapp__clear-completed"
        data-cy="ClearCompletedButton"
        disabled={!hasCompletedTodos}
        onClick={onClearCompleted}
      >
        Clear completed
      </button>
    </footer>
  );
};
