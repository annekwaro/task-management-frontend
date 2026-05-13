import { Component, Input, OnInit } from '@angular/core';
import { TaskService } from '../services/task.service';
import { ProjectService } from '../services/project.service';
import { Task } from '../models/task.model';
import { Project } from '../models/project.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent implements OnInit {
  @Input() projectId!: number;
  project: Project | null = null;
  tasks: Task[] = [];
  totalCarbon = 0;

  displayedColumns: string[] = [
    'title',
    'carbonImpact',
    'businessValue',
    'ratio',
    'actions',
  ];

  newTask: Task = {
    title: '',
    description: '',
    carbonImpact: 'LOW',
    businessValue: 'HIGH',
    project: { id: 0 },
  };

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProject();
    this.loadTasks();
    this.loadTotalCarbon();
  }

  loadProject(): void {
    this.projectService.getProject(this.projectId).subscribe({
      next: (data) => (this.project = data),
      error: () =>
        this.snackBar.open('Error loading project', 'Close', {
          duration: 3000,
        }),
    });
  }

  loadTasks(): void {
    this.taskService.getTasksSortedByRatio(this.projectId).subscribe({
      next: (data) => (this.tasks = data),
      error: () =>
        this.snackBar.open('Error loading tasks', 'Close', { duration: 3000 }),
    });
  }

  loadTotalCarbon(): void {
    this.taskService.getTotalCarbon(this.projectId).subscribe({
      next: (data) => (this.totalCarbon = data),
      error: () =>
        this.snackBar.open('Error loading carbon total', 'Close', {
          duration: 3000,
        }),
    });
  }

  createTask(): void {
    if (!this.newTask.title) {
      this.snackBar.open('Please enter a task title', 'Close', {
        duration: 3000,
      });
      return;
    }
    this.newTask.project.id = this.projectId;
    this.taskService.createTask(this.newTask).subscribe({
      next: () => {
        this.snackBar.open('Task created', 'Close', { duration: 3000 });
        this.newTask = {
          title: '',
          description: '',
          carbonImpact: 'LOW',
          businessValue: 'HIGH',
          project: { id: 0 },
        };
        this.loadTasks();
        this.loadTotalCarbon();
      },
      error: () =>
        this.snackBar.open('Error creating task', 'Close', { duration: 3000 }),
    });
  }

  getRatio(task: Task): number {
    const carbonPoints = { LOW: 1, MEDIUM: 2, HIGH: 3 }[task.carbonImpact];
    const valuePoints = { LOW: 1, MEDIUM: 2, HIGH: 3 }[task.businessValue];
    return carbonPoints / valuePoints;
  }

  deleteTask(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Task',
        message: 'Are you sure you want to delete this task?',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.taskService.deleteTask(id).subscribe({
          next: () => {
            this.snackBar.open('Task deleted', 'Close', { duration: 3000 });
            this.loadTasks();
            this.loadTotalCarbon();
          },
          error: () =>
            this.snackBar.open('Error deleting task', 'Close', {
              duration: 3000,
            }),
        });
      }
    });
  }

  editTask(task: Task): void {
    const newTitle = prompt('Edit task title', task.title);
    if (newTitle && newTitle !== task.title) {
      task.title = newTitle;
      this.taskService.updateTask(task.id!, task).subscribe({
        next: () => {
          this.snackBar.open('Task updated', 'Close', { duration: 3000 });
          this.loadTasks();
        },
        error: () =>
          this.snackBar.open('Error updating task', 'Close', {
            duration: 3000,
          }),
      });
    }
  }
}
