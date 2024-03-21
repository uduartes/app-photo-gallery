import { Component, OnInit } from '@angular/core';
import { DatabaseService, User } from '../services/database.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit {
  public users: any;

  registrationForm: FormGroup;

  constructor(public db: DatabaseService, private fb: FormBuilder) {}

  async ngOnInit() {
    await this.db.initializePlugin();

    this.users = this.db.getUsers();
    this.createForm();
  }

  createForm() {
    this.registrationForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  addUser() {
    if (this.registrationForm.valid) {
      const newUser: User = {
        id: null, // Assuming ID is auto-generated
        ...this.registrationForm.value,
      };
      this.db.createUser(newUser).then(() => {
        console.log('User registered successfully');
        // Handle post-registration logic here, e.g., clear form, show message, navigate
      });
    }
  }
}
