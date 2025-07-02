import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';

interface TodoDto {
  id: string;
  name: string;
  completed: boolean;
  completedAt: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class HomePageService {
  constructor(private http: HttpClient) {}

  private readonly API_URL = 'http://localhost:5194';

  todos = signal<TodoDto[]>([]);

  fetchTodos() {
    return this.http
      .get<TodoDto[]>(`${this.API_URL}/api/todo`, { withCredentials: true })
      .pipe(
        tap((todos) => this.todos.set(todos)),
        catchError((error) => {
          console.error('API Error:', error);
          this.todos.set([]);
          return of([]);
        })
      );
  }

  createTodo(name: string) {
    return this.http
      .post<TodoDto>(
        `${this.API_URL}/api/todo`,
        { name },
        { withCredentials: true }
      )
      .pipe(
        tap((todo) => this.todos.update((todos) => [...todos, todo])),
        catchError((err) => {
          console.error(err);
          return of(void 0);
        })
      );
  }

  deleteTodos(todoId: string) {
    return this.http
      .delete<string>(`${this.API_URL}/api/todo/${todoId}`, {
        withCredentials: true,
      })
      .pipe(
        tap((id) =>
          this.todos.update((todos) => todos.filter((t) => t.id !== id))
        ),
        catchError((err) => {
          console.error(err);
          return of(void 0);
        })
      );
  }
}
