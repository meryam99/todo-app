import { Todo } from '../types/Todo';
import { client } from '../utils/fetchClient';

export const USER_ID = 3097;

export const getTodos = () => {
  return client.get<Todo[]>(`/todos?userId=${USER_ID}`);
};

export const deleteTodo = (todoId: Todo['id']) => {
  return client.delete(`/todos/${todoId}`);
};

export const createTodo = (newTodo: Omit<Todo, 'id'>) => {
  return client.post<Todo>('/todos/', newTodo);
};

export const updateTodo = (todoId: number, todo: Partial<Omit<Todo, 'id'>>) => {
  return client.patch<Todo>(`/todos/${todoId}`, todo);
};

// Add more methods here
