import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getTasksSortedByRatio(projectId: number): Observable<Task[]> {
    return this.http.get<Task[]>(
      `${this.apiUrl}/project/${projectId}/sorted-by-ratio`
    );
  }

  getTotalCarbon(projectId: number): Observable<number> {
    return this.http.get<number>(
      `${this.apiUrl}/project/${projectId}/carbon-total`
    );
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(id: number, task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
