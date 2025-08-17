import React from 'react';
import cn from 'classnames';

interface HeaderPprops {
  isVisible: boolean;
  todosAreCompleted: boolean;
  title: string;
  isAdding: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  onTitleChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onToggleAllStatus: () => void;
}

export const Header: React.FC<HeaderPprops> = ({
  isVisible,
  todosAreCompleted,
  title,
  isAdding,
  inputRef,
  onTitleChange,
  onSubmit,
  onToggleAllStatus,
}) => {
  return (
<header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          {isVisible && (
            <button
              type="button"
              className={cn('todoapp__toggle-all', {
                active: todosAreCompleted,
              })}
              data-cy="ToggleAllButton"
              onClick={onToggleAllStatus}
            />
          )}

          {/* Add a todo on form submit */}
          <form onSubmit={onSubmit}>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              autoFocus
              value={title}
              onChange={event => onTitleChange(event.target.value)}
              ref={inputRef}
              disabled={isAdding}
            />
          </form>
    </header>
  )
}
