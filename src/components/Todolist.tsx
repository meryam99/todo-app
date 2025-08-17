import React from 'react';
import { Todo } from '../types/Todo';
import { ErrorType } from '../types/ErrorType';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  tempTodo: Todo | null;
  processingTodoIds: number[];
  editingTodoIds: number[];
  onDeleteTodo: (id: number) => void;
  onToggleStatus: (id: number) => void;
  onUpdateTodo: (todo: Todo) => void;
  onStartEditing: (id: number) => void;
  onEndEditing: (id: number) => void;
  setErrorMessage: (error: ErrorType) => void;

}

export const Todolist: React.FC<TodoListProps> = ({
  todos,
  tempTodo,
  processingTodoIds,
  editingTodoIds,
  onDeleteTodo,
  onToggleStatus,
onUpdateTodo,
onStartEditing,
onEndEditing,
setErrorMessage,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
                 {/* This is a completed todo */}

                 {todos.map(todo => (
                   <TodoItem
                     key={todo.id}
                     todo={todo}
                     onDeleteTodo={onDeleteTodo}
                     isLoading={processingTodoIds.includes(todo.id)}
                     onToggleStatus={onToggleStatus}
                     onUpdateTodo={onUpdateTodo}
                     setErrorMessage={setErrorMessage}
                     isEditing={editingTodoIds.includes(todo.id)}
                     onStartEditing={onStartEditing}
                     onEndEditing={onEndEditing}
                   />
                 ))}
                 {tempTodo && (
                   <TodoItem
                     todo={tempTodo}
                     onDeleteTodo={() => {}}
                     isLoading={true}
                     onToggleStatus={() => {}}
                     onUpdateTodo={onUpdateTodo}
                     setErrorMessage={setErrorMessage}
                     isEditing={false}
                     onStartEditing={() => {}}
                     onEndEditing={() => {}}
                   />
                 )}
               </section>

  )
}

