export interface Task {
  id?: number;
  title: string;
  description: string;
  carbonImpact: 'LOW' | 'MEDIUM' | 'HIGH';
  businessValue: 'LOW' | 'MEDIUM' | 'HIGH';
  project: { id: number };
}
