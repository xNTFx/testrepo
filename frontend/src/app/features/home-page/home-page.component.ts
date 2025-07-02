import { NgStyle } from '@angular/common';
import { Component, effect, OnInit, Signal, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HomePageService } from './home-page.service';
import { AuthService } from '../../core/services/auth.service';

interface TodoDto {
  id: string;
  name: string;
  completed: boolean;
  completedAt: string;
  createdAt: string;
}

@Component({
  selector: 'app-home-page',
  imports: [ReactiveFormsModule, NgStyle],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  standalone: true,
})
export class HomePageComponent {
  readonly todos: Signal<TodoDto[]>;

  constructor(
    private homePageService: HomePageService,
    private authService: AuthService
  ) {
    this.todos = homePageService.todos;

    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.homePageService.fetchTodos().subscribe();
      } else {
        this.homePageService.todos.set([]);
      }
    });
  }

  form = new FormGroup({
    todoInput: new FormControl(''),
  });

  addTodo() {
    const todoName = this.form.value.todoInput?.trim();
    if (!todoName) return;
    this.homePageService.createTodo(todoName).subscribe();

    this.form.reset();
  }

  removeTodo(id: string) {
    this.homePageService.deleteTodos(id).subscribe();
  }

  updateTodo(id: string) {}

  handleCheckBox(id: string) {}
}
