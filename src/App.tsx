/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { UserWarning } from './UserWarning';
import {
  createTodo,
  deleteTodo,
  getTodos,
  updateTodo,
  USER_ID,
} from './api/todos';
import { Todo } from './types/Todo';
import { ErrorNotification } from './components/ErrorNotification';
import { ErrorType, FilterType } from './types/ErrorType';
import cn from 'classnames';
import { getFilteredTodos } from './utils/getFilteredTodos';
import { TodoItem } from './components/TodoItem';
import { StatusFilter } from './components/StatusFilter';
import { Header } from './components/Header';
import { Todolist } from './components/Todolist';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState<ErrorType>(
    ErrorType.DEFAULT,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<FilterType>(FilterType.All);
  const [processingTodoIds, setProcessingTodoIds] = useState<Todo['id'][]>([]);
  const [title, setTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const [tempTodo, setTempTodo] = useState<Todo | null>(null);

  const [editingTodoIds, setEditingTodoIds] = useState<number[]>([]);

  const handleAddTodoToProcessing = (todoId: number) => {
    setProcessingTodoIds(current => [...current, todoId]);
  };

  const handleRemoveTodoToProcessing = (todoId: Todo['id']) => {
    setProcessingTodoIds(current => current.filter(id => id !== todoId));
  };

  const handleAddTodoToEditing = (todoId: number) => {
    setEditingTodoIds(current => [...current, todoId]);
  };

  const handleRemoveTodoToEditing = (todoId: number) => {
    setEditingTodoIds(current => current.filter(id => id !== todoId));
  };

  const handleToggleStatus = useCallback(
    (todoId: number) => {
      const todoToUpdate = todos.find(todo => todo.id === todoId);

      if (!todoToUpdate) {
        return;
      }

      const newStatus = !todoToUpdate.completed;

      handleAddTodoToProcessing(todoId);

      updateTodo(todoId, { completed: newStatus })
        .then(updatedTodo => {
          setTodos(current =>
            current.map(todo => (todo.id === todoId ? updatedTodo : todo)),
          );
        })
        .catch(() => {
          setErrorMessage(ErrorType.UPDATE_TODO);
        })
        .finally(() => {
          handleRemoveTodoToProcessing(todoId);
        });
    },
    [todos, handleAddTodoToProcessing, handleRemoveTodoToProcessing],
  );

  useEffect(() => {
    setIsLoading(true);
    getTodos()
      .then(setTodos)
      .catch(() => setErrorMessage(ErrorType.LOAD_TODOS))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDeleteTodo = useCallback((todoId: number) => {
    handleAddTodoToProcessing(todoId);

    return deleteTodo(todoId)
      .then(() => {
        setTodos(current => current.filter(todo => todo.id !== todoId));
      })
      .catch(() => {
        setErrorMessage(ErrorType.DELETE_TODO);

        throw new Error(ErrorType.DELETE_TODO);
      })
      .finally(() => {
        handleRemoveTodoToProcessing(todoId);
      });
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);

  const addTodo = (newTodo: Omit<Todo, 'id'>) => {
    const temp = {
      ...newTodo,
      id: 0,
    };

    setTempTodo(temp);
    setIsAdding(true);
    handleAddTodoToProcessing(0);

    createTodo(newTodo)
      .then(todoFromServer => {
        setTodos(currentTodos => [...currentTodos, todoFromServer]);
        setTitle('');
      })
      .catch(() => {
        setErrorMessage(ErrorType.ADD_TODO);
      })
      .finally(() => {
        setIsAdding(false);
        setTempTodo(null);
        handleRemoveTodoToProcessing(0);
      });
  };

  useEffect(() => {
    if (processingTodoIds) {
      inputRef.current?.focus();
    }
  }, [processingTodoIds]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      setErrorMessage(ErrorType.EMPTY_TITLE);

      return;
    }

    const newTodo = {
      userId: USER_ID,
      title: title.trim(),
      completed: false,
    };

    addTodo(newTodo);
  };

  const handleUpdateTodo = useCallback(
    (todoId: Todo['id'], data: Partial<Omit<Todo, 'id'>>): Promise<void> => {
      handleAddTodoToProcessing(todoId);

      return updateTodo(todoId, data)
        .then(updatedTodo => {
          setTodos(current =>
            current.map(todo => {
              if (todo.id === todoId) {
                return updatedTodo;
              }

              return todo;
            }),
          );
        })
        .catch(() => {
          setErrorMessage(ErrorType.UPDATE_TODO);

          throw new Error(ErrorType.UPDATE_TODO);
        })
        .finally(() => {
          handleRemoveTodoToProcessing(todoId);
        });
    },
    [handleAddTodoToProcessing, handleRemoveTodoToProcessing],
  );

  const handleClearCompleted = useCallback(async () => {
    const completedTodos = todos.filter(todo => todo.completed);

    const results = await Promise.allSettled(
      completedTodos.map(todo => handleDeleteTodo(todo.id)),
    );

    const hasError = results.some(result => result.status === 'rejected');

    if (hasError) {
      setErrorMessage(ErrorType.DELETE_TODO);
    }

    inputRef.current?.focus();
  }, [todos, handleDeleteTodo]);

  const handleToggleAllStatus = useCallback(() => {
    const isTodoCompleted = todos.some(todo => !todo.completed);

    todos.forEach(todo => {
      if (todo.completed !== isTodoCompleted) {
        handleUpdateTodo(todo.id, {
          completed: isTodoCompleted,
        });
      }
    });
  }, [todos, handleUpdateTodo]);

  const filteredTodos = useMemo(() => {
    return getFilteredTodos(todos, status);
  }, [todos, status]);
  const activeTodosCounter = useMemo(() => {
    return todos.filter(todo => !todo.completed).length;
  }, [todos]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  const isToggleAllVisible = !isLoading && todos.length > 0;
  const allTodoCompleted =
    todos.length > 0 && todos.every(todo => todo.completed);


  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          isVisible={isToggleAllVisible}
          todosAreCompleted={allTodoCompleted}
          title={title}
          isAdding={isAdding}
          inputRef={inputRef}
          onTitleChange={setTitle}
          onSubmit={handleSubmit}
          onToggleAllStatus={handleToggleAllStatus}
        />
        {!isLoading && (
          <>
        <Todolist
           todos={filteredTodos}
            tempTodo={tempTodo}
              processingTodoIds={processingTodoIds}
            editingTodoIds={editingTodoIds}
             onDeleteTodo={handleDeleteTodo}
            onToggleStatus={handleToggleStatus}
             onUpdateTodo={handleUpdateTodo}
             onStartEditing={handleAddTodoToEditing}
           onEndEditing={handleRemoveTodoToEditing}
           setErrorMessage={setErrorMessage}
          />
            {/* Hide the footer if there are no todos */}
            {todos.length > 0 && (
              <Footer
                todos={todos}
                activeTodosCounter={activeTodosCounter}
                status={status}
                onStatusChange={setStatus}
                onClearCompleted={handleClearCompleted}/>
            )}
          </>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}

      <ErrorNotification
        message={errorMessage}
        onClear={() => setErrorMessage(ErrorType.DEFAULT)}
      />
    </div>
  );
};
