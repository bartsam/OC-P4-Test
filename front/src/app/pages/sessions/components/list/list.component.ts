import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Session } from '../../../../core/models/session.interface';
import { SessionInformation } from '../../../../core/models/sessionInformation.interface';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { SessionService } from '../../../../core/service/session.service';
import { MaterialModule } from '../../../../shared/material.module';

@Component({
  selector: 'app-list',
  imports: [CommonModule, MaterialModule, RouterModule, FlexLayoutModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent {
  private sessionApiService = inject(SessionApiService);
  private sessionService = inject(SessionService);

  public sessions$: Observable<Session[]> = this.sessionApiService.all();

  get user(): SessionInformation | undefined {
    return this.sessionService.sessionInformation;
  }
}
