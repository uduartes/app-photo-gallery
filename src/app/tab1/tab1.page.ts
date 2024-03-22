import { Component, OnInit } from '@angular/core';
import { DatabaseService, User } from '../services/database.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit {
  public users: User[] = [];

  registrationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private databaseService: DatabaseService
  ) {}

  async ngOnInit() {
    this.createForm();
    this.databaseService.init();
    this.loadUsers();
  }

  createForm() {
    this.registrationForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  loadUsers() {
    this.databaseService.loadUsers().then((users) => {
      console.log('users:', users);
      this.users = users;
    });
  }

  addUser() {
    if (this.registrationForm.valid) {
      const newUser: User = {
        id: null, // Assuming ID is auto-generated
        ...this.registrationForm.value,
      };

      this.databaseService.createUser(newUser).then(
        () => {
          this.loadUsers();
          this.registrationForm.reset();
        },
        (error) => {
          console.log('Error: ', error);
        }
      );
    }
  }

  editUser(user: User) {
    this.databaseService.updateUser(user);
    this.loadUsers();
  }

  deleteUser(id) {
    this.databaseService.deleteUserById(id);
    this.loadUsers();
  }
}
