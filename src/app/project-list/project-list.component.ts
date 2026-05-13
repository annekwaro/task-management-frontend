import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { Project } from '../models/project.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css',
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  selectedProjectId: number | null = null;

  newProject: Project = { id: 0, name: '', description: '', carbonBudget: 0 };

  constructor(
    private projectService: ProjectService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe((data) => {
      this.projects = [...data];
    });
  }

  createProject(): void {
    console.log('Create button clicked!', this.newProject);

    if (!this.newProject.name || !this.newProject.carbonBudget) {
      alert('Please fill name and budget');
      return;
    }
    this.projectService.createProject(this.newProject).subscribe({
      next: () => {
        this.newProject = { id: 0, name: '', description: '', carbonBudget: 0 };
        this.loadProjects();
        this.selectedProjectId = null;
        this.snackBar.open('Project created', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Error creating project', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  selectProject(id: number): void {
    this.selectedProjectId = id;
  }

  deleteProject(id: number, event: Event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Project',
        message:
          'Are you sure you want to delete this project? All tasks will also be deleted.',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.projectService.deleteProject(id).subscribe({
          next: () => {
            this.snackBar.open('Project deleted', 'Close', { duration: 3000 });
            this.loadProjects();
            if (this.selectedProjectId === id) this.selectedProjectId = null;
          },
          error: () =>
            this.snackBar.open('Error deleting project', 'Close', {
              duration: 3000,
            }),
        });
      }
    });
  }

  editProject(project: Project, event: Event): void {
    event.stopPropagation();
    const newName = prompt('Edit project name', project.name);
    if (newName && newName !== project.name) {
      project.name = newName;
      this.projectService.updateProject(project.id, project).subscribe({
        next: () => {
          this.snackBar.open('Project updated', 'Close', { duration: 3000 });
          this.loadProjects();
        },
        error: () =>
          this.snackBar.open('Error updating project', 'Close', {
            duration: 3000,
          }),
      });
    }
  }
}
